# Terminal Management Guide

## 🧹 Quick Cleanup Commands

### Close All Terminals
**VS Code Command Palette** (`Cmd+Shift+P`):
- Type: `Terminal: Kill All Terminals`

### Clear Current Terminal
- **Keyboard**: `Cmd+K` (clears buffer)
- **Command**: `clear` (clears screen but keeps history)

### Close Single Terminal
- Click the 🗑️ (trash) icon in terminal tab
- Or press `Cmd+W` when terminal is focused

---

## 📋 Server Management Commands

### Check What's Running
```bash
# Check server ports
lsof -i :8080 -i :3005

# See all node processes
ps aux | grep -E "node.*vite|npm.*dev" | grep -v grep

# See all Java processes
ps aux | grep -E "spring-boot:run" | grep -v grep
```

### Clean Up Processes
```bash
# Run the cleanup script
./scripts/clean-terminals.sh

# Kill specific process by PID
kill <PID>

# Force kill if needed
kill -9 <PID>

# Kill all node processes (⚠️ kills ALL node)
killall node
```

### Stop Servers Properly
```bash
# Stop frontend (if you have the PID)
kill $(cat frontend/frontend.pid 2>/dev/null)

# Or find and kill
lsof -ti:3005 | xargs kill

# Stop backend
lsof -ti:8080 | xargs kill
```

---

## 🚀 Better Workflow

### 1. Use Named Terminals (Recommended!)
When you start servers, give them clear names:

**Backend Terminal:**
```bash
# In VS Code, rename terminal to "🚀 Backend"
cd backend
export JWT_SECRET='your-secret'
./mvnw spring-boot:run
```

**Frontend Terminal:**
```bash
# Rename terminal to "🎨 Frontend"
cd frontend
npm run dev
```

### 2. Use VS Code Tasks Instead
Create `.vscode/tasks.json` for one-click server starts:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "🚀 Start Backend",
      "type": "shell",
      "command": "cd backend && export JWT_SECRET='...' && ./mvnw spring-boot:run",
      "isBackground": true,
      "problemMatcher": []
    },
    {
      "label": "🎨 Start Frontend",
      "type": "shell",
      "command": "cd frontend && npm run dev",
      "isBackground": true,
      "problemMatcher": []
    },
    {
      "label": "🌟 Start All Servers",
      "dependsOn": ["🚀 Start Backend", "🎨 Start Frontend"]
    }
  ]
}
```

Then run with: `Cmd+Shift+P` → `Tasks: Run Task` → Select task

### 3. Use Terminal Tabs
VS Code now shows terminal tabs on the side. You can:
- Drag to reorder
- Right-click to rename
- Click + to create new
- Close unused ones easily

### 4. Split Terminals
Instead of many separate terminals:
- Click the split icon in terminal
- Or use `Cmd+\` to split current terminal

---

## ⚙️ VS Code Settings Applied

We just configured:
- ✅ Terminal tabs enabled (easier to manage)
- ✅ Auto-close terminals when process exits
- ✅ Limited scrollback to 5000 lines (less memory)
- ✅ Show terminal actions always
- ✅ Better tab titles showing process and folder

Reload VS Code to apply these settings!

---

## 🎯 Recommended Daily Workflow

### Morning Startup:
```bash
# 1. Clean up any old processes
./scripts/clean-terminals.sh

# 2. Start backend in dedicated terminal
cd backend
export JWT_SECRET='DNsMl6oRSuJ/cvpauhwJfEmavQjyOlx2B4TWF1Uh3LA/KIii0vkcny/fjjLxMAR6HsN7AU5xj3dkf3vBl7b+Cw=='
./mvnw spring-boot:run
# Rename terminal to "🚀 Backend"

# 3. Start frontend in new terminal (Cmd+T)
cd frontend  
npm run dev
# Rename terminal to "🎨 Frontend"

# 4. Keep 1 working terminal for commands
# Rename to "⚡ Commands"
```

### End of Day:
```bash
# Close all terminals
Cmd+Shift+P → "Terminal: Kill All Terminals"
```

---

## 🔧 Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| New Terminal | `` Ctrl+` `` |
| Kill Active Terminal | `Cmd+W` |
| Clear Terminal | `Cmd+K` |
| Focus Next Terminal | `Cmd+Shift+]` |
| Focus Previous Terminal | `Cmd+Shift+[` |
| Toggle Terminal Panel | `` Ctrl+` `` |
| Split Terminal | `Cmd+\` |

---

## 📝 Notes

- **Don't press Ctrl+C** on server terminals (stops the server!)
- **Use separate terminals** for backend, frontend, and general commands
- **Name your terminals** so you know what's what
- **Run cleanup script weekly** to remove old logs and check for zombie processes
- **Close unused terminals** at end of each day to start fresh
