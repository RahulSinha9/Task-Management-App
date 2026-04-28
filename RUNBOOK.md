# Arm-task — Operations Runbook

## Infrastructure

| Component | IP / URL | Type |
|-----------|----------|------|
| Bastion Host | 13.234.115.21 | Public |
| Staging EC2 | 10.0.2.179 | Private |
| Production EC2 | 10.0.2.186 | Private |
| Staging URL | https://staging-arm-task.devopslabx.com | Public |
| Production URL | https://arm-task.devopslabx.com | Public |
| ECR Registry | 773802564338.dkr.ecr.ap-south-1.amazonaws.com | AWS |

---

## 1. How to Deploy

### Via CI/CD (recommended)

```bash
# Deploy to staging — auto triggers on push
git checkout staging
git merge your-feature-branch
git push origin staging

# Watch pipeline at:
# GitHub → RahulSinha9/Task-Management-App → Actions

# Verify staging is healthy
curl https://staging-arm-task.devopslabx.com/api/v1/healthcheck

# Deploy to production — requires manual approval
git checkout main
git merge staging
git push origin main

# Then: GitHub → Actions → Deploy to Production → Review deployments → Approve
```

### Manual deploy via SSM (emergency)

```bash
# Connect to production EC2
aws ssm start-session --target i-086c0b8e18eae424a --region ap-south-1

# Deploy
cd /opt/arm-task
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin \
  773802564338.dkr.ecr.ap-south-1.amazonaws.com

aws secretsmanager get-secret-value \
  --secret-id arm-task/prod \
  --region ap-south-1 \
  --query SecretString \
  --output text | jq -r 'to_entries | map("\(.key)=\(.value)") | .[]' > .env

echo "IMAGE_TAG=<commit-sha>" >> .env
echo "ECR_REGISTRY=773802564338.dkr.ecr.ap-south-1.amazonaws.com" >> .env

docker compose -f docker-compose.yml pull
docker compose -f docker-compose.yml up -d
```

---

## 2. How to Rollback

### Option A — Automatic rollback (built in)

The deploy script saves `.prev_tag` before every deployment.
If health check fails 5 times, it automatically restores the previous image.
No manual action needed — monitor via GitHub Actions logs.

### Option B — Manual rollback via SSM

```bash
# Connect to production
aws ssm start-session --target i-086c0b8e18eae424a --region ap-south-1

cd /opt/arm-task

# Check what the previous good tag was
cat .prev_tag

# Rollback to previous tag
PREV=$(cat .prev_tag)
sed -i "s/^IMAGE_TAG=.*/IMAGE_TAG=$PREV/" .env
set -a; source .env; set +a
docker compose -f docker-compose.yml up -d --force-recreate

# Verify rollback worked
curl http://localhost:4000/api/v1/healthcheck
```

### Option C — Git rollback

```bash
# Revert last commit on main
git revert HEAD
git push origin main

# Go to GitHub Actions → approve Deploy to Production
# Production auto-deploys with reverted code
```

### Option D — Rollback to specific release

```bash
# List all production release tags
git tag | grep "prod-"

# Each tag is named prod-{sha}
# Extract the SHA and use it as IMAGE_TAG in Option B
```

---

## 3. How to Check Logs

### Live container logs via SSM

```bash
# Connect to production
aws ssm start-session --target i-086c0b8e18eae424a --region ap-south-1

cd /opt/arm-task

# All containers
docker compose -f docker-compose.yml logs -f --tail=100

# Backend only
docker compose -f docker-compose.yml logs -f backend

# Frontend only
docker compose -f docker-compose.yml logs -f frontend

# MongoDB only
docker compose -f docker-compose.yml logs -f mongodb

# Filter errors only
docker compose -f docker-compose.yml logs backend | grep -i "error\|ERROR"
```

### Via SSH through Bastion

```bash
# Step 1 — SSH to bastion
ssh -i arm.pem ubuntu@13.234.115.21

# Step 2 — SSH to production EC2
ssh -i arm.pem ubuntu@10.0.2.186

# Step 3 — Check logs
cd /opt/arm-task
docker compose -f docker-compose.yml logs -f backend
```

### CloudWatch Logs (AWS Console)

```
AWS Console → CloudWatch → Log Groups
  /arm-task/backend   ← Express application logs
  /arm-task/frontend  ← nginx access + error logs
```

**CloudWatch Insights query for errors:**

```
SOURCE '/arm-task/backend'
| fields @timestamp, @message
| filter @message like /error|Error|ERROR/
| sort @timestamp desc
| limit 50
```

---

## 4. How to Restart Services

```bash
# Connect to production
aws ssm start-session --target i-086c0b8e18eae424a --region ap-south-1

cd /opt/arm-task

# Restart backend only (no downtime for frontend)
docker compose -f docker-compose.yml restart backend

# Restart frontend only
docker compose -f docker-compose.yml restart frontend

# Restart all services
docker compose -f docker-compose.yml down
set -a; source .env; set +a
docker compose -f docker-compose.yml up -d

# Force recreate (picks up new env vars)
docker compose -f docker-compose.yml up -d --force-recreate
```

---

## 5. How to Verify Application Health

### Quick health check

```bash
# From public internet
curl https://arm-task.devopslabx.com/api/v1/healthcheck
# Expected: {"statusCode":200,"data":{"message":"Server is running"},"success":true}

# From inside EC2
curl http://localhost:4000/api/v1/healthcheck
curl http://localhost:3000
```

### Container status

```bash
# Connect to production
aws ssm start-session --target i-086c0b8e18eae424a --region ap-south-1

cd /opt/arm-task

# All containers and health status
docker compose -f docker-compose.yml ps
# All should show "healthy"

# Resource usage
docker stats --no-stream

# Disk usage (alert threshold: 90%)
df -h

# Memory usage (alert threshold: 85%)
free -m
```

### ALB Target Group health

```
AWS Console → EC2 → Target Groups
  arm-task-backend-tg  → Targets tab → should show "healthy"
  arm-task-frontend-tg → Targets tab → should show "healthy"
```

### CloudWatch Dashboard

```
AWS Console → CloudWatch → Dashboards → arm-task-overview
Shows: CPU, Memory, Disk, Network In/Out, Status checks, Backend error logs
```

---

## 6. GitHub Secrets

### Repository secrets

| Secret | Description |
|--------|-------------|
| AWS_ACCESS_KEY_ID | IAM user access key for GitHub Actions |
| AWS_SECRET_ACCESS_KEY | IAM user secret key for GitHub Actions |

### Environment secrets

| Environment | Secret | Value |
|-------------|--------|-------|
| staging | VITE_API_BASE_URL | https://staging-arm-task.devopslabx.com/api/v1 |
| production | VITE_API_BASE_URL | https://arm-task.devopslabx.com/api/v1 |

---

## 7. AWS Secrets Manager — arm-task/prod

All application credentials are stored here. No credentials in code or config files.

```
AWS Console → Secrets Manager → arm-task/prod

Contains:
  MONGO_USER, MONGO_PASSWORD
  MONGO_URI, DATABASE_NAME
  ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET
  ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY
  CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
  MAILTRAP_HOST, MAILTRAP_PORT, MAILTRAP_USER, MAILTRAP_PASSWORD
  FRONTEND_URL
```

---

## 8. Common Issues and Fixes

### Backend crash-looping

```bash
docker logs arm-task-backend --tail=30
# Check for: MongoServerError, missing env vars, port conflicts
```

### ECR pull fails

```bash
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin \
  773802564338.dkr.ecr.ap-south-1.amazonaws.com
```

### Disk full

```bash
docker image prune -f
docker system prune -f
df -h
```

### MongoDB auth failed

```bash
# Verify credentials
docker exec arm-task-mongo mongosh \
  -u admin -p <password> \
  --authenticationDatabase admin \
  --eval "db.adminCommand('ping')"
```
