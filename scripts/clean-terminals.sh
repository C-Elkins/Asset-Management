#!/bin/bash
# Clean up old server processes and logs

echo "🧹 Cleaning up old processes and logs..."

# Kill old node/npm processes (except currently running servers)
echo "Checking for zombie Node processes..."
OLD_NODES=$(ps aux | grep -E "node.*vite|npm.*dev" | grep -v grep | awk '{print $2}' | wc -l | xargs)
if [ "$OLD_NODES" -gt 0 ]; then
    echo "Found $OLD_NODES Node processes"
    # Don't auto-kill, just report
else
    echo "✅ No zombie Node processes"
fi

# Check for old Java processes
echo "Checking for multiple Java processes..."
OLD_JAVA=$(ps aux | grep -E "spring-boot:run" | grep -v grep | awk '{print $2}' | wc -l | xargs)
if [ "$OLD_JAVA" -gt 1 ]; then
    echo "⚠️  Warning: Found $OLD_JAVA Java/Maven processes running"
    echo "   You may want to kill old ones manually"
else
    echo "✅ Single backend process running"
fi

# Clean old logs (keep last 5 days)
echo "Cleaning old logs..."
find logs/ -name "*.log" -mtime +5 -delete 2>/dev/null
find backend/logs/ -name "*.json" -mtime +5 -delete 2>/dev/null

# Show what's currently running
echo ""
echo "=== Currently Running Servers ==="
lsof -i :8080 -i :3005 2>/dev/null | grep LISTEN || echo "No servers on ports 8080/3005"

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "💡 Tips to manage terminals:"
echo "   • Press Cmd+K to clear terminal buffer"
echo "   • Use Cmd+W to close unused terminals"
echo "   • Click 🗑️  icon to kill terminal"
echo "   • Use 'Terminal > Kill All Terminals' from menu"
