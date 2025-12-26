# Changelog

## [v1.1.0] - 2025-09-24

### Added

- AI endpoints (`AIController`) with deterministic categorize/insights and standard
  rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`,
  `X-RateLimit-Reset`, `Retry-After`.
- Auth metrics counters for login/refresh success and failure.
- Correlation ID propagation via `X-Correlation-Id` and structured JSON logging
  (`logback-spring.xml`).
- Resilience configuration scaffold (`resilience4j.yml`).
- Frontend AI Assistant: dynamic cooldown from headers, remaining quota and
  reset countdown; Dexie v4 history; global rate limit store; axios telemetry.

### Changed

- README updated with rate limit semantics and UI behavior.
- Frontend dependency: `uuid` added for persistent correlation IDs.

### Notes

- Run `npm install` in `frontend/`.
- No DB migrations (browser Dexie auto-upgrade).
