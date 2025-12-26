# 💰 Krubles Pricing Structure

## Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         KRUBLES PRICING TIERS                           │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   FREE       │    │ PROFESSIONAL │    │  ENTERPRISE  │
│              │    │  ⭐ POPULAR  │    │              │
│   $0         │    │   $49/mo     │    │   $199/mo    │
│   forever    │    │   $490/yr    │    │   $1,990/yr  │
│              │    │  (save $98)  │    │  (save $398) │
│              │    │              │    │              │
│ 50 assets    │    │ 500 assets   │    │ ∞ assets     │
│ 3 users      │    │ 25 users     │    │ ∞ users      │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## Detailed Comparison

| Feature                    | Free          | Professional     | Enterprise          |
|---------------------------|---------------|------------------|---------------------|
| **Monthly Price**         | $0            | **$49**          | **$199**            |
| **Annual Price**          | $0            | **$490** (-17%)  | **$1,990** (-17%)   |
| **Assets**                | 50 max        | 500 max          | Unlimited           |
| **Users**                 | 3 max         | 25 max           | Unlimited           |
| **Reporting**             | Basic         | Advanced         | Advanced Analytics  |
| **Support**               | Email         | Priority Email   | 24/7 Phone & Email  |
| **Data Retention**        | 30 days       | 1 year           | Unlimited           |
| **Custom Fields**         | ❌            | ✅               | ✅                  |
| **API Access**            | ❌            | ✅               | ✅                  |
| **Custom Integrations**   | ❌            | ❌               | ✅                  |
| **SOC 2 Audit Support**   | ❌            | ❌               | ✅                  |
| **Dedicated Manager**     | ❌            | ❌               | ✅                  |

---

## Usage-Based Billing (Overages)

### For Professional Plan Only

When you exceed 500 assets on the Professional plan:

```
Example 1: Using 550 assets
├─ Base: 500 assets (included in $49/mo)
└─ Overage: 50 assets × $0.50 = $25.00
   TOTAL: $49.00 + $25.00 = $74.00/month

Example 2: Using 800 assets
├─ Base: 500 assets (included in $49/mo)
└─ Overage: 300 assets × $0.50 = $150.00
   TOTAL: $49.00 + $150.00 = $199.00/month
   
   💡 Tip: At this usage, Enterprise ($199/mo) is better value!
```

**Enterprise Plan**: No overages - unlimited assets included

---

## Pricing Strategy Highlights

### Annual Savings

```
Professional:
  Monthly:  $49 × 12 = $588/year
  Annual:   $490/year
  SAVINGS:  $98/year (16.7% discount)

Enterprise:
  Monthly:  $199 × 12 = $2,388/year
  Annual:   $1,990/year
  SAVINGS:  $398/year (16.7% discount)
```

### Target Customers

**Free**: 
- Small teams testing the platform
- Personal projects
- Up to 3 people managing basic assets

**Professional** (Most Popular):
- Growing businesses
- 10-25 person teams
- Need advanced reporting and API access
- Managing 100-500 assets

**Enterprise**:
- Large organizations
- 25+ users
- Complex integration needs
- High asset volume (500+)
- Compliance requirements (SOC 2)

---

## Stripe Product Configuration

### Products to Create in Stripe Dashboard

#### 1. Professional Plan
- **Product Name**: `Professional Plan`
- **Description**: `500 assets, 25 users, priority support, API access`
- **Prices**:
  - Monthly: $49.00/month → Copy Price ID
  - Annual: $490.00/year → Copy Price ID

#### 2. Enterprise Plan
- **Product Name**: `Enterprise Plan`
- **Description**: `Unlimited assets, unlimited users, 24/7 support`
- **Prices**:
  - Monthly: $199.00/month → Copy Price ID
  - Annual: $1,990.00/year → Copy Price ID

#### 3. Additional Assets (Metered)
- **Product Name**: `Additional Assets`
- **Description**: `Per-asset overage for Professional plan`
- **Price**: $0.50 per asset (usage-based, monthly) → Copy Price ID

---

## Configuration Mapping

### Backend (`application-dev.yml`)

```yaml
stripe:
  price-ids: |
    {
      'professional-monthly': 'price_FROM_STRIPE_DASHBOARD',
      'professional-yearly': 'price_FROM_STRIPE_DASHBOARD',
      'enterprise-monthly': 'price_FROM_STRIPE_DASHBOARD',
      'enterprise-yearly': 'price_FROM_STRIPE_DASHBOARD',
      'metered-asset': 'price_FROM_STRIPE_DASHBOARD'
    }
  
  plans: |
    {
      'Free': { 'asset-limit': 50, 'user-limit': 3 },
      'Professional': { 'asset-limit': 500, 'user-limit': 25 },
      'Enterprise': { 'asset-limit': -1, 'user-limit': -1 }
    }
```

### Frontend (`.env.development`)

```bash
REACT_APP_STRIPE_PRO_MONTHLY_PRICE_ID=price_FROM_STRIPE
REACT_APP_STRIPE_PRO_ANNUAL_PRICE_ID=price_FROM_STRIPE
REACT_APP_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_FROM_STRIPE
REACT_APP_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=price_FROM_STRIPE
```

---

## Customer Journey

### Free → Professional Upgrade
```
Trigger Points:
├─ Approaching 50 assets (90% = 45 assets)
├─ Need more than 3 users
├─ Want API access
├─ Need longer data retention
└─ Require custom fields

Upgrade Process:
1. User clicks "Upgrade" in dashboard
2. Selects Professional plan
3. Enters payment method (Stripe)
4. Immediate access to 500 assets, 25 users
```

### Professional → Enterprise Upgrade
```
Trigger Points:
├─ Exceeding 500 assets regularly
├─ Overage costs approaching $150/mo
├─ Need 24/7 phone support
├─ Require SOC 2 compliance
├─ Want dedicated account manager
└─ Need custom integrations

Upgrade Process:
1. User clicks "Upgrade to Enterprise"
2. Pro-rated credit for remaining Professional billing
3. Immediate unlimited access
4. Account manager assigned within 24 hours
```

---

## Billing Cycle Examples

### Professional Monthly ($49/mo)

```
January 1:  Subscription starts
            Charge: $49.00
            
February 1: Renewal
            Charge: $49.00
            (+ overages if > 500 assets)
            
March 1:    Renewal
            Charge: $49.00
```

### Professional Annual ($490/yr)

```
January 1:  Subscription starts
            Charge: $490.00
            
January 1   (Next Year):
            Renewal
            Charge: $490.00
```

### Enterprise with Overages (shouldn't happen - unlimited)

```
Enterprise plan has NO overages
All usage included in flat $199/mo or $1,990/yr
```

---

## Competitive Positioning

```
Industry Standard for Asset Management:

Low End:    $30-50/month  (basic features)
Mid Range:  $50-150/month (our Professional tier)
High End:   $200-500/month (enterprise features)

Krubles Positioning:
✅ Competitive Professional pricing ($49)
✅ Strong value Enterprise tier ($199)
✅ Fair usage-based billing ($0.50/asset)
✅ Meaningful annual discounts (17%)
```

---

## Revenue Projections

### Example Customer Mix

```
100 Total Customers:
├─ 60 Free (0%)        = $0/month
├─ 30 Professional     = 30 × $49 = $1,470/month
└─ 10 Enterprise       = 10 × $199 = $1,990/month
    
TOTAL MRR: $3,460/month
TOTAL ARR: $41,520/year

With 20% annual conversions:
├─ 24 Professional Annual = 24 × $490 = $11,760
└─ 8 Enterprise Annual = 8 × $1,990 = $15,920
    
Annual Revenue: $27,680 (from annual plans)
Monthly Revenue: $14,640 (from 16 monthly plans × 12)
TOTAL: $42,320/year
```

---

## Testing Checklist

- [ ] Free plan displays $0 correctly
- [ ] Professional shows $49/mo and $490/yr
- [ ] Enterprise shows $199/mo and $1,990/yr
- [ ] Annual toggle shows 17% savings
- [ ] Payment form accepts test card (4242...)
- [ ] Subscription creates in Stripe
- [ ] Usage displays correctly in dashboard
- [ ] Overage billing works (Professional > 500 assets)
- [ ] Upgrade flow works (Free → Pro → Enterprise)
- [ ] Billing portal accessible
- [ ] Invoices display correctly

---

**Ready to implement? Follow the STRIPE_SETUP_CHECKLIST.md guide!**
