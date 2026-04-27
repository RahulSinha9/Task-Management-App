terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ── VPC ──────────────────────────────────────────────────────
resource "aws_vpc" "arm-task" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = { Name = "arm-task-vpc" }
}

# ── Subnets ──────────────────────────────────────────────────
resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.arm-task.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true
  tags = { Name = "arm-task-public-a" }
}

resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.arm-task.id
  cidr_block              = "10.0.3.0/24"
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true
  tags = { Name = "arm-task-public-b" }
}

resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.arm-task.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "${var.aws_region}a"
  tags = { Name = "arm-task-private-a" }
}

# ── Internet Gateway ─────────────────────────────────────────
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.arm-task.id
  tags   = { Name = "arm-task-igw" }
}

# ── NAT Gateway ──────────────────────────────────────────────
resource "aws_eip" "nat" {
  domain = "vpc"
}

resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public_a.id
  tags          = { Name = "arm-task-nat" }
}

# ── Route Tables ─────────────────────────────────────────────
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.arm-task.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
  tags = { Name = "arm-task-rt-public" }
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.arm-task.id
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat.id
  }
  tags = { Name = "arm-task-rt-private" }
}

resource "aws_route_table_association" "public_a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_b" {
  subnet_id      = aws_subnet.public_b.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private_a" {
  subnet_id      = aws_subnet.private_a.id
  route_table_id = aws_route_table.private.id
}

# ── Security Groups ──────────────────────────────────────────
resource "aws_security_group" "alb" {
  name        = "arm-task-alb-sg"
  description = "Allow HTTP/HTTPS from internet"
  vpc_id      = aws_vpc.arm-task.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "arm-task-alb-sg" }
}

resource "aws_security_group" "app" {
  name        = "arm-task-app-sg"
  description = "Allow traffic from ALB and restricted SSH"
  vpc_id      = aws_vpc.arm-task.id

  ingress {
    description     = "Frontend from ALB"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  ingress {
    description     = "Backend API from ALB"
    from_port       = 4000
    to_port         = 4000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  ingress {
    description = "SSH from admin only"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.admin_ip_cidr]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "arm-task-app-sg" }
}

resource "aws_security_group" "mongo" {
  name        = "arm-task-mongo-sg"
  description = "MongoDB only from app tier"
  vpc_id      = aws_vpc.arm-task.id

  ingress {
    description     = "MongoDB from app only"
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }
  tags = { Name = "arm-task-mongo-sg" }
}

# ── IAM Role for EC2 ─────────────────────────────────────────
resource "aws_iam_role" "ec2_role" {
  name = "arm-task-ec2-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "ec2_policy" {
  name = "arm-task-ec2-policy"
  role = aws_iam_role.ec2_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchGetImage",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchCheckLayerAvailability"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = "arn:aws:secretsmanager:${var.aws_region}:${var.aws_account_id}:secret:arm-task/*"
      },
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData",
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "arm-task-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

# ── ECR Repositories ─────────────────────────────────────────
resource "aws_ecr_repository" "backend" {
  name                 = "arm-task-backend"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration { scan_on_push = true }
  tags = { Name = "arm-task-backend" }
}

resource "aws_ecr_repository" "frontend" {
  name                 = "arm-task-frontend"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration { scan_on_push = true }
  tags = { Name = "arm-task-frontend" }
}

# ── Secrets Manager ──────────────────────────────────────────
resource "aws_secretsmanager_secret" "arm-task" {
  name                    = "arm-task/prod"
  description             = "TaskFlow production secrets"
  recovery_window_in_days = 7
}

# ── SNS Alerts ───────────────────────────────────────────────
resource "aws_sns_topic" "alerts" {
  name = "arm-task-alerts"
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# ── CloudWatch Log Groups ────────────────────────────────────
resource "aws_cloudwatch_log_group" "backend" {
  name              = "/arm-task/backend"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "frontend" {
  name              = "/arm-task/frontend"
  retention_in_days = 14
}


# ── EC2 Instance ─────────────────────────────────────────────
resource "aws_instance" "app" {
  ami                    = "ami-0388e3ada3d9812da"
  instance_type          = var.ec2_instance_type
  subnet_id              = aws_subnet.private_a.id
  vpc_security_group_ids = [aws_security_group.app.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name
  key_name               = "arm"

  root_block_device {
    volume_size           = 20
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  user_data = base64encode(<<-SCRIPT
    #!/bin/bash
    apt-get update -y
    apt-get install -y docker.io docker-compose-v2 curl jq unzip

    systemctl enable docker
    systemctl start docker
    usermod -aG docker ubuntu

    # Install AWS CLI
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
    unzip /tmp/awscliv2.zip -d /tmp
    /tmp/aws/install

    # App directory
    mkdir -p /opt/arm-task
    chown ubuntu:ubuntu /opt/arm-task

    # Install SSM Agent
    snap install amazon-ssm-agent --classic
    systemctl enable snap.amazon-ssm-agent.amazon-ssm-agent.service
    systemctl start snap.amazon-ssm-agent.amazon-ssm-agent.service

    echo "Bootstrap complete"
  SCRIPT
  )

  tags = { Name = "arm-task-app", Project = "arm-task" }
}

# ── CloudWatch Alarms ────────────────────────────────────────
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "arm-task-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 120
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "CPU above 80% for 4 minutes"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  dimensions          = { InstanceId = aws_instance.app.id }
}

resource "aws_cloudwatch_metric_alarm" "high_memory" {
  alarm_name          = "arm-task-high-memory"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "mem_used_percent"
  namespace           = "CWAgent"
  period              = 120
  statistic           = "Average"
  threshold           = 85
  alarm_description   = "Memory above 85%"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  dimensions          = { InstanceId = aws_instance.app.id }
}

resource "aws_cloudwatch_metric_alarm" "high_disk" {
  alarm_name          = "arm-task-high-disk"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "disk_used_percent"
  namespace           = "CWAgent"
  period              = 300
  statistic           = "Average"
  threshold           = 90
  alarm_description   = "Disk usage above 90%"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  dimensions          = { InstanceId = aws_instance.app.id, path = "/" }
}

resource "aws_cloudwatch_metric_alarm" "instance_status" {
  alarm_name          = "arm-task-instance-status"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "StatusCheckFailed"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Maximum"
  threshold           = 0
  alarm_description   = "EC2 instance status check failed"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  dimensions          = { InstanceId = aws_instance.app.id }
}

# ── CloudWatch Dashboard ─────────────────────────────────────

# ── CloudWatch Dashboard ─────────────────────────────────────
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "arm-task-overview"
  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 8
        height = 6
        properties = {
          title   = "CPU Utilization"
          region  = var.aws_region
          metrics = [["AWS/EC2", "CPUUtilization", "InstanceId", aws_instance.app.id]]
          period  = 60
          stat    = "Average"
          view    = "timeSeries"
          annotations = {
            horizontal = [{ value = 80, label = "Alert", color = "#ff0000" }]
          }
        }
      },
      {
        type   = "metric"
        x      = 8
        y      = 0
        width  = 8
        height = 6
        properties = {
          title   = "Memory Used %"
          region  = var.aws_region
          metrics = [["CWAgent", "mem_used_percent", "InstanceId", aws_instance.app.id]]
          period  = 60
          stat    = "Average"
          view    = "timeSeries"
          annotations = {
            horizontal = [{ value = 85, label = "Alert", color = "#ff0000" }]
          }
        }
      },
      {
        type   = "metric"
        x      = 16
        y      = 0
        width  = 8
        height = 6
        properties = {
          title   = "Disk Used %"
          region  = var.aws_region
          metrics = [["CWAgent", "disk_used_percent", "InstanceId", aws_instance.app.id, "path", "/"]]
          period  = 300
          stat    = "Average"
          view    = "timeSeries"
          annotations = {
            horizontal = [{ value = 90, label = "Alert", color = "#ff0000" }]
          }
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          title   = "Network In/Out"
          region  = var.aws_region
          metrics = [
            ["AWS/EC2", "NetworkIn", "InstanceId", aws_instance.app.id],
            ["AWS/EC2", "NetworkOut", "InstanceId", aws_instance.app.id]
          ]
          period = 60
          stat   = "Average"
          view   = "timeSeries"
          annotations = {
            horizontal = []
          }
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6
        properties = {
          title   = "Instance Status Check"
          region  = var.aws_region
          metrics = [["AWS/EC2", "StatusCheckFailed", "InstanceId", aws_instance.app.id]]
          period  = 60
          stat    = "Maximum"
          view    = "timeSeries"
          annotations = {
            horizontal = [{ value = 1, label = "Failed", color = "#ff0000" }]
          }
        }
      },
      {
        type   = "log"
        x      = 0
        y      = 12
        width  = 24
        height = 6
        properties = {
          title  = "Backend Error Logs"
          region = var.aws_region
          query  = "SOURCE '/arm-task/backend' | fields @timestamp, @message | filter @message like /[Ee]rror|ERROR/ | sort @timestamp desc | limit 50"
          view   = "table"
        }
      }
    ]
  })
}

# ── Bastion Host ─────────────────────────────────────────────
resource "aws_security_group" "bastion" {
  name        = "arm-task-bastion-sg"
  description = "Bastion host SSH access"
  vpc_id      = aws_vpc.arm-task.id

  ingress {
    description = "SSH from admin only"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.admin_ip_cidr]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "arm-task-bastion-sg" }
}

resource "aws_instance" "bastion" {
  ami                         = "ami-0388e3ada3d9812da"
  instance_type               = "t3.micro"
  subnet_id                   = aws_subnet.public_a.id
  vpc_security_group_ids      = [aws_security_group.bastion.id]
  key_name                    = "arm"
  associate_public_ip_address = true

  tags = { Name = "arm-task-bastion", Project = "arm-task" }
}

resource "aws_security_group_rule" "app_ssh_from_bastion" {
  type                     = "ingress"
  from_port                = 22
  to_port                  = 22
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.bastion.id
  security_group_id        = aws_security_group.app.id
  description              = "SSH from bastion only"
}

# ── Staging EC2 Instance (private subnet) ────────────────────
resource "aws_instance" "staging" {
  ami                        = "ami-0388e3ada3d9812da"
  instance_type              = "t3.micro"
  subnet_id                  = aws_subnet.private_a.id
  vpc_security_group_ids     = [aws_security_group.app.id]
  iam_instance_profile       = aws_iam_instance_profile.ec2_profile.name
  key_name                   = "arm"

  root_block_device {
    volume_size           = 20
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  tags = { Name = "arm-task-staging", Project = "arm-task", Environment = "staging" }
}

# ── Production domain listener rules ─────────────────────────
resource "aws_lb_listener_rule" "prod_frontend" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 20

  condition {
    host_header { values = ["arm-task.devopslabx.com"] }
  }

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

resource "aws_lb_listener_rule" "prod_api" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 19

  condition {
    host_header { values = ["arm-task.devopslabx.com"] }
  }

  condition {
    path_pattern { values = ["/api/*"] }
  }

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

# ── Application Load Balancer ─────────────────────────────────
resource "aws_lb" "main" {
  name               = "arm-task-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = [aws_subnet.public_a.id, aws_subnet.public_b.id]
  tags               = { Name = "arm-task-alb" }
}

resource "aws_lb_target_group" "frontend" {
  name     = "arm-task-frontend-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = aws_vpc.arm-task.id
  health_check {
    path                = "/"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
  }
}

resource "aws_lb_target_group" "backend" {
  name     = "arm-task-backend-tg"
  port     = 4000
  protocol = "HTTP"
  vpc_id   = aws_vpc.arm-task.id
  health_check {
    path                = "/api/v1/healthcheck"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
  }
}

resource "aws_lb_target_group_attachment" "frontend" {
  target_group_arn = aws_lb_target_group.frontend.arn
  target_id        = aws_instance.app.id
  port             = 3000
}

resource "aws_lb_target_group_attachment" "backend" {
  target_group_arn = aws_lb_target_group.backend.arn
  target_id        = aws_instance.app.id
  port             = 4000
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = "arn:aws:acm:ap-south-1:773802564338:certificate/251af80d-4585-49d7-aae1-c374b18e21de"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 100
  condition {
    path_pattern { values = ["/api/*"] }
  }
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

resource "aws_lb_target_group" "staging_frontend" {
  name     = "arm-task-staging-frontend-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = aws_vpc.arm-task.id
  health_check {
    path                = "/"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
  }
}

resource "aws_lb_target_group" "staging_backend" {
  name     = "arm-task-staging-backend-tg"
  port     = 4000
  protocol = "HTTP"
  vpc_id   = aws_vpc.arm-task.id
  health_check {
    path                = "/api/v1/healthcheck"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
  }
}

resource "aws_lb_target_group_attachment" "staging_frontend" {
  target_group_arn = aws_lb_target_group.staging_frontend.arn
  target_id        = aws_instance.staging.id
  port             = 3000
}

resource "aws_lb_target_group_attachment" "staging_backend" {
  target_group_arn = aws_lb_target_group.staging_backend.arn
  target_id        = aws_instance.staging.id
  port             = 4000
}

resource "aws_lb_listener_rule" "staging_frontend" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 10
  condition {
    host_header { values = ["staging-arm-task.devopslabx.com"] }
  }
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.staging_frontend.arn
  }
}

resource "aws_lb_listener_rule" "staging_api" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 9
  condition {
    host_header { values = ["staging-arm-task.devopslabx.com"] }
  }
  condition {
    path_pattern { values = ["/api/*"] }
  }
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.staging_backend.arn
  }
}
