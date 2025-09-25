## Summary

This PR introduces standardized AI rate limit telemetry, dynamic cooldown
handling in the AI Assistant, authentication flow metrics, and correlation ID
propagation end-to-end. It also adds a global rate limit store and updates
documentation accordingly.

## Why

Improve UX transparency (quota + reset time), observability (metrics/logs), and
prepare for an external AI provider using resilience patterns.

## Scope

- Backend: `AIController`, rate limit headers on success/429, auth metrics,
  structured JSON logging config, resilience config, refresh token infra.
- Frontend: `AIAssistant.jsx` with dynamic cooldown + quota UI, global rate
  limit store, axios interceptors for telemetry and correlation.
- Docs: README rate limit semantics and UI integration.

## Risks

Low; changes are additive. Requires `npm install` for `uuid`.

## Follow-ups

- Add a Playwright test for the 429 flow
- Grafana panels for new counters
- External AI provider integration using resilience4j

## Checklist

- [ ] Builds pass locally (frontend/backend)
- [ ] AI endpoints return rate limit headers
- [ ] Cooldown & quota display behave as expected
- [ ] New metrics visible via Prometheus scrape
