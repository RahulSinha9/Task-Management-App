# arm-task Architecture and Network Design

## Network Diagram

Internet
    |
    v
VPC: 10.0.0.0/16 (ap-south-1)
    |
    |-- Public Subnet 10.0.1.0/24 (ap-south-1a)
    |       |-- Bastion Host (13.234.115.21)
    |       |-- NAT Gateway (outbound for private subnet)
    |       |-- Internet Gateway
    |
    |-- Private Subnet 10.0.2.0/24 (ap-south-1a)
            |-- Staging EC2 (10.0.2.179) t3.micro
            |       |-- Docker: frontend:3000
            |       |-- Docker: backend:4000
            |       |-- Docker: mongodb:27017 (internal only)
            |
            |-- Production EC2 (10.0.2.186) t3.small
                    |-- Docker: frontend:3000
                    |-- Docker: backend:4000
                    |-- Docker: mongodb:27017 (internal only)

## Supporting AWS Services

  ECR:             773802564338.dkr.ecr.ap-south-1.amazonaws.com
  Secrets Manager: arm-task/prod
  CloudWatch:      Alarms + Dashboard + Log Groups
  SNS:             arm-task-alerts (email notifications)
  IAM:             arm-task-ec2-role (least privilege)

## Security Groups

  arm-task-alb-sg:     Allow 80, 443 from internet
  arm-task-app-sg:     Allow 3000, 4000 from ALB; 22 from bastion
  arm-task-mongo-sg:   Allow 27017 from app SG only
  arm-task-bastion-sg: Allow 22 from admin IP only

## CI/CD Flow

  1. Developer pushes to staging branch
  2. GitHub Actions runs lint and test
  3. Builds Docker images and pushes to ECR
  4. Deploys to Staging EC2 via SSM (auto)
  5. Health check on staging
  6. Developer pushes to main branch
  7. Manual approval required in GitHub
  8. Deploys to Production EC2 via SSM
  9. Tags release prod-{sha}

## Docker Networking

  Network: arm-task-net (bridge driver)
    frontend  -> proxies /api/* to backend:4000
    backend   -> connects to mongodb:27017
    mongodb   -> no external ports, internal only

## Security Design

  No public DB:        MongoDB has no host ports exposed
  No hardcoded secrets: AWS Secrets Manager for all credentials
  Least privilege IAM: EC2 role allows ECR, Secrets, CloudWatch only
  Restricted SSH:      Bastion only, port 22 from admin IP /32
  Private app tier:    EC2 in private subnet, no public IP
  Container security:  Non-root user in Dockerfile
  Encrypted volumes:   EBS encrypted at rest
