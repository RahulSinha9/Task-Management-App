# Arm-task — Architecture & Network Design

## 1. Network Diagram

```
                        Internet (Users)
                               |
                    HTTPS:443 / HTTP:80
                               |
                               v
         +------------------------------------------+
         |     Application Load Balancer            |
         |     arm-task-alb                         |
         |     Public Subnets:                      |
         |     10.0.1.0/24 + 10.0.3.0/24           |
         |                                          |
         |  HTTP:80  ──► redirect to HTTPS:443      |
         |                                          |
         |  HTTPS:443 listener rules:               |
         |    staging-arm-task.devopslabx.com       |
         |      /*      ──► staging frontend :3000  |
         |      /api/*  ──► staging backend  :4000  |
         |                                          |
         |    arm-task.devopslabx.com               |
         |      /*      ──► prod frontend    :3000  |
         |      /api/*  ──► prod backend     :4000  |
         +------------------------------------------+
                    |                  |
             HTTP (internal)      SSH :22
                    |                  |
                    v                  v
         +------------------------------------------+
         |      Private Subnet: 10.0.2.0/24         |
         |                                          |
         |  +--------------------+ +-------------+  |
         |  | Staging EC2        | | Prod EC2    |  |
         |  | 10.0.2.179         | | 10.0.2.186  |  |
         |  | t3.micro           | | t3.small    |  |
         |  |                    | |             |  |
         |  | Docker: arm-task-net| Docker: arm  |  |
         |  | frontend  :3000    | | frontend    |  |
         |  | backend   :4000    | | backend     |  |
         |  | mongodb   :27017   | | mongodb     |  |
         |  | (internal only)    | | (internal)  |  |
         |  +--------------------+ +-------------+  |
         +------------------------------------------+
                    ^                  ^
             outbound NAT         SSH jump
                    |                  |
         +------------------------------------------+
         |      Public Subnet: 10.0.1.0/24          |
         |                                          |
         |  +--------------------+ +-------------+  |
         |  | NAT Gateway        | | Bastion     |  |
         |  | (outbound only)    | | 13.234.115  |  |
         |  |                    | | port 22     |  |
         |  |                    | | admin IP/32 |  |
         |  +--------------------+ +-------------+  |
         +------------------------------------------+
```

### Supporting AWS Services

| Service | Purpose |
|---------|---------|
| ECR | Docker image registry |
| Secrets Manager | arm-task/prod — all credentials |
| CloudWatch | Metrics + Logs + Alarms + Dashboard |
| SNS | arm-task-alerts — email notifications |
| ACM | devopslabx.com wildcard TLS certificate |
| IAM | arm-task-ec2-role — least privilege |

---

## 2. Network Traffic Flow

### Frontend request

```
User browser
  ──► DNS: arm-task.devopslabx.com
  ──► ALB port 443 (TLS terminated by ACM)
  ──► Production EC2 port 3000
  ──► nginx container serves React app
  ──► React app loads in browser
```

### API request

```
React app calls /api/v1/...
  ──► ALB routes /api/* to backend target group
  ──► Production EC2 port 4000
  ──► Express backend processes request
  ──► mongodb:27017 (Docker internal network only)
  ──► JSON response back to browser
```

### Outbound from private EC2

```
EC2 (no public IP)
  ──► NAT Gateway
  ──► Internet Gateway
  ──► ECR (pull Docker images)
  ──► CloudWatch (push logs and metrics)
  ──► Secrets Manager (fetch credentials on boot)
  ──► Cloudinary (file uploads)
  ──► Mailtrap SMTP (send emails)
```

### Admin access

```
Option A — SSH via Bastion:
  Admin machine ──► Bastion (13.234.115.21:22) ──► Private EC2 (:22)

Option B — SSM Session Manager:
  AWS Console ──► SSM ──► Private EC2 (no open SSH port needed)
```

---

## 3. Security Groups

| SG Name | Inbound Rules | Purpose |
|---------|---------------|---------|
| arm-task-alb-sg | 80, 443 from 0.0.0.0/0 | Internet-facing ALB |
| arm-task-app-sg | 3000, 4000 from ALB SG only; 22 from bastion SG | App EC2 instances |
| arm-task-mongo-sg | 27017 from app SG only | MongoDB — never public |
| arm-task-bastion-sg | 22 from admin IP /32 only | SSH jump server |

---

## 4. Docker Networking

```
arm-task-net (Docker bridge driver)

  +---------------+     proxy /api/*    +---------------+
  |   frontend    | ──────────────────► |    backend    |
  |   nginx :80   |                     |  express:4000 |
  +---------------+                     +-------+-------+
                                                 |
                                          :27017 |
                                         +-------▼-------+
                                         |    mongodb    |
                                         |  NO host port |
                                         |  EBS volume   |
                                         +---------------+
```

- `frontend` — serves static React files via nginx, proxies `/api/*` to `backend:4000`
- `backend` — Express API, connects to `mongodb:27017`
- `mongodb` — no host port mapping, only accessible within `arm-task-net`, data on encrypted EBS

---

## 5. MongoDB Decision — Why Containerized

| Factor | Decision |
|--------|----------|
| Cost | Atlas M10 = ~$57/month. Containerized on existing EC2 = $0 extra |
| Security | No host port — only reachable within Docker bridge network |
| Persistence | `mongo_data` volume on encrypted EBS gp3 — survives restarts |
| Backup | EBS snapshots via AWS Backup for point-in-time recovery |

> **Production scale recommendation:** Migrate to MongoDB Atlas or Amazon DocumentDB for managed HA, automated backups, and multi-region replication.

---

## 6. CI/CD Pipeline

```
push to staging branch
  └──► Job 1: Test and Lint
  │      npm ci (Backend + Frontend)
  │      ESLint (non-blocking)
  │      TypeScript check (tsc --noEmit)
  │      npm run build (validation)
  │
  └──► Job 2: Build and Push to ECR
  │      Backend image ──► ECR arm-task-backend:{sha}
  │      Frontend image (VITE_API_BASE_URL injected):
  │        staging ──► https://staging-arm-task.devopslabx.com/api/v1
  │
  └──► Job 3: Deploy to Staging (automatic)
         SSM send-command to staging EC2
         Pull secrets from Secrets Manager ──► .env
         Pull images from ECR
         docker compose up -d --remove-orphans
         Health check: curl /api/v1/healthcheck


push to main branch
  └──► Job 1: Test and Lint (same as above)
  │
  └──► Job 2: Build and Push to ECR
  │      Frontend image (VITE_API_BASE_URL injected):
  │        main ──► https://arm-task.devopslabx.com/api/v1
  │
  └──► Job 4: Deploy to Production
         MANUAL APPROVAL REQUIRED
         GitHub Environment: production
         Required reviewer: RahulSinha9
         Same deploy flow as staging
         Tags release: prod-{sha}
```

---

## 7. Rollback Plan

### Automatic rollback — built into every deploy

```bash
# Before every deploy, current tag is saved
PREV_TAG=$(grep IMAGE_TAG .env | cut -d= -f2)
echo $PREV_TAG > .prev_tag

# After deploy, health check runs 5 times
# If all 5 fail, automatic rollback:
IMAGE_TAG=$(cat .prev_tag)
docker compose up -d --force-recreate
```

### Manual rollback via SSM

```bash
aws ssm start-session --target i-086c0b8e18eae424a --region ap-south-1

cd /opt/arm-task
PREV=$(cat .prev_tag)
sed -i "s/^IMAGE_TAG=.*/IMAGE_TAG=$PREV/" .env
set -a; source .env; set +a
docker compose -f docker-compose.yml up -d --force-recreate

# Verify
curl http://localhost:4000/api/v1/healthcheck
```

### Git rollback

```bash
git revert HEAD
git push origin main
# Approve in GitHub Actions
# Production auto-deploys with reverted code
```

---

## 8. IAM Least Privilege

`arm-task-ec2-role` grants only what is needed — nothing more:

| Permission | Scope |
|------------|-------|
| ecr:GetAuthorizationToken | * |
| ecr:BatchGetImage, GetDownloadUrlForLayer, BatchCheckLayerAvailability | * |
| secretsmanager:GetSecretValue, DescribeSecret | arm-task/* only |
| cloudwatch:PutMetricData | * |
| logs:CreateLogGroup, CreateLogStream, PutLogEvents | * |
| ssm:* (Session Manager access) | * |

No admin access. No S3. No EC2 control plane. No IAM modifications.

---

## 9. Monitoring and Alarms

| Alarm Name | Metric | Threshold | Action |
|------------|--------|-----------|--------|
| arm-task-high-cpu | EC2 CPUUtilization | > 80% for 4 min | SNS email |
| arm-task-high-memory | CWAgent mem_used_percent | > 85% for 4 min | SNS email |
| arm-task-high-disk | CWAgent disk_used_percent | > 90% | SNS email |
| arm-task-instance-status | StatusCheckFailed | > 0 | SNS email |
| arm-task-backend-errors | Log metric ERROR count | > 10/min | SNS email |
| arm-task-prod-unhealthy-hosts | ALB UnHealthyHostCount | > 0 | SNS email |
| arm-task-staging-unhealthy-hosts | ALB UnHealthyHostCount | > 0 | SNS email |

**Dashboard:** `AWS Console → CloudWatch → Dashboards → arm-task-overview`

---

## 10. Cost Estimate (ap-south-1, monthly)

| Resource | Details | Estimated Cost |
|----------|---------|----------------|
| EC2 Production | t3.small | ~$15 |
| EC2 Staging | t3.micro | ~$8 |
| EC2 Bastion | t3.micro | ~$8 |
| ALB | + LCU usage | ~$18 |
| NAT Gateway | + data transfer | ~$35 |
| EBS (3x 20GB gp3) | encrypted at rest | ~$5 |
| ECR | image storage | ~$1 |
| CloudWatch | logs + metrics | ~$3 |
| Secrets Manager | 1 secret | ~$0.40 |
| ACM Certificate | TLS termination | Free |
| **Total** | | **~$93/month** |
