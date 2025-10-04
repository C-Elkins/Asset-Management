# Stripe Integration Setup Guide

This guide will help you set up the complete Stripe integration for subscription management, usage-based billing, and payment processing.

## Prerequisites

1. Stripe account (create at https://stripe.com)
2. Stripe API keys (test and live)
3. Node.js 16+ and npm (for frontend dependencies)
4. Java 21 and Maven (for backend)

## Backend Setup

### 1. Install Dependencies

The Stripe Java SDK has already been added to `pom.xml`. Run Maven install:

```bash
cd backend
./mvnw clean install
```

### 2. Configure Stripe API Keys

Add your Stripe keys to environment variables or `application.yml`:

```yaml
stripe:
  api-key: ${STRIPE_SECRET_KEY:sk_test_your_secret_key}
  publishable-key: ${STRIPE_PUBLISHABLE_KEY:pk_test_your_publishable_key}
  webhook-secret: ${STRIPE_WEBHOOK_SECRET:whsec_your_webhook_secret}
```

**To get your keys:**

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy "Publishable key" (starts with `pk_test_`)
3. Reveal and copy "Secret key" (starts with `sk_test_`)

### 3. Create Products and Prices in Stripe

Go to Stripe Dashboard → Products → Create Product:

**Professional Plan (Monthly)**
- Product name: "Professional Plan"
- Pricing model: Standard pricing
- Price: $49 USD
- Billing period: Monthly
- Copy the Price ID (starts with `price_`)

**Professional Plan (Annual)**
- Same product, add another price
- Price: $490 USD
- Billing period: Yearly

**Enterprise Plan (Monthly)**
- Product name: "Enterprise Plan"
- Price: $199 USD
- Billing period: Monthly

**Enterprise Plan (Annual)**
- Same product, add another price
- Price: $1,990 USD
- Billing period: Yearly

**Metered Assets (Usage-based)**
- Product name: "Additional Assets"
- Pricing model: Usage-based pricing
- Price per unit: $0.50 USD
- Billing period: Monthly
- Usage type: Metered
- Aggregation: Sum

### 4. Update Price IDs in application.yml

```yaml
stripe:
  price-ids:
    professional-monthly: price_xxxxxxxxxxxxx
    professional-annual: price_xxxxxxxxxxxxx
    enterprise-monthly: price_xxxxxxxxxxxxx
    enterprise-annual: price_xxxxxxxxxxxxx
    metered-assets: price_xxxxxxxxxxxxx
```

### 5. Set Up Webhooks

Webhooks are essential for handling payment events:

**For Local Development:**

1. Install Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
# or
curl -s https://stripe.com/cli | bash
```

2. Login to Stripe CLI:
```bash
stripe login
```

3. Forward webhooks to localhost:
```bash
stripe listen --forward-to localhost:8080/api/v1/webhooks/stripe
```

4. Copy the webhook secret (starts with `whsec_`) to your `.env` file

**For Production:**

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://yourdomain.com/api/v1/webhooks/stripe`
4. Select events to listen:
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
5. Copy webhook secret to production environment

### 6. Run Database Migration

The Flyway migration script will create necessary tables:

```bash
cd backend
./mvnw flyway:migrate
```

### 7. Start Backend

```bash
./mvnw spring-boot:run
```

## Frontend Setup

### 1. Install Stripe React Libraries

```bash
cd frontend
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Configure Environment Variables

Create `.env` file in `frontend/`:

```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
REACT_APP_STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxx
REACT_APP_STRIPE_PRO_ANNUAL_PRICE_ID=price_xxxxxxxxxxxxx
REACT_APP_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxx
REACT_APP_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=price_xxxxxxxxxxxxx
```

### 3. Update App.jsx to Include Stripe Provider

```jsx
import { StripeProvider } from './contexts/StripeContext';

function App() {
  return (
    <StripeProvider>
      {/* Your existing routes */}
    </StripeProvider>
  );
}
```

### 4. Add Billing Routes

Add these routes to your React Router configuration:

```jsx
import SubscriptionPlans from './components/billing/SubscriptionPlans';
import BillingPortal from './components/billing/BillingPortal';
import UsageDisplay from './components/billing/UsageDisplay';

// In your router
<Route path="/subscription" element={<SubscriptionPlans />} />
<Route path="/dashboard/billing" element={<BillingPortal />} />
<Route path="/dashboard/usage" element={<UsageDisplay />} />
```

### 5. Start Frontend

```bash
npm start
```

## Testing the Integration

### 1. Test Subscription Creation

1. Navigate to `/subscription`
2. Select a plan (Professional or Enterprise)
3. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
4. Click "Subscribe"
5. Verify subscription is created in:
   - Stripe Dashboard → Customers
   - Your database `subscriptions` table
   - Frontend billing portal

### 2. Test Webhooks

1. With Stripe CLI running:
```bash
stripe listen --forward-to localhost:8080/api/v1/webhooks/stripe
```

2. Trigger test events:
```bash
stripe trigger payment_intent.succeeded
stripe trigger invoice.payment_succeeded
stripe trigger customer.subscription.updated
```

3. Check logs to verify webhook handling

### 3. Test Usage-Based Billing

1. Create assets in your system beyond the plan limit
2. Wait for daily usage reporting job (1 AM) or manually trigger
3. Check `usage_records` table
4. Verify usage appears in Stripe Dashboard → Billing → Usage

### 4. Test Billing Portal

1. Navigate to `/dashboard/billing`
2. Click "Manage Subscription"
3. Verify Stripe Customer Portal opens
4. Test:
   - Updating payment method
   - Changing plans
   - Downloading invoices
   - Canceling subscription

## Test Cards

Stripe provides test cards for different scenarios:

| Card Number | Scenario |
|-------------|----------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 9995 | Declined (insufficient funds) |
| 4000 0000 0000 9987 | Declined (lost card) |
| 4000 0000 0000 0077 | Charge succeeds, dispute lost |
| 4000 0025 0000 3155 | Requires authentication (3D Secure) |

## API Endpoints

### Subscription Management
- `GET /api/v1/subscriptions/current` - Get current subscription
- `POST /api/v1/subscriptions` - Create subscription
- `PUT /api/v1/subscriptions` - Update subscription (change plan)
- `DELETE /api/v1/subscriptions` - Cancel subscription
- `POST /api/v1/subscriptions/resume` - Resume canceled subscription

### Billing Portal
- `GET /api/v1/subscriptions/billing-portal` - Get portal URL

### Invoices
- `GET /api/v1/subscriptions/invoices` - Get invoices (paginated)

### Payment Methods
- `GET /api/v1/subscriptions/payment-methods` - Get payment methods
- `POST /api/v1/subscriptions/payment-methods` - Add payment method

### Usage Tracking
- `GET /api/v1/subscriptions/usage` - Get usage records (paginated)

### Webhooks
- `POST /api/v1/webhooks/stripe` - Stripe webhook endpoint (internal)

## Usage Tracking Configuration

The `UsageTrackingService` automatically:

1. **Daily Usage Reporting** (1 AM)
   - Counts assets per tenant
   - Calculates overage (assets beyond limit)
   - Reports to Stripe for metered billing
   - Saves records to database

2. **Manual Tracking**
```java
@Autowired
private UsageTrackingService usageTrackingService;

// Track current usage
usageTrackingService.trackUsage(tenantId);

// Check if exceeded limits
boolean exceeded = usageTrackingService.hasExceededLimits(tenantId);

// Get remaining assets
int remaining = usageTrackingService.getRemainingAssets(tenantId);
```

## Security Best Practices

1. **Never expose secret keys** - Use environment variables
2. **Verify webhook signatures** - Already implemented in `StripeWebhookController`
3. **Use HTTPS in production** - Required for webhooks and payment forms
4. **Implement CSRF protection** - Already configured in Spring Security
5. **Log security events** - Monitor failed payments and suspicious activity

## Troubleshooting

### Webhook Not Receiving Events

1. Check Stripe CLI is running: `stripe listen`
2. Verify webhook secret matches in application.yml
3. Check firewall allows localhost:8080
4. Review backend logs for errors

### Payment Fails

1. Verify Stripe keys are correct (test vs live)
2. Check customer has valid payment method
3. Review Stripe logs in Dashboard → Developers → Logs
4. Verify webhook events are being processed

### Subscription Not Created

1. Check backend logs for exceptions
2. Verify price IDs match Stripe Dashboard
3. Ensure customer ID is saved in `tenants` table
4. Check database constraints

### Usage Not Reporting

1. Verify scheduled job is running (check logs at 1 AM)
2. Check `usage_records` table for data
3. Ensure subscription has metered item attached
4. Review Stripe Dashboard → Billing → Usage

## Going to Production

1. **Switch to Live Mode**
   - Get live API keys from Stripe Dashboard
   - Update environment variables
   - Update webhook endpoint URL

2. **Configure Production Webhooks**
   - Add production endpoint in Stripe Dashboard
   - Use HTTPS (required by Stripe)
   - Save webhook secret

3. **Enable Scheduling**
   - Ensure `@EnableScheduling` is active
   - Configure cron expressions for your timezone

4. **Monitor & Alerts**
   - Set up Stripe email notifications
   - Monitor webhook delivery in Dashboard
   - Configure alerts for failed payments

5. **Compliance**
   - Review Stripe's compliance requirements
   - Implement SCA (Strong Customer Authentication) for EU
   - Add terms of service and privacy policy links

## Support

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Support**: https://support.stripe.com
- **Test Mode**: Always test in Stripe test mode first
- **Community**: Stripe has active community forums and Discord

## Next Steps

1. Customize subscription plans to match your pricing
2. Add email notifications for payment events
3. Implement proration handling for plan changes
4. Add analytics for subscription metrics
5. Configure tax collection if applicable
6. Set up dunning management for failed payments

---

**Note**: This integration uses Stripe API version 2024-12-18. Review Stripe's API changelog for any updates.
