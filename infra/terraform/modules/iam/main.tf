variable "project_id" {}

resource "google_service_account" "sa_runtime" {
  account_id   = "sa-runtime"
  display_name = "StadiumAI NOC - Runtime Service Account"
}

resource "google_project_iam_member" "runtime_ai" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.sa_runtime.email}"
}

resource "google_project_iam_member" "runtime_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.sa_runtime.email}"
}

resource "google_project_iam_member" "runtime_redis" {
  project = var.project_id
  role    = "roles/redis.editor"
  member  = "serviceAccount:${google_service_account.sa_runtime.email}"
}

output "sa_runtime_email" { value = google_service_account.sa_runtime.email }