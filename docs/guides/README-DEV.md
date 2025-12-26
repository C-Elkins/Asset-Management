# 🛠️ Developer Guide - IT Asset Management System

## Quick Status Check

**Run this command anytime to see service status:**
```bash
./dev-status.sh
```

## Current Service Configuration

### Backend (Spring Boot)
- **Port:** 8080
- **Base URL:** http://localhost:8080/api/v1
- **Health Check:** http://localhost:8080/api/v1/healthz
- **H2 Console:** http://localhost:8080/api/v1/h2-console
- **API Docs:** http://localhost:8080/api/v1/swagger-ui.html
- **Process:** Java (Maven)

### Frontend (React + Vite)
- **Port:** 3005 (or 5173, 3000 - dynamically assigned)
- **URL:** http://localhost:3005
- **Process:** Node.js (Vite dev server)

## Starting Services

### Start Both Services
```bash
./start.sh
```

### Start Backend Only
```bash
cd backend
./mvnw spring-boot:run
```

### Start Frontend Only
```bash
cd frontend
npm run dev
```

### Start in Background
```bash
# Backend
cd backend && ./mvnw spring-boot:run > backend.log 2>&1 &

# Frontend
cd frontend && npm run dev > frontend.log 2>&1 &
```

## Stopping Services

### Stop All Services
```bash
./scripts/dev-stop.sh
```

### Kill Specific Ports
```bash
# Backend (port 8080)
lsof -ti:8080 | xargs kill -9

# Frontend (check actual port first)
lsof -ti:3005 | xargs kill -9
# or
lsof -ti:5173 | xargs kill -9
```

### Find Process ID
```bash
lsof -iTCP:8080 -sTCP:LISTEN
lsof -iTCP:3005 -sTCP:LISTEN
```

## Viewing Logs

### Real-time Logs
```bash
# Backend
tail -f backend/backend.log

# Frontend
tail -f frontend/frontend.log

# Both simultaneously
tail -f backend/backend.log frontend/frontend.log
```

### Search Logs
```bash
# Find errors in backend logs
grep -i "error" backend/backend.log

# Find specific request
grep "POST /auth/login" backend/backend.log

# Count occurrences
grep -c "TenantContext" backend/backend.log
```

## Testing Authentication

### Default Credentials (Development)
```
Admin Account:
  Email:    admin@devorg.com
  Password: DevAdmin123!

Regular User:
  Email:    user@devorg.com
  Password: DevUser123!
```

### Test Login via cURL
```bash
# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@devorg.com","password":"DevAdmin123!"}'

# Health check
curl http://localhost:8080/api/v1/healthz
```

## Database Access

### H2 Console
1. Go to: http://localhost:8080/api/v1/h2-console
2. **JDBC URL:** `jdbc:h2:mem:testdb`
3. **Username:** `sa`
4. **Password:** *(leave empty)*

### Useful SQL Queries
```sql
-- View all tenants
SELECT * FROM tenants;

-- View all users
SELECT id, email, username, role, active FROM users;

-- Check user credentials
SELECT email, password, role FROM users WHERE email = 'admin@devorg.com';

-- View assets
SELECT * FROM assets;
```

## Environment Variables

### Backend
- `SPRING_PROFILES_ACTIVE=dev` - Enables dev mode
- `SERVER_PORT=8080` - Change backend port
- `JWT_SECRET` - JWT signing key (auto-generated in dev)

### Frontend
- `VITE_API_BASE_URL=http://localhost:8080/api/v1` - Backend URL
- `PORT=3005` - Change frontend port

## Common Development Tasks

### Restart Services After Code Changes
```bash
# Backend auto-reloads with Spring DevTools
# Just save your files

# Frontend auto-reloads with Vite HMR
# Just save your files

# Force restart if needed:
./scripts/dev-stop.sh && ./start.sh
```

### Clear Database (H2 in-memory)
```bash
# Just restart the backend
lsof -ti:8080 | xargs kill -9
cd backend && ./mvnw spring-boot:run
```

### Check Service Health
```bash
# Quick check
curl http://localhost:8080/api/v1/healthz
curl http://localhost:3005

# Full status
./dev-status.sh
```

### Monitor Memory Usage
```bash
# Watch services in real-time
watch -n 2 './dev-status.sh'

# Or use top
top -pid $(lsof -ti:8080) -pid $(lsof -ti:3005)
```

## Troubleshooting

### Port Already in Use
```bash
# Find what's using the port
lsof -i:8080
lsof -i:3005

# Kill the process
lsof -ti:8080 | xargs kill -9
```

### Backend Won't Start
```bash
# Check Java version
java -version  # Should be 17+

# Check Maven
./mvnw -version

# Clean and rebuild
cd backend
./mvnw clean install
```

### Frontend Won't Start
```bash
# Check Node version
node -v  # Should be 18+

# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors
- Backend already configured for `http://localhost:3005`
- If frontend port changes, update `application-dev.yml`

### Login Fails
1. Check backend is running: `./dev-status.sh`
2. Check credentials match database (use H2 console)
3. Check network tab in browser DevTools
4. Check backend logs: `tail -f backend/backend.log`

## Shell Aliases (Optional)

Add these to your `~/.zshrc` for quick access:

```bash
# Navigate to project
alias asset='cd "/Users/chaseelkins/Documents/Asset Management System/it-asset-management"'

# Service status
alias asset-status='cd "/Users/chaseelkins/Documents/Asset Management System/it-asset-management" && ./dev-status.sh'

# Quick restart
alias asset-restart='cd "/Users/chaseelkins/Documents/Asset Management System/it-asset-management" && ./scripts/dev-stop.sh && sleep 2 && ./start.sh'

# View logs
alias asset-logs-be='tail -f "/Users/chaseelkins/Documents/Asset Management System/it-asset-management/backend/backend.log"'
alias asset-logs-fe='tail -f "/Users/chaseelkins/Documents/Asset Management System/it-asset-management/frontend/frontend.log"'
```

Then reload: `source ~/.zshrc`

## Performance Tips

### Backend
- Spring DevTools auto-reload is fast (~2-3 seconds)
- H2 in-memory database resets on each restart
- Use `./mvnw spring-boot:run` for hot reload
- JVM heap: Default 512MB (adjust if needed)

### Frontend
- Vite HMR is near-instant
- Browser cache can cause issues (hard refresh: Cmd+Shift+R)
- React DevTools for debugging

## Key Files to Watch

### Backend
- `application-dev.yml` - Dev configuration
- `SecurityConfig.java` - CORS, auth rules
- `CustomUserDetailsService.java` - User authentication
- `DevDataSeeder.java` - Database seeding

### Frontend
- `vite.config.js` - Build config, proxy
- `authService.js` - API calls, auth logic
- `Login.jsx` - Login form

## Next Steps

1. ✅ Both services running
2. ✅ Authentication working
3. 🔜 Configure Stripe products
4. 🔜 Test subscription features
5. 🔜 Deploy to production

---

**Last Updated:** October 3, 2025  
**Services:** Backend (Port 8080) • Frontend (Port 3005)
