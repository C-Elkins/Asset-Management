# Flyway Migration Setup - Quick Guide

## ✅ Issue Resolved

The Flyway migration error was caused by two issues:

### 1. **Duplicate Migration Version**
- **Problem**: Two `V6__` migration files existed
  - `V6__Add_Multi_Tenant_Support.sql` (existing)
  - `V6__create_stripe_tables.sql` (new)
- **Solution**: Renamed Stripe migration to `V7__create_stripe_tables.sql`

### 2. **Flyway Disabled in Dev Mode**
- **Problem**: `application-dev.yml` had `flyway.enabled: false`
- **Solution**: Changed to `flyway.enabled: true` with `baseline-on-migrate: true`

## 📋 Current Migration Order

```
V1__Initial_Schema.sql
V2__Sample_Data.sql
V3__Add_Api_Keys.sql
V4__Add_OAuth2_Support.sql
V5__Add_Scheduled_Reports.sql
V6__Add_Multi_Tenant_Support.sql
V7__create_stripe_tables.sql  ← Stripe integration
```

## 🚀 How to Run Migrations

### Option 1: Automatic (Recommended)
Migrations run automatically when you start Spring Boot:

```bash
./mvnw spring-boot:run
```

Spring Boot will:
1. Connect to the database (H2 in-memory by default in dev mode)
2. Run Flyway migrations automatically
3. Start the application

### Option 2: Standalone Flyway Command (Optional)
To run Flyway migrations without starting the app, you need database credentials.

For **H2 in-memory** (dev mode):
```bash
# Not practical - H2 memory DB requires app to be running
```

For **PostgreSQL** (production):
```bash
./mvnw flyway:migrate \
  -Dflyway.url=jdbc:postgresql://localhost:5432/asset_management \
  -Dflyway.user=postgres \
  -Dflyway.password=your_password
```

## 🗄️ What V7 Migration Creates

The Stripe migration (`V7__create_stripe_tables.sql`) creates:

### 1. **Tenants Table Update**
- Adds `stripe_customer_id` column (VARCHAR(255), UNIQUE)

### 2. **Subscriptions Table**
- Stores subscription details
- Links to tenants via `tenant_id`
- Tracks plan, status, billing cycle, trial periods
- **17 columns, 4 indexes**

### 3. **Invoices Table**
- Stores invoice history
- Links invoices to subscriptions
- Tracks amounts, status, PDF URLs
- **16 columns, 6 indexes**

### 4. **Payment Methods Table**
- Stores customer payment methods
- Card details (brand, last4, expiry)
- Default payment method flag
- **12 columns, 4 indexes**

### 5. **Usage Records Table**
- Tracks asset usage for metered billing
- Records overage counts
- Syncs with Stripe for billing
- **9 columns, 4 indexes**

## 🔍 Verify Migrations

After starting the app, check migration status:

```bash
# Check which migrations have been applied
./mvnw flyway:info
```

Or view in H2 Console (when app is running):
- URL: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:testdb`
- Username: `sa`
- Password: (empty)

Query to check:
```sql
SELECT * FROM flyway_schema_history ORDER BY installed_rank;
```

## 🐘 Using PostgreSQL Instead of H2

If you want to use PostgreSQL for development:

1. **Start PostgreSQL** (via Docker):
   ```bash
   docker run --name asset-mgmt-db \
     -e POSTGRES_DB=asset_management \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres \
     -p 5432:5432 \
     -d postgres:16-alpine
   ```

2. **Update `application-dev.yml`**:
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/asset_management
       driver-class-name: org.postgresql.Driver
       username: postgres
       password: postgres
   ```

3. **Run the app**:
   ```bash
   ./mvnw spring-boot:run
   ```

## 📝 Configuration Files Changed

### `application-dev.yml`
```yaml
# BEFORE:
flyway:
  enabled: false

# AFTER:
flyway:
  enabled: true
  baseline-on-migrate: true
```

### Migration File Renamed
```bash
# BEFORE:
V6__create_stripe_tables.sql  ← Conflict with existing V6

# AFTER:
V7__create_stripe_tables.sql  ← Proper sequence
```

## ⚡ Quick Start Command

Run this single command to start everything:

```bash
cd backend && ./mvnw spring-boot:run
```

That's it! Flyway will:
- ✅ Create the H2 in-memory database
- ✅ Run all 7 migrations in order
- ✅ Create all tables including Stripe tables
- ✅ Start the Spring Boot application

## 🎯 Next Steps

1. ✅ Migrations are ready
2. 🔧 Configure Stripe API keys (see `docs/STRIPE_INTEGRATION_GUIDE.md`)
3. 🏗️ Create products in Stripe Dashboard
4. 🧪 Test with test cards

## 📚 Related Documentation

- **Full Setup Guide**: `docs/STRIPE_INTEGRATION_GUIDE.md`
- **Integration Summary**: `docs/STRIPE_INTEGRATION_SUMMARY.md`
- **Verification Script**: `backend/test-stripe-setup.sh`

---

**Status**: ✅ Ready to run  
**Last Updated**: October 3, 2025
