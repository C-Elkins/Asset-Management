#!/bin/bash
# 🚀 Asset Management System - Demo Startup Script
# Run this script to start your demo

clear
echo "🚀 Starting Asset Management System Demo"
echo "==========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "backend/pom.xml" ]; then
    echo "❌ Error: Please run this script from the it-asset-management directory"
    echo "   cd '/Users/chaseelkins/Documents/IT Asset Management System/it-asset-management'"
    exit 1
fi

echo "📂 Current directory: $(pwd)"
echo "📦 Starting backend server..."
echo ""

cd backend

echo "🔄 Starting Spring Boot application..."
echo "⏰ This will take about 30-60 seconds..."
echo ""
echo "💡 When you see '🚀 Asset Management System Started Successfully!' your demo is ready!"
echo ""
echo "🌐 Demo URLs will be available at:"
echo "   📊 API Documentation: http://localhost:8080/api/v1/swagger-ui.html"
echo "   🔧 Database Console:  http://localhost:8080/api/v1/h2-console"
echo "   💚 Health Check:      http://localhost:8080/api/v1/actuator/health"
echo ""
echo "============================================="
echo ""

# Start the application
./mvnw spring-boot:run
