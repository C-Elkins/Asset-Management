# ✅ Stripe API Keys Configured!

## 🔑 Your Stripe Keys (Test Mode)

### Backend Configuration (application-dev.yml)
✅ **Secret Key**: `sk_test_51SE1M7RnSgrmRk1T...` (configured)
✅ **Publishable Key**: `pk_test_51SE1M7RnSgrmRk1T...` (configured)
⚠️ **Webhook Secret**: Not yet configured (see step 5 below)

### Frontend Configuration (.env.development)
✅ **Publishable Key**: `pk_test_51SE1M7RnSgrmRk1T...` (configured)

## 🚀 Quick Start Guide

### 1. Start the Backend (with Stripe integration)
```bash
cd backend
./mvnw spring-boot:run
```

The application will:
- ✅ Connect to H2 in-memory database
- ✅ Run all Flyway migrations (including V7 - Stripe tables)
- ✅ Initialize Stripe with your API keys
- ✅ Start on http://localhost:8080

### 2. Verify Stripe Configuration
Once the app starts, check the logs for:
```
Stripe API initialized with key: sk_test_51SE1M7...
```

### 3. Access the H2 Database Console
View your Stripe tables:
- URL: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:testdb`
- Username: `sa`
- Password: (leave empty)

Check these new tables:
- `subscriptions`
- `invoices`
- `payment_methods`
- `usage_records`
- `tenants` (now has `stripe_customer_id` column)

### 4. Start the Frontend
```bash
cd ../frontend
npm install  # If you haven't already
npm run dev
```

The frontend will start on http://localhost:5173

### 5. Set Up Stripe Webhooks (Required for production)

#### Using Stripe CLI (Development/Testing)
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to your Stripe account
stripe login

# Forward webhooks to your local backend
stripe listen --forward-to localhost:8080/api/v1/webhooks/stripe
```

This will output a webhook signing secret like:
```
Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

Add this to `application-dev.yml`:
```yaml
stripe:
  webhook-secret: "whsec_xxxxxxxxxxxxx"
```

#### For Production
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. URL: `https://your-domain.com/api/v1/webhooks/stripe`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.trial_will_end`
   - `invoice.created`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `invoice.finalized`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_method.attached`
5. Copy the webhook signing secret
6. Add to your production environment variables

## 📦 Next Steps: Create Products in Stripe

### 1. Go to Stripe Dashboard
https://dashboard.stripe.com/test/products

### 2. Create Professional Plan

**Product Details:**
- Name: `Professional Plan`
- Description: `500 assets, 25 users, priority support, API access`

**Pricing:**
- Click "Add pricing"
- **Monthly Price**: $49.00/month
  - Billing period: Monthly
  - Save and copy the Price ID: `price_xxxxx`
- **Annual Price**: $490.00/year  
  - Billing period: Yearly
  - Save and copy the Price ID: `price_xxxxx`

### 3. Create Enterprise Plan

**Product Details:**
- Name: `Enterprise Plan`
- Description: `Unlimited assets, unlimited users, 24/7 support, dedicated account manager`

**Pricing:**
- **Monthly Price**: $199.00/month
- **Annual Price**: $1,990.00/year

### 4. Create Metered Billing for Overages

**Product Details:**
- Name: `Additional Assets`
- Description: `Per-asset overage billing`

**Pricing:**
- Model: `Graduated pricing` or `Volume pricing`
- Usage is metered
- Billing period: Monthly
- Price: $0.50 per asset

### 5. Update Configuration with Price IDs

After creating products, update `application.yml`:
```yaml
stripe:
  price-ids:
    professional-monthly: "price_xxxxx"  # From Stripe Dashboard
    professional-annual: "price_xxxxx"
    enterprise-monthly: "price_xxxxx"
    enterprise-annual: "price_xxxxx"
    metered-assets: "price_xxxxx"
```

Or set as environment variables:
```bash
export STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxx
export STRIPE_PRO_ANNUAL_PRICE_ID=price_xxxxx
export STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_xxxxx
export STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=price_xxxxx
export STRIPE_METERED_ASSETS_PRICE_ID=price_xxxxx
```

## 🧪 Testing with Test Cards

Stripe provides test card numbers for various scenarios:

### Successful Payment
```
Card: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

### Declined Payment
```
Card: 4000 0000 0000 9995
```

### Requires 3D Secure Authentication
```
Card: 4000 0025 0000 3155
```

### More test cards:
https://stripe.com/docs/testing#cards

## 🔍 Testing the Integration

### 1. Create a Subscription via API

```bash
# Login and get JWT token first
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Use the token to create a subscription
curl -X POST http://localhost:8080/api/v1/subscriptions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "priceId": "price_xxxxx",
    "paymentMethodId": "pm_card_visa"
  }'
```

### 2. Check Subscription Status

```bash
curl -X GET http://localhost:8080/api/v1/subscriptions/current \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. View Billing Portal

The billing portal URL can be accessed via:
```bash
curl -X GET "http://localhost:8080/api/v1/subscriptions/billing-portal?returnUrl=http://localhost:3000/dashboard" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Test Usage Tracking

The scheduled job runs daily at 1 AM, but you can trigger it manually:
```bash
# Check current usage
curl -X GET http://localhost:8080/api/v1/subscriptions/usage \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📊 Monitoring

### View Application Logs
```bash
tail -f backend/logs/application.json
```

### Check Stripe Events
https://dashboard.stripe.com/test/events

### View Webhooks Status
https://dashboard.stripe.com/test/webhooks

## ⚠️ Important Security Notes

### ✅ Safe to Commit (Public):
- Frontend: `VITE_STRIPE_PUBLISHABLE_KEY` (starts with `pk_test_`)
- This key is meant to be public and used in client-side code

### ❌ NEVER Commit (Keep Private):
- Backend: `STRIPE_SECRET_KEY` (starts with `sk_test_`)
- Backend: `STRIPE_WEBHOOK_SECRET` (starts with `whsec_`)
- Use environment variables or `.env` files (add to `.gitignore`)

### Current Setup:
- ✅ Secret key in `application-dev.yml` (NOT in git yet - good!)
- ✅ Publishable key in `.env.development` (safe to commit)
- ⚠️ Make sure `application-dev.yml` is in `.gitignore` before committing

## 📚 API Endpoints Available

### Subscription Management
- `GET /api/v1/subscriptions/current` - Get current subscription
- `POST /api/v1/subscriptions` - Create subscription
- `PUT /api/v1/subscriptions` - Update/change plan
- `DELETE /api/v1/subscriptions` - Cancel subscription
- `POST /api/v1/subscriptions/resume` - Resume canceled subscription

### Billing Portal
- `GET /api/v1/subscriptions/billing-portal` - Get Stripe portal URL

### Payment Methods
- `GET /api/v1/subscriptions/payment-methods` - List payment methods
- `POST /api/v1/subscriptions/payment-methods` - Add payment method

### Invoices
- `GET /api/v1/subscriptions/invoices` - List invoices

### Usage Tracking
- `GET /api/v1/subscriptions/usage` - Get usage records

### Webhooks (Internal)
- `POST /api/v1/webhooks/stripe` - Stripe webhook endpoint

## 🎯 What's Next?

1. ✅ **Stripe keys configured** (Done!)
2. 🔧 **Create products in Stripe Dashboard** (Next step)
3. 🔗 **Set up webhooks** (Required for production)
4. 🧪 **Test subscription flow** (After products created)
5. 🎨 **Integrate frontend components** (Use React components created)
6. 🚀 **Deploy to production** (Follow production checklist)

## 📖 Documentation

- **Setup Guide**: `docs/STRIPE_INTEGRATION_GUIDE.md`
- **Migration Guide**: `docs/FLYWAY_MIGRATION_SETUP.md`
- **Integration Summary**: `docs/STRIPE_INTEGRATION_SUMMARY.md`
- **API Documentation**: http://localhost:8080/swagger-ui.html (when app is running)

---

**Status**: 🟢 Stripe API Keys Configured - Ready to Create Products!  
**Last Updated**: October 3, 2025
