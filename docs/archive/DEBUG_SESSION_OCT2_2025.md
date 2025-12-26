# Debug Session – October 2, 2025

## Issue: Frontend Dev Blank Screen
Earlier development access via port 3005 displayed a blank white page while production build on another port rendered successfully.

## Root Cause
Duplicate React bootstrap files (`frontend/src/main.jsx` and `frontend/src/main.tsx`). `index.html` referenced `main.tsx`, but the stale `main.jsx` interfered with Vite/HMR and, without global error handlers, failures were silent.

## Actions Taken
1. Stopped backend & frontend; freed ports 8080, 3001, 3005, 3006.
2. Added boot diagnostics and global error/unhandled rejection handlers to `main.tsx`.
3. Deleted obsolete `main.jsx`.
4. Restarted backend (`scripts/local/start-backend.sh`) – startup banner confirms success (overall actuator health still 503 due to mail component; non-blocking).
5. Restarted frontend on standardized script port 3001 (`scripts/local/start-frontend.sh`).
6. Verified only active listeners: 8080 (Java), 3001 (Node/Vite).

## Current State
Use `http://localhost:3001` for development. Expect console logs beginning with `🟢 BOOT:` as sanity markers.

## If It Reoccurs
- Hard reload (clear cache).
- Ensure only `main.tsx` exists.
- Check browser console for global error handler output.
- Review auth redirect logic in `App.jsx` for loops.

## Next
Proceed with normal feature work now that dev environment is stable.
