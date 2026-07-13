variable "project_id" {}
variable "region" {}

resource "google_compute_network" "vpc" {
  name                    = "stadiumai-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnet" {
  name          = "stadiumai-subnet"
  ip_cidr_range = "10.0.0.0/28"
  region        = var.region
  network       = google_compute_network.vpc.id
}

resource "google_vpc_access_connector" "connector" {
  name          = "stadiumai-vpc-cx"
  region        = var.region
  network       = google_compute_network.vpc.name
  ip_cidr_range = "10.8.0.0/28"
}

resource "google_compute_router" "router" {
  name    = "stadiumai-router"
  region  = var.region
  network = google_compute_network.vpc.id
}

resource "google_compute_address" "nat_ip" {
  name   = "stadiumai-nat-ip"
  region = var.region
}

resource "google_compute_router_nat" "nat" {
  name                               = "stadiumai-nat"
  router                             = google_compute_router.router.name
  region                             = var.region
  nat_ip_allocate_option             = "MANUAL_ONLY"
  nat_ips                            = [google_compute_address.nat_ip.self_link]
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
}

output "vpc_id" {
  value = google_compute_network.vpc.id
}

output "vpc_connector_id" {
  value = google_vpc_access_connector.connector.id
}

output "static_nat_ip" {
  value = google_compute_address.nat_ip.address
}