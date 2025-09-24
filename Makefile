SHELL := /bin/sh

COMPOSE_DEV := docker compose -f docker-compose.dev.yml
COMPOSE := docker compose

.PHONY: help dev-up dev-down dev-logs dev-ps dev-restart up down logs ps restart \
	local-up local-down local-logs local-status local-restart \
	local-backend-start local-backend-stop local-frontend-start local-frontend-stop

help:
	@echo "Targets:"
	@echo "  dev-up       - Start dev stack (db, backend dev, frontend dev)"
	@echo "  dev-down     - Stop dev stack and remove containers"
	@echo "  dev-logs     - Tail dev logs"
	@echo "  dev-ps       - List dev containers"
	@echo "  dev-restart  - Restart dev containers"
	@echo "  up           - Start prod-like stack (build images)"
	@echo "  down         - Stop prod-like stack"
	@echo "  logs         - Tail prod-like logs"
	@echo "  ps           - List prod-like containers"
	@echo "  restart      - Restart prod-like containers"
	@echo ""
	@echo "Local dev (no Docker):"
	@echo "  local-up            - Start backend (8080) + frontend (3001) in background with health checks"
	@echo "  local-down          - Stop local backend and frontend and free ports"
	@echo "  local-logs          - Tail both backend and frontend logs"
	@echo "  local-status        - Show PIDs and ports for local services"
	@echo "  local-restart       - Restart both local services"
	@echo "  local-backend-start - Start only backend"
	@echo "  local-backend-stop  - Stop only backend"
	@echo "  local-frontend-start- Start only frontend"
	@echo "  local-frontend-stop - Stop only frontend"

dev-up:
	$(COMPOSE_DEV) up -d --build

dev-down:
	$(COMPOSE_DEV) down -v

dev-logs:
	$(COMPOSE_DEV) logs -f --tail=200

dev-ps:
	$(COMPOSE_DEV) ps

dev-restart:
	$(COMPOSE_DEV) restart

up:
	$(COMPOSE) up -d --build

down:
	$(COMPOSE) down -v

logs:
	$(COMPOSE) logs -f --tail=200

ps:
	$(COMPOSE) ps

restart:
	$(COMPOSE) restart

# ---------- Local dev (no Docker) ----------

ROOT_DIR := $(abspath .)
SCRIPTS := $(ROOT_DIR)/scripts/local
LOG_DIR := $(ROOT_DIR)/logs

local-up: local-backend-start local-frontend-start
	@echo "Local dev started:"
	@echo "  Backend:  http://localhost:8080/api/v1"
	@echo "  Frontend: http://localhost:3001"

local-down: local-backend-stop local-frontend-stop
	@echo "Local dev stopped"

local-logs:
	@echo "Tailing logs (Ctrl+C to stop)"
	@mkdir -p "$(LOG_DIR)"
	@echo "--- Backend log ---"
	@tail -n 100 -f "$(LOG_DIR)/backend.log" & \
	BACK=$$!; \
	trap 'kill $$BACK' INT TERM; \
	echo "--- Frontend log ---"; \
		tail -n 100 -f "$(LOG_DIR)/frontend.log"; \
	kill $$BACK || true

local-status:
	@echo "Backend PID:"; test -f .pids/backend.pid && cat .pids/backend.pid || echo "(not running)"
	@echo "Frontend PID:"; test -f .pids/frontend.pid && cat .pids/frontend.pid || echo "(not running)"
	@echo "Ports in use:"; lsof -i tcp:8080 -sTCP:LISTEN -n -P || true; lsof -i tcp:3001 -sTCP:LISTEN -n -P || true

local-restart: local-down local-up

local-backend-start:
	bash "$(SCRIPTS)/start-backend.sh"

local-backend-stop:
	bash "$(SCRIPTS)/stop-backend.sh"

local-frontend-start:
	bash "$(SCRIPTS)/start-frontend.sh"

local-frontend-stop:
	bash "$(SCRIPTS)/stop-frontend.sh"
