# IT Asset Management System

Production-ready IT asset management app with a Spring Boot backend and a
Vite + React frontend.

![CI](https://github.com/C-Elkins/IT-Asset-Management/actions/workflows/ci.yml/badge.svg)

## Features

- Asset inventory, categories, maintenance records
- Auth flow with protected routes and inline errors
- Robust error boundaries and guarded UI state
- Stable JSON API with pagination-ready services
- Dockerized stack (Postgres, backend, frontend) with health checks
- CI for backend (Maven) and frontend (Node) + E2E smoke test (Playwright)

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
