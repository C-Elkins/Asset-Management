#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PID_FILE="$ROOT_DIR/.pids/frontend.pid"
PORT=3001

if [[ -f "$PID_FILE" ]]; then
  PID=$(cat "$PID_FILE" || true)
  if [[ -n "${PID:-}" ]] && ps -p "$PID" >/dev/null 2>&1; then
    kill "$PID" || true
    sleep 1
    if ps -p "$PID" >/dev/null 2>&1; then kill -9 "$PID" || true; fi
  fi
  rm -f "$PID_FILE"
fi

# Also free the port if some other process took it
if lsof -ti tcp:$PORT >/dev/null 2>&1; then
  lsof -ti tcp:$PORT | xargs -r kill -9 || true
fi

echo "Frontend stopped"
