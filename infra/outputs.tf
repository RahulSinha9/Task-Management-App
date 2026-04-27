output "ecr_backend_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_url" {
  value = aws_ecr_repository.frontend.repository_url
}

output "vpc_id" {
  value = aws_vpc.arm-task.id
}

output "public_subnet_a" {
  value = aws_subnet.public_a.id
}

output "private_subnet_a" {
  value = aws_subnet.private_a.id
}

output "secrets_manager_arn" {
  value = aws_secretsmanager_secret.arm-task.arn
}

output "sns_topic_arn" {
  value = aws_sns_topic.alerts.arn
}

output "ec2_instance_id" {
  value = aws_instance.app.id
}

output "bastion_public_ip" {
  value = aws_instance.bastion.public_ip
}

output "staging_instance_id" {
  value = aws_instance.staging.id
}

output "staging_private_ip" {
  value = aws_instance.staging.private_ip
}

output "alb_dns_name" {
  value = aws_lb.main.dns_name
}
