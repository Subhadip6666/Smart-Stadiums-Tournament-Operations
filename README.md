# StadiumAI NOC — Network Operations Center

StadiumAI NOC is a state-of-the-art Network Operations Center platform built to manage and optimize stadium crowd dynamics, security incidents, navigation routing, eco-friendly transit, and live operations in real-time for FIFA World Cup 2026.

---

## 1. Key Platform Features

- **Dijkstra Spatial Wayfinding & Eco-Transit**: Shortest path, accessible step-free, and green shuttle transit routing over Neo4j.
- **Service-Layer Architecture**: Strict separation of concerns — API routers (`/v1/navigate`, `/v1/crowd`, `/v1/incidents`) delegate business logic exclusively to dedicated service classes (`NavigationService`, `CrowdService`, `IncidentService`).
- **AI Triage & Emergency Playbooks**: Real-time incident severity scoring, automated dispatch, and reasoning powered by Google Gemini AI.
- **Fail-Safe Resilience**: No silent fallbacks to fake data. Unreachable Neo4j databases return a clean HTTP 503 Service Unavailable with user-facing alert banners.
- **Fan Data Privacy**: GDPR-compliant anonymization via `app.utils.anonymizer` converting raw crowd counts to bucketed density levels (`low`, `moderate`, `high`, `critical`).

---

## 2. Technology Stack

### Frontend
- **Framework & Tooling:** React 18, TypeScript, Vite, TailwindCSS
- **State Management:** Zustand (`authStore`, `crowdStore`, `incidentStore`)
- **Icons:** Lucide React
- **Client Routing:** React Router DOM v6
- **Code Linter:** Oxlint

### Backend & API Layer
- **API Framework:** FastAPI (Python 3.12)
- **Deployment Platform:** Vercel Serverless Functions (`api/index.py`)
- **Database Graph Layer:** Neo4j AuraDB (Dijkstra algorithm)
- **AI Agent Integration:** Google Gemini API (`google-genai`)
- **Logging & Security:** Structured logging, JWT bearer tokens, sliding-window rate limiting

---

## 3. Developer Workflows & Commands

```bash
# Display all Makefile targets
make help

# Run FastAPI backend locally
make dev-backend

# Run Vite React frontend locally
make dev-frontend

# Execute full pytest suite (16 tests)
make test

# Run frontend linter
make lint

# Compile production TypeScript bundle
make build
```