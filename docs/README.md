# OppForge Documentation Index

Welcome to the OppForge documentation! This guide will help you navigate all technical documentation, setup guides, and reference materials.

---

## 📖 Table of Contents

### Getting Started
1. [Quick Start Guide](#quick-start)
2. [Installation & Setup](#installation-setup)
3. [Configuration](#configuration)

### Architecture & Technical Docs
4. [System Architecture](TECHNICAL.md)
5. [Product Overview](PRODUCT.md)
6. [Services Documentation](SERVICES.md)

### Development Guides
7. [Next Steps & Testing](NEXT_STEPS.md)
8. [Celery Setup Guide](CELERY_SETUP.md)
9. [Frontend Integration](FRONTEND_INTEGRATION.md)

### Deployment
10. [Deployment Guide](deployment.md)
11. [Multi-Repo Setup](setup-repos.sh)

### Project Planning
12. [Roadmap](ROADMAP.md)
13. [Grant Strategy](GRANT_STRATEGY.md)
14. [Critical Advantages](CRITICAL_ADVANTAGE.md)

### Development History
15. [Phase 3 Complete](PHASE_3_COMPLETE.md)
16. [Phase 4 Walkthrough](PHASE_4_WALKTHROUGH.md)
17. [Platform Walkthrough](WALKTHROUGH.md)
18. [Codebase Audit V2](CODEBASE_AUDIT_V2.md)

---

## 🚀 Quick Start

### Start All Services
```bash
cd /Users/ayomisco/Documents/Main/Builds/AI\ PROJECTS/OppForge
./start-all.sh
```

This starts:
- ✅ Redis (port 6379)
- ✅ Backend API (port 8000)
- ✅ AI Engine (port 8001)
- ✅ Celery Worker (background)
- ✅ Celery Beat (scheduler)

### Verify Everything Works
```bash
# Backend health
curl http://localhost:8000/health

# AI Engine health
curl http://localhost:8001/health

# Redis
redis-cli ping
```

### Stop All Services
```bash
./stop-all.sh
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.11+
- PostgreSQL (or Aiven managed instance)
- Redis
- Node.js 18+ (for frontend)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Run migrations
python app/scripts/add_risk_fields.py

# Seed ecosystems
python -m app.scripts.add_remaining_ecosystems

# Start server
uvicorn app.main:app --reload --port 8000
```

### AI Engine Setup
```bash
cd ai-engine
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Start server
uvicorn main:app --host 0.0.0.0 --port 8001
```

### Frontend Setup
```bash
# Website
cd website
npm install
npm run dev  # Port 3000

# Platform
cd platform
npm install
npm run dev  # Port 3001
```

### Redis Setup
```bash
# macOS
brew install redis
redis-server --daemonize yes

# Ubuntu
sudo apt install redis-server
sudo systemctl start redis
```

### Celery Setup
See [CELERY_SETUP.md](CELERY_SETUP.md) for detailed configuration.

```bash
cd backend
source venv/bin/activate

# Start worker
celery -A app.celery_config.celery_app worker --loglevel=info

# Start beat scheduler
celery -A app.celery_config.celery_app beat --loglevel=info

# Start Flower monitoring (optional)
celery -A app.celery_config.celery_app flower --port=5555
```

---

## ⚙️ Configuration

### Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/dbname

# AI
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile

# Redis
REDIS_URL=redis://localhost:6379/0

# Authentication
SECRET_KEY=your-secret-key-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key

# Email
PLUNK_SECRET_KEY=sk_...

# External APIs
RAPIDAPI_KEY=your-rapidapi-key
```

#### AI Engine
The AI Engine shares the backend `.env` file automatically.

---

## 🏗️ Architecture Overview

```
Frontend (Next.js)
    ↓
Backend API (FastAPI :8000)
    ├─ PostgreSQL Database
    ├─ ChromaDB Vector Store
    └─ Redis Cache/Queue
         ↓
    Celery Workers
    ├─ Scraping Queue → Web Scrapers
    ├─ AI Queue → AI Engine (:8001)
    └─ Notification Queue → Email Service
```

For detailed architecture, see [TECHNICAL.md](TECHNICAL.md)

---

## 📊 Key Features

### AI Engine (Port 8001)
- **Scoring Agent**: Match scoring (0-100)
- **Chat Agent**: Strategic advice
- **Risk Agent**: Scam detection
- **Classifier Agent**: Data extraction
- **Semantic Search**: ChromaDB-powered

### Automated Scraping
- **114 Ecosystems** across 3 tiers
- **Platform Scrapers**:
  - DoraHacks
  - Questbook
  - HackQuest
  - Superteam
  - Devpost
  - Devfolio
  - Gitcoin
- **Social Scrapers**: Twitter, Reddit
- **Scheduled Tasks**: Tier-based frequency

### Risk Engine
- Real-time risk assessment
- Scam detection algorithms
- Source credibility analysis
- Trust score calculation

---

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd backend
pytest

# AI Engine tests
cd ai-engine
python -m pytest

# Integration tests
python tests/integration/test_full_flow.py
```

### Manual Testing
See [NEXT_STEPS.md](NEXT_STEPS.md) for comprehensive testing checklist.

---

## 🚢 Deployment

### Production Checklist
- [ ] Rotate all API keys
- [ ] Generate strong SECRET_KEY
- [ ] Add rate limiting
- [ ] Restrict CORS origins
- [ ] Setup HTTPS
- [ ] Configure monitoring (Sentry, Prometheus)
- [ ] Setup backups
- [ ] Configure CDN (Cloudflare)

See [deployment.md](deployment.md) for full guide.

---

## 📚 API Documentation

### Backend API
- **OpenAPI Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### AI Engine API
- **OpenAPI Docs**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

---

## 🔧 Development Tools

### Database Management
```bash
# Connect to PostgreSQL
psql $DATABASE_URL

# Check ecosystem count
python -c "from app.database import SessionLocal; from app.models.ecosystem import Ecosystem; db = SessionLocal(); print(db.query(Ecosystem).count()); db.close()"

# Check opportunities
python -c "from app.database import SessionLocal; from app.models.opportunity import Opportunity; db = SessionLocal(); print(db.query(Opportunity).count()); db.close()"
```

### Celery Monitoring
```bash
# Flower dashboard
celery -A app.celery_config.celery_app flower --port=5555
# Visit http://localhost:5555

# Check queue lengths
redis-cli
LLEN scraping
LLEN ai_processing
LLEN notifications
```

### Logs
```bash
# Backend
tail -f backend/logs/backend.log

# AI Engine
tail -f ai-engine/logs/ai-engine.log

# Celery Worker
tail -f backend/logs/celery-worker.log

# Celery Beat
tail -f backend/logs/celery-beat.log
```

---

## 🤝 Contributing

### Code Style
- Python: PEP 8, Black formatter
- TypeScript: ESLint + Prettier
- Commits: Conventional Commits

### Pull Request Process
1. Create feature branch
2. Write tests
3. Update documentation
4. Submit PR with description
5. Wait for CI to pass
6. Request review

---

## 📞 Support & Resources

### Documentation
- [Technical Docs](TECHNICAL.md)
- [Product Docs](PRODUCT.md)
- [Services Guide](SERVICES.md)

### External Resources
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [Celery Docs](https://docs.celeryq.dev)
- [ChromaDB Docs](https://docs.trychroma.com)
- [Next.js Docs](https://nextjs.org/docs)

### Community
- GitHub Issues: Report bugs
- Discussions: Ask questions
- Discord: Real-time chat (coming soon)

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📈 Project Status

**Current Version**: MVP 1.0  
**Status**: 85% Complete - Ready for Testing  
**Last Updated**: February 17, 2026

### Metrics
- **Ecosystems**: 114 (Tier 1: 30, Tier 2: 33, Tier 3: 51)
- **Scrapers**: 7 platforms + Twitter + Reddit
- **AI Agents**: 4 (Scoring, Chat, Risk, Classifier)
- **API Endpoints**: 50+
- **Database Tables**: 8

---

**For detailed next steps and testing guide, see [NEXT_STEPS.md](NEXT_STEPS.md)**
