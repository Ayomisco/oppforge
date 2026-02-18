#!/bin/bash

# OppForge - Stop All Services

set -e

echo "🛑 Stopping OppForge System..."
echo "==============================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Stop Backend
if [ -f backend/.backend.pid ]; then
    PID=$(cat backend/.backend.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo -e "${GREEN}✅ Stopped Backend (PID: $PID)${NC}"
    fi
    rm backend/.backend.pid
fi

# Stop AI Engine
if [ -f ai-engine/.ai-engine.pid ]; then
    PID=$(cat ai-engine/.ai-engine.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo -e "${GREEN}✅ Stopped AI Engine (PID: $PID)${NC}"
    fi
    rm ai-engine/.ai-engine.pid
fi

# Stop Celery Worker
if [ -f backend/.celery-worker.pid ]; then
    PID=$(cat backend/.celery-worker.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo -e "${GREEN}✅ Stopped Celery Worker (PID: $PID)${NC}"
    fi
    rm backend/.celery-worker.pid
fi

# Stop Celery Beat
if [ -f backend/.celery-beat.pid ]; then
    PID=$(cat backend/.celery-beat.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo -e "${GREEN}✅ Stopped Celery Beat (PID: $PID)${NC}"
    fi
    rm backend/.celery-beat.pid
fi

# Stop Redis (optional - commented out as it might be used by other apps)
# redis-cli shutdown
# echo -e "${GREEN}✅ Stopped Redis${NC}"

echo ""
echo -e "${GREEN}✅ All services stopped${NC}"
echo ""
