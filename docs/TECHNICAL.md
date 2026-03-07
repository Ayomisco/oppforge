# OppForge — Technical Reference

> **Updated**: March 7, 2026

---

## 1. Architecture

```
Internet (Twitter/X, Reddit, Blogs, APIs)
         │
         ▼
┌─────────────────────────────┐
│  DATA INGESTION LAYER        │
│  Celery Workers + Scrapers   │
│  20+ sources, runs on cron   │
└──────────────┬──────────────┘
               │ raw data
               ▼
┌─────────────────────────────┐
│  AI PROCESSING LAYER         │
│  Groq (Llama 3.1 8B Fast)   │
│  Classifier · Scorer ·       │
│  Chat Agent · Proposal Gen   │
│  LangChain + LangGraph       │
└──────────────┬──────────────┘
               │ scored + enriched
               ▼
┌─────────────────────────────┐
│  BACKEND API (FastAPI)       │
│  REST + Auth + Business      │
│  oppbackendapi.oppforge.xyz  │
└──────────────┬──────────────┘
               │ REST
               ▼
┌─────────────────────────────┐
│  FRONTEND (Next.js 14)       │
│  Dashboard · Tracker ·       │
│  Forge Workspace · Admin     │
│  app.oppforge.xyz            │
└─────────────────────────────┘

DATA STORES
  PostgreSQL (Aiven)   — primary DB
  Redis                — Celery broker + caching
  ChromaDB             — vector store (AI memory)
```

---

## 2. Services & Infra

| Service | Provider | URL / Notes |
|---|---|---|
| Frontend | Railway | app.oppforge.xyz |
| Backend API | Railway | oppbackendapi.oppforge.xyz |
| Database | Aiven PostgreSQL v16 | SSL required |
| Redis | Railway | Celery broker |
| AI Inference | Groq Cloud | Llama 3.1 8B Instant (free tier) |
| Auth | Google OAuth | `/auth/google` endpoint |
| Email | Plunk | Transactional + marketing |
| Twitter scraping | RapidAPI `twitter-api45` | ~100+ ecosystems scraped |
| Reddit | Reddit JSON API | Free public endpoints |
| Solana RPC | Helius | High-performance |
| EVM RPC | Alchemy | ETH Mainnet + Sepolia enabled |
| Smart Contracts | Hardhat + Etherscan | ETH Sepolia deployed, verified |

---

## 3. Backend — Key Modules

```
backend/app/
├── main.py              # FastAPI app + CORS
├── database.py          # SQLAlchemy engine + session
├── celery_config.py     # Celery + Redis config
├── routers/             # API routes (opportunities, tracker, auth, admin...)
├── models/              # SQLAlchemy ORM models
├── schemas/             # Pydantic request/response schemas
├── scrapers/            # 20+ scrapers (Twitter, Reddit, Gitcoin, Superteam...)
├── services/            # Business logic (AI scoring, notifications...)
├── tasks/               # Celery background tasks
└── utils/               # Helpers
```

---

## 4. Frontend — Key Routes

```
platform/src/app/
├── page.js                          # Landing page (website)
├── dashboard/
│   ├── page.js                      # Opportunity feed
│   ├── opportunity/[id]/page.js     # Opportunity detail
│   ├── tracker/page.js              # Kanban tracker board
│   ├── forge/workspace/[id]/page.js # Forge AI workspace (full chat + sections)
│   ├── profile/page.js              # User profile + preferences
│   └── admin/page.js                # Admin panel
└── auth/                            # Google OAuth flow
```

Key components:
- `KanbanBoard.jsx` — drag-friendly board with 3-dot dropdown (View / Forge / Move / Remove)
- `ForgeWorkspace` — AI workspace with sections canvas, auto-brief, PDF export
- `OpportunityCard` — feed card with save-to-tracker button
- `AIDrafterModal` — inline AI drafting from tracker

---

## 5. Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql://...          # Aiven PostgreSQL (SSL)
SECRET_KEY=...                          # JWT signing key
GROQ_API_KEY=...                        # AI inference
RAPIDAPI_KEY=...                        # Twitter/X scraping
PLUNK_API_KEY=...                       # Email
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
REDIS_URL=redis://...
FOUNDER_CONTRACT_ADDRESS=0xa092...      # ETH Sepolia
MISSION_CONTRACT_ADDRESS=0x654b...
PROTOCOL_CONTRACT_ADDRESS=0x5029...
```

### Platform (`platform/.env`)
```env
NEXT_PUBLIC_API_URL=https://oppbackendapi.oppforge.xyz
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXT_PUBLIC_FOUNDER_CONTRACT=0xa092...  # ETH Sepolia (when integration live)
NEXT_PUBLIC_MISSION_CONTRACT=0x654b...
NEXT_PUBLIC_PROTOCOL_CONTRACT=0x5029...
```

### Contracts (`contracts/.env`)
```env
PRIVATE_KEY=...
ALCHEMY_API_KEY=...
ETHERSCAN_API_KEY=...
ARBISCAN_API_KEY=...
REPORT_GAS=false
```

---

## 6. Celery (Background Jobs)

```bash
# Start worker (processes scrapers + AI tasks)
celery -A app.celery_config worker --loglevel=info

# Start beat (scheduler — runs scrapers on cron)
celery -A app.celery_config beat --loglevel=info

# Or use the start scripts
cd backend && bash start_celery_worker.sh
cd backend && bash start_celery_beat.sh
```

Scrapers run on a schedule. Each scraper class lives in `backend/app/scrapers/` and inherits from a base scraper. Results are deduplicated, AI-scored, and stored in PostgreSQL.

---

## 7. Database

- **Production**: Aiven PostgreSQL v16 (SSL required — `sslmode=require`)
- **Local dev**: SQLite (`oppforge.db`) via `DATABASE_URL=sqlite:///./oppforge.db`
- **Migrations**: handled via SQLAlchemy models + manual migration scripts in `app/scripts/`

Key tables: `users`, `opportunities`, `tracked_applications`, `chat_messages`, `notifications`

---

## 8. Smart Contracts

See [CONTRACTS.md](CONTRACTS.md) for full details.

**Live on ETH Sepolia (March 7, 2026)**:
- OppForgeFounder: `0xa0928440186C28062c964aeE496b38275e94aA8c`
- OppForgeMission: `0x654b689f316c5E2D1c6860d2446A73538B146722`
- OppForgeProtocol: `0x502973c5413167834d49078f214ee777a8C0A8Cf`
