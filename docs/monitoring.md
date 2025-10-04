# Monitoring & Observability

This repo includes a local monitoring stack for development and demos:

Services (ports)

- Prometheus: <http://localhost:9090>
- Grafana: <http://localhost:3003> (admin/admin by default)
- Alertmanager: <http://localhost:9093>
- Elasticsearch: <http://localhost:9200>
- Kibana: <http://localhost:5601>
- Logstash: tcp://localhost:5044 (input)
- Uptime Kuma: <http://localhost:3002>
- Node Exporter: <http://localhost:9100/metrics>

## Start the stack

From the repo root:

```bash
docker compose -f docker-compose.monitoring.yml up -d
```

## Prometheus

- Scrapes the Spring Boot app at `http://host.docker.internal:8080/api/v1/actuator/prometheus`
- Scrapes node-exporter at `node-exporter:9100`
- Alerts via Alertmanager (see `monitoring/rules/app-alerts.yml`)

## Grafana

- Pre-provisioned Prometheus datasource
- Dashboard provisioning scans `monitoring/grafana/dashboards/`
- Example dashboard: `App Overview (Spring Boot + JVM + Node)`

## Logs (ELK)

- Filebeat ships logs from:
  - `backend/logs/*.json`
  - `logs/*.log`
- Pipeline: Filebeat → Logstash (5044) → Elasticsearch → Kibana
- In Kibana add index pattern `app-logs-*`

## Uptime Kuma

- Simple UI to configure HTTP checks (e.g., backend actuator, frontend URL)

## PagerDuty (optional)

- Edit `monitoring/alertmanager.yml` and add a receiver with your PD routing key:

```yaml
receivers:
  - name: pagerduty
    pagerduty_configs:
      - routing_key: YOUR_PD_INTEGRATION_KEY
        severity: '{{ .CommonLabels.severity }}'
route:
  receiver: pagerduty
```

Restart Alertmanager:

```bash
docker compose -f docker-compose.monitoring.yml restart alertmanager
```

## Frontend Sentry

- Configure DSN in `frontend/.env`:

```bash
VITE_SENTRY_DSN=your-frontend-dsn
VITE_SENTRY_TRACES_SAMPLE_RATE=1.0
VITE_SENTRY_ENV=dev
```

## Backend Sentry

- Set DSN via env or in `application-sentry.yml`.

## Troubleshooting

- If Prometheus target `spring-boot-app` is DOWN, confirm backend is running
  locally and metrics path: `/api/v1/actuator/prometheus`.
- If Grafana default login fails, you can reset with
  `GF_SECURITY_ADMIN_PASSWORD` env in compose.
- If Kibana shows no indices, check Filebeat logs and paths mounted in `monitoring/filebeat.yml`.
