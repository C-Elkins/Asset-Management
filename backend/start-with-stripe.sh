#!/bin/bash

echo "================================================"
echo "🚀 Starting IT Asset Management with Stripe"
echo "================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "pom.xml" ]; then
    echo "❌ Error: Not in backend directory"
    echo "Please run: cd backend && ./start-with-stripe.sh"
    exit 1
fi

echo "✅ Checking configuration..."

# Check if Stripe keys are configured
if grep -q "sk_test_51SE1M7RnSgrmRk1T" src/main/resources/application-dev.yml 2>/dev/null; then
    echo "   ✅ Stripe Secret Key configured"
else
    echo "   ⚠️  Stripe Secret Key not found in application-dev.yml"
fi

if grep -q "pk_test_51SE1M7RnSgrmRk1T" src/main/resources/application-dev.yml 2>/dev/null; then
    echo "   ✅ Stripe Publishable Key configured"
else
    echo "   ⚠️  Stripe Publishable Key not found in application-dev.yml"
fi

# Check if migration files exist
MIGRATION_COUNT=$(ls -1 src/main/resources/db/migration/*.sql 2>/dev/null | wc -l | tr -d ' ')
echo "   ✅ Found $MIGRATION_COUNT migration files"

if [ -f "src/main/resources/db/migration/V7__create_stripe_tables.sql" ]; then
    echo "   ✅ Stripe tables migration (V7) ready"
fi

echo ""
echo "================================================"
echo "🔧 Starting Spring Boot Application..."
echo "================================================"
echo ""
echo "This will:"
echo "  1. Connect to H2 in-memory database"
echo "  2. Run all Flyway migrations (including Stripe tables)"
echo "  3. Initialize Stripe with your API keys"
echo "  4. Start the REST API on http://localhost:8080"
echo ""
echo "📝 To view logs, check:"
echo "  - Console output below"
echo "  - logs/application.json"
echo ""
echo "🌐 After startup, access:"
echo "  - API Documentation: http://localhost:8080/swagger-ui.html"
echo "  - H2 Console: http://localhost:8080/h2-console"
echo "    (JDBC URL: jdbc:h2:mem:testdb, User: sa, Password: empty)"
echo ""
echo "⏸️  To stop the application, press Ctrl+C"
echo ""
echo "================================================"
echo ""

# Start Spring Boot
./mvnw spring-boot:run
