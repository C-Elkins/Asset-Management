#!/bin/bash

# Asset Management System - Start Script
echo "🚀 Starting Asset Management System..."

# Function to kill processes on exit
cleanup() {
    echo "\n🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Set up cleanup on script exit
trap cleanup EXIT INT TERM

# Start backend in background
echo "📊 Starting Spring Boot backend..."
cd "/Users/chaseelkins/Documents/IT Asset Management System/it-asset-management/backend"
mvn spring-boot:run &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 10

# Start frontend in background
echo "🌐 Starting React frontend..."
cd "/Users/chaseelkins/Documents/IT Asset Management System/it-asset-management/frontend"
npm run dev &
FRONTEND_PID=$!

echo "✅ Both servers started!"
echo "📊 Backend: http://localhost:8080/api/v1"
echo "🌐 Frontend: http://localhost:3005"
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait
