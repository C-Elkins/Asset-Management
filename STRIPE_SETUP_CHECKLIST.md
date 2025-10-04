# 🎯 Stripe Setup Checklist

## ✅ All Servers Stopped

All backend and frontend processes have been stopped. You can now do a clean restart.

---

## 📋 Your Current Pricing Structure

Based on your code, here's what needs to be configured in Stripe:

### 💎 **Free Plan**
- **Price**: $0 (no Stripe product needed)
- **Features**:
  - 50 assets max
  - 3 users max
  - Basic reporting
  - Email support
  - 30-day data retention

### 🚀 **Professional Plan** (Most Popular)
- **Monthly**: $49/month
- **Annual**: $490/year (saves $98 = 17% discount)
- **Features**:
  - 500 assets max
  - 25 users max
  - Advanced reporting
  - Priority email support
  - Custom fields
  - API access
  - 1-year data retention

### 🏢 **Enterprise Plan**
- **Monthly**: $199/month
- **Annual**: $1,990/year (saves $398 = 17% discount)
- **Features**:
  - Unlimited assets
  - Unlimited users
  - Advanced analytics
  - 24/7 phone & email support
  - Custom integrations
  - SOC 2 audit support
  - Dedicated account manager
  - Unlimited data retention

### 📊 **Metered Billing** (Asset Overages)
- **Price**: $0.50 per asset over plan limit
- **Applies to**: Professional plan only (Enterprise is unlimited)
- **Billing**: Monthly, based on actual usage

---

## 🛠️ Step-by-Step Stripe Configuration

### Step 1: Create Products in Stripe Dashboard

Go to: https://dashboard.stripe.com/test/products

#### Product 1: Professional Plan

1. Click "Add product"
2. **Product information**:
   - Name: `Professional Plan`
   - Description: `500 assets, 25 users, priority support, API access`
   - Image: (optional) Upload logo
3. **Pricing information**:
   - Click "Add price"
   
   **Price 1 - Monthly:**
   - Price model: `Standard pricing`
   - Price: `49.00 USD`
   - Billing period: `Monthly`
   - Click "Add price"
   - ✏️ **Copy this Price ID** → `price_xxxxxxxxxxxxxxxx`
   
   **Price 2 - Annual:**
   - Click "Add another price"
   - Price model: `Standard pricing`
   - Price: `490.00 USD`
   - Billing period: `Yearly`
   - Click "Add price"
   - ✏️ **Copy this Price ID** → `price_xxxxxxxxxxxxxxxx`

#### Product 2: Enterprise Plan

1. Click "Add product"
2. **Product information**:
   - Name: `Enterprise Plan`
   - Description: `Unlimited assets, unlimited users, 24/7 support, dedicated account manager`
3. **Pricing information**:
   
   **Price 1 - Monthly:**
   - Price model: `Standard pricing`
   - Price: `199.00 USD`
   - Billing period: `Monthly`
   - Click "Add price"
   - ✏️ **Copy this Price ID** → `price_xxxxxxxxxxxxxxxx`
   
   **Price 2 - Annual:**
   - Click "Add another price"
   - Price model: `Standard pricing`
   - Price: `1990.00 USD`
   - Billing period: `Yearly`
   - Click "Add price"
   - ✏️ **Copy this Price ID** → `price_xxxxxxxxxxxxxxxx`

#### Product 3: Asset Overage (Metered Billing)

1. Click "Add product"
2. **Product information**:
   - Name: `Additional Assets`
   - Description: `Per-asset overage billing for Professional plan`
3. **Pricing information**:
   - Price model: `Usage-based pricing`
   - Price: `0.50 USD`
   - Unit label: `asset` (singular)
   - Billing period: `Monthly`
   - Usage type: `Metered` ✅
   - Aggregation: `Sum`
   - Click "Add price"
   - ✏️ **Copy this Price ID** → `price_xxxxxxxxxxxxxxxx`

---

### Step 2: Update Backend Configuration

Once you have all 5 Price IDs from Stripe, update this file:

**File**: `backend/src/main/resources/application-dev.yml`

Replace the placeholder section with your actual Price IDs:

```yaml
stripe:
  api-key: "sk_test_51SE1M7RnSgrmRk1TxkwctZ6e5Xpun0pkOA8TdvUeKiqT1aTNwKwbwQWQMq6o11nzo8xTS8FhODhSLCJnkUXWXt6J00L2AjI7bm"
  publishable-key: "pk_test_51SE1M7RnSgrmRk1TXlB3HyFWd0jPCj0ffgk4nLZlKhguHybdx7QblMdxZ4ve8Qn1gNt7eiMfbDn6eOK3zrKgnNJC00BXa2ya6q"
  webhook-secret: "${STRIPE_WEBHOOK_SECRET:whsec_test_webhook_secret_here}"
  
  # ⬇️ UPDATE THESE WITH YOUR ACTUAL STRIPE PRICE IDs ⬇️
  price-ids: |
    {
      'professional-monthly': 'price_XXXXX_FROM_STRIPE',
      'professional-yearly': 'price_XXXXX_FROM_STRIPE',
      'enterprise-monthly': 'price_XXXXX_FROM_STRIPE',
      'enterprise-yearly': 'price_XXXXX_FROM_STRIPE',
      'metered-asset': 'price_XXXXX_FROM_STRIPE'
    }
  
  # These are correct - no changes needed
  plans: |
    {
      'Free': { 'asset-limit': 50, 'user-limit': 3 },
      'Professional': { 'asset-limit': 500, 'user-limit': 25 },
      'Enterprise': { 'asset-limit': -1, 'user-limit': -1 }
    }
```

---

### Step 3: Update Frontend Environment Variables

**File**: `frontend/.env.development`

Add these lines (or update if they exist):

```bash
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SE1M7RnSgrmRk1TXlB3HyFWd0jPCj0ffgk4nLZlKhguHybdx7QblMdxZ4ve8Qn1gNt7eiMfbDn6eOK3zrKgnNJC00BXa2ya6q

# Update these with your actual Stripe Price IDs
REACT_APP_STRIPE_PRO_MONTHLY_PRICE_ID=price_XXXXX_FROM_STRIPE
REACT_APP_STRIPE_PRO_ANNUAL_PRICE_ID=price_XXXXX_FROM_STRIPE
REACT_APP_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_XXXXX_FROM_STRIPE
REACT_APP_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=price_XXXXX_FROM_STRIPE
```

---

### Step 4: Set Up Webhooks (Optional but Recommended)

Webhooks allow Stripe to notify your app about payment events.

#### Option A: Using Stripe CLI (for local development)

1. Install Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:8080/api/v1/webhooks/stripe
   ```

4. Copy the webhook signing secret (starts with `whsec_`)

5. Update `application-dev.yml`:
   ```yaml
   stripe:
     webhook-secret: "whsec_ACTUAL_SECRET_FROM_CLI"
   ```

#### Option B: Using Stripe Dashboard (for deployed apps)

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://yourdomain.com/api/v1/webhooks/stripe`
4. Select events to listen to:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `payment_method.attached`
5. Copy the webhook signing secret
6. Add to your environment variables

---

## 🚀 Quick Start Commands

### Start Backend:
```bash
cd it-asset-management/backend
./mvnw spring-boot:run
```

### Start Frontend:
```bash
cd it-asset-management/frontend
npm run dev
```

### Expected Output:

**Backend**:
- ✅ Server: http://localhost:8080
- ✅ API: http://localhost:8080/api/v1
- ✅ H2 Console: http://localhost:8080/api/v1/h2-console
- ✅ Swagger: http://localhost:8080/swagger-ui.html

**Frontend**:
- ✅ Server: http://localhost:3005 (or 5173 depending on vite config)

---

## 🧪 Testing Your Stripe Integration

### Test Cards (Stripe provides these for testing):

| Card Number         | Scenario                  |
|---------------------|---------------------------|
| 4242 4242 4242 4242 | Successful payment        |
| 4000 0000 0000 0002 | Card declined             |
| 4000 0025 0000 3155 | Requires authentication   |

- **Expiry**: Any future date (e.g., 12/34)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

### Test Flow:

1. **Access Subscription Page**:
   - Navigate to: http://localhost:3005/subscription
   
2. **Select Professional Monthly Plan**:
   - Click "Subscribe" button
   - Should show payment form

3. **Enter Test Card**:
   - Card: 4242 4242 4242 4242
   - Expiry: 12/34
   - CVC: 123
   - ZIP: 12345
   
4. **Submit Payment**:
   - Should create subscription
   - Check Stripe Dashboard → Customers
   - Verify subscription appears

5. **Test Billing Portal**:
   - Navigate to: http://localhost:3005/dashboard/billing
   - Should show current subscription
   - Test "Manage Subscription" button
   - Opens Stripe Customer Portal

---

## 📝 Configuration File Locations

Here's where all the configuration files are:

```
it-asset-management/
├── backend/
│   └── src/main/resources/
│       ├── application-dev.yml       ← Update Stripe price IDs here
│       └── application-prod.yml      ← For production (use env vars)
│
├── frontend/
│   ├── .env.development              ← Update frontend Stripe config
│   ├── .env.production               ← For production deployment
│   └── src/components/billing/
│       ├── SubscriptionPlans.jsx     ← Pricing display
│       ├── BillingPortal.jsx         ← Subscription management
│       └── UsageDisplay.jsx          ← Usage tracking
│
└── docs/
    ├── STRIPE_INTEGRATION_GUIDE.md   ← Detailed integration docs
    ├── STRIPE_KEYS_CONFIGURED.md     ← Initial setup guide
    └── RESTART_SUMMARY.md            ← System status
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Backend is offline" on login page

**Cause**: Backend server not running or wrong port

**Solution**:
```bash
# Check if backend is running
lsof -i :8080

# If nothing, start backend
cd backend && ./mvnw spring-boot:run
```

### Issue 2: Stripe configuration errors

**Cause**: Missing or invalid Price IDs

**Solution**:
- Verify Price IDs are copied correctly from Stripe Dashboard
- Check no extra spaces or quotes
- Format must be: `'key': 'price_xxxxx'`

### Issue 3: Frontend can't connect to backend

**Cause**: CORS or incorrect API URL

**Solution**:
Check `application-dev.yml` has correct CORS settings:
```yaml
cors:
  allowed-origins: 
    - "http://localhost:3000"
    - "http://localhost:3005"
    - "http://localhost:5173"
```

### Issue 4: Payments failing in test mode

**Cause**: Using real card instead of test card

**Solution**:
- Only use Stripe test cards in test mode
- Card: 4242 4242 4242 4242
- Never use real card numbers in test mode

---

## 📞 Support Resources

- **Stripe Dashboard**: https://dashboard.stripe.com/test
- **Stripe API Docs**: https://stripe.com/docs/api
- **Stripe Test Cards**: https://stripe.com/docs/testing
- **Stripe Webhooks**: https://stripe.com/docs/webhooks

---

## ✅ Post-Setup Verification Checklist

After configuring everything, verify:

- [ ] Backend starts without errors
- [ ] Frontend connects to backend
- [ ] Subscription page displays all 3 plans
- [ ] Professional plan shows $49/mo and $490/yr
- [ ] Enterprise plan shows $199/mo and $1,990/yr
- [ ] Free plan shows $0
- [ ] Payment form appears when selecting paid plan
- [ ] Test payment succeeds with 4242 4242 4242 4242
- [ ] Subscription appears in Stripe Dashboard
- [ ] Billing portal accessible from dashboard
- [ ] Webhooks receiving events (if configured)

---

## 🎉 Ready to Deploy?

Once everything works locally:

1. **Update Production Config**:
   - Use live Stripe keys (starts with `sk_live_` and `pk_live_`)
   - Set up real webhook endpoints
   - Use environment variables for sensitive data

2. **Create Production Products**:
   - Repeat the product creation in live mode
   - Get new live Price IDs

3. **Test in Production**:
   - Use real payment methods
   - Verify webhook delivery
   - Monitor Stripe Dashboard logs

---

**Good luck! 🚀 When you're ready to start, just run the backend and frontend servers and follow this guide.**
