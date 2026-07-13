variable "project_id" {}
variable "region" {}
variable "vpc_connector_id" {}
variable "sa_runtime" {}

resource "google_cloud_run_service" "backend" {
  name     = "stadiumai-backend-prod"
  location = var.region

  template {
    spec {
      service_account_name = var.sa_runtime
      containers {
        image = "gcr.io/${var.project_id}/stadiumai-backend:latest"
        
        env {
          name = "GCP_PROJECT"
          value = var.project_id
        }
        
        env {
          name = "JWT_SECRET"
          value_source {
            secret_key_ref {
              secret  = "jwt-secret"
              version = "latest"
            }
          }
        }
      }
    }
    
    metadata {
      annotations = {
        "run.googleapis.com/vpc-access-connector" = var.vpc_connector_id
        "run.googleapis.com/vpc-access-egress"    = "all-traffic"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}