# StadiumAI NOC — Project Brain

Last updated: 2026-07-12T21:38:09+05:30  
Last updated by: Antigravity (correction pass #1)

> **Corrections in this pass (v2):**
> 1. **Section 1 — GCP Project ID**: marked as unconfirmed; `production.tfvars` is empty; `stadiumai-project` appears only as a default/placeholder in `config.py` and `.env.example`. The CD workflow references `sa-cicd@stadiumai-project.iam.gserviceaccount.com`, lending it some credibility but it remains unverified against live infra.
> 2. **Section 3 — Verified vs Assumed**: elevated "Terraform plan/apply never run" and "Neo4j live connectivity never tested" to top-level callouts; no longer buried.
> 3. **Section 4 — Known Issues**: backfilled four security remediation items (AuraDB IP allow-list, sa_chat destruction, JWT_SECRET→Secret Manager, redis.editor role).
> 4. **Section 6 — Env/Secrets Map**: added `JWT_SECRET` Secret Manager entry; noted `jwt_secret` absent from `.env` and `.env.example` (loaded from Secret Manager in prod).
> 5. **Section 7 — Decisions Log**: added single sa-runtime SA compromise decision, .gitignore-before-first-commit decision.
> 6. **Section 2 — Architecture Snapshot**: expanded Key Files list with actual per-file evidence.
> 7. **Section 8 — Open Questions**: expanded with all blocked human-action items from security remediation.

---

## 1. Project Overview

StadiumAI NOC is a real-time Network Operations Center platform for FIFA World Cup 2026 stadium management. It provides AI-powered crowd intelligence (density heatmaps, forecasts), graph-based wayfinding (shortest path, accessible routes via Neo4j), multilingual fan chat (Gemini 2.5 Flash), and automated incident triage with response-team dispatch. Built for a competition/hackathon submission with production-grade security hardening.

- **Tech Stack:**
  - **Backend:** Python ^3.12, FastAPI ^0.111.0, Uvicorn ^0.30.1, Neo4j driver ^5.21.0, Redis ^5.0.7, google-cloud-pubsub ^2.21.3, google-genai ^0.5.0, structlog ^24.2.0, python-jose ^3.3.0, google-auth ^2.30.0, sse-starlette <3.0.0, pydantic-settings ^2.3.4.
  - **Frontend:** React ^19.2.7, React DOM ^19.2.7, Vite ^8.1.1, TypeScript ~6.0.2, TailwindCSS ^3.4.19, Zustand ^5.0.14, React Router DOM ^7.18.1, Framer Motion ^12.42.2, Lucide React ^1.24.0, Radix UI react-slot ^1.3.0, class-variance-authority ^0.7.1, clsx ^2.1.1, tailwind-merge ^3.6.0.
  - **DevDeps:** pytest ^8.2.2, pytest-asyncio ^0.23.7, httpx ^0.27.0, oxlint ^1.71.0.
  - **Infrastructure:** Terraform (hashicorp/google ~> 5.0, hashicorp/google-beta ~> 5.0). GitHub Actions CI/CD (4 workflows).
- **GCP Environment:**
  - Project ID: **unconfirmed** — `stadiumai-project` appears in `backend/app/config.py` (default), `backend/.env.example`, and `cd-production.yml` (SA email `sa-cicd@stadiumai-project.iam`). However, `production.tfvars` is empty and no `terraform.tfvars` exists. Treat as placeholder until verified against live `gcloud` output.
  - Region: `asia-south1` (Terraform default, confirmed in `infra/terraform/variables.tf` and CD workflows).
  - Deployed Services (Terraform-defined, **not yet applied**): Cloud Run (`stadiumai-backend-prod`), Serverless VPC Access Connector (`stadiumai-vpc-cx`), Cloud NAT (`stadiumai-nat` with static IP `stadiumai-nat-ip`), Secret Manager (`jwt-secret`), IAM (`sa-runtime`).

---

## 2. Architecture Snapshot

### Folder Structure (actual, top 3 levels)

```
Project-4/
├── backend/
│   ├── app/
│   │   ├── config.py, main.py, dependencies.py
│   │   ├── routers/        (navigation, crowd, chat, incidents, health, ingest[stub])
│   │   ├── services/       (genai/orchestrator+guardrails, chat_service[stub], crowd_service[stub], incident_service[stub], navigation_service[stub])
│   │   ├── graph/          (driver, queries, seed[stub])
│   │   ├── models/         (schemas, neo4j_models[stub], enums[stub])
│   │   ├── middleware/     (rate_limit, auth[stub], cors[stub])
│   │   └── utils/          (logging, anonymizer[stub], telemetry[stub])
│   ├── tests/              (conftest[stub], unit/, integration/)
│   ├── verify_jwt.py, verify_neo4j.py
│   ├── pyproject.toml, Dockerfile, .env, .env.example
├── frontend/
│   ├── src/
│   │   ├── App.tsx, main.tsx, index.css, App.css
│   │   ├── pages/          (Dashboard, Incidents, Settings — implemented; ChatPage, FanHome, NOCDashboard, NavigatePage — stubs)
│   │   ├── components/     (StadiumMap — implemented; chat/, common/, crowd/, dashboard/, incidents/, navigation/ — subdirs)
│   │   ├── hooks/          (useSSE, useChat, useRoute, useCrowd — all stubs, 18 bytes each)
│   │   ├── stores/         (authStore, crowdStore, incidentStore — all stubs)
│   │   ├── services/       (api.ts — stub)
│   │   └── types/, utils/
│   ├── package.json, vite.config.ts, Dockerfile, nginx.conf, tailwind.config.js
├── infra/
│   ├── terraform/
│   │   ├── main.tf, provider.tf, variables.tf, outputs.tf
│   │   ├── modules/        (cloud-run, networking, iam, secrets, redis[stub], pubsub[stub], monitoring[stub])
│   │   └── environments/   (production.tfvars[empty], staging.tfvars[empty])
│   └── scripts/            (deploy.sh[empty], rotate-secrets.sh[empty], seed-neo4j.sh)
├── docs/                   (BRAIN.md, architecture-blueprint.md, api-spec.yaml, runbook.md[stub], adr/)
├── data/                   (stadiums/, playbooks/)
├── .github/workflows/      (ci-backend.yml, ci-frontend.yml, cd-staging.yml, cd-production.yml)
├── .gitignore, README.md, Makefile[empty]
```

> **Note on stubs:** Files marked `[stub]` are 17–18 bytes (typically just a comment or empty placeholder). They exist in the directory but contain no functional code.

### Key Files & Responsibilities

| File | Responsibility |
|------|---------------|
| `backend/app/main.py` | FastAPI app entry: lifespan (Neo4j shutdown), CORS, rate-limit middleware, global exception handler (H-02 fix), router registration. |
| `backend/app/config.py` | Pydantic `Settings` class: loads `neo4j_*`, `gemini_api_key`, `redis_url`, `jwt_secret`, `cors_origins` from env/.env. |
| `backend/app/dependencies.py` | JWT verification via python-jose (C-02 fix); Neo4j driver dependency injection. `jwt_secret` loaded from `settings` (Secret Manager in prod). |
| `backend/app/routers/navigation.py` | `GET /v1/navigate/route` — Dijkstra shortest-path / accessible-path queries against Neo4j. Auth required. |
| `backend/app/routers/crowd.py` | `GET /v1/crowd/heatmap` (SSE stream, bucketed density only per ADR-003), `GET /v1/crowd/zone/{zone_id}`. |
| `backend/app/routers/chat.py` | `POST /v1/chat/message` — delegates to GenAI orchestrator. |
| `backend/app/routers/incidents.py` | `POST /v1/incidents` — simulated AI triage (hardcoded logic, not wired to real Gemini). |
| `backend/app/routers/health.py` | `GET /health` (liveness), `GET /ready` (readiness — checks Neo4j connectivity). |
| `backend/app/services/genai/orchestrator.py` | Gemini 2.5 Flash integration: prompt construction, input sanitization, output validation, graceful fallback. |
| `backend/app/services/genai/guardrails.py` | Regex-based prompt injection sanitizer + output leak validator. |
| `backend/app/middleware/rate_limit.py` | In-memory token-bucket rate limiter (H-04 fix). NOT backed by Redis yet (see Known Issues). |
| `backend/app/graph/driver.py` | Async Neo4j singleton driver with `close_instance()` for clean shutdown (M-03 fix). |
| `backend/app/graph/queries.py` | Parameterized Cypher: `SHORTEST_PATH_QUERY` (Dijkstra), `ACCESSIBLE_PATH_QUERY` (accessibility-filtered Dijkstra). |
| `backend/app/utils/logging.py` | structlog JSON logging setup — timestamps, log level, stack info, exception formatting. |
| `infra/terraform/modules/iam/main.tf` | Defines `sa-runtime` SA with 3 roles: `aiplatform.user`, `secretmanager.secretAccessor`, `redis.editor`. **No `sa_chat` or per-service SAs.** |
| `infra/terraform/modules/secrets/main.tf` | Creates `jwt-secret` in Secret Manager with placeholder value `replace-me-in-production`. |
| `infra/terraform/modules/cloud-run/main.tf` | Deploys `stadiumai-backend-prod` on Cloud Run with VPC connector, `sa_runtime` SA, `JWT_SECRET` injected from Secret Manager. |
| `infra/terraform/modules/networking/main.tf` | VPC, subnet, VPC Access Connector, Cloud Router, static NAT IP, Cloud NAT. |
| `frontend/src/App.tsx` | Root layout + routing: Dashboard, Incidents, Settings pages. Dark-theme shell. |
| `docs/architecture-blueprint.md` | 900-line authoritative design doc: architecture, data model, API spec, security, scalability. |
| `.github/workflows/cd-production.yml` | GitHub Actions CD: deploys backend + frontend to Cloud Run via Workload Identity Federation (SA: `sa-cicd@stadiumai-project.iam`). |

### Data Flow (verified from code)

1. Frontend (React/Vite) → HTTP/SSE requests to FastAPI backend at `/v1/*` endpoints.
2. Backend enforces JWT auth (python-jose, `verify_token` dependency) and in-memory rate limiting on all protected routes.
3. Navigation & incident routes query Neo4j AuraDB via async driver with parameterized Cypher.
4. Chat route passes through GenAI orchestrator → input sanitization → Gemini 2.5 Flash API → output validation → response.
5. Crowd heatmap uses SSE (`sse-starlette`) to stream bucketed density labels (no raw counts per ADR-003).

---

## 3. Current State — Verified vs Assumed

### ⚠️ CRITICAL UNVERIFIED ITEMS

> **Terraform plan/apply has NEVER been run.** The development sandbox lacks `terraform` and `gcloud` CLI tools. All infrastructure code (`infra/terraform/`) is staged in files only. No `.terraform/` directory, no `*.tfstate`, no `*.tfplan` files exist. Every Terraform-managed resource (Cloud Run, VPC, NAT, IAM SAs, Secret Manager) exists only as HCL — none have been provisioned in GCP.

> **Live Neo4j AuraDB connectivity has NEVER been tested.** The `verify_neo4j.py` script tests rejection of *unauthenticated* connections to `bolt://localhost:7687` — it does not test authenticated connection to the real AuraDB instance. No evidence of a successful `driver.verify_connectivity()` against the production URI exists anywhere. This is the **single highest-risk unverified item** in the project.

### Verified working (evidence from code inspection)

- **Code structure**: All directories and files exist as listed above (confirmed via `list_dir` scans, 2026-07-12).
- **Backend dependencies**: `pyproject.toml` and `poetry.lock` are consistent and complete.
- **Frontend dependencies**: `package.json` has all deps listed; `node_modules/` and `dist/` directories exist (suggesting at least one `npm install` and `npm run build` was executed at some point).
- **Security hardening (code-level)**: The following fixes are present in source code:
  - H-01: CORS restricted to config-based origins (`main.py` L34).
  - H-02: Global exception handler returns generic error + reference ID, not `str(exc)` (`main.py` L57-72).
  - H-04: Rate-limit middleware exists (`middleware/rate_limit.py`), though in-memory only.
  - C-02: JWT verification uses python-jose with HS256, not hardcoded string comparison (`dependencies.py` L42-55).
  - M-03: Neo4j driver clean shutdown via lifespan context manager (`main.py` L19-23, `graph/driver.py` L16-20).
- **JWT_SECRET removed from code**: Not present in `backend/.env` or `.env.example`. Loaded via `settings.jwt_secret` from env vars (Secret Manager in prod). Cloud Run Terraform injects it from `secret_key_ref` to `jwt-secret` secret.
- **`roles/redis.editor` on sa-runtime**: **Confirmed present** in `infra/terraform/modules/iam/main.tf` L20-24 as `google_project_iam_member.runtime_redis`.
- **GenAI guardrails**: Input sanitization (5 regex patterns for prompt injection) and output validation (blocks system prompt leakage) confirmed in `services/genai/guardrails.py`.
- **.gitignore covers secrets**: `.env`, `.env.local`, `.env.*.local`, `*.tfvars`, `secrets.json`, `secrets/`, `*.tfstate`, `*.tfstate.backup` are all excluded.
- **CI/CD workflows exist**: 4 GitHub Actions workflows present (ci-backend, ci-frontend, cd-staging, cd-production). CD uses Workload Identity Federation.

### Unverified / staged / assumed

- **Terraform infrastructure**: NEVER applied. No tfstate exists. All GCP resources (Cloud Run service, VPC, NAT, SA, secrets) are code-only. Missing: `terraform init`, `terraform plan`, `terraform apply` execution.
- **Neo4j AuraDB connectivity**: NEVER tested against real instance. `backend/.env` points to `bolt://localhost:7687`. Real AuraDB URI unknown/unconfirmed.
- **AuraDB IP allow-list**: Cloud NAT static IP Terraform code is staged but never deployed. Even after deployment, the human must manually copy the IP to the AuraDB console. Not done.
- **`sa_chat` service account destruction**: The architecture blueprint (`docs/architecture-blueprint.md` L651) still references `sa-chat@proj.iam` as a separate SA. In actual Terraform code (`modules/iam/main.tf`), only `sa-runtime` exists — `sa_chat` was never created in Terraform, so there is nothing to destroy. However, if `sa-chat` exists in the live GCP project from manual creation, it has not been verified via `gcloud iam service-accounts list`.
- **JWT_SECRET in Secret Manager (live)**: Terraform `modules/secrets/main.tf` creates the `jwt-secret` secret with placeholder value `replace-me-in-production`. This has never been applied, and the actual secret value has never been set in Secret Manager.
- **Frontend build**: `dist/` directory exists suggesting a past build, but current build success is unverified.
- **Rate limiter Redis backing**: `middleware/rate_limit.py` uses in-memory dict, not Redis. The code comment notes this is a placeholder.
- **Stub files**: ~20+ files across backend and frontend are 17–18 byte stubs (listed in Architecture Snapshot). These represent planned but unimplemented features.
- **CI/CD pipeline**: Workflows exist but have never been triggered (no evidence of GitHub Actions runs).
- **Gemini API integration**: Orchestrator code is complete but relies on `GEMINI_API_KEY` which is absent from `.env`. The orchestrator gracefully degrades ("GenAI is currently offline") when key is missing.

---

## 4. Known Issues (open, ranked by severity)

| Severity | Issue | Reference |
|----------|-------|-----------|
| **Critical** | Neo4j AuraDB live connectivity never tested — no confirmed connection to real AuraDB instance; `verify_neo4j.py` only tests localhost rejection | `backend/verify_neo4j.py`, `backend/.env` |
| **Critical** | Terraform plan/apply never executed — all GCP infra is code-only, no resources provisioned | `infra/terraform/` (no `.tfstate`) |
| **High** | AuraDB IP allow-list — Cloud NAT static IP code staged in `modules/networking/main.tf`, but (a) never deployed, (b) human must manually copy IP to Aura console post-deploy | `infra/terraform/modules/networking/main.tf`, `README.md` |
| **High** | `sa_chat` service account — blueprint doc (`architecture-blueprint.md` L651) references `sa-chat@proj.iam`, but Terraform only defines `sa-runtime`. If `sa-chat` was manually created in GCP, it has NOT been verified destroyed via `gcloud iam service-accounts list` | `docs/architecture-blueprint.md` L651, `infra/terraform/modules/iam/main.tf` |
| **High** | JWT_SECRET → Secret Manager migration — code correctly reads from `settings.jwt_secret` (no hardcoded value), Terraform creates `jwt-secret` in Secret Manager, Cloud Run config injects it. BUT: Terraform never applied, so Secret Manager secret doesn't actually exist yet. Placeholder value is `replace-me-in-production`. | `infra/terraform/modules/secrets/main.tf` L13, `modules/cloud-run/main.tf` L22-29 |
| **High** | `production.tfvars` and `staging.tfvars` are completely empty — Terraform has no environment-specific configuration | `infra/terraform/environments/` |
| **Medium** | Rate limiter uses in-memory dict, not Redis — will not work correctly across Cloud Run instances | `backend/app/middleware/rate_limit.py` L8 |
| **Medium** | ~20+ stub files (17-18 bytes) across backend services, frontend hooks/stores/pages — represent unimplemented features | Multiple (see Architecture Snapshot) |
| **Medium** | `infra/scripts/deploy.sh` and `rotate-secrets.sh` are empty — no deployment or secret rotation automation | `infra/scripts/` |
| **Medium** | Blueprint doc references per-service SAs (sa-navigation, sa-crowd, sa-chat, sa-incident, sa-ingest) that don't exist in Terraform — doc is stale/aspirational vs actual implementation | `docs/architecture-blueprint.md` L648-654 vs `infra/terraform/modules/iam/main.tf` |
| **Low** | `Makefile` is empty | `Makefile` |
| **Low** | `docs/runbook.md` is a 9-byte stub | `docs/runbook.md` |
| **Low** | ADR files (`001-neo4j-over-spanner.md`, `002-cloud-nat-for-auradb.md`, `003-fan-data-anonymization.md`) are ~24-28 byte stubs | `docs/adr/` |

---

## 5. Edit Log

`2026-07-12 — [docs/BRAIN.md] — [Created Project Brain file (v1)] — [Initial project context generation for future agent sessions] — [verified: yes, by reading all project files]`

`2026-07-12 — [docs/BRAIN.md] — [Corrected and backfilled BRAIN.md (v2)] — [Added security remediation history, corrected GCP project ID to unconfirmed, elevated critical unverified items, added decisions log entries, re-scanned iam/main.tf to confirm redis.editor and sa-runtime-only state, backfilled known issues with 4 security items] — [verified: yes, by re-reading all Terraform modules, backend code, .gitignore, workflows, and architecture blueprint]`

`2026-07-13 — [Multiple] — [Implemented Minimal Auth Flow] — [Added passlib/bcrypt, created /v1/auth/login, updated dependencies.py to strictly verify JWT. Frontend: added LoginPage, updated api.ts to inject token, updated authStore.ts] — [verified: yes, via e2e test: unauthenticated access redirects to /login, invalid creds return 401, valid creds redirect to dashboard and protected routes return 200]`

`2026-07-15 — [Multiple] — [Implemented Tiered Access Control (Public Fan vs Staff Auth)] — [Routes reclassified: GET /v1/crowd/heatmap, GET /v1/crowd/zone/{id}, GET /v1/navigate/route, POST /v1/chat/message → PUBLIC (no verify_token). POST /v1/incidents → remains JWT-protected. Rate limiter rewritten with tiered limits (30/min public, 200/min staff), TTL-based cleanup (fixes memory leak), Retry-After headers. Chat endpoint gains 500-char input length limit. Guardrails call path verified: router→orchestrator→sanitize_input()→Gemini→validate_output(). Frontend: App.tsx restructured with ProtectedRoute guard, staff nav hidden for unauth'd users, default home is /fan not /login.] — [verified: yes, via verify_tiered_access.py (7/7 passed): crowd zone 200, navigate not-401, chat 200, incidents 401, 501-char chat 400, 500-char chat 200, rate limit 429 at req #26. Browser e2e: fan home loads without auth, staff nav hidden, /dashboard redirects to /login, login shows staff nav + dashboard]`

---

## 6. Environment & Secrets Map (names only, never values)

> ⚠️ No actual secret values, tokens, or credentials go in this file, ever.

| Env Var / Secret Name | Source | Purpose |
|----------------------|--------|---------|
| `NEO4J_URI` | `.env` / env var | Connection URI for Neo4j AuraDB instance |
| `NEO4J_USER` | `.env` / env var | Neo4j database username |
| `NEO4J_PASSWORD` | `.env` / env var | Neo4j database password (**required**, no default) |
| `GEMINI_API_KEY` | `.env` / env var | API key for Google GenAI / Gemini. Optional — orchestrator degrades gracefully without it |
| `REDIS_URL` | `.env` / env var | Connection URL for Redis / Memorystore |
| `JWT_SECRET` | Secret Manager (`jwt-secret`) in prod; env var in dev | Symmetric secret for HS256 JWT signing/verification. **Not present in `.env` or `.env.example`** — deliberately removed from local config, loaded from Secret Manager via Cloud Run secret injection. For local dev, must be set as env var manually |
| `CORS_ORIGINS` | `.env` / env var | Comma-separated allowed CORS origins |
| `GCP_PROJECT` | `.env` / env var / Terraform var | GCP project identifier |

### Secret Manager Secrets (Terraform-defined, not yet provisioned)

| Secret ID | Defined In | Consumers | Status |
|-----------|-----------|-----------|--------|
| `jwt-secret` | `modules/secrets/main.tf` | Cloud Run backend (via `secret_key_ref`) | **Not provisioned** — Terraform never applied. Placeholder value: `replace-me-in-production` |

---

## 7. Decisions Log

| Date | Decision | Rationale | Alternative Rejected |
|------|----------|-----------|---------------------|
| 2026-07-07 | Cloud NAT + static IP allow-list for AuraDB access instead of VPC Peering | AuraDB Free/Professional tier does not support VPC Peering (requires Business Critical / VDC tier). Cloud NAT provides a deterministic egress IP for the IP allow-list. | VPC Peering (not available on current AuraDB tier) |
| 2026-07-07 | Single `sa-runtime` service account for all Cloud Run services instead of per-service SAs (`sa-navigation`, `sa-crowd`, `sa-chat`, `sa-incident`, `sa-ingest`) | Cloud Run enforces a single service account per revision. True per-microservice SA separation would require separate Cloud Run services per domain, which is out of scope for the current monolithic FastAPI app. `sa-runtime` is given the union of required roles (`aiplatform.user`, `secretmanager.secretAccessor`, `redis.editor`) as a pragmatic least-privilege compromise. | Per-service dedicated SAs (aspirational, documented in `architecture-blueprint.md` L648-654, but not implementable with current single-service architecture) |
| 2026-07-07 | Git repo initialized with comprehensive `.gitignore` excluding all secret files (`.env`, `*.tfvars`, `secrets.json`, `secrets/`, `*.tfstate`) **before first commit** | Prevents secret values from ever entering git history. Once a secret is in git history, it requires BFG/filter-branch to remove, which is operationally expensive. | Adding `.gitignore` after initial commits (risk of accidental secret commit in history) |
| 2026-07-07 | JWT_SECRET moved from `.env` / code to Secret Manager, injected into Cloud Run via `secret_key_ref` | Eliminates the secret from local files and environment variable sprawl. Secret Manager provides audit logging, versioning, and rotation support. | Keeping JWT_SECRET as a plain env var in Cloud Run (no audit trail, no rotation) |

---

## 8. Open Questions / Blocked Items

| # | Item | Blocked On | Impact |
|---|------|-----------|--------|
| 1 | **Terraform apply**: All infrastructure is code-only. Need `terraform init` + `plan` + `apply` run against real GCP project. | Human with `gcloud` + `terraform` CLI access and sufficient IAM permissions | **Blocks everything** — no Cloud Run, no VPC, no NAT, no SA, no secrets exist until this runs |
| 2 | **AuraDB IP allow-list**: After Terraform provisions the static NAT IP, the IP must be manually copied to the Neo4j AuraDB console's IP Allow-list | Human with AuraDB console access | Blocks all Neo4j connectivity from Cloud Run |
| 3 | **`sa_chat` cleanup verification**: If `sa_chat` was created manually in GCP (outside Terraform), run `gcloud iam service-accounts list --project=stadiumai-project` to confirm it's been deleted. If it exists, delete it: `gcloud iam service-accounts delete sa-chat@stadiumai-project.iam.gserviceaccount.com` | Human with `gcloud` access | Dangling SA with unnecessary permissions is a security risk |
| 4 | **JWT_SECRET actual value**: Secret Manager `jwt-secret` has placeholder `replace-me-in-production`. After Terraform apply, must set a real cryptographically-random value: `gcloud secrets versions add jwt-secret --data-file=-` | Human with Secret Manager admin access | Auth will fail in production with placeholder value |
| 5 | **Neo4j AuraDB credentials**: Real `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD` must be configured. Currently `.env` has `bolt://localhost:7687` / `localdev`. Need actual AuraDB connection string. | Human with AuraDB console access | Blocks all graph queries |
| 6 | **Gemini API key**: `GEMINI_API_KEY` not set anywhere. Orchestrator gracefully degrades but chat/incident AI features are non-functional without it. | Human must provision API key or configure Vertex AI SA-based auth | Blocks AI features |
| 7 | **GCP Project ID confirmation**: Is `stadiumai-project` the real project ID? Verify with `gcloud config get project` or `gcloud projects list`. | Human with `gcloud` access | If wrong, all Terraform and CD workflows will fail |
| 8 | **production.tfvars population**: Empty file. Must contain at minimum `project_id = "..."`. | Human decision on environment-specific values | Terraform apply will fail or use wrong defaults |
| 9 | **Workload Identity Federation setup**: CD workflow (`cd-production.yml`) references `projects/123456789/locations/global/workloadIdentityPools/github/providers/my-repo` — this is clearly a placeholder. Must configure real WIF pool. | Human with GCP IAM admin access | Blocks CI/CD deployment pipeline |
