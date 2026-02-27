"""
Celery Configuration for OppForge
Handles distributed task queue for scraping, AI processing, and notifications
"""

from celery import Celery
from celery.schedules import crontab
import os
from dotenv import load_dotenv

load_dotenv()

# Redis configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Create Celery app
celery_app = Celery(
    "oppforge",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=[
        "app.tasks.scraping_tasks",
        "app.tasks.ai_tasks",
        "app.tasks.notification_tasks"
    ]
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes max
    task_soft_time_limit=25 * 60,  # 25 minutes soft limit
    worker_prefetch_multiplier=1,  # One task at a time
    worker_max_tasks_per_child=50,  # Restart worker after 50 tasks
    task_acks_late=True,  # Acknowledge tasks after completion
    task_reject_on_worker_lost=True,
    result_expires=3600,  # Results expire after 1 hour
)

# Periodic task schedule
celery_app.conf.beat_schedule = {
    # --- DISABLED PENDING IMPLEMENTATION ---
    # The scrape_ecosystem_grants task is currently a TODO stub.
    # Leaving these disabled so we don't spam logs and artificially 
    # inflate the last_scraped_at timestamps with 0 actual results.
    
    # "scrape-tier1-ecosystems": {
    #     "task": "app.tasks.scraping_tasks.scrape_tier1_ecosystems",
    #     "schedule": crontab(minute=0, hour="*/6"),
    # },
    # "scrape-tier2-ecosystems": {
    #     "task": "app.tasks.scraping_tasks.scrape_tier2_ecosystems",
    #     "schedule": crontab(minute=0, hour="*/12"),
    # },
    # "scrape-tier3-ecosystems": {
    #     "task": "app.tasks.scraping_tasks.scrape_tier3_ecosystems",
    #     "schedule": crontab(minute=0, hour=2),
    # },
    # ---------------------------------------
    
    # Twitter/Social - Every 3 hours
    "scrape-twitter": {
        "task": "app.tasks.scraping_tasks.scrape_twitter",
        "schedule": crontab(minute=0, hour="*/3"),
    },
    
    # Platforms - Every 4 hours
    "scrape-platforms": {
        "task": "app.tasks.scraping_tasks.scrape_grant_platforms",
        "schedule": crontab(minute=30, hour="*/4"),
    },
    
    # AI Processing - Every hour (process unscored opportunities)
    "process-ai-scoring": {
        "task": "app.tasks.ai_tasks.batch_score_opportunities",
        "schedule": crontab(minute=15),  # Every hour at :15
    },
    
    # Risk Assessment - Every 2 hours
    "assess-risk": {
        "task": "app.tasks.ai_tasks.batch_risk_assessment",
        "schedule": crontab(minute=45, hour="*/2"),
    },
    
    # Cleanup - Daily at 3 AM
    "cleanup-old-data": {
        "task": "app.tasks.scraping_tasks.cleanup_old_opportunities",
        "schedule": crontab(minute=0, hour=3),
    },
    
    # Send digest emails - Daily at 9 AM
    "send-daily-digest": {
        "task": "app.tasks.notification_tasks.send_daily_digests",
        "schedule": crontab(minute=0, hour=9),
    },
}

# Task routing
celery_app.conf.task_routes = {
    "app.tasks.scraping_tasks.*": {"queue": "scraping"},
    "app.tasks.ai_tasks.*": {"queue": "ai_processing"},
    "app.tasks.notification_tasks.*": {"queue": "notifications"},
}

if __name__ == "__main__":
    celery_app.start()
