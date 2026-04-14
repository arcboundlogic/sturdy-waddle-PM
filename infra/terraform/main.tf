# ====================================
# Sturdy Waddle PM — Terraform (AWS)
# ====================================
# This is a scaffold for the cloud infrastructure.
# Actual resources will be configured in subsequent phases.

terraform {
  required_version = ">= 1.7.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Remote state backend (configure for your environment)
  # backend "s3" {
  #   bucket = "waddle-pm-terraform-state"
  #   key    = "infrastructure/terraform.tfstate"
  #   region = "us-east-1"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "sturdy-waddle-pm"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# ---- Variables ----

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "development"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro"
}

# ---- Outputs ----

output "region" {
  value = var.aws_region
}

output "environment" {
  value = var.environment
}
