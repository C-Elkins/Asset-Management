# IT Asset Management System

Production-ready IT asset management app with a Spring Boot backend and a
Vite + React frontend.

![CI](https://github.com/C-Elkins/IT-Asset-Management/actions/workflows/ci.yml/badge.svg)

## Features


## AI Assistant (Experimental)

The application includes an experimental, deterministic AI Assistant available at
`/app/ai` ("AI Assistant" in the sidebar). It provides two backend-powered
capabilities:

1. Categorize – Heuristically assigns a category and tag set to arbitrary input
    text (e.g., asset descriptions, incident notes) and returns a confidence
    score.
2. Insights – Extracts structured key/value insight pairs with simple scoring
    (no external AI APIs required).

### Technical Architecture

- Backend: Spring Boot exposes POST endpoints `/ai/categorize` and
   `/ai/insights` with per-user in-memory rate limiting (30 req / 5 min).
- Frontend: Lightweight React Query mutations (see `src/hooks/useAIBackend.ts`)
   wrap `backendCategorize` and `backendInsights` from `aiService`.
- Local History: Each successful query is persisted to IndexedDB (Dexie) in a
   new `ai_queries` table (version 4 schema upgrade) for quick recall and
   re-run.
- Separation of Concerns: The heuristic simulation / enrichment logic
   (`AIService`) stays isolated from backend wrappers to allow future integration
   of real LLM providers without bundle bloat.

### Extending

To integrate a real model provider, add a new module (e.g., `llmProvider.ts`)
exporting async functions with the same shape as `backendCategorize` /
`backendInsights`, then feature toggle in the Assistant UI. Avoid modifying
existing endpoints to preserve deterministic fallbacks.

### Rate Limiting & Headers

Backend applies a per-user fixed window (30 requests / 5 minutes) for both AI endpoints.

Headers emitted on every successful response and 429:

| Header | Meaning |
| ------ | ------- |
| `X-RateLimit-Limit` | Max requests permitted in the current window (e.g. 30) |
| `X-RateLimit-Remaining` | Requests left before throttling |
| `X-RateLimit-Reset` | Unix epoch seconds when the current window resets |
| `Retry-After` | (On 429) Seconds until retry (matches reset delta) |

Frontend cooldown logic:

1. On 429 the app reads `Retry-After` (or derives from `X-RateLimit-Reset`) and
   disables submission until that time.
2. On success it could (future enhancement) surface remaining quota; currently
   it simply resets internal cooldown if any.
3. Fallback: If headers are missing, a conservative 60s cooldown is applied.

These headers make client-side UX deterministic and observable; they also enable
external monitoring / dashboards to reason about saturation.

UI Integration:

- The AI Assistant page now shows: remaining requests, total limit, and a live
   countdown until reset (derived from `X-RateLimit-Reset`). When throttled it
   swaps to a cooldown timer sourced from `Retry-After`.

## Observability & Logging

- Actuator endpoints exposed: `health`, `info`, `metrics`, `env`, `prometheus`.
- Micrometer Prometheus registry enabled (scrape `/api/v1/actuator/prometheus`).
- Custom metrics added for AI endpoints
   (`ai_categorize_requests_total`, `ai_insights_requests_total`,
   `ai_rate_limit_hits_total`, latency timers).
- Structured JSON logs written to `logs/application.json` with correlation,
   trace, span IDs.
- `AuthActivityFilter` injects `correlationId` (header `X-Correlation-Id` or
   generated) and logs auth request outcomes.

## Resilience (Prepared)

Baseline Resilience4j config (`resilience4j.yml`) defines a circuit breaker &
time limiter named `aiExternalProvider` for future external AI integrations
(currently unused in code paths).

## OpenAPI & Type Generation

SpringDoc already exposes the OpenAPI doc at `/api/v1/api-docs` and Swagger UI
at `/api/v1/swagger-ui.html`.
Planned: add a frontend npm script to generate TypeScript types (e.g. using `openapi-typescript`).


## Project structure

- `backend/` — Spring Boot (Java 17+, Maven) REST API
- `frontend/` — React 19 (Vite) SPA served by nginx in prod
- `docker-compose.yml` — Compose stack for DB + API + Web

## Quick start

1. Backend (dev)

   - Requirements: Java 17+, Maven 3.9+
   - Build and run:

   ```bash
   mvn spring-boot:run
   ```

2. Frontend (dev)

   - Requirements: Node.js 20+
   - Install and start:

   ```bash
   npm install
   npm run dev
   ```

3. Docker (prod-like)

   Build and run all services:

   ```bash
   docker compose up -d --build
   ```

   Services:

   - Frontend: <http://localhost:3002> (nginx serving Vite build)
   - Backend: internal on 8080 in the Compose network
   - Postgres: localhost:5432 (user/pass: iam/iam)

   Health:

   - Frontend: <http://localhost:3002/healthz>
   - Backend: <http://localhost:8080/api/v1/actuator/health> (inside network)

## Environment

- Frontend dev proxy: `VITE_API_BASE=/api` (see `frontend/.env.development`)
- Nginx runtime env: `BACKEND_ORIGIN` (defaults to `http://backend:8080`)

## E2E smoke tests (Playwright)

Run locally:

```bash
cd frontend
npm run build && npm run test:e2e
npm run test:e2e:report # optional
```

## Dev modes

- Local dev (hot reload):
  - Backend: `./mvnw spring-boot:run` in `backend`
  - Frontend: `npm run dev` in `frontend` → <http://localhost:3001>
  - API proxied via Vite `/api` → <http://localhost:8080>

- Containerized dev:
  - `docker compose up -d --build`
  - Frontend → <http://localhost:3002>
  - Backend (Compose network) → `http://backend:8080`
  - Nginx proxy uses BACKEND_ORIGIN env (default `http://backend:8080`)

## VS Code tasks

Tasks are available under Terminal → Run Task:

- dev:start backend — starts Spring Boot (scripted)
- dev:start frontend — starts Vite dev server
- dev:start all — runs both in parallel

## CI

CI builds:

- Backend: Maven on Temurin 21
- Frontend: Node 20 build + Playwright smoke tests
- Triggers: push and PR to main

## Contributing and Security

- See [CONTRIBUTING.md](./CONTRIBUTING.md)
- See [SECURITY.md](./SECURITY.md)
