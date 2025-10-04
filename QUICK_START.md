# 🚀 Quick Restart Guide

## Current Status: ✅ All Servers Stopped

---

## Step 1: Restart Backend

```bash
cd /Users/chaseelkins/Documents/Asset\ Management\ System/it-asset-management/backend
./mvnw spring-boot:run
```

**Wait for**: "Started AssetManagementApplication"

**Check at**: http://localhost:8080/api/v1

---

## Step 2: Restart Frontend

```bash
cd /Users/chaseelkins/Documents/Asset\ Management\ System/it-asset-management/frontend
npm run dev
```

**Check at**: http://localhost:3005 (or http://localhost:5173)

---

## Step 3: Verify Connection

Open: http://localhost:3005/login

If you still see "Backend offline":
1. Check backend logs for errors
2. Verify backend is running: `lsof -i :8080`
3. Check CORS settings in `application-dev.yml`

---

## Next: Stripe Pricing Setup

📄 **See full guide**: `STRIPE_SETUP_CHECKLIST.md`

### Quick Summary:

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/test/products

2. **Create 2 products with these exact prices**:
   - **Professional**: $49/mo and $490/yr
   - **Enterprise**: $199/mo and $1,990/yr
   - **Metered Assets**: $0.50 per asset

3. **Copy the 5 Price IDs** from Stripe

4. **Update config file**: `backend/src/main/resources/application-dev.yml`
   
   Replace this section:
   ```yaml
   price-ids: |
     {
       'professional-monthly': 'price_YOUR_ACTUAL_ID_HERE',
       'professional-yearly': 'price_YOUR_ACTUAL_ID_HERE',
       'enterprise-monthly': 'price_YOUR_ACTUAL_ID_HERE',
       'enterprise-yearly': 'price_YOUR_ACTUAL_ID_HERE',
       'metered-asset': 'price_YOUR_ACTUAL_ID_HERE'
     }
   ```

5. **Update frontend env**: `frontend/.env.development`
   ```bash
   REACT_APP_STRIPE_PRO_MONTHLY_PRICE_ID=price_YOUR_ID
   REACT_APP_STRIPE_PRO_ANNUAL_PRICE_ID=price_YOUR_ID
   REACT_APP_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_YOUR_ID
   REACT_APP_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=price_YOUR_ID
   ```

6. **Restart both servers** (after config changes)

7. **Test**: Use card `4242 4242 4242 4242` to test subscription

---

## Helpful Commands

**Check what's running**:
```bash
lsof -i :8080  # Backend
lsof -i :3005  # Frontend (or :5173)
```

**Stop all servers**:
```bash
pkill -f "spring-boot:run" && pkill -f "vite"
```

**View backend logs**:
```bash
tail -f backend/backend.log
```

**Check git status**:
```bash
git status
git branch
```

---

## Files You'll Need to Edit

1. ✏️ `backend/src/main/resources/application-dev.yml` - Add Stripe Price IDs
2. ✏️ `frontend/.env.development` - Add Stripe Price IDs

---

Good luck! 🎉
