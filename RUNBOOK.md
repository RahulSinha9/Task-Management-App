# arm-task Operations Runbook

## Infrastructure
- Bastion: 13.234.115.21 (public)
- Staging: 10.0.2.179 (private)
- Production: 10.0.2.186 (private)
- ECR: 773802564338.dkr.ecr.ap-south-1.amazonaws.com

## 1. How to Deploy

### Via CICD
Push to staging branch triggers auto deploy.
Push to main branch requires manual approval in GitHub Actions.

### Manual deploy via SSM
  aws ssm start-session --target i-086c0b8e18eae424a --region ap-south-1
  cd /opt/arm-task
  docker compose -f docker-compose.prod.yml up -d

## 2. How to Rollback

  aws ssm start-session --target i-086c0b8e18eae424a --region ap-south-1
  cd /opt/arm-task
  PREV=$(cat .prev_tag)
  sed -i "s/^IMAGE_TAG=.*/IMAGE_TAG=$PREV/" .env
  docker compose -f docker-compose.prod.yml up -d

## 3. How to Check Logs

### Container logs
  ssh -i arm.pem ubuntu@13.234.115.21
  ssh -i arm.pem ubuntu@10.0.2.186
  cd /opt/arm-task
  docker compose -f docker-compose.prod.yml logs -f backend
  docker compose -f docker-compose.prod.yml logs -f frontend

### CloudWatch logs
  AWS Console -> CloudWatch -> Log Groups
  /arm-task/backend
  /arm-task/frontend

## 4. How to Restart Services

  cd /opt/arm-task
  docker compose -f docker-compose.prod.yml restart backend
  docker compose -f docker-compose.prod.yml restart frontend
  docker compose -f docker-compose.prod.yml down
  docker compose -f docker-compose.prod.yml up -d

## 5. How to Verify Health

  docker compose -f docker-compose.prod.yml ps
  curl http://localhost:4000/api/v1/healthcheck
  curl http://localhost:3000
  docker stats --no-stream
  df -h
  free -m

  CloudWatch Dashboard: AWS Console -> CloudWatch -> Dashboards -> arm-task-overview

## GitHub Secrets Required

  AWS_ACCESS_KEY_ID
  AWS_SECRET_ACCESS_KEY
  VITE_API_BASE_URL = http://10.0.2.186:4000/api/v1
