# Reviewer Checklist

## Functional

- [ ] AI categorize/insights return expected payloads and headers
- [ ] 429 includes `Retry-After` aligned with `X-RateLimit-Reset`
- [ ] Cooldown UI disables submit and re-enables at reset
- [ ] Quota display (remaining/limit/reset) matches headers

## Security

- [ ] Refresh tokens hashed; no plaintext tokens in logs
- [ ] Correlation ID is opaque UUID; no PII leaked
- [ ] JWT handling unchanged and regression-free

## Observability

- [ ] Prometheus exposes new auth counters
- [ ] Structured logs include correlationId across auth/AI
- [ ] Rate limit headers reflect policy (30/300s)

## Code Quality

- [ ] No hardcoded 5m cooldown remains
- [ ] `rateLimitStore.js` updates only via interceptor, safe if headers missing
- [ ] Axios interceptors guard absent header cases

## Docs

- [ ] README rate limit table renders and is accurate
- [ ] UI quota note matches implementation

## Resilience / Future Ready

- [ ] `resilience4j.yml` names consistent, ready for provider swap
- [ ] External provider can be added without breaking API contract

## DX / Build

- [ ] `npm install` succeeds with `uuid`
- [ ] Frontend and backend build cleanly
- [ ] Dexie v4 upgrade has no console errors

## Optional

- [ ] Manual: make rapid requests to observe remaining decrement + 429
- [ ] Correlation ID visible in network tab and backend logs
