# ADR 003: Fan PII Redaction & Bucketed Crowd Density Specification

## Status
Accepted

## Context
Tracking crowd movement in stadium concourses presents fan privacy concerns if individual location traces or exact headcounts are exposed.

## Decision
Enforce strict fan data anonymization at the API edge via `app.utils.anonymizer`:
1. Strip all PII fields (`user_id`, `name`, `email`, `phone`, `ticket_id`).
2. Convert raw headcounts into categorical density buckets (`low`, `moderate`, `high`, `critical`).

## Consequences
- Ensures GDPR and FIFA privacy compliance.
- Preserves operational intelligence for NOC operators without compromising individual fan privacy.