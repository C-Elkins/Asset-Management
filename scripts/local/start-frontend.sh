#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PID_FILE="$ROOT_DIR/.pids/frontend.pid"
LOG_FILE="$ROOT_DIR/logs/frontend.log"
PORT=3001

mkdir -p "$(dirname "$PID_FILE")" "$(dirname "$LOG_FILE")"

# If already running, exit cleanly
if lsof -ti tcp:$PORT >/dev/null 2>&1; then
  echo "Frontend already running on port $PORT"
  exit 0
fi

cd "$ROOT_DIR/frontend"

(nohup npm run dev -- --host --port $PORT --strictPort >"$LOG_FILE" 2>&1 & echo $! >"$PID_FILE")

# Wait for health
for i in {1..30}; do
  if curl -sf "http://localhost:$PORT/healthz" >/dev/null; then
    echo "Frontend healthy at http://localhost:$PORT"
    exit 0
  fi
  sleep 1
done

echo "Frontend failed to become healthy. Check $LOG_FILE"
exit 1
