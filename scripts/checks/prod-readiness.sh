#!/usr/bin/env bash
set -euo pipefail

# Simple readiness checks. Run from repo root.

YELLOW='\033[1;33m'; GREEN='\033[0;32m'; RED='\033[0;31m'; NC='\033[0m'

ot() { echo -e "${YELLOW}==>${NC} $*"; }
pass() { echo -e "${GREEN}PASS${NC} $*"; }
fail() { echo -e "${RED}FAIL${NC} $*"; }

# 1) .env existence
if [[ -f .env ]]; then pass ".env present"; else ot ".env not found (ok for local). Use .env.prod.example when ready."; fi

# 2) Required vars when deploying with docker-compose.prod.yml
missing=()
req_vars=( FRONTEND_HOST BACKEND_HOST LETSENCRYPT_EMAIL POSTGRES_DB POSTGRES_USER POSTGRES_PASSWORD JWT_SECRET )
for v in "${req_vars[@]}"; do
  if [[ -z "${!v:-}" ]]; then missing+=("$v") ; fi
done
if (( ${#missing[@]} > 0 )); then ot "Missing vars (only needed for real prod): ${missing[*]}"; else pass "All required vars set"; fi

# 3) Backend prod safety
if grep -q "ddl-auto: validate" backend/src/main/resources/application-prod.yml; then pass "JPA ddl-auto=validate"; else fail "JPA ddl-auto not validate in prod"; fi

# 4) Compose sanity
if docker compose config >/dev/null 2>&1; then pass "docker compose config parses"; else fail "docker compose config has issues"; fi
if docker compose -f docker-compose.prod.yml --env-file .env config >/dev/null 2>&1; then ot "prod compose parses (if .env present)"; fi

# 5) Monitoring optional keys
[[ -n "${PD_ROUTING_KEY:-}" ]] && ot "PagerDuty key present" || ot "PagerDuty key not set (optional)"
[[ -n "${SENTRY_DSN:-}" ]] && ot "Sentry DSN present" || ot "Sentry DSN not set (optional)"

# 6) Health checks (if running)
if curl -fsS http://localhost:3002/healthz >/dev/null 2>&1; then pass "Frontend healthz OK"; fi
if curl -fsS http://localhost:3002/api/v1/actuator/health >/dev/null 2>&1; then pass "Backend health via frontend proxy OK"; fi

ot "Done. Use docker compose up -d --build to run locally."
