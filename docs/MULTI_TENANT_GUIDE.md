# Multi-Tenant SaaS Implementation Guide

## Overview

Your IT Asset Management System has been successfully converted to a **multi-tenant SaaS architecture** with complete data isolation, subdomain routing, and row-level security.

## Architecture

### Multi-Tenancy Strategy: **SHARED DATABASE with Row-Level Security**

- **Single PostgreSQL database** with `tenant_id` column on all tenant-aware tables
- **Complete data isolation** enforced at multiple levels:
  1. Database Row-Level Security (RLS) policies
  2. Hibernate interceptors
  3. JPA `@PrePersist` callbacks
  4. Application-level tenant context filtering

### Key Components

1. **TenantContext** - Thread-local storage for current tenant
2. **TenantFilter** - Extracts tenant from subdomain/header
3. **TenantInterceptor** - Hibernate-level tenant enforcement
4. **TenantAwareEntity** - Base class for all multi-tenant entities
5. **TenantResolver** - Cached tenant lookup from subdomain

---

## Database Schema

### Tenants Table

```sql
CREATE TABLE tenants (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    subdomain VARCHAR(63) NOT NULL UNIQUE,
    contact_email VARCHAR(255) NOT NULL,
    subscription_tier VARCHAR(20) DEFAULT 'FREE',
    max_users INTEGER DEFAULT 5,
    max_assets INTEGER DEFAULT 100,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tenant-Aware Tables

All existing tables (users, assets, categories, maintenance_records, etc.) now have:
- `tenant_id BIGINT NOT NULL` column
- Foreign key constraint to `tenants(id)`
- Index on `tenant_id` for performance
- Row-Level Security (RLS) policies

---

## Subscription Tiers

| Tier | Max Users | Max Assets | Price |
|------|-----------|------------|-------|
| **FREE** | 5 | 100 | Free |
| **BASIC** | 25 | 1,000 | $29/month |
| **PROFESSIONAL** | 100 | 10,000 | $99/month |
| **ENTERPRISE** | Unlimited | Unlimited | Custom |

---

## API Endpoints

### Tenant Registration

**POST** `/api/v1/tenants/register`

Register a new organization (tenant) with admin user.

```json
{
  "name": "Acme Corporation",
  "subdomain": "acme",
  "description": "IT asset management for Acme",
  "contactEmail": "admin@acme.com",
  "contactName": "John Doe",
  "phoneNumber": "+1-555-0100",
  "subscriptionTier": "PROFESSIONAL",
  "adminUsername": "admin",
  "adminEmail": "admin@acme.com",
  "adminPassword": "SecurePassword123!",
  "adminFirstName": "John",
  "adminLastName": "Doe"
}
```

**Response:**
```json
{
  "tenant": {
    "id": 1,
    "name": "Acme Corporation",
    "subdomain": "acme",
    "active": true,
    "subscriptionTier": "PROFESSIONAL",
    "maxUsers": 100,
    "maxAssets": 10000
  },
  "message": "Tenant registered successfully",
  "subdomain": "acme",
  "loginUrl": "https://acme.yourdomain.com/login"
}
```

### Check Subdomain Availability

**GET** `/api/v1/tenants/check-subdomain?subdomain=acme`

```json
{
  "available": false
}
```

### Get Current Tenant

**GET** `/api/v1/tenants/current`

Returns information about the logged-in user's tenant.

### Tenant Management (SUPER_ADMIN only)

- **GET** `/api/v1/tenants` - List all tenants
- **GET** `/api/v1/tenants/{id}` - Get tenant by ID
- **PUT** `/api/v1/tenants/{id}` - Update tenant
- **PATCH** `/api/v1/tenants/{id}/subscription?tier=ENTERPRISE` - Update subscription
- **PATCH** `/api/v1/tenants/{id}/active?active=false` - Deactivate tenant
- **DELETE** `/api/v1/tenants/{id}` - Delete tenant (soft delete)

---

## Subdomain Routing

### How It Works

1. **User accesses**: `https://acme.yourdomain.com`
2. **TenantFilter extracts**: subdomain = "acme"
3. **TenantResolver queries**: `SELECT id FROM tenants WHERE subdomain = 'acme'`
4. **TenantContext sets**: `tenant_id = 123`
5. **All queries filtered**: `WHERE tenant_id = 123`

### Supported Formats

- `subdomain.yourdomain.com` - Production subdomain
- `subdomain.localhost:8080` - Local development
- `X-Tenant-Subdomain: acme` - API clients (custom header)
- `localhost:8080` - Falls back to "default" tenant

### DNS Configuration

For production, configure wildcard DNS:

```
*.yourdomain.com -> Your server IP
```

---

## Security Features

### 1. Row-Level Security (RLS)

PostgreSQL RLS policies ensure database-level isolation:

```sql
CREATE POLICY tenant_isolation_policy ON assets
    USING (tenant_id = current_setting('app.current_tenant_id', true)::BIGINT);
```

### 2. Hibernate Interceptor

Prevents cross-tenant data access at ORM level:

```java
@Override
public boolean onSave(Object entity, Serializable id, Object[] state, ...) {
    if (entity instanceof TenantAwareEntity) {
        Long tenantId = TenantContext.getTenantId();
        // Automatically set tenant_id
    }
}
```

### 3. JPA @PrePersist Callback

```java
@PrePersist
public void onPrePersist() {
    if (this.tenantId == null) {
        this.tenantId = TenantContext.getTenantId();
    }
    if (this.tenantId == null) {
        throw new IllegalStateException("Tenant ID must be set");
    }
}
```

### 4. JWT Token Tenant Binding

JWT tokens include `tenantId` claim:

```json
{
  "sub": "john.doe",
  "tenantId": 123,
  "roles": "SUPER_ADMIN",
  "iat": 1696320000,
  "exp": 1696323600
}
```

---

## Entity Updates

All entities now extend `TenantAwareEntity`:

### Before (Single-Tenant)
```java
@Entity
@Table(name = "assets")
public class Asset {
    @Id
    private Long id;
    private String name;
    // ...
}
```

### After (Multi-Tenant)
```java
@Entity
@Table(name = "assets", indexes = {
    @Index(name = "idx_assets_tenant", columnList = "tenant_id")
})
public class Asset extends TenantAwareEntity {
    @Id
    private Long id;
    private String name;
    // tenant_id inherited from TenantAwareEntity
}
```

---

## Migration Guide

### Step 1: Run Database Migration

```bash
# Flyway will automatically run V6__Add_Multi_Tenant_Support.sql
./mvnw flyway:migrate
```

This migration:
- Creates `tenants` table
- Adds `tenant_id` column to all tables
- Creates a "default" tenant
- Migrates existing data to default tenant
- Enables Row-Level Security
- Creates indexes

### Step 2: Update Application Configuration

**application.yml:**

```yaml
spring:
  jpa:
    properties:
      hibernate:
        # Enable multi-tenancy
        multiTenancy: DISCRIMINATOR
        
server:
  # Allow wildcard subdomains
  forward-headers-strategy: native
```

### Step 3: Test Tenant Isolation

```bash
# Register tenant 1
curl -X POST http://localhost:8080/api/v1/tenants/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Tenant 1","subdomain":"tenant1","contactEmail":"admin@tenant1.com",...}'

# Register tenant 2  
curl -X POST http://localhost:8080/api/v1/tenants/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Tenant 2","subdomain":"tenant2","contactEmail":"admin@tenant2.com",...}'

# Login as tenant1 admin
curl -X POST http://tenant1.localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Create asset for tenant1
curl -X POST http://tenant1.localhost:8080/api/v1/assets \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","assetTag":"LT001",...}'

# Verify tenant2 cannot see tenant1's assets
curl -X GET http://tenant2.localhost:8080/api/v1/assets \
  -H "Authorization: Bearer <TENANT2_TOKEN>"
# Should return empty or only tenant2's assets
```

---

## Development Setup

### Local Testing with Subdomains

Add to `/etc/hosts` (macOS/Linux) or `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
127.0.0.1 tenant1.localhost
127.0.0.1 tenant2.localhost
127.0.0.1 acme.localhost
```

### Testing with cURL

```bash
# Using subdomain
curl http://acme.localhost:8080/api/v1/assets

# Using custom header (for clients that can't control subdomain)
curl -H "X-Tenant-Subdomain: acme" http://localhost:8080/api/v1/assets
```

---

## Performance Considerations

### 1. Tenant Cache

`TenantResolver` caches subdomain → tenant_id mappings:

```java
// Cache hit (no database query)
Long tenantId = tenantResolver.resolveTenantId("acme"); // From cache

// Clear cache when tenant updated
tenantResolver.clearCache("acme");
```

### 2. Database Indexes

All tenant-aware tables have composite indexes:

```sql
CREATE INDEX idx_assets_tenant_status ON assets(tenant_id, status);
CREATE INDEX idx_users_tenant_active ON users(tenant_id, active);
```

### 3. Connection Pooling

Configure appropriate pool size for multi-tenant load:

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
```

---

## Monitoring & Observability

### Tenant-Aware Logging

All logs include tenant context:

```java
log.info("User {} created asset in tenant {}", username, tenantId);
```

### Metrics to Track

1. **Tenants per subscription tier**
2. **Assets/users per tenant**
3. **API requests per tenant**
4. **Tenant churn rate**
5. **Resource usage per tenant**

### Example Queries

```sql
-- Tenants approaching limits
SELECT t.name, t.subdomain, 
       COUNT(DISTINCT u.id) as user_count, 
       t.max_users,
       COUNT(DISTINCT a.id) as asset_count,
       t.max_assets
FROM tenants t
LEFT JOIN users u ON t.id = u.tenant_id
LEFT JOIN assets a ON t.id = a.tenant_id
GROUP BY t.id
HAVING COUNT(DISTINCT u.id) >= t.max_users * 0.9
    OR COUNT(DISTINCT a.id) >= t.max_assets * 0.9;
```

---

## Production Deployment Checklist

- [ ] Configure wildcard DNS (`*.yourdomain.com`)
- [ ] Set up SSL certificates (Let's Encrypt wildcard)
- [ ] Enable CORS for tenant subdomains
- [ ] Configure JWT secrets per environment
- [ ] Set up monitoring for tenant isolation violations
- [ ] Implement rate limiting per tenant
- [ ] Create backup strategy (tenant-aware backups)
- [ ] Test cross-tenant data access prevention
- [ ] Document tenant onboarding process
- [ ] Set up billing integration (Stripe/PayPal)
- [ ] Create admin dashboard for tenant management
- [ ] Implement tenant usage analytics

---

## Troubleshooting

### Issue: "Tenant ID must be set before persisting entity"

**Cause**: TenantContext not properly initialized

**Solution**: Ensure TenantFilter runs before JwtAuthenticationFilter

```java
// In SecurityConfig.java
http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
```

### Issue: Users see data from other tenants

**Cause**: Row-Level Security not enabled or tenant_id not set

**Solution**: 
1. Verify RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'assets';`
2. Check TenantContext: `TenantContext.getTenantId()` should not be null
3. Verify tenant_id in database: `SELECT DISTINCT tenant_id FROM assets;`

### Issue: Subdomain not resolving

**Cause**: DNS not configured or TenantFilter not extracting subdomain

**Solution**:
1. Check DNS: `nslookup acme.yourdomain.com`
2. Add debug logging in TenantFilter
3. Use `X-Tenant-Subdomain` header for testing

---

## API Client Integration

### Frontend (React/Vue/Angular)

```javascript
// Axios interceptor to add tenant header
axios.interceptors.request.use(config => {
  const subdomain = window.location.hostname.split('.')[0];
  config.headers['X-Tenant-Subdomain'] = subdomain;
  return config;
});
```

### Mobile Apps

```kotlin
// Android/Kotlin
val request = Request.Builder()
    .url("https://api.yourdomain.com/assets")
    .addHeader("X-Tenant-Subdomain", tenantSubdomain)
    .build()
```

### Third-Party Integrations

```bash
# Zapier, Make.com, etc.
curl -X GET https://api.yourdomain.com/assets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-Tenant-Subdomain: acme"
```

---

## Future Enhancements

1. **Database-per-tenant** - For enterprise customers requiring complete isolation
2. **Custom domains** - `assets.acme.com` instead of `acme.yourdomain.com`
3. **White-labeling** - Custom branding per tenant
4. **Tenant-specific features** - Feature flags per subscription tier
5. **Data export/import** - Tenant data portability
6. **Multi-region support** - Tenant data residency compliance
7. **Automated backups** - Tenant-aware backup/restore

---

## Support & Resources

- **Documentation**: `/docs/multi-tenant-architecture.md`
- **API Reference**: `/swagger-ui.html`
- **Database Schema**: `/docs/database-schema.md`
- **Security Guide**: `/docs/SECURITY_ANALYSIS.md`

---

**Last Updated**: October 3, 2025  
**Version**: 1.1.0 (Multi-Tenant)
