#!/bin/bash

# OppForge - Complete System Startup Script
# Starts Backend, AI Engine, Celery Worker, and Celery Beat

set -e

echo "🚀 Starting OppForge Complete System..."
echo "======================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Redis is running
echo -e "\n${YELLOW}1. Checking Redis...${NC}"
if ! pgrep redis-server > /dev/null; then
    echo "Starting Redis..."
    redis-server --daemonize yes
    sleep 2
fi

if redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis is running${NC}"
else
    echo -e "${RED}❌ Redis failed to start${NC}"
    exit 1
fi

# Start Backend API
echo -e "\n${YELLOW}2. Starting Backend API (Port 8000)...${NC}"
cd backend
if pgrep -f "uvicorn.*8000" > /dev/null; then
    echo -e "${GREEN}✅ Backend already running${NC}"
else
    source venv/bin/activate
    nohup uvicorn app.main:app --reload --port 8000 > logs/backend.log 2>&1 &
    echo $! > .backend.pid
    sleep 3
    echo -e "${GREEN}✅ Backend started (PID: $(cat .backend.pid))${NC}"
fi
cd ..

# Start AI Engine
echo -e "\n${YELLOW}3. Starting AI Engine (Port 8001)...${NC}"
cd ai-engine
if pgrep -f "uvicorn.*8001" > /dev/null; then
    echo -e "${GREEN}✅ AI Engine already running${NC}"
else
    source venv/bin/activate
    nohup uvicorn main:app --host 0.0.0.0 --port 8001 > logs/ai-engine.log 2>&1 &
    echo $! > .ai-engine.pid
    sleep 3
    echo -e "${GREEN}✅ AI Engine started (PID: $(cat .ai-engine.pid))${NC}"
fi
cd ..

# Start Celery Worker
echo -e "\n${YELLOW}4. Starting Celery Worker...${NC}"
cd backend
if pgrep -f "celery.*worker" > /dev/null; then
    echo -e "${GREEN}✅ Celery Worker already running${NC}"
else
    source venv/bin/activate
    nohup celery -A app.celery_config.celery_app worker --loglevel=info > logs/celery-worker.log 2>&1 &
    echo $! > .celery-worker.pid
    sleep 3
    echo -e "${GREEN}✅ Celery Worker started (PID: $(cat .celery-worker.pid))${NC}"
fi

# Start Celery Beat
echo -e "\n${YELLOW}5. Starting Celery Beat (Scheduler)...${NC}"
if pgrep -f "celery.*beat" > /dev/null; then
    echo -e "${GREEN}✅ Celery Beat already running${NC}"
else
    nohup celery -A app.celery_config.celery_app beat --loglevel=info > logs/celery-beat.log 2>&1 &
    echo $! > .celery-beat.pid
    sleep 2
    echo -e "${GREEN}✅ Celery Beat started (PID: $(cat .celery-beat.pid))${NC}"
fi
cd ..

# Health Checks
echo -e "\n${YELLOW}6. Running Health Checks...${NC}"

# Backend
if curl -s http://localhost:8000/health > /dev/null; then
    echo -e "${GREEN}✅ Backend API responding${NC}"
else
    echo -e "${RED}❌ Backend API not responding${NC}"
fi

# AI Engine
if curl -s http://localhost:8001/health > /dev/null; then
    echo -e "${GREEN}✅ AI Engine responding${NC}"
else
    echo -e "${RED}❌ AI Engine not responding${NC}"
fi

# Redis
if redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis responding${NC}"
else
    echo -e "${RED}❌ Redis not responding${NC}"
fi

# Summary
echo -e "\n${GREEN}=======================================${NC}"
echo -e "${GREEN}🎉 OppForge System Started Successfully${NC}"
echo -e "${GREEN}=======================================${NC}"
echo ""
echo "📊 Service Status:"
echo "  - Backend API:    http://localhost:8000"
echo "  - AI Engine:      http://localhost:8001"
echo "  - Redis:          localhost:6379"
echo "  - Flower Monitor: http://localhost:5555 (run: celery -A app.celery_config.celery_app flower)"
echo ""
echo "📝 Logs:"
echo "  - Backend:        backend/logs/backend.log"
echo "  - AI Engine:      ai-engine/logs/ai-engine.log"
echo "  - Celery Worker:  backend/logs/celery-worker.log"
echo "  - Celery Beat:    backend/logs/celery-beat.log"
echo ""
echo "🛑 To stop all services: ./stop-all.sh"
echo ""
