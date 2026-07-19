# ADR 002: Network Isolation & Serverless Egress Strategy for Neo4j AuraDB

## Status
Accepted

## Context
Neo4j AuraDB database instances require secure network access controls while serving stateless serverless application clients (Vercel Serverless Functions).

## Decision
Utilize strict TLS encryption (`bolt+s://` or `neo4j+s://`) with strong user credential authentication and environment-based secret isolation.

## Consequences
- Prevents unauthenticated database connections.
- Serverless driver connection pool cleanly managed via `get_neo4j_driver()` generator lifecycle.