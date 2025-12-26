#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

"$ROOT_DIR/scripts/local/start-backend.sh"
"$ROOT_DIR/scripts/local/start-frontend.sh"

echo "\nAll services up:"
echo "- Backend:   http://localhost:8080/api/v1 (health: /actuator/health)"
echo "- Frontend:  http://localhost:3001 (health: /healthz)"
