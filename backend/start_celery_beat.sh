#!/bin/bash

# OppForge Celery Beat (Scheduler) Startup Script

cd "$(dirname "$0")"

echo "📅 Starting Celery Beat (Scheduler)..."

# Activate virtual environment
source venv/bin/activate

# Start Celery beat
celery -A app.celery_config.celery_app beat \
    --loglevel=info \
    --scheduler celery.beat:PersistentScheduler
