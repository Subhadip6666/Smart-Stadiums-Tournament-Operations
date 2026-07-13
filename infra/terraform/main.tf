locals {
  static_nat_ip = module.networking.static_nat_ip
}

module "networking" {
  source = "./modules/networking"
  project_id = var.project_id
  region     = var.region
}

module "iam" {
  source = "./modules/iam"
  project_id = var.project_id
}

module "secrets" {
  source = "./modules/secrets"
  project_id = var.project_id
}

module "cloud_run" {
  source = "./modules/cloud-run"
  project_id = var.project_id
  region     = var.region
  
  vpc_connector_id = module.networking.vpc_connector_id
  
  sa_runtime    = module.iam.sa_runtime_email
}

output "static_nat_ip" {
  description = "The static egress IP used by Cloud NAT. You MUST manually copy this IP and add it to the Neo4j AuraDB IP Allow-list console."
  value       = local.static_nat_ip
}
