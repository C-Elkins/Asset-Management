# Multi-Tenant Quick Start Guide

## 🚀 Quick Start (5 Minutes)

### 1. Run Database Migration

```bash
cd backend
./mvnw clean install
./mvnw flyway:migrate
```

### 2. Start the Application

```bash
./mvnw spring-boot:run
```

### 3. Register Your First Tenant

```bash
curl -X POST http://localhost:8080/api/v1/tenants/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corporation",
    "subdomain": "acme",
    "description": "IT assets for Acme",
    "contactEmail": "admin@acme.com",
    "contactName": "John Doe",
    "subscriptionTier": "FREE",
    "adminUsername": "admin",
    "adminEmail": "admin@acme.com",
    "adminPassword": "SecurePass123!",
    "adminFirstName": "John",
    "adminLastName": "Doe"
  }'
```

### 4. Login and Get JWT Token

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Subdomain: acme" \
  -d '{
    "username": "admin",
    "password": "SecurePass123!"
  }'
```

Save the JWT token from the response.

### 5. Create Your First Asset

```bash
curl -X POST http://localhost:8080/api/v1/assets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-Tenant-Subdomain: acme" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MacBook Pro",
    "assetTag": "LT-001",
    "description": "Developer laptop",
    "brand": "Apple",
    "model": "MacBook Pro 16-inch",
    "status": "AVAILABLE",
    "condition": "EXCELLENT",
    "categoryId": 1
  }'
```

## 🔧 Testing Multi-Tenancy

### Register a Second Tenant

```bash
curl -X POST http://localhost:8080/api/v1/tenants/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TechCorp",
    "subdomain": "techcorp",
    "contactEmail": "admin@techcorp.com",
    "adminUsername": "techcorp-admin",
    "adminEmail": "admin@techcorp.com",
    "adminPassword": "TechPass123!",
    "adminFirstName": "Jane",
    "adminLastName": "Smith"
  }'
```

### Verify Data Isolation

```bash
# Login as techcorp
TOKEN_TECHCORP=$(curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Subdomain: techcorp" \
  -d '{"username":"techcorp-admin","password":"TechPass123!"}' \
  | jq -r '.token')

# Try to access acme's assets (should return empty or 403)
curl -X GET http://localhost:8080/api/v1/assets \
  -H "Authorization: Bearer $TOKEN_TECHCORP" \
  -H "X-Tenant-Subdomain: techcorp"
```

## 📊 Key Features Implemented

✅ **Complete Data Isolation** - Each tenant's data is completely isolated  
✅ **Subdomain Routing** - Access via `tenant.yourdomain.com`  
✅ **Row-Level Security** - Database-level enforcement  
✅ **Subscription Tiers** - FREE, BASIC, PROFESSIONAL, ENTERPRISE  
✅ **JWT Tenant Binding** - Tenant ID embedded in tokens  
✅ **Tenant Registration API** - Self-service signup  
✅ **Performance Caching** - Cached tenant resolution  
✅ **Multi-Layer Security** - Database RLS + Hibernate + JPA

## 📁 Files Created/Modified

### New Files
- `model/Tenant.java` - Tenant entity
- `model/SubscriptionTier.java` - Subscription enum
- `model/TenantAwareEntity.java` - Base class for tenant entities
- `tenant/TenantContext.java` - Thread-local tenant storage
- `tenant/TenantFilter.java` - Subdomain extraction filter
- `tenant/TenantResolver.java` - Cached tenant lookup
- `tenant/TenantInterceptor.java` - Hibernate interceptor
- `tenant/TenantIdentifierResolver.java` - Hibernate resolver
- `repository/TenantRepository.java` - Tenant data access
- `service/TenantService.java` - Tenant business logic
- `controller/TenantController.java` - Tenant REST API
- `dto/TenantRegistrationDTO.java` - Registration payload
- `db/migration/V6__Add_Multi_Tenant_Support.sql` - Schema migration

### Modified Files
- All entity classes (Asset, User, Category, etc.) - Added tenant_id
- `JwtTokenProvider.java` - Added tenant_id to JWT
- `JwtAuthenticationFilter.java` - Extract tenant from JWT
- `SecurityConfig.java` - Integrated tenant filter

## 🎯 Next Steps

1. **Configure DNS** - Set up wildcard DNS for subdomains
2. **Enable HTTPS** - Configure SSL certificates
3. **Add Billing** - Integrate Stripe/PayPal for subscriptions
4. **Frontend Updates** - Update UI to support multi-tenancy
5. **Monitoring** - Add tenant-aware metrics

## 📚 Documentation

- Full Guide: `docs/MULTI_TENANT_GUIDE.md`
- Database Schema: `backend/src/main/resources/db/migration/V6__Add_Multi_Tenant_Support.sql`
- API Reference: Run app and visit `/swagger-ui.html`

## 🆘 Troubleshooting

**Issue**: "Tenant ID must be set before persisting entity"  
**Fix**: Ensure you're passing `X-Tenant-Subdomain` header or using subdomain URL

**Issue**: Can't access tenant data  
**Fix**: Verify JWT token contains correct `tenantId` claim

**Issue**: Subdomain not working locally  
**Fix**: Add entries to `/etc/hosts`:
```
127.0.0.1 acme.localhost
127.0.0.1 techcorp.localhost
```

---

**Ready to deploy?** See full deployment guide in `MULTI_TENANT_GUIDE.md`
