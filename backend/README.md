# OppForge Backend

FastAPI backend for OppForge — REST API, authentication, data scrapers, and WebSocket support.

## Tech Stack

- **Framework**: FastAPI (Python 3.11+)
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic
- **Auth**: JWT (python-jose) + bcrypt
- **Task Queue**: Celery + Redis
- **Scraping**: BeautifulSoup, Playwright
- **Server**: Uvicorn (ASGI)

## Getting Started

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env

# Run migrations
alembic upgrade head

# Seed data (optional)
python -m app.db.seed

# Start server
uvicorn app.main:app --reload --port 8000
```

API docs available at [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI).

## Project Structure

```
app/
├── main.py              # FastAPI app entry point
├── config.py            # Environment & app config
├── api/
│   ├── routes/
│   │   ├── auth.py          # Register, login, profile
│   │   ├── opportunities.py # CRUD, search, filters
│   │   ├── chat.py          # Chat endpoints + WebSocket
│   │   ├── tracker.py       # Application tracker
│   │   ├── preferences.py   # User preferences
│   │   └── health.py        # Health check
│   └── deps.py              # Shared dependencies
├── models/              # SQLAlchemy database models
├── schemas/             # Pydantic validation schemas
├── services/            # Business logic layer
├── scrapers/            # Data source scrapers
├── tasks/               # Celery async tasks
└── db/
    ├── database.py      # DB connection & session
    ├── migrations/      # Alembic migrations
    └── seed.py          # Development seed data
```

## API Endpoints

```
POST   /api/v1/auth/register          # Create account
POST   /api/v1/auth/login             # Login → JWT
GET    /api/v1/auth/me                # Current user
PUT    /api/v1/auth/preferences       # Update preferences

GET    /api/v1/opportunities          # List (paginated, filtered)
GET    /api/v1/opportunities/{id}     # Detail
GET    /api/v1/opportunities/search   # Full-text search
GET    /api/v1/opportunities/trending # Top by score

POST   /api/v1/chat/message           # Chat → AI response
GET    /api/v1/chat/history           # Chat history
WS     /ws/chat                       # WebSocket chat

GET    /api/v1/tracker                # List tracked apps
POST   /api/v1/tracker                # Add tracking
PUT    /api/v1/tracker/{id}           # Update status
DELETE /api/v1/tracker/{id}           # Remove

GET    /api/v1/health                 # Health check
```

## Environment Variables

```bash
DATABASE_URL=sqlite:///./data/oppforge.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
REDIS_URL=redis://localhost:6379/0
AI_ENGINE_URL=http://localhost:8001
```
