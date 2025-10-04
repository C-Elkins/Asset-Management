# Frontend Health Check Behavior

Updated: 2025-10-03

## Overview
The login screen displays backend status and previously disabled the form whenever the overall `/actuator/health` endpoint returned `DOWN`. In development the only failing component is typically `mail` (SMTP not configured), causing a false "Offline" state.

## New Logic (Login.jsx)

Decision tree (simplified):

1. Attempt axios GET `/actuator/health`.
   (Uses shared API client; interceptors disabled for this path.)
2. Parse JSON (even on HTTP 503) if a response body exists.
3. Classification:
   - 200 + overall `UP` → `state=up`, message `Online`.
     (Or `Stable` if latency ≥ 500 ms.)
   - 503 + overall `DOWN` + only `mail` is `DOWN` → `state=warn`,
     message `Degraded` (form stays enabled).
   - 503 + multiple (or non-whitelisted) components `DOWN` → `state=down`.
   - Network / CORS / other transport failure → fallback raw `fetch`.
     If fallback also fails → `state=down`.
4. Submit button label: `Login (Degraded)` when `state=warn`.

Rationale: Actuator returns 503 if any component is `DOWN`.
In dev, `mail` is intentionally unconfigured; treating it as a full outage
blocks sign‑in needlessly.

## Handling 503 Responses Explicitly

Earlier logic treated any non‑2xx as a transport failure and appeared
`Offline` when CORS blocked requests. We now:

- Inspect `err.response.status === 503`.
- Parse `err.response.data` (health JSON) instead of discarding it.
- Re-run component aggregation to decide `warn` vs `down`.

This prevents misclassification when the backend is reachable but one
non‑critical subsystem is failing.

## CORS & Security Configuration Notes

Backend updates accompanying this change:

- CORS allowed origins now include dev ports 3001, 3005, 3006 (`localhost` and `127.0.0.1`).
- `/api/v1/actuator/**` added to Spring Security permit list (health
  endpoint accessible unauthenticated).
- Result: Preflight succeeds; health check consumes real JSON instead of
  failing early (no false Offline).

## Edge Cases Considered

- Missing / partial JSON body → fallback network retry; if still ambiguous → `down`.
- Latency spikes: placeholder classification may evolve to `Slow` vs `Stable`.
- Additional non-critical components can be added to a whitelist later.

## Extension Ideas

- Provide `/healthz` slim endpoint excluding `mail` for routine dev usage.
- Tooltip or modal: show per-component statuses.
- Adaptive poll interval: slow down while `warn`.
- Metrics aggregation: moving averages & std dev for `Slow` detection.

## Why

Avoid blocking authentication for non-critical services (like outbound
email) during local development or partial outages.

## Future Enhancements

- Add readiness/liveness endpoints and favor those for gating UI.
- Surface component list on hover (tooltip) for transparency.
- Track moving average latency to classify `Stable`/`Slow`.

## Added /healthz Endpoint (Backend)

The backend now exposes `/api/v1/healthz` returning an adjusted status that
ignores a solitary `mail` component failure. Implementation details:

- Wraps Spring Boot Actuator `HealthEndpoint`.
- If only `mail` is DOWN and all other components are UP, it reports `status: UP`.
- Provides minimal component map plus a `_note` field documenting behavior.
- Security configuration permits anonymous access (`/api/v1/healthz`).

Frontend can migrate from `/actuator/health` to `/api/v1/healthz` for a stable
readiness signal that is not impacted by unconfigured SMTP in development.

Frontend implementation (Login.jsx) now attempts `/healthz` first and only
falls back to `/actuator/health` if `/healthz` is unavailable (older build or
non-upgraded environment). Direct fetch fallback mirrors this order.

## Dev Profile Mail Health Disabled

`application-dev.yml` sets:

```yaml
management.health.mail.enabled=false
```

and supplies a no-op `spring.mail` configuration. This prevents the mail
contributor from forcing a global DOWN state locally.
