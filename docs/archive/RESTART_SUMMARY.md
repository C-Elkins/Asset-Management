# System Restart Summary

## Date: 2025-10-03

### Services Restarted Successfully ✅

#### Backend (Spring Boot)
- **Status**: ✅ Running
- **URL**: http://localhost:8080
- **API Base**: http://localhost:8080/api/v1
- **H2 Console**: http://localhost:8080/api/v1/h2-console (username: sa, password: blank)
- **Swagger UI**: http://localhost:8080/swagger-ui.html

**Stripe Configuration**:
- API Key: Configured (sk_test_51SE1M7RnSgrmRk1T...)
- Publishable Key: Configured (pk_test_51SE1M7RnSgrmRk1T...)
- Webhook Secret: Placeholder (needs setup after webhook configuration)
- Price IDs: Placeholder (update after creating products in Stripe)

**Subscription Endpoints Available**:
- `POST /api/v1/subscriptions/create` - Create new subscription
- `POST /api/v1/subscriptions/update` - Update subscription
- `POST /api/v1/subscriptions/cancel` - Cancel subscription
- `POST /api/v1/subscriptions/resume` - Resume subscription
- `POST /api/v1/subscriptions/payment-methods` - Add payment method
- `POST /api/v1/subscriptions/billing-portal` - Get billing portal URL
- `GET /api/v1/subscriptions` - List all subscriptions
- `GET /api/v1/subscriptions/{id}` - Get subscription details
- `GET /api/v1/subscriptions/usage` - Get usage records
- `POST /api/v1/webhooks/stripe` - Stripe webhook endpoint

#### Frontend (React + Vite)
- **Status**: ✅ Running
- **URL**: http://localhost:3005
- **Network**: http://192.168.1.70:3005
- **Stripe Publishable Key**: Configured in .env.development

### Changes Made During Restart

#### Configuration Fixes

1. **Disabled Flyway for Development**:
   - File: `backend/src/main/resources/application-dev.yml`
   - Changed: `flyway.enabled: false` (H2 doesn't support PostgreSQL extensions)
   - Changed: `hibernate.ddl-auto: update` (use Hibernate for H2 schema management)
   - Note: Flyway migrations will be used in production with PostgreSQL

2. **Added Stripe Configuration**:
   - File: `backend/src/main/resources/application-dev.yml`
   - Added: `stripe.price-ids` with placeholder values
   - Added: `stripe.plans` with subscription limits
   - Format: YAML map notation for Spring configuration

3. **Fixed Migration Script**:
   - File: `backend/src/main/resources/db/migration/V1__Initial_Schema.sql`
   - Commented out: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"` (PostgreSQL-specific)

### Current State

**Database (H2)**:
- Running in-memory mode
- Schema auto-created by Hibernate
- Sample data loaded on startup
- Stripe tables: Will be created when needed by Hibernate

**Known Warnings (Non-Critical)**:
1. Tenant context warnings during startup (expected during initialization)
2. OAuth2 placeholder warnings (Google/Microsoft - not needed for basic functionality)
3. JPA open-in-view warning (expected for REST APIs)

### Next Steps

#### 1. Create Stripe Products (Required for Testing)
Go to https://dashboard.stripe.com/test/products and create:

**Professional Plan**:
- Monthly: $49/month (get price ID)
- Yearly: $490/year (get price ID)
- Limits: 500 assets, 25 users

**Enterprise Plan**:
- Monthly: $199/month (get price ID)
- Yearly: $1,990/year (get price ID)
- Limits: Unlimited

**Metered Billing**:
- Per-asset overage: $0.50 (get price ID)

After creating, update `application-dev.yml` with actual price IDs:
```yaml
stripe:
  price-ids: |
    {
      'professional-monthly': 'price_ACTUAL_ID_HERE',
      'professional-yearly': 'price_ACTUAL_ID_HERE',
      'enterprise-monthly': 'price_ACTUAL_ID_HERE',
      'enterprise-yearly': 'price_ACTUAL_ID_HERE',
      'metered-asset': 'price_ACTUAL_ID_HERE'
    }
```

#### 2. Set Up Stripe Webhooks
1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:8080/api/v1/webhooks/stripe`
4. Copy webhook secret from output
5. Update `application-dev.yml`:
   ```yaml
   stripe:
     webhook-secret: "whsec_ACTUAL_SECRET_HERE"
   ```

#### 3. Test Subscription Flow
Use Stripe test cards:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Auth**: 4000 0025 0000 3155

Test API endpoints:
```bash
# Create subscription
curl -X POST http://localhost:8080/api/v1/subscriptions/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "priceId": "price_ACTUAL_ID",
    "paymentMethodId": "pm_card_visa"
  }'
```

#### 4. Frontend Integration
The React Stripe components are ready:
- `frontend/src/components/stripe/SubscriptionPlans.jsx` - Pricing page
- `frontend/src/components/stripe/BillingPortal.jsx` - Billing dashboard
- `frontend/src/components/stripe/UsageDisplay.jsx` - Usage tracking

Import and use in your React app:
```jsx
import { StripeProvider } from './components/stripe/StripeContext';
import SubscriptionPlans from './components/stripe/SubscriptionPlans';

function App() {
  return (
    <StripeProvider>
      <SubscriptionPlans />
    </StripeProvider>
  );
}
```

### Troubleshooting

**If Backend Fails to Start**:
1. Check if port 8080 is in use: `lsof -i :8080`
2. Check logs: `tail -f backend/backend.log`
3. Verify Java version: `java -version` (should be 17 or 21)

**If Frontend Fails to Start**:
1. Check if port 3005 is in use: `lsof -i :3005`
2. Clear node_modules: `rm -rf node_modules && npm install`
3. Check Node version: `node -v` (should be 18+)

**Database Issues**:
1. Access H2 Console: http://localhost:8080/api/v1/h2-console
2. JDBC URL: `jdbc:h2:mem:testdb`
3. Username: `sa`
4. Password: (leave blank)

### Quick Restart Commands

**Stop All Services**:
```bash
pkill -f "spring-boot:run"
pkill -f "vite"
```

**Start Backend**:
```bash
cd backend && ./mvnw spring-boot:run
```

**Start Frontend**:
```bash
cd frontend && npm run dev
```

### Production Deployment Notes

For production deployment with PostgreSQL:

1. **Enable Flyway**:
   ```yaml
   spring:
     flyway:
       enabled: true
       baseline-on-migrate: true
   ```

2. **Uncomment PostgreSQL Commands**:
   - In `V1__Initial_Schema.sql`: Uncomment `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

3. **Update Database URL**:
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/assetmanagement
       driver-class-name: org.postgresql.Driver
   ```

4. **Use Environment Variables**:
   - Never commit real API keys to Git
   - Use `.env` files or secret management
   - Set: `STRIPE_API_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
