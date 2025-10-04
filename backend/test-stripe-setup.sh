#!/bin/bash

echo "=========================================="
echo "Stripe Integration Setup Verification"
echo "=========================================="
echo ""

# Check if database is accessible
echo "✓ Checking migration files..."
MIGRATION_COUNT=$(ls -1 src/main/resources/db/migration/*.sql 2>/dev/null | wc -l)
echo "  Found $MIGRATION_COUNT migration files"

# Check if Stripe migration exists
if [ -f "src/main/resources/db/migration/V7__create_stripe_tables.sql" ]; then
    echo "  ✓ Stripe tables migration (V7) found"
else
    echo "  ✗ Stripe tables migration NOT found"
fi

echo ""
echo "✓ Checking Stripe configuration..."

# Check for Stripe config in application.yml
if grep -q "stripe:" src/main/resources/application.yml 2>/dev/null; then
    echo "  ✓ Stripe configuration found in application.yml"
else
    echo "  ✗ Stripe configuration NOT found in application.yml"
fi

echo ""
echo "✓ Checking Stripe Java files..."

STRIPE_FILES=(
    "src/main/java/com/chaseelkins/assetmanagement/config/StripeConfig.java"
    "src/main/java/com/chaseelkins/assetmanagement/model/Subscription.java"
    "src/main/java/com/chaseelkins/assetmanagement/model/Invoice.java"
    "src/main/java/com/chaseelkins/assetmanagement/model/PaymentMethod.java"
    "src/main/java/com/chaseelkins/assetmanagement/model/UsageRecord.java"
    "src/main/java/com/chaseelkins/assetmanagement/service/StripeService.java"
    "src/main/java/com/chaseelkins/assetmanagement/service/UsageTrackingService.java"
    "src/main/java/com/chaseelkins/assetmanagement/controller/SubscriptionController.java"
    "src/main/java/com/chaseelkins/assetmanagement/controller/StripeWebhookController.java"
)

FOUND=0
for file in "${STRIPE_FILES[@]}"; do
    if [ -f "$file" ]; then
        ((FOUND++))
    fi
done

echo "  Found $FOUND/${#STRIPE_FILES[@]} Stripe integration files"

echo ""
echo "=========================================="
echo "Next Steps:"
echo "=========================================="
echo ""
echo "1. Set up your Stripe account at https://dashboard.stripe.com"
echo ""
echo "2. Get your API keys from: https://dashboard.stripe.com/test/apikeys"
echo ""
echo "3. Add them to your application-dev.yml or environment variables:"
echo "   STRIPE_SECRET_KEY=sk_test_..."
echo "   STRIPE_PUBLISHABLE_KEY=pk_test_..."
echo "   STRIPE_WEBHOOK_SECRET=whsec_..."
echo ""
echo "4. Create products and prices in Stripe Dashboard:"
echo "   - Professional Plan (monthly & annual)"
echo "   - Enterprise Plan (monthly & annual)"
echo "   - Metered billing for asset overages"
echo ""
echo "5. Start your Spring Boot application:"
echo "   ./mvnw spring-boot:run"
echo ""
echo "   Flyway will automatically run migrations on startup!"
echo ""
echo "6. Test with Stripe test cards:"
echo "   - Success: 4242 4242 4242 4242"
echo "   - Decline: 4000 0000 0000 9995"
echo ""
echo "=========================================="
echo "For detailed setup instructions, see:"
echo "docs/STRIPE_INTEGRATION_GUIDE.md"
echo "=========================================="
