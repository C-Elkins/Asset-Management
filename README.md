# IT Asset Management System

A full-stack IT Asset Management system with a Spring Boot backend and a React frontend.

## Project Structure

- backend: Spring Boot (Java 17+, Maven) REST API
- frontend: React (Vite) SPA
- docker-compose.yml: Containerized stack (Postgres + backend + frontend)

## Quick start

1. Backend (dev)
    - Requirements: Java 17+, Maven 3.9+
    - Build and run:
       - mvn spring-boot:run

2. Frontend (dev)
    - Requirements: Node.js 18+
    - Install and start:
       - npm install
       - npm run dev

3. Docker (prod-like)
    - Build and run all services:
       - docker compose up -d --build
    - Services:
       - Frontend: <http://localhost:3002> (containerized nginx serving build)
       - Backend: internal 8080 in Compose network (no host port binding)
       - Postgres: localhost:5432 (iam/iam)
    - Health:
       - Frontend: <http://localhost:3002/healthz>
       - Backend: <http://localhost:8080/api/v1/actuator/health> (from inside network)

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
- Frontend: Node 20 build
- Triggers: push and PR to main

## Contributing and Security

- See [CONTRIBUTING.md](./CONTRIBUTING.md)
- See [SECURITY.md](./SECURITY.md)
