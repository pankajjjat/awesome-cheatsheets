# Terraform / OpenTofu — Cheatsheet

*Terraform is an IaC tool by HashiCorp. OpenTofu is the open-source fork (Linux Foundation).
HCL-based declarative configuration for provisioning infrastructure across providers.*

---

## Installation

```bash
# Terraform
# https://developer.hashicorp.com/terraform/install
# macOS: brew install terraform
# Linux: wget + unzip from releases.hashicorp.com
# Windows: choco install terraform or download from website

terraform -version                    # Verify installation
terraform -help                       # General help
terraform <subcommand> -help          # Subcommand help

# OpenTofu (open-source fork)
# https://opentofu.org/docs/intro/install/
# macOS: brew install opentofu
# Linux: install from tofu-releases.net
# Windows: choco install opentofu

tofu version                          # Verify OpenTofu
# Commands are identical — just replace "terraform" with "tofu"
```

## Core Lifecycle

```bash
# === INIT ===
terraform init                        # Initialize working directory (downloads providers, modules)
terraform init -upgrade               # Upgrade providers/modules to latest in constraints
terraform init -reconfigure           # Reconfigure backend (ignore cached config)

# === PLAN ===
terraform plan                        # Show execution plan (what will change)
terraform plan -out plan.tfplan       # Save plan to file
terraform plan -destroy               # Plan destruction of all resources
terraform plan -target=resource       # Plan changes for specific resource
terraform plan -var="env=prod"        # Set variables during plan

# === APPLY ===
terraform apply                       # Apply changes (with approval prompt)
terraform apply plan.tfplan           # Apply saved plan (no prompt)
terraform apply -auto-approve         # Apply without prompt (CI/CD)
terraform apply -destroy              # Destroy all resources
terraform apply -target=resource      # Apply specific resource

# === DESTROY ===
terraform destroy                     # Destroy all managed infrastructure
terraform destroy -target=resource    # Destroy specific resource
terraform destroy -auto-approve       # Destroy without prompt

# === VALIDATE & FORMAT ===
terraform validate                    # Validate configuration syntax
terraform fmt                         # Format HCL files to canonical style
terraform fmt -recursive              # Recursively format all HCL files
terraform fmt -check                  # Check formatting (exit 1 if unformatted)

# === STATE ===
terraform state list                  # List all resources in state
terraform state show <resource>       # Show attributes of a resource
terraform state mv <src> <dest>       # Move item in state (rename/refactor)
terraform state rm <resource>         # Remove resource from state (no destroy)
terraform state pull > state.json     # Pull state to local file
terraform state push state.json       # Push state from local file (careful!)
terraform state replace-provider      # Replace provider in state
terraform state list --state=path     # List from specific state file

# === OUTPUTS ===
terraform output                      # Show all output values
terraform output <name>               # Show specific output value
terraform output -json                # Output as JSON (scriptable)
terraform output -raw                 # Output as raw string (no quotes)

# === WORKSPACES ===
terraform workspace list              # List workspaces
terraform workspace show              # Show current workspace
terraform workspace new <name>        # Create new workspace
terraform workspace select <name>     # Switch workspace
terraform workspace delete <name>     # Delete workspace

# === OTHER ===
terraform get                         # Download and update modules
terraform graph                       # Generate dependency graph (DOT format)
terraform version                     # Show version info
terraform providers                   # Show provider requirements
terraform providers lock              # Write provider lockfile (.terraform.lock.hcl)
terraform console                     # Interactive console for expressions
terraform taint <resource>            # Mark resource for recreation (legacy — use -replace)
terraform untaint <resource>          # Remove taint
terraform force-unlock <lock-id>      # Force unlock state (use carefully)
```

## HCL Syntax Basics

```hcl
# Block syntax
resource "aws_instance" "web" {
  # Block labels: TYPE, NAME
  # Arguments
  ami           = "ami-abc123"
  instance_type = "t3.micro"

  # Nested blocks
  tags = {
    Name = "Web Server"
  }
}

# Comments
# Single line
/* Multi
   line */
// Also single line (unofficial but works)

# String interpolation
"Hello, ${var.name}!"
"user_${count.index}"

# Heredoc
<<-EOF
  Indented
  multiline
  string
EOF
```

## Resource & Data Sources

```hcl
# Resource — manages infrastructure object
resource "aws_s3_bucket" "data" {
  bucket = "my-app-data-${var.environment}"
  force_destroy = var.environment == "dev" ? true : false
}

# Data source — reads existing infrastructure (no management)
data "aws_ami" "ubuntu" {
  most_recent = true
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-*-amd64-*"]
  }
  owners = ["099720109477"]
}

# Reference data source
resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"
}

# Using outputs
output "instance_ip" {
  value       = aws_instance.web.public_ip
  description = "The public IP of the web instance"
}
```

## Variables & Locals

```hcl
# Input variables
variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Must be dev, staging, or prod."
  }
}

# Variable types
variable "instance_count" { type = number }
variable "enabled"         { type = bool }
variable "tags"            { type = map(string) }
variable "cidr_blocks"     { type = list(string) }
variable "config" {
  type = object({
    name    = string
    port    = number
    enabled = bool
  })
}

# Local values (computed expressions)
locals {
  name_prefix = "${var.environment}-app"
  common_tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
  }
  instance_type = var.environment == "prod" ? "t3.large" : "t3.micro"
}

# Variable values from files
# terraform.tfvars:
#   environment = "prod"
#   instance_count = 3
#
# .auto.tfvars — loaded automatically
# *.auto.tfvars — also loaded automatically
#
# Environment variables:
#   TF_VAR_environment=prod

# Variable precedence (lowest to highest):
# 1. Default value
# 2. terraform.tfvars
# 3. *.auto.tfvars (alphabetical)
# 4. -var or -var-file CLI flag
```

## Modules

```hcl
# Module structure:
# modules/
# ├── networking/
# │   ├── main.tf
# │   ├── variables.tf
# │   ├── outputs.tf
# │   └── versions.tf
# └── compute/
#     ├── main.tf
#     ...

# Calling a module
module "networking" {
  source = "./modules/networking"    # Local path
  # source = "terraform-aws-modules/vpc/aws"  # Registry
  # source = "git::https://github.com/org/repo.git"  # Git
  # source = "git::ssh://git@github.com/org/repo.git?ref=v1.0"  # Git with tag

  environment = var.environment
  vpc_cidr    = "10.0.0.0/16"

  # Module inputs
  tags = local.common_tags
}

# Module outputs
resource "aws_instance" "app" {
  subnet_id = module.networking.public_subnet_id
}

# Module registry
# https://registry.terraform.io/
# terraform-aws-modules/* — AWS official
# Azure, GCP, etc. all have registry modules
```

## Backends (Remote State)

```hcl
# Terraform
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "prod/network/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"  # State locking
  }
}

# Other backends:
# backend "azurerm" { ... }           # Azure Storage
# backend "gcs" { ... }              # Google Cloud Storage
# backend "pg" { ... }               # PostgreSQL
# backend "consul" { ... }           # Consul
# backend "kubernetes" { ... }       # Kubernetes Secret
# backend "http" { ... }             # Custom HTTP API
# backend "local" { ... }            # Local file (default)

# Partial config (CI/CD — pass via CLI)
# terraform init \
#   -backend-config="bucket=${TF_STATE_BUCKET}" \
#   -backend-config="key=${TF_STATE_KEY}"

# OpenTofu supports OCI-compatible backends natively
```

## Workspaces (State Isolation)

```hcl
# Workspaces create separate state files for the same config
# S3 backend key: <key>/<workspace>/terraform.tfstate

# Use workspace in config
resource "aws_instance" "app" {
  tags = {
    Name      = "app-${terraform.workspace}"
    Workspace = terraform.workspace
  }
}

# Workspace-based conditional
instance_type = terraform.workspace == "prod" ? "t3.large" : "t3.micro"
```

## Provider Configuration

```hcl
terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = ">= 3.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  # Assume role
  assume_role {
    role_arn = "arn:aws:iam::123456789:role/terraform-role"
  }

  # Default tags on all resources (AWS provider 5.0+)
  default_tags {
    tags = {
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# Multiple providers (aliases)
provider "aws" {
  alias  = "west"
  region = "us-west-2"
}

resource "aws_instance" "west" {
  provider = aws.west
  # ...
}
```

## Provisioners & Lifecycle

```hcl
resource "aws_instance" "web" {
  # ...

  # Provisioners (use sparingly — prefer user_data, config mgmt, or custom images)
  provisioner "remote-exec" {
    inline = [
      "sudo apt update",
      "sudo apt install -y nginx",
    ]
    connection {
      type        = "ssh"
      host        = self.public_ip
      user        = "ubuntu"
      private_key = file("~/.ssh/id_rsa")
    }
  }

  provisioner "local-exec" {
    command = "echo ${self.public_ip} >> ips.txt"
  }

  # lifecycle rules
  lifecycle {
    create_before_destroy = true                    # Create new before destroying old
    prevent_destroy       = true                    # Prevent accidental deletion
    ignore_changes        = [ami, tags["UpdatedAt"]] # Ignore specific attributes
    replace_triggered_by  = [aws_s3_bucket.data.arn] # Replace when dependency changes
  }
}
```

## Functions

```hcl
# String
upper("hello")      # "HELLO"
lower("HELLO")      # "hello"
title("hello world") # "Hello World"
trimspace(" hi ")   # "hi"
format("%s-%d", "app", 1)  # "app-1"
join(", ", ["a", "b"])     # "a, b"
split(",", "a,b,c")        # ["a", "b", "c"]
replace("hello", "l", "x") # "hexxo"

# Numeric
max(1, 2, 3)            # 3
min(1, 2, 3)            # 1
ceil(1.5)               # 2
floor(1.5)              # 1
abs(-5)                 # 5

# Collection
length(["a", "b", "c"])    # 3
element(["a", "b"], 1)     # "b"
index(["a", "b", "c"], "b") # 1
contains(["a", "b"], "a")  # true
distinct([1, 1, 2])        # [1, 2]
flatten([[1], [2], [3]])   # [1, 2, 3]
lookup({a=1, b=2}, "a", 0) # 1
merge({a=1}, {b=2})        # {a=1, b=2}
zipmap(["a","b"], [1,2])   # {a=1, b=2}

# Type conversion
tostring(42)     # "42"
tonumber("42")   # 42
tolist({a=1})    # tolist(["a", "1"])
toset([1, 1, 2]) # set([1, 2])

# File
file("path/to/file")        # Read file as string
filebase64("path/to/file")  # Read file as base64
templatefile("tpl.tftpl", { name = "world" }) # Render template

# Encoding
base64encode("hello")
base64decode("aGVsbG8=")

# Network
cidrsubnet("10.0.0.0/16", 8, 1)   # "10.0.1.0/24"
cidrhost("10.0.0.0/24", 10)       # "10.0.0.10"
cidrnetmask("10.0.0.0/24")        # "255.255.255.0"

# Time
timestamp()        # Current UTC timestamp
formatdate("YYYY-MM-DD", timestamp())

# Condition
condition ? true_val : false_val
coalesce("", null, "fallback")  # "fallback"
```

## Expressions & Meta-Arguments

```hcl
# for expression
[for name in var.names : upper(name)]
{for k, v in var.tags : k => upper(v)}

# Splat expression
aws_instance.web[*].id               # List of all IDs
aws_instance.web[*].private_ip       # List of private IPs

# count — create multiple resources
resource "aws_instance" "app" {
  count = var.instance_count
  name  = "app-${count.index}"
  # ...
}

# for_each — create from map/set
resource "aws_s3_bucket" "data" {
  for_each = toset(var.bucket_names)
  bucket   = each.value  # or each.key (same for set)
}
# or with map:
# for_each = var.bucket_configs
# bucket   = each.key
# acl      = each.value.acl

# depends_on — explicit dependency
resource "aws_s3_bucket" "data" {
  # ...
  depends_on = [aws_iam_role_policy.data_policy]
}

# Null resource — for triggers/scripts
resource "null_resource" "deploy" {
  triggers = {
    build_id = var.build_id
  }
  provisioner "local-exec" {
    command = "deploy.sh ${aws_instance.web.public_ip}"
  }
}

# moved blocks (refactoring in Terraform 1.1+)
moved {
  from = aws_instance.old_name
  to   = aws_instance.new_name
}
```

## Best Practices

```
1. Use remote state with locking (S3+DynamoDB / Azure Storage / GCS)
2. Structure by environment:
   terraform/environments/
   ├── dev/
   │   ├── main.tf
   │   └── terraform.tfvars
   └── prod/
       └── main.tf
   OR use workspaces for simpler setups

3. Always pin provider versions (terraform.required_providers)
4. Use modules for reusable components
5. Never manually edit .tfstate
6. Use terraform plan before every apply in CI/CD
7. Separate state per environment
8. Keep secrets out of state (use Vault, AWS Secrets Manager)
9. Use .terraform.lock.hcl (committed to version control)
10. Prefer data sources over hardcoded values
11. Use tflint and tfsec for linting/security
12. Terragrunt for DRY configurations across environments
```

## Common Provisioners (CI/CD)

```bash
# GitHub Actions
# uses: hashicorp/setup-terraform@v3
# with:
#   terraform_version: 1.7.0
# terraform fmt -check
# terraform init
# terraform validate
# terraform plan
# terraform apply -auto-approve

# Atlantis — PR-driven Terraform automation
# https://www.runatlant.is/

# Terragrunt — keep configurations DRY
# terragrunt run-all plan
# terragrunt run-all apply

# TFLint — Terraform linter
# tflint --init
# tflint

# Checkov — security scanning
# checkov -d .
