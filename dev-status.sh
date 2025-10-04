#!/bin/bash
# Development Status Dashboard
# Shows running services, ports, PIDs, and health status

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Unicode symbols
CHECK="✓"
CROSS="✗"
INFO="ℹ"
ROCKET="🚀"
WARNING="⚠"

echo ""
echo -e "${BOLD}${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║     IT ASSET MANAGEMENT - DEVELOPMENT STATUS              ║${NC}"
echo -e "${BOLD}${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to check if a port is in use
check_port() {
    local port=$1
    lsof -iTCP:$port -sTCP:LISTEN -n -P 2>/dev/null
}

# Function to get process info
get_process_info() {
    local port=$1
    local info=$(lsof -iTCP:$port -sTCP:LISTEN -n -P 2>/dev/null | tail -n 1)
    if [ -n "$info" ]; then
        local pid=$(echo $info | awk '{print $2}')
        local command=$(echo $info | awk '{print $1}')
        echo "$pid|$command"
    fi
}

# Function to check HTTP endpoint
check_endpoint() {
    local url=$1
    local timeout=2
    if curl -s -f -m $timeout "$url" > /dev/null 2>&1; then
        echo "UP"
    else
        echo "DOWN"
    fi
}

# Function to get memory usage
get_memory() {
    local pid=$1
    if [ -n "$pid" ] && ps -p $pid > /dev/null 2>&1; then
        ps -o rss= -p $pid | awk '{printf "%.1f MB", $1/1024}'
    else
        echo "N/A"
    fi
}

# Function to get uptime
get_uptime() {
    local pid=$1
    if [ -n "$pid" ] && ps -p $pid > /dev/null 2>&1; then
        ps -o etime= -p $pid | awk '{print $1}'
    else
        echo "N/A"
    fi
}

echo -e "${BOLD}${BLUE}📊 SERVICE STATUS${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Backend Check (Port 8080)
echo -e "${BOLD}Backend (Spring Boot)${NC}"
backend_info=$(get_process_info 8080)
if [ -n "$backend_info" ]; then
    backend_pid=$(echo $backend_info | cut -d'|' -f1)
    backend_cmd=$(echo $backend_info | cut -d'|' -f2)
    backend_health=$(check_endpoint "http://localhost:8080/api/v1/healthz")
    backend_mem=$(get_memory $backend_pid)
    backend_uptime=$(get_uptime $backend_pid)
    
    echo -e "  ${GREEN}${CHECK}${NC} Status:     ${GREEN}RUNNING${NC}"
    echo -e "  ${INFO} Port:       ${BOLD}8080${NC}"
    echo -e "  ${INFO} PID:        ${BOLD}$backend_pid${NC}"
    echo -e "  ${INFO} Process:    $backend_cmd"
    echo -e "  ${INFO} Health:     $([ "$backend_health" = "UP" ] && echo -e "${GREEN}${CHECK} UP${NC}" || echo -e "${RED}${CROSS} DOWN${NC}")"
    echo -e "  ${INFO} Memory:     $backend_mem"
    echo -e "  ${INFO} Uptime:     $backend_uptime"
    echo -e "  ${INFO} Endpoint:   ${CYAN}http://localhost:8080/api/v1${NC}"
    echo -e "  ${INFO} H2 Console: ${CYAN}http://localhost:8080/api/v1/h2-console${NC}"
    echo -e "  ${INFO} API Docs:   ${CYAN}http://localhost:8080/api/v1/swagger-ui.html${NC}"
else
    echo -e "  ${RED}${CROSS}${NC} Status:     ${RED}NOT RUNNING${NC}"
    echo -e "  ${INFO} Port:       8080 (available)"
    echo -e "  ${WARNING} Run: ${YELLOW}cd backend && ./mvnw spring-boot:run${NC}"
fi
echo ""

# Frontend Check (Vite can use 5173, 3005, 3000, etc.)
echo -e "${BOLD}Frontend (React + Vite)${NC}"

# Check common Vite ports
frontend_port=""
frontend_info=""
for port in 3005 5173 3000 3001; do
    info=$(get_process_info $port)
    if [ -n "$info" ]; then
        # Verify it's node/vite
        if echo "$info" | grep -q "node"; then
            frontend_port=$port
            frontend_info=$info
            break
        fi
    fi
done

if [ -n "$frontend_info" ]; then
    frontend_pid=$(echo $frontend_info | cut -d'|' -f1)
    frontend_cmd=$(echo $frontend_info | cut -d'|' -f2)
    frontend_health=$(check_endpoint "http://localhost:$frontend_port")
    frontend_mem=$(get_memory $frontend_pid)
    frontend_uptime=$(get_uptime $frontend_pid)
    
    echo -e "  ${GREEN}${CHECK}${NC} Status:     ${GREEN}RUNNING${NC}"
    echo -e "  ${INFO} Port:       ${BOLD}$frontend_port${NC}"
    echo -e "  ${INFO} PID:        ${BOLD}$frontend_pid${NC}"
    echo -e "  ${INFO} Process:    $frontend_cmd"
    echo -e "  ${INFO} Health:     $([ "$frontend_health" = "UP" ] && echo -e "${GREEN}${CHECK} UP${NC}" || echo -e "${RED}${CROSS} DOWN${NC}")"
    echo -e "  ${INFO} Memory:     $frontend_mem"
    echo -e "  ${INFO} Uptime:     $frontend_uptime"
    echo -e "  ${INFO} Endpoint:   ${CYAN}http://localhost:$frontend_port${NC}"
else
    echo -e "  ${RED}${CROSS}${NC} Status:     ${RED}NOT RUNNING${NC}"
    echo -e "  ${INFO} Port:       Checking 5173, 3005, 3000... (all available)"
    echo -e "  ${WARNING} Run: ${YELLOW}cd frontend && npm run dev${NC}"
fi
echo ""

echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Summary
echo -e "${BOLD}${BLUE}📈 QUICK SUMMARY${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

total_services=2
running_services=0
[ -n "$backend_info" ] && ((running_services++))
[ -n "$frontend_info" ] && ((running_services++))

if [ $running_services -eq $total_services ]; then
    echo -e "  ${GREEN}${ROCKET} All services are running!${NC}"
    echo -e "  ${GREEN}${CHECK} Backend:  http://localhost:8080/api/v1${NC}"
    [ -n "$frontend_port" ] && echo -e "  ${GREEN}${CHECK} Frontend: http://localhost:$frontend_port${NC}"
elif [ $running_services -eq 0 ]; then
    echo -e "  ${RED}${CROSS} No services running${NC}"
    echo -e "  ${INFO} Run: ${YELLOW}./start.sh${NC} to start all services"
else
    echo -e "  ${YELLOW}${WARNING} Partial deployment: $running_services/$total_services services running${NC}"
fi
echo ""

# Show all listening ports for context
echo -e "${BOLD}${BLUE}🔌 ALL LISTENING PORTS${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
listening_ports=$(lsof -iTCP -sTCP:LISTEN -n -P 2>/dev/null | grep -v "COMMAND" | awk '{print $9, $1, $2}' | sort -t: -k2 -n | head -20)
if [ -n "$listening_ports" ]; then
    echo "$listening_ports" | while read line; do
        port=$(echo $line | cut -d':' -f2 | awk '{print $1}')
        cmd=$(echo $line | awk '{print $2}')
        pid=$(echo $line | awk '{print $3}')
        
        # Highlight our services
        if [ "$port" = "8080" ] || [ "$port" = "3005" ] || [ "$port" = "5173" ] || [ "$port" = "3000" ]; then
            echo -e "  ${GREEN}${CHECK}${NC} Port ${BOLD}$port${NC} - $cmd (PID: $pid)"
        else
            echo -e "  ${INFO} Port $port - $cmd (PID: $pid)"
        fi
    done
else
    echo -e "  ${INFO} No listening ports detected"
fi
echo ""

echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BOLD}${BLUE}🛠  USEFUL COMMANDS${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${BOLD}Start all services:${NC}      ./start.sh"
echo -e "  ${BOLD}Stop all services:${NC}       ./scripts/dev-stop.sh"
echo -e "  ${BOLD}View backend logs:${NC}       tail -f backend/backend.log"
echo -e "  ${BOLD}View frontend logs:${NC}      tail -f frontend/frontend.log"
echo -e "  ${BOLD}Kill port 8080:${NC}          lsof -ti:8080 | xargs kill -9"
echo -e "  ${BOLD}Kill port 5173:${NC}          lsof -ti:5173 | xargs kill -9"
echo -e "  ${BOLD}Refresh this status:${NC}     ./dev-status.sh"
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
