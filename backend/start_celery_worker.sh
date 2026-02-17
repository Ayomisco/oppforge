#!/bin/bash

# OppForge Celery Worker Startup Script

cd "$(dirname "$0")"

echo "🚀 Starting Celery Worker..."

# Activate virtual environment
source venv/bin/activate

# Start Celery worker
celery -A app.celery_config.celery_app worker \
    --loglevel=info \
    --concurrency=4 \
    --queues=scraping,ai_processing,notifications \
    --max-tasks-per-child=50
