# StadiumAI NOC — Operational Runbook

## Overview
This runbook defines standard operating procedures for Network Operations Center (NOC) personnel and automated monitoring systems during FIFA World Cup 2026 match-day operations.

---

## 1. Incident Triage Operating Procedures

### High-Density Crowd Congestion (Level 4/5)
1. **Detection**: Crowd Heatmap flags zone status as `critical` (`/v1/crowd/heatmap`).
2. **Automated AI Action**: `IncidentService` triggers Playbook `PB-CROWD-03` and calculates alternative wayfinding routes using `ACCESSIBLE_PATH_QUERY`.
3. **Operator Intervention**:
   - Verify camera feed for zone `Z-GATE-E` / `Z-PLAZ-E`.
   - Dispatch nearest Crowd Management Ops unit (`TEAM-CROWD`).
   - Broadcast detour instructions to fan mobile app via push telemetry.

### Medical Emergency Response
1. **Detection**: Field steward submits incident via `POST /v1/incidents` with category `Medical`.
2. **Automated Action**: Gemini AI triage assigns priority score `5` and dispatches `Medical First Responders` (`PB-MED-01`).
3. **SLA**: Medical ETA must remain under 120 seconds.

---

## 2. Infrastructure Health & Troubleshooting

### Neo4j AuraDB Connection Failures
- **Symptom**: `GET /v1/navigate/route` returns `503 Service Unavailable` (`detail: "Navigation service temporarily unavailable due to database connectivity issue"`).
- **Diagnostics**:
  1. Run backend readiness check: `GET /ready`
  2. Check Neo4j AuraDB console status.
  3. Verify `NEO4J_URI`, `NEO4J_USER`, and `NEO4J_PASSWORD` environment variables in Vercel.
- **Mitigation**: The system automatically serves 503 error banners to the frontend without displaying stale or corrupted graph coordinates.

### Rate Limit Threshold Management
- **Symptom**: Client receives HTTP `429 Too Many Requests`.
- **Policy**: Public fan routes cap at `30 req/min`; authenticated staff routes cap at `200 req/min`.
- **Reset**: Sliding window automatically clears key counters after 60 seconds.

---

## 3. Maintenance Commands

```bash
# Execute unit test suite
make test

# Build static production bundle
make build

# Run linter checks
make lint
```