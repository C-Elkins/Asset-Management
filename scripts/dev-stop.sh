#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

"$ROOT_DIR/scripts/local/stop-frontend.sh" || true
"$ROOT_DIR/scripts/local/stop-backend.sh" || true

echo "All services stopped."
