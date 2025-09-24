 #!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PID_FILE="$ROOT_DIR/.pids/backend.pid"
LOG_FILE="$ROOT_DIR/logs/backend.log"
PORT=8080

mkdir -p "$(dirname "$PID_FILE")" "$(dirname "$LOG_FILE")"

# If already running, exit cleanly
if lsof -ti tcp:$PORT >/dev/null 2>&1; then
  echo "Backend already running on port $PORT"
  exit 0
fi

cd "$ROOT_DIR/backend"

# Prefer JDK 21 to avoid known Lombok/javac issues on newer JDKs
if command -v /usr/libexec/java_home >/dev/null 2>&1; then
  JDK21_PATH="$(! /usr/libexec/java_home -v 21 2>/dev/null; true)"
  if [ -z "$JDK21_PATH" ]; then
    JDK21_PATH="$(! /usr/libexec/java_home -V 2>/dev/null | awk '/21\./{print $NF; exit}')"
  fi
  if [ -n "$JDK21_PATH" ] && [ -d "$JDK21_PATH" ]; then
    export JAVA_HOME="$JDK21_PATH"
    export PATH="$JAVA_HOME/bin:$PATH"
  fi
fi

# Start in background with profile=dev using Maven Wrapper for consistent JDK
(nohup ./mvnw -q -Dspring-boot.run.profiles=dev spring-boot:run >"$LOG_FILE" 2>&1 & echo $! >"$PID_FILE")

# Wait for health
for i in {1..30}; do
  if curl -sf "http://localhost:$PORT/api/v1/actuator/health" >/dev/null; then
    echo "Backend healthy at http://localhost:$PORT/api/v1"
    exit 0
  fi
  sleep 1
done

echo "Backend failed to become healthy. Check $LOG_FILE"
exit 1
