## Production readiness checklist

This doc summarizes what to set before deploying.

### Secrets and configuration

- Set environment via `.env` or platform secrets:
   - FRONTEND_HOST, BACKEND_HOST, TRAEFIK_DASHBOARD_HOST, LETSENCRYPT_EMAIL
   - POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD
   - JWT_SECRET (>= 32 chars), SENTRY_DSN (optional), PD_ROUTING_KEY (optional)
- Verify `backend/src/main/resources/application-prod.yml` CORS `allowed-origins`
   includes your frontend URL over HTTPS.
- Ensure `application-sentry.yml` values come from environment (done) and sampling
   is tuned for cost.

### Database & migrations

- Use Postgres with backups (e.g., daily logical backups with `pg_dump`).
- Confirm Flyway baseline is correct in prod. DDL auto is set to `validate`
   (safe). Never override it.

### Networking & TLS

- Traefik terminates TLS with Let's Encrypt.
- Frontend Nginx and Traefik send sane security headers; adjust CSP if you
   enable it.

### Monitoring & alerting

- Prometheus, Grafana, Alertmanager are available via the monitoring compose.
- Set `PD_ROUTING_KEY` and restart Alertmanager to enable PagerDuty.
- Sentry DSN configured for backend and frontend.

### Logging

- Backend logs to JSON file and console; Filebeat ships to Logstash/Elasticsearch
   in monitoring stack.

### Performance & limits

- Backend JVM flags via `JAVA_OPTS` are set for containers.
- Nginx caches immutable assets; index.html is no-store to support zero-downtime
   deploys.

### Access control

- Disable Swagger UI in production (done). Keep API docs enabled only if needed.

## How to run in production (single host)

1) Copy `.env.prod.example` to `.env` and fill values.
2) Build and start the stack:
    - `docker compose -f docker-compose.prod.yml --env-file .env up -d --build`
3) Verify:
    - `https://$FRONTEND_HOST` loads the UI
    - `https://$BACKEND_HOST/api/v1/actuator/health` returns UP
4) Optional: Start monitoring stack alongside:
    - `docker compose -f docker-compose.monitoring.yml up -d`

## Next steps

- Add CSP to frontend once list of script/style sources is finalized.
- Add OIDC SSO to Grafana; restrict Traefik dashboard or disable it in production.
- Set up automated backups and restore drills for Postgres.
