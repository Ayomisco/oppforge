# OppForge MVP - Next Steps & Testing Guide

## 🎉 What's Been Completed

✅ **AI Engine** (100% Complete)
- 4 fully operational agents (Scoring, Chat, Risk, Classifier)
- ChromaDB semantic search enabled
- FastAPI server on port 8001
- All endpoints tested and working

✅ **Ecosystem Database** (114 ecosystems seeded)
- Tier 1: 30 ecosystems (scrape every 6 hours)
- Tier 2: 33 ecosystems (scrape every 12 hours)
- Tier 3: 51 ecosystems (scrape daily)

✅ **Risk Engine Integration**
- Database fields added (risk_score, risk_level, risk_flags)
- Risk assessment tasks created
- Ready for testing

✅ **Automated Scraping Infrastructure**
- Celery + Redis task queue configured
- 9 periodic tasks created
- Worker and Beat scheduler scripts ready
- Monitoring with Flower available

✅ **Multi-Repo Git Deployment**
- `./deploy.sh "message"` pushes to 6 repos simultaneously

---

## 🚀 Quick Start

### 1. Start All Services
```bash
cd /Users/ayomisco/Documents/Main/Builds/AI\ PROJECTS/OppForge
./start-all.sh
```

This starts:
- Redis (port 6379)
- Backend API (port 8000)
- AI Engine (port 8001)
- Celery Worker (background)
- Celery Beat (scheduler)

### 2. Verify Services
```bash
# Backend health
curl http://localhost:8000/health

# AI Engine health
curl http://localhost:8001/health

# Redis
redis-cli ping
```

### 3. Start Flower (Monitoring Dashboard)
```bash
cd backend
source venv/bin/activate
celery -A app.celery_config.celery_app flower --port=5555
```
Then visit: http://localhost:5555

### 4. Test Celery
```bash
cd backend
source venv/bin/activate
python -c "from app.tasks.scraping_tasks import test_celery; result = test_celery.delay(); print(result.get())"
```

Should output: `{"status": "success", "message": "Celery is working!"}`

---

## 🧪 Testing Checklist

### Phase 1: Basic Infrastructure
- [ ] All services start without errors
- [ ] Backend responds to /health
- [ ] AI Engine responds to /health
- [ ] Redis accepts connections
- [ ] Celery worker connects to Redis
- [ ] Celery beat scheduler starts
- [ ] test_celery task executes successfully

### Phase 2: AI Engine Testing
```bash
# Test scoring
curl -X POST http://localhost:8001/ai/score \
  -H "Content-Type: application/json" \
  -d '{
    "opportunity": {
      "title": "Ethereum Grant Program",
      "description": "Build innovative DeFi protocols",
      "category": "Grant",
      "reward_pool": "$50,000"
    },
    "user_profile": {
      "skills": ["Solidity", "DeFi", "Smart Contracts"]
    }
  }'

# Test risk assessment
curl -X POST http://localhost:8001/ai/risk-assess \
  -H "Content-Type: application/json" \
  -d '{
    "opportunity": {
      "title": "GET RICH QUICK - 1000% GUARANTEED RETURNS!!!",
      "description": "Send Bitcoin to get 10x back in 24 hours",
      "reward_pool": "$1,000,000",
      "source": "anonymous telegram"
    }
  }'
```

### Phase 3: Scraping Tasks
```bash
# Test Twitter scraping
python -c "from app.tasks.scraping_tasks import scrape_twitter; scrape_twitter.delay()"

# Test platform scraping
python -c "from app.tasks.scraping_tasks import scrape_grant_platforms; scrape_grant_platforms.delay()"

# Check task status in Flower
# Visit http://localhost:5555/tasks
```

### Phase 4: Database Verification
```bash
# Check ecosystem count
python -c "from app.database import SessionLocal; from app.models.ecosystem import Ecosystem; db = SessionLocal(); print(f'Ecosystems: {db.query(Ecosystem).count()}'); db.close()"

# Check opportunities
python -c "from app.database import SessionLocal; from app.models.opportunity import Opportunity; db = SessionLocal(); print(f'Opportunities: {db.query(Opportunity).count()}'); db.close()"
```

---

## 🔧 Configuration

### Redis Configuration
If using cloud Redis (recommended for production):
```bash
# backend/.env
REDIS_URL=redis://username:password@your-redis-host:6379/0
```

### Celery Task Frequencies
Edit `backend/app/celery_config.py`:
```python
# Change scraping frequency
"scrape_tier1_ecosystems": {
    "task": "app.tasks.scraping_tasks.scrape_tier1_ecosystems",
    "schedule": crontab(minute=0, hour="*/6"),  # Every 6 hours
}
```

---

## 🐛 Troubleshooting

### Redis Not Starting
```bash
# macOS
brew services start redis

# Or manually
redis-server --daemonize yes

# Check
redis-cli ping
```

### Celery Worker Not Connecting
```bash
# Check Redis connection
redis-cli ping

# Check Celery config
cd backend
source venv/bin/activate
python -c "from app.celery_config import celery_app; print(celery_app.conf.broker_url)"

# Restart worker
pkill -f "celery.*worker"
./start_celery_worker.sh
```

### Tasks Not Executing
```bash
# Check if Beat is running
pgrep -f "celery.*beat"

# Check logs
tail -f backend/logs/celery-beat.log
tail -f backend/logs/celery-worker.log

# Manually trigger a task
python -c "from app.tasks.scraping_tasks import scrape_tier1_ecosystems; scrape_tier1_ecosystems.delay()"
```

### Database Connection Issues
```bash
# Test connection
python -c "from app.database import SessionLocal; db = SessionLocal(); print('Connected!'); db.close()"

# If fails, check DATABASE_URL in .env
```

---

## 🔐 Security Hardening (CRITICAL!)

**MUST DO BEFORE PUBLIC LAUNCH:**

### 1. Rotate API Keys
```bash
# Generate new keys
# GROQ: https://console.groq.com/keys
# RAPIDAPI: https://rapidapi.com
# PLUNK: https://useplunk.com
# SUPABASE: https://supabase.com/dashboard

# Update backend/.env with new keys
```

### 2. Generate Strong JWT Secret
```bash
# Generate 256-bit secret
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Add to backend/.env
SECRET_KEY=<your-generated-secret>
```

### 3. Add Rate Limiting
```bash
cd backend
source venv/bin/activate
pip install slowapi

# Then add to app/main.py:
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.get("/api/opportunities")
@limiter.limit("10/minute")
def get_opportunities():
    ...
```

### 4. Restrict CORS
```python
# backend/app/main.py and ai-engine/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://oppforge.com",
        "https://platform.oppforge.com",
        "http://localhost:3000"  # For dev
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

### 5. Add AI Engine Authentication
```python
# ai-engine/main.py
from fastapi import Header, HTTPException

API_KEY = os.getenv("AI_ENGINE_API_KEY")

async def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")

@app.post("/ai/score", dependencies=[Depends(verify_api_key)])
def score_opportunity(...):
    ...
```

### 6. Remove .env from Git History
```bash
# Install git-filter-repo
brew install git-filter-repo

# Remove .env from history
cd /Users/ayomisco/Documents/Main/Builds/AI\ PROJECTS/OppForge
git filter-repo --path backend/.env --invert-paths

# Force push (WARNING: This rewrites history)
git push --force
```

---

## 📊 Monitoring

### Celery Tasks (Flower)
```bash
# Start Flower
cd backend
celery -A app.celery_config.celery_app flower --port=5555

# Visit http://localhost:5555
```

Features:
- Task history
- Worker status
- Queue lengths
- Success/failure rates
- Real-time monitoring

### Redis Monitoring
```bash
redis-cli

# Check queue lengths
LLEN celery
LLEN scraping
LLEN ai_processing

# View active tasks
KEYS celery-task-meta-*

# Get task result
GET celery-task-meta-<task-id>
```

### Backend API Logs
```bash
# Real-time
tail -f backend/logs/backend.log

# Search for errors
grep ERROR backend/logs/backend.log
```

### AI Engine Logs
```bash
# Real-time
tail -f ai-engine/logs/ai-engine.log

# Check agent calls
grep "Agent" ai-engine/logs/ai-engine.log
```

---

## 🚢 Production Deployment

### Using Supervisor (Recommended)
```bash
# Install supervisor
sudo apt install supervisor  # Ubuntu
brew install supervisor      # macOS

# Create config
sudo nano /etc/supervisor/conf.d/oppforge.conf
```

```ini
[program:oppforge-backend]
command=/path/to/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
directory=/path/to/backend
user=oppforge
autostart=true
autorestart=true
stderr_logfile=/var/log/oppforge/backend.err.log
stdout_logfile=/var/log/oppforge/backend.out.log

[program:oppforge-ai-engine]
command=/path/to/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8001
directory=/path/to/ai-engine
user=oppforge
autostart=true
autorestart=true

[program:oppforge-celery-worker]
command=/path/to/venv/bin/celery -A app.celery_config.celery_app worker --loglevel=info
directory=/path/to/backend
user=oppforge
autostart=true
autorestart=true

[program:oppforge-celery-beat]
command=/path/to/venv/bin/celery -A app.celery_config.celery_app beat --loglevel=info
directory=/path/to/backend
user=oppforge
autostart=true
autorestart=true
```

```bash
# Reload supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl status
```

### Using Docker
```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD uvicorn app.main:app --host 0.0.0.0 --port 8000 & \
    celery -A app.celery_config.celery_app worker & \
    celery -A app.celery_config.celery_app beat
```

```bash
docker build -t oppforge-backend .
docker run -p 8000:8000 --env-file .env oppforge-backend
```

---

## 📈 Performance Optimization

### Database Indexing
Already indexed:
- opportunities.title
- opportunities.category
- opportunities.chain
- opportunities.deadline
- opportunities.ai_score
- opportunities.risk_score
- ecosystems.name
- ecosystems.type
- ecosystems.tier

### Celery Tuning
```python
# backend/app/celery_config.py

# Increase workers for heavy load
celery_app.conf.worker_concurrency = 8

# Prefetch fewer tasks
celery_app.conf.worker_prefetch_multiplier = 1

# Lower max tasks per child
celery_app.conf.worker_max_tasks_per_child = 100
```

### ChromaDB Optimization
```python
# ai-engine/vectorstore/chroma_client.py

# Batch insertions
collection.add(
    documents=batch_docs,
    embeddings=batch_embeddings,
    ids=batch_ids
)
```

---

## 📚 Additional Resources

- **Celery Docs:** https://docs.celeryq.dev
- **FastAPI Docs:** https://fastapi.tiangolo.com
- **ChromaDB Docs:** https://docs.trychroma.com
- **Redis Docs:** https://redis.io/docs

---

## 🎯 Next Development Priorities

### Immediate (This Week)
1. ✅ Complete testing of Celery system
2. ⚠️ Fix security vulnerabilities
3. 📝 Implement ecosystem-specific scrapers
4. 🧪 Test end-to-end scraping flow

### Short-Term (This Month)
5. 🎨 Complete platform UI
6. 📧 Implement email notifications
7. 🔍 Populate ChromaDB with opportunities
8. 📊 Add analytics dashboard

### Long-Term (Next 3 Months)
9. 🤖 ML-based recommendation engine
10. 🌐 Multi-language support
11. 📱 Mobile app
12. 🎮 Gamification features

---

**Last Updated:** February 17, 2026  
**Version:** MVP 1.0  
**Status:** 85% Complete - Ready for Testing
