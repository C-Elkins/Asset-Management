#!/bin/bash
# Start frontend server in background

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
LOGS_DIR="$PROJECT_ROOT/logs"

cd "$FRONTEND_DIR"

echo "🎨 Starting Frontend Server on Port 3005..."
echo "PID will be saved to frontend.pid"

nohup npm run dev > "$LOGS_DIR/frontend-bg.log" 2>&1 &
FRONTEND_PID=$!

echo $FRONTEND_PID > frontend.pid
echo "✅ Frontend started with PID: $FRONTEND_PID"
echo "📋 Logs: logs/frontend-bg.log"

sleep 3

if lsof -i :3005 > /dev/null 2>&1; then
    echo "✅ Frontend is running on http://localhost:3005/"
else
    echo "❌ Frontend failed to start. Check logs/frontend-bg.log"
fi
