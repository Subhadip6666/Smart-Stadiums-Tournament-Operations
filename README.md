# README

## Security Posture
**AuraDB Networking Configuration:**
To secure the database, the backend uses a static NAT IP via Cloud Run VPC egress. You must manually copy the `static_nat_ip` output from `terraform apply` and paste it into the Neo4j AuraDB IP Allow-list in the Aura console. This replaces the insecure `0.0.0.0/0` default.