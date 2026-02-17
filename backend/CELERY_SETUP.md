# Celery Automated Scraping Setup

## Overview
OppForge now has automated scraping using Celery + Redis for task scheduling and execution.

## Architecture
- **Celery**: Distributed task queue for async job execution
- **Redis**: Message broker and result backend
- **Flower**: Web-based monitoring dashboard
- **Beat**: Scheduler for periodic tasks

## Installation

### 1. Install Dependencies
```bash
cd backend
source venv/bin/activate
pip install celery[redis] redis flower
```

### 2. Install & Start Redis
```bash
# macOS
brew install redis
redis-server --daemonize yes

# Linux
sudo apt install redis-server
sudo systemctl start redis

# Check if running
redis-cli ping  # Should return "PONG"
```

## Running Celery

### Option 1: Using Scripts (Recommended)
```bash
# Terminal 1: Start worker
cd backend
./start_celery_worker.sh

# Terminal 2: Start beat scheduler
cd backend
./start_celery_beat.sh

# Terminal 3 (Optional): Start Flower monitoring
celery -A app.celery_config.celery_app flower --port=5555
# Visit http://localhost:5555
```

### Option 2: Manual Commands
```bash
# Worker
celery -A app.celery_config.celery_app worker --loglevel=info

# Beat (scheduler)
celery -A app.celery_config.celery_app beat --loglevel=info

# Flower (monitoring)
celery -A app.celery_config.celery_app flower
```

## Task Schedules

### Periodic Tasks
| Task | Frequency | Queue | Description |
|------|-----------|-------|-------------|
| `scrape_tier1_ecosystems` | Every 6 hours | scraping | High-priority L1s (Ethereum, Solana, etc.) |
| `scrape_tier2_ecosystems` | Every 12 hours | scraping | L2 solutions (Arbitrum, Optimism, etc.) |
| `scrape_tier3_ecosystems` | Daily at 2 AM | scraping | Cosmos chains, DAOs, etc. |
| `scrape_twitter` | Every 3 hours | scraping | Twitter/X Web3 opportunities |
| `scrape_grant_platforms` | Every 4 hours | scraping | Gitcoin, DoraHacks, etc. |
| `batch_score_opportunities` | Every 2 hours | ai_processing | AI scoring for unscored opps |
| `batch_risk_assessment` | Every 2 hours | ai_processing | Risk assessment |
| `send_daily_digests` | Daily at 8 AM | notifications | Email digests to users |
| `cleanup_old_opportunities` | Daily at 3 AM | scraping | Remove old closed opps |

### On-Demand Tasks
Call these manually for immediate execution:

```python
from app.tasks.scraping_tasks import scrape_ecosystem_grants, test_celery

# Test Celery
test_celery.delay()

# Scrape specific ecosystem
scrape_ecosystem_grants.delay("ecosystem-id-here")
```

## Queues
- **scraping**: Heavy web scraping tasks
- **ai_processing**: AI agent calls (scoring, risk assessment)
- **notifications**: Email/notification sending

## Monitoring

### Celery Events
```bash
celery -A app.celery_config.celery_app events
```

### Flower Dashboard
Visit http://localhost:5555 to see:
- Active workers
- Task history
- Task success/failure rates
- Queue lengths
- Real-time task execution

### Redis CLI
```bash
redis-cli

# Check queue lengths
LLEN celery
LLEN scraping
LLEN ai_processing

# View tasks
KEYS celery-task-meta-*
```

## Configuration

### Redis URL
Edit `backend/app/celery_config.py`:
```python
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
```

For cloud Redis (Upstash, Redis Cloud, etc.):
```bash
# backend/.env
REDIS_URL=redis://username:password@host:port/0
```

### Task Retry Settings
Tasks retry up to 3 times with exponential backoff (5min, 10min, 15min).

Edit in `celery_config.py`:
```python
celery_app.conf.task_annotations = {
    '*': {'max_retries': 3}
}
```

## Testing

### 1. Test Celery Connection
```python
# Python shell
from app.tasks.scraping_tasks import test_celery
result = test_celery.delay()
print(result.get())  # Should print success message
```

### 2. Test Scraping Task
```python
from app.tasks.scraping_tasks import scrape_tier1_ecosystems
result = scrape_tier1_ecosystems.delay()
print(result.get(timeout=300))  # Wait up to 5 minutes
```

### 3. Check Task Status
```python
from celery.result import AsyncResult
result = AsyncResult('task-id-here')
print(result.status)  # PENDING, STARTED, SUCCESS, FAILURE
print(result.info)    # Result data or exception
```

## Troubleshooting

### Redis Not Running
```bash
# Check if Redis is running
redis-cli ping

# Start Redis
redis-server --daemonize yes

# Check logs
tail -f /usr/local/var/log/redis.log
```

### Celery Worker Not Starting
- Check Redis connection
- Ensure virtual environment is activated
- Check for import errors: `python -c "from app.celery_config import celery_app"`

### Tasks Not Executing
- Ensure both worker AND beat are running
- Check Flower dashboard for errors
- Check Redis queues: `redis-cli LLEN scraping`

### Rate Limiting Issues
If scrapers are being rate-limited:
1. Reduce scraping frequency in `celery_config.py`
2. Add delays in scraper code
3. Use rotating proxies

## Production Deployment

### Supervisor (Recommended)
```ini
# /etc/supervisor/conf.d/oppforge-celery.conf
[program:oppforge-worker]
command=/path/to/venv/bin/celery -A app.celery_config.celery_app worker --loglevel=info
directory=/path/to/backend
user=oppforge
autostart=true
autorestart=true
stderr_logfile=/var/log/oppforge/celery-worker.err.log
stdout_logfile=/var/log/oppforge/celery-worker.out.log

[program:oppforge-beat]
command=/path/to/venv/bin/celery -A app.celery_config.celery_app beat --loglevel=info
directory=/path/to/backend
user=oppforge
autostart=true
autorestart=true
```

### Docker
```dockerfile
# Add to backend Dockerfile
CMD celery -A app.celery_config.celery_app worker --loglevel=info &
    celery -A app.celery_config.celery_app beat --loglevel=info &
    uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Next Steps
1. ✅ Celery & Redis installed
2. ✅ Task files created
3. ⏳ Start Redis server
4. ⏳ Test Celery worker
5. ⏳ Implement ecosystem-specific scrapers
6. ⏳ Seed remaining 109 ecosystems
7. ⏳ Monitor task execution in Flower
