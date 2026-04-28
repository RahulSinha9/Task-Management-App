# arm-task Architecture and Network Design

## Network Diagram

Internet (Users)
        |
        | HTTPS:443 / HTTP:80 redirect
        v
+--------------------------------------------------+
|  Application Load Balancer (arm-task-alb)        |
|  Public Subnets: 10.0.1.0/24 + 10.0.3.0/24     |
|                                                  |
|  HTTP:80  -> redirect to HTTPS:443               |
|  HTTPS:443                                       |
|    staging-arm-task.devopslabx.com               |
|      /* -> staging frontend TG (port 3000)       |
|      /api/* -> staging backend TG (port 4000)    |
|    arm-task.devopslabx.com                       |
|      /* -> prod frontend TG (port 3000)          |
|      /api/* -> prod backend TG (port 4000)       |
+--------------------------------------------------+
        |                    |
        v                    v SSH
+--------------------------------------------------+
|  Private Subnet: 10.0.2.0/24                     |
|  Staging EC2 (10.0.2.179)  Prod EC2 (10.0.2.186)|
|  Docker: arm-task-net      Docker: arm-task-net  |
|  [frontend  :3000]         [frontend  :3000]     |
|  [backend   :4000]         [backend   :4000]     |
|  [mongodb   :27017 internal only]                |
+--------------------------------------------------+
+--------------------------------------------------+
|  Public Subnet: 10.0.1.0/24                      |
|  NAT Gateway               Bastion 13.234.115.21 |
+--------------------------------------------------+

Supporting Services:
  ECR             -> Docker image registry
  Secrets Manager -> arm-task/prod (all credentials)
  CloudWatch      -> Metrics + Logs + Alarms + Dashboard
  SNS             -> arm-task-alerts (email notifications)
  ACM             -> devopslabx.com wildcard TLS certificate
  IAM             -> arm-task-ec2-role (least privilege)

## Network Traffic Flow

User browser
  -> DNS arm-task.devopslabx.com
  -> ALB port 443 (TLS terminated)
  -> Production EC2 port 3000 (frontend)
  -> nginx serves React app
  -> React calls /api/v1/*
  -> ALB routes to EC2 port 4000 (backend)
  -> Express queries mongodb:27017 (internal only)

## Security Groups

| SG Name             | Inbound                          | Purpose          |
|---------------------|----------------------------------|------------------|
| arm-task-alb-sg     | 80,443 from 0.0.0.0/0            | ALB              |
| arm-task-app-sg     | 3000,4000 from ALB; 22 from bastion | App EC2       |
| arm-task-mongo-sg   | 27017 from app SG only           | MongoDB internal |
| arm-task-bastion-sg | 22 from admin IP /32             | Jump server      |

## Docker Networking

arm-task-net (Docker bridge)
  frontend -> proxies /api/* to backend:4000
  backend  -> connects to mongodb:27017
  mongodb  -> NO host port, internal only, data on encrypted EBS

## MongoDB Decision - Why Containerized

1. Cost: Atlas M10 = ~$57/month. Containerized on existing EC2 = $0 extra.
2. Security: No host port mapping. Only accessible within arm-task-net.
3. Persistence: mongo_data volume on encrypted EBS gp3.
4. For production scale: migrate to MongoDB Atlas or Amazon DocumentDB.

## CI/CD Pipeline

push to staging -> Test + Lint -> Build images -> Deploy to Staging (auto)
push to main    -> Test + Lint -> Build images -> Deploy to Production (manual approval)

Frontend image built with VITE_API_BASE_URL injected per branch:
  staging -> https://staging-arm-task.devopslabx.com/api/v1
  main    -> https://arm-task.devopslabx.com/api/v1

## Rollback Plan

Automatic: deploy script saves .prev_tag, restores if health check fails 5 times.

Manual:
  aws ssm start-session --target i-086c0b8e18eae424a --region ap-south-1
  cd /opt/arm-task
  PREV=$(cat .prev_tag)
  sed -i "s/^IMAGE_TAG=.*/IMAGE_TAG=$PREV/" .env
  docker compose -f docker-compose.yml up -d --force-recreate

## IAM Least Privilege

arm-task-ec2-role allows only:
  ECR pull, Secrets Manager read (arm-task/* only),
  CloudWatch metrics/logs write, SSM Session Manager

## Cost Estimate (ap-south-1, monthly)

| Resource           | Cost  |
|--------------------|-------|
| EC2 x3             | ~$31  |
| ALB                | ~$18  |
| NAT Gateway        | ~$35  |
| EBS + ECR + CW     | ~$9   |
| Secrets Manager    | ~$0.40|
| ACM                | Free  |
| Total              | ~$93  |
