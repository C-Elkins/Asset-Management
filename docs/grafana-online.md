# Grafana online: two good options

You have two reliable paths to view dashboards on the web:

1) Grafana Cloud (recommended for speed)
- Free tier is generous; no server to run
- Steps:
  - Create an account at https://grafana.com
  - In Grafana Cloud, create a Prometheus metrics instance
  - Copy the remote_write URL and credentials
  - Edit `monitoring/prometheus.yml` and uncomment the `remote_write` block; paste URL, username, and API token
  - Restart Prometheus
  - In Grafana Cloud, add a dashboard and select your Cloud Prometheus datasource

2) Self-hosted Grafana behind HTTPS
- Keep running the local Grafana container, but expose it via a domain and reverse proxy
- Steps (Nginx + Let's Encrypt example):
  - Point a DNS record at your server (e.g., `grafana.example.com`)
  - On the server, run Nginx and obtain a TLS cert (Certbot)
  - Configure Nginx reverse proxy to forward `grafana.example.com` → `http://localhost:3003`
  - In `docker-compose.monitoring.yml`, set (and un-comment) these environment variables for Grafana:
    - `GF_SERVER_DOMAIN=grafana.example.com`
    - `GF_SERVER_ROOT_URL=%(protocol)s://%(domain)s/`
    - `GF_SERVER_ENFORCE_DOMAIN=true`
    - disable anonymous access: `GF_AUTH_ANONYMOUS_ENABLED=false`
  - Restart Grafana

## Security tips for self-hosted
- Always put Grafana behind HTTPS
- Disable anonymous auth and use strong admin passwords
- Limit IPs or add SSO (GitHub/Google/OIDC) where possible
- Backup the Grafana volume (`grafana_data`) regularly

## Troubleshooting
- If dashboards don’t show metrics in Grafana Cloud, verify Prometheus `remote_write` credentials
- If local dashboards are empty, check Prometheus targets and query `up` to ensure `1` for your jobs
- If reverse proxy shows 502/504, confirm container is listening on port 3003 and Nginx upstream matches
