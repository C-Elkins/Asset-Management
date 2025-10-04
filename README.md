<h1 align="center">🚀 Krubles Asset Management (KAM)</h1>

<p align="center">
  <strong>Enterprise-grade IT Asset Management made simple, modern, and powerful</strong>
</p>

<p align="center">
  <img src="https://github.com/C-Elkins/IT-Asset-Management/actions/workflows/ci.yml/badge.svg" alt="CI">
  <img src="https://img.shields.io/badge/version-1.1.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
</p>

<p align="center">
  <strong>Krubles</strong> is a modern, full-stack asset management platform built for IT teams who need more than just a spreadsheet. Track assets, automate workflows, integrate with your favorite tools, and gain insights—all from a beautiful, responsive web interface.
</p>

---

## 📸 Screenshots

> _Coming soon - See `/docs` folder for detailed feature documentation_

---

## ✨ Key Features

### 🎯 Core Asset Management
- **Complete Asset Lifecycle Tracking** - From acquisition to disposal
- **Category Management** - Organize by type, department, or custom taxonomy
- **Asset Assignment** - Track who has what, when, and where
- **Maintenance Scheduling** - Never miss warranty renewals or maintenance
- **Advanced Search & Filtering** - Find assets instantly
- **Bulk Operations** - Import, export, and update hundreds of assets at once

### 🏢 Multi-Tenant SaaS Architecture
- **Complete Tenant Isolation** - Row-level security with database constraints
- **Subdomain Routing** - `{tenant}.krubles.com` automatic routing
- **Tenant Context** - Thread-safe request scoping with Spring AOP
- **13+ Multi-Tenant Entities** - Assets, users, categories, API keys, and more
- **Tenant-Aware Filtering** - Automatic query filtering via Hibernate interceptors
- **Self-Service Signup** - Automated tenant provisioning

### 💳 Stripe Integration & Billing
- **Usage-Based Billing** - Metered pricing for API calls, storage, assets
- **Subscription Management** - Create, update, cancel subscriptions via API
- **Webhook Processing** - Real-time payment events (succeeded, failed, disputes)
- **Customer Portal** - Self-service billing management
- **Invoice Generation** - Automatic invoicing with Stripe
- **Multiple Payment Methods** - Cards, ACH, SEPA, and more
- **Revenue Recognition** - Automated with Stripe Billing

### 🔗 Integrations (11 Live!)
- ✅ **REST API** - Full programmatic access with OpenAPI docs
- ✅ **Google OAuth 2.0** - Sign in with Google accounts
- ✅ **Microsoft OAuth / Azure AD** - Enterprise SSO with Microsoft
- ✅ **JWT Authentication** - Secure, stateless token-based auth
- ✅ **API Keys & Rate Limiting** - Programmatic access with bcrypt-hashed keys
- ✅ **Stripe Payments** - Complete subscription & usage-based billing
- ✅ **CSV Import/Export** - Standard data exchange
- ✅ **Excel Import/Export** - Direct .xlsx file support with formatting
- ✅ **Webhooks** - Real-time event notifications to any endpoint
- ✅ **Slack Notifications** - Team alerts for asset events
- ✅ **Email Notifications** - SMTP with HTML templates for assignments & reminders
- ✅ **Enhanced Filtered Exports** - Custom columns & advanced filtering

### 🔐 Security & Access Control
- **Role-Based Access Control (RBAC)** - 5 permission levels (SUPER_ADMIN → VIEWER)
- **OAuth 2.0 Authentication** - Sign in with Google or Microsoft/Azure AD
- **JWT Authentication** - Secure, stateless token-based auth
- **Multi-Factor Authentication (MFA)** - TOTP 6-digit codes for enhanced security
- **API Keys & Rate Limiting** - Bcrypt-hashed keys with sliding window algorithm
- **Audit Logging** - Track every change with comprehensive audit trails
- **Session Management** - Secure token handling with configurable expiry
- **CORS Protection** - Configured security headers and origin validation

### 📊 Reporting & Analytics
- **Asset Dashboard** - Real-time overview
- **Custom Reports** - Filter by any criteria
- **Value Tracking** - Monitor asset depreciation
- **Maintenance Reports** - Upcoming and overdue items
- **Export Options** - CSV, Excel, or API

### 🤖 AI Assistant (Experimental)
- **Smart Categorization** - Auto-categorize assets from descriptions
- **Insights Extraction** - Pull structured data from text
- **Rate Limited** - 30 requests per 5 minutes per user
- **Local History** - IndexedDB-backed query history

### 📈 Observability
- **Health Checks** - `/actuator/health` endpoint
- **Prometheus Metrics** - Full metric export
- **Structured Logging** - JSON logs with correlation IDs
- **Performance Monitoring** - Request timing & throughput

### 📊 Production Monitoring Stack
- **Sentry** - Error tracking & performance monitoring (7.10.0)
- **Prometheus + Grafana** - Metrics collection & visualization
- **ELK Stack** - Elasticsearch, Logstash, Kibana for log management
- **Uptime Kuma** - Uptime monitoring & status pages
- **AlertManager** - Prometheus alert routing & notifications
- **Filebeat** - Log shipping to Logstash
- **Docker Compose** - Complete monitoring infrastructure included

---

## 🏗️ Architecture

### Tech Stack

**Frontend**
- **React 19** - Latest React with concurrent features
- **Vite 7.1.7** - Lightning-fast builds (< 3s)
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Query** - Server state management
- **Framer Motion** - Smooth animations

**Backend**
- **Spring Boot 3.4.1** - Modern Java framework
- **Java 21** - Latest LTS with virtual threads
- **PostgreSQL** - Production database
- **H2** - Development database
- **Flyway** - Database migrations
- **Spring Security** - Authentication & authorization
- **Apache POI** - Excel processing
- **Micrometer** - Metrics & observability

**DevOps**
- **Docker** - Containerization
- **Docker Compose** - Local orchestration
- **GitHub Actions** - CI/CD pipeline
- **Nginx** - Production web server

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                  │
│  Marketing Pages • Dashboard • Asset Management • Reports   │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API (JWT Auth)
┌──────────────────────▼──────────────────────────────────────┐
│              Spring Boot Backend (Java 21)                  │
│  Controllers → Services → Repositories → Database           │
│  • AssetService  • WebhookService  • SlackService          │
│  • ExcelService  • ExportService   • ImportService         │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                PostgreSQL Database                          │
│  Assets • Categories • Users • Webhooks • Maintenance       │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   Webhooks              Slack API          Excel Exports
```

---

## 🚀 Quick Start

### Prerequisites

- **Docker** & **Docker Compose** (recommended)
- OR **Java 21+**, **Node.js 18+**, **PostgreSQL 14+**

### Option 1: Docker Compose (Easiest)

```bash
# Clone the repository
git clone https://github.com/C-Elkins/IT-Asset-Management.git
cd IT-Asset-Management

# Start all services
docker-compose up -d

# Access the application
open http://localhost:3001
```

**Default Credentials**:
- Username: `admin`
- Password: `admin123`

### Option 2: Local Development

#### Backend Setup

```bash
cd backend

# Install dependencies & build
./mvnw clean install

# Run with dev profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Backend will be available at `http://localhost:8080`

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend will be available at `http://localhost:3001`

---

## 📚 Project Structure

```
IT-Asset-Management/
├── backend/                    # Spring Boot API
│   ├── src/main/java/
│   │   └── com/chaseelkins/assetmanagement/
│   │       ├── config/        # Spring configuration
│   │       ├── controller/    # REST endpoints
│   │       ├── dto/           # Data transfer objects
│   │       ├── model/         # JPA entities
│   │       ├── repository/    # Data access layer
│   │       ├── security/      # Auth & authorization
│   │       └── service/       # Business logic
│   ├── src/main/resources/
│   │   ├── application.yml    # App configuration
│   │   └── db/migration/      # Flyway SQL migrations
│   └── pom.xml               # Maven dependencies
│
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/            
│   │   │   ├── auth/         # Login, signup, reset
│   │   │   ├── dashboard/    # Admin dashboard
│   │   │   └── marketing/    # Public pages
│   │   ├── services/         # API clients
│   │   ├── hooks/            # Custom React hooks
│   │   ├── stores/           # State management
│   │   └── utils/            # Helper functions
│   ├── public/               # Static assets
│   └── package.json          # NPM dependencies
│
├── docs/                       # Documentation
│   ├── api-documentation.md   # API reference
│   ├── auth-setup.md          # Authentication guide
│   ├── deployment-guide.md    # Production deployment
│   ├── oauth-implementation-guide.md
│   ├── slack-integration-guide.md
│   └── user-guide.md          # End user docs
│
├── docker-compose.yml         # Full stack orchestration
├── Makefile                   # Common commands
└── README.md                  # This file
```

---

## 🌐 Marketing Pages

Krubles includes **9 beautifully designed marketing pages** built with modern gradients, animations, and responsive design:

1. **Home** (`/`) - Landing page with hero, features, and CTA
2. **Features** (`/features`) - Detailed feature showcase
3. **Solutions** (`/solutions`) - Industry use cases
4. **Pricing** (`/pricing`) - Transparent pricing tiers
5. **Customers** (`/customers`) - Testimonials & success stories
6. **Integrations** (`/integrations`) - Available integrations
7. **Security** (`/security`) - Security & compliance
8. **About** (`/about`) - Company story & team
9. **Contact** (`/contact`) - Get in touch

**Design System**:
- Blue-green gradient (`#2563eb` to `#10b981`)
- Animated gradient blobs
- Smooth scroll animations
- Mobile-responsive (Tailwind breakpoints)
- Consistent typography & spacing

---

## 🔧 Configuration

### Environment Variables

**Backend** (`backend/src/main/resources/application.yml`):

```yaml
# Database
spring.datasource.url=${DATABASE_URL:jdbc:postgresql://localhost:5432/assetdb}
spring.datasource.username=${DATABASE_USERNAME:postgres}
spring.datasource.password=${DATABASE_PASSWORD:postgres}

# JWT
jwt.secret=${JWT_SECRET:your-secret-key-min-32-chars}
jwt.access-expiration=900000      # 15 minutes
jwt.refresh-expiration=604800000  # 7 days

# Slack Integration (Optional)
slack.webhook.url=${SLACK_WEBHOOK_URL:}
slack.notifications.enabled=${SLACK_NOTIFICATIONS_ENABLED:false}

# Server
server.port=8080
```

**Frontend** (`.env`):

```env
# API Configuration
VITE_API_URL=http://localhost:8080/api/v1
VITE_APP_NAME=Krubles Asset Management

# Google OAuth 2.0 (Optional - enables "Sign in with Google")
# Get your client ID from: https://console.cloud.google.com/apis/credentials
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here

# Microsoft OAuth / Azure AD (Optional - enables "Sign in with Microsoft")
# Get your client ID from: https://portal.azure.com
VITE_MICROSOFT_CLIENT_ID=your-microsoft-client-id-here
VITE_MICROSOFT_TENANT_ID=common
```

> **Note**: OAuth buttons will only appear if the corresponding client IDs are configured. See detailed setup guides:
> - [Google OAuth Setup](./docs/google-oauth-integration.md)
> - [Microsoft OAuth Setup](./docs/microsoft-oauth-integration.md)

### Docker Environment

Create `docker-compose.override.yml` for local overrides:

```yaml
version: '3.8'
services:
  backend:
    environment:
      - JWT_SECRET=your-production-secret-key
      - SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK
      - SLACK_NOTIFICATIONS_ENABLED=true
```

---

## 📖 API Documentation

### REST API

Base URL: `http://localhost:8080/api/v1`

**Authentication**: All endpoints (except `/auth/*`) require JWT token in `Authorization: Bearer {token}` header

#### Key Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signin` | User login | ❌ |
| POST | `/auth/signup` | User registration | ❌ |
| GET | `/assets` | List all assets | ✅ |
| POST | `/assets` | Create asset | ✅ (IT_ADMIN+) |
| GET | `/assets/{id}` | Get asset details | ✅ |
| PUT | `/assets/{id}` | Update asset | ✅ (IT_ADMIN+) |
| DELETE | `/assets/{id}` | Delete asset | ✅ (SUPER_ADMIN) |
| POST | `/imports/excel` | Import Excel file | ✅ (IT_ADMIN+) |
| GET | `/exports/assets/csv` | Export filtered CSV | ✅ |
| GET | `/webhooks` | List webhooks | ✅ (IT_ADMIN+) |
| POST | `/webhooks` | Create webhook | ✅ (IT_ADMIN+) |
| POST | `/slack/test` | Test Slack connection | ✅ (IT_ADMIN+) |

**Full API Docs**: Visit `http://localhost:8080/api/v1/swagger-ui.html` when running

### User Roles

| Role | Permissions |
|------|-------------|
| `SUPER_ADMIN` | Full system access, delete assets |
| `IT_ADMIN` | Manage assets, users, settings, integrations |
| `MANAGER` | Create/update assets, view reports, import/export |
| `IT_STAFF` | View assets, export data |
| `USER` | View assigned assets only |

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
./mvnw test                    # Run all tests
./mvnw test -Dtest=AssetServiceTest  # Run specific test
./mvnw verify                  # Run tests + integration tests
```

### Frontend Tests

```bash
cd frontend
npm test                       # Run unit tests
npm run test:coverage          # With coverage report
npm run test:e2e               # Playwright E2E tests
```

---

## 🚀 Deployment

### Production Build

```bash
# Backend
cd backend
./mvnw clean package -DskipTests
# Creates: target/it-asset-management-1.1.0.jar

# Frontend
cd frontend
npm run build
# Creates: dist/ folder with optimized bundle
```

### Docker Production

```bash
# Build images
docker-compose build

# Push to registry
docker tag it-asset-management-backend:latest your-registry/krubles-backend:1.1.0
docker push your-registry/krubles-backend:1.1.0

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Deployment Checklist

- [ ] Set strong `JWT_SECRET` (min 32 characters)
- [ ] Configure production database (PostgreSQL)
- [ ] Enable HTTPS (Let's Encrypt recommended)
- [ ] Set up database backups
- [ ] Configure monitoring (Prometheus + Grafana)
- [ ] Set up log aggregation
- [ ] Configure CORS for production domain
- [ ] Enable Slack notifications (optional)
- [ ] Test all integrations
- [ ] Create initial admin user

**Full deployment guide**: See `docs/deployment-guide.md`

---

## 🔌 Integrations Setup

### Slack Notifications

1. Create Slack Incoming Webhook at https://api.slack.com/apps
2. Set environment variables:
   ```bash
   export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
   export SLACK_NOTIFICATIONS_ENABLED=true
   ```
3. Test connection via API: `POST /slack/test`
4. See full guide: `docs/slack-integration-guide.md`

### Webhooks

1. Login as IT_ADMIN or SUPER_ADMIN
2. Create webhook via API: `POST /webhooks`
   ```json
   {
     "name": "Asset Events",
     "url": "https://your-endpoint.com/webhook",
     "events": ["ASSET_CREATED", "ASSET_UPDATED"],
     "active": true
   }
   ```
3. Verify HMAC signature in `X-Webhook-Signature` header
4. See full guide: `docs/integration-implementation-plan.md`

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Code Standards

- **Backend**: Follow Java conventions, use Spring Boot best practices
- **Frontend**: Use TypeScript, follow React hooks patterns
- **Tests**: Write tests for new features
- **Documentation**: Update docs for API changes

---

## 📊 Performance

### Build Times
- **Backend**: ~2.5s (Maven compile)
- **Frontend**: ~2.8s (Vite build)
- **Total**: < 6s from clean state

### Bundle Size
- **Frontend (gzipped)**: 84.39 KB
- **Backend JAR**: ~45 MB (includes all dependencies)

### API Response Times
- **Asset list (100 items)**: < 100ms
- **Asset detail**: < 50ms
- **Excel export (1000 assets)**: ~2s
- **Filtered CSV export**: ~1s

---

## 🐛 Troubleshooting

### Common Issues

**Port already in use**
```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9

# Or change port in application.yml
server.port=8081
```

**Database connection failed**
```bash
# Check PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs postgres
```

**Frontend build errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**JWT token expired**
- Access tokens expire after 15 minutes
- Use refresh token to get new access token
- Or re-authenticate via `/auth/signin`

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Krubles** is built by founders who care about making IT asset management simple and enjoyable.

- **Contact**: support@krubles.com
- **Website**: https://krubles.com (coming soon)
- **GitHub**: https://github.com/C-Elkins/IT-Asset-Management

---

## 🗺️ Roadmap

### ✅ v1.1.0 (Current - October 2025)
- [x] 9 marketing pages redesigned
- [x] Excel import/export
- [x] Webhooks system
- [x] Slack notifications
- [x] Enhanced filtered exports
- [x] 7 live integrations

### 🔄 v1.2.0 (Q4 2025)
- [ ] Google OAuth sign-in
- [ ] Microsoft OAuth sign-in
- [ ] Enhanced dashboard with charts
- [ ] Mobile app (React Native)
- [ ] Scheduled reports

### 🔮 v2.0.0 (2026)
- [ ] ServiceNow integration
- [ ] Jira integration
- [ ] Power BI connector
- [ ] Multi-tenancy support
- [ ] Advanced analytics with AI

---

## 📚 Additional Resources

- **API Documentation**: `docs/api-documentation.md`
- **User Guide**: `docs/user-guide.md`
- **Deployment Guide**: `docs/deployment-guide.md`
- **Integration Guides**: `docs/` folder
- **Release Notes**: See GitHub Releases

---

## ⭐ Star Us!

If you find Krubles useful, please consider giving us a star on GitHub! It helps others discover the project.

[![GitHub stars](https://img.shields.io/github/stars/C-Elkins/IT-Asset-Management?style=social)](https://github.com/C-Elkins/IT-Asset-Management/stargazers)

---

**Built with ❤️ by the Krubles team**

*Making asset management simple, powerful, and enjoyable.*

---

## 🤖 AI Assistant (Technical Details)

The application includes an experimental, deterministic AI Assistant available at `/app/ai` ("AI Assistant" in the sidebar).

## Features

## AI Assistant (Experimental)

The application includes an experimental, deterministic AI Assistant available at
`/app/ai` ("AI Assistant" in the sidebar). It provides two backend-powered
capabilities:

1. Categorize – Heuristically assigns a category and tag set to arbitrary input
    text (e.g., asset descriptions, incident notes) and returns a confidence
    score.
2. Insights – Extracts structured key/value insight pairs with simple scoring
    (no external AI APIs required).

### Technical Architecture

- Backend: Spring Boot exposes POST endpoints `/ai/categorize` and
   `/ai/insights` with per-user in-memory rate limiting (30 req / 5 min).
- Frontend: Lightweight React Query mutations (see `src/hooks/useAIBackend.ts`)
   wrap `backendCategorize` and `backendInsights` from `aiService`.
- Local History: Each successful query is persisted to IndexedDB (Dexie) in a
   new `ai_queries` table (version 4 schema upgrade) for quick recall and
   re-run.
- Separation of Concerns: The heuristic simulation / enrichment logic
   (`AIService`) stays isolated from backend wrappers to allow future integration
   of real LLM providers without bundle bloat.

### Extending

To integrate a real model provider, add a new module (e.g., `llmProvider.ts`)
exporting async functions with the same shape as `backendCategorize` /
`backendInsights`, then feature toggle in the Assistant UI. Avoid modifying
existing endpoints to preserve deterministic fallbacks.

### Rate Limiting & Headers

Backend applies a per-user fixed window (30 requests / 5 minutes) for both AI endpoints.

Headers emitted on every successful response and 429:

| Header | Meaning |
| ------ | ------- |
| `X-RateLimit-Limit` | Max requests permitted in the current window (e.g. 30) |
| `X-RateLimit-Remaining` | Requests left before throttling |
| `X-RateLimit-Reset` | Unix epoch seconds when the current window resets |
| `Retry-After` | (On 429) Seconds until retry (matches reset delta) |

Frontend cooldown logic:

1. On 429 the app reads `Retry-After` (or derives from `X-RateLimit-Reset`) and
   disables submission until that time.
2. On success, it could (future enhancement) surface remaining quota; currently
   it simply resets internal cooldown if any.
3. Fallback: If headers are missing, a conservative 60s cooldown is applied.

These headers make client-side UX deterministic and observable; they also enable
external monitoring / dashboards to reason about saturation.

UI Integration:

- The AI Assistant page now shows: remaining requests, total limit, and a live
   countdown until reset (derived from `X-RateLimit-Reset`). When throttled it
   swaps to a cooldown timer sourced from `Retry-After`.

## Observability & Logging

- Actuator endpoints exposed: `health`, `info`, `metrics`, `env`, `prometheus`.
- Micrometer Prometheus registry enabled (scrape `/api/v1/actuator/prometheus`).
- Custom metrics added for AI endpoints
   (`ai_categorize_requests_total`, `ai_insights_requests_total`,
   `ai_rate_limit_hits_total`, latency timers).
- Structured JSON logs written to `logs/application.json` with correlation,
   trace, span IDs.
- `AuthActivityFilter` injects `correlationId` (header `X-Correlation-Id` or
   generated) and logs auth request outcomes.

## Resilience (Prepared)

Baseline Resilience4j config (`resilience4j.yml`) defines a circuit breaker &
time limiter named `aiExternalProvider` for future external AI integrations
(currently unused in code paths).

## OpenAPI & Type Generation

SpringDoc already exposes the OpenAPI doc at `/api/v1/api-docs` and Swagger UI
at `/api/v1/swagger-ui.html`.
Planned: add a frontend npm script to generate TypeScript types (e.g. using `openapi-typescript`).

## Project structure

- `backend/` — Spring Boot (Java 17+, Maven) REST API
- `frontend/` — React 19 (Vite) SPA served by nginx in prod
- `docker-compose.yml` — Compose stack for DB + API + Web

## Quick start

1. Backend (dev)

   - Requirements: Java 17+, Maven 3.9+
   - Build and run:

   ```bash
   mvn spring-boot:run
   ```

2. Frontend (dev)

   - Requirements: Node.js 20+
   - Install and start:

   ```bash
   npm install
   npm run dev
   ```

3. Docker (prod-like)

   Build and run all services:

   ```bash
   docker compose up -d --build
   ```

   Services:

   - Frontend: <http://localhost:3002> (nginx serving Vite build)
   - Backend: internal on 8080 in the Compose network
   - Postgres: localhost:5432 (user/pass: iam/iam)

   Health:

   - Frontend: <http://localhost:3002/healthz>
   - Backend: <http://localhost:8080/api/v1/actuator/health> (inside network)

## Environment

- Frontend dev proxy: `VITE_API_BASE=/api` (see `frontend/.env.development`)
- Nginx runtime env: `BACKEND_ORIGIN` (defaults to `http://backend:8080`)

## E2E smoke tests (Playwright)

Run locally:

```bash
cd frontend
npm run build && npm run test:e2e
npm run test:e2e:report # optional
```

## Dev modes

- Local dev (hot reload):
  - Backend: `./mvnw spring-boot:run` in `backend`
  - Frontend: `npm run dev` in `frontend` → <http://localhost:3001>
  - API proxied via Vite `/api` → <http://localhost:8080>

- Containerized dev:
  - `docker compose up -d --build`
  - Frontend → <http://localhost:3002>
  - Backend (Compose network) → `http://backend:8080`
  - Nginx proxy uses BACKEND_ORIGIN env (default `http://backend:8080`)

## VS Code tasks

Tasks are available under Terminal → Run Task:

- dev:start backend — starts Spring Boot (scripted)
- dev:start frontend — starts Vite dev server
- dev:start all — runs both in parallel

## CI

CI builds:

- Backend: Maven on Temurin 21
- Frontend: Node 20 build + Playwright smoke tests
- Triggers: push and PR to main

## Contributing and Security

- See [CONTRIBUTING.md](./CONTRIBUTING.md)
- See [SECURITY.md](./SECURITY.md)
