# OppForge — Technical Architecture & Specification

> **Version**: 1.0  
> **Author**: Ayomide  
> **Date**: February 11, 2026  
> **Status**: Pre-Development

---

## 1. Architecture Overview

### System Design Philosophy
OppForge follows a **microservice-inspired monorepo** architecture — three independent services that communicate via REST APIs and shared message queues, all managed from a single repository for development speed.

### High-Level Architecture

```
                    ┌───────────────────────────┐
                    │       INTERNET             │
                     │  Twitter/X · Discord · Telegram │
                     │  Reddit · Blogs · APIs · Forums  │
                    └─────────┬─────────────────┘
                              │
              ┌───────────────┴────────────────┐
              │      DATA INGESTION LAYER       │
              │  Scrapers · Crawlers · Monitors  │
              │  (Celery Workers)                │
              └───────────────┬────────────────┘
                              │ Raw Data
                              ▼
              ┌───────────────────────────────────┐
              │      AI PROCESSING LAYER           │
              │                                    │
              │  ┌──────────┐  ┌───────────────┐  │
              │  │ Classifier│  │ Scoring Model │  │
              │  │ Agent     │  │ (scikit-learn)│  │
              │  └──────────┘  └───────────────┘  │
              │  ┌──────────┐  ┌───────────────┐  │
              │  │ Chat      │  │ Proposal      │  │
              │  │ Agent     │  │ Generator     │  │
              │  └──────────┘  └───────────────┘  │
              │  LangChain + LangGraph + Ollama    │
              └───────────────┬───────────────────┘
                              │ Processed Data
                              ▼
              ┌───────────────────────────────────┐
              │       BACKEND API LAYER            │
              │  FastAPI + WebSocket               │
              │  Auth · Routes · Business Logic    │
              └───────────────┬───────────────────┘
                              │ REST + WS
                              ▼
              ┌───────────────────────────────────┐
              │       FRONTEND LAYER               │
              │  Next.js 14+ (App Router)          │
              │  Cyberpunk Brown UI                 │
              │  Dashboard · Chat · Tracker         │
              └───────────────────────────────────┘

                    DATA STORES (Shared)
              ┌─────────┬──────────┬──────────┐
              │ SQLite/  │ ChromaDB │  Redis   │
              │ Postgres │ (Vectors)│ (Cache/Q)│
              └─────────┴──────────┴──────────┘
```

---

## 2. Directory Structure

```
OppForge/
│
├── frontend/                          # Next.js 14+ Frontend (App Router)
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── logo.svg
│   │   └── assets/
│   │       ├── fonts/
│   │       └── images/
│   ├── src/
│   │   ├── app/                       # Next.js App Router (file-based routing)
│   │   │   ├── layout.jsx             # Root layout (sidebar + header wrapper)
│   │   │   ├── globals.css            # Global styles + CSS variables
│   │   │   ├── page.jsx               # Landing page (/)
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   └── page.jsx           # Dashboard/feed (/dashboard)
│   │   │   │
│   │   │   ├── opportunity/
│   │   │   │   └── [id]/
│   │   │   │       └── page.jsx       # Opportunity detail (/opportunity/:id)
│   │   │   │
│   │   │   ├── chat/
│   │   │   │   └── page.jsx           # Full-page chat (/chat)
│   │   │   │
│   │   │   ├── tracker/
│   │   │   │   └── page.jsx           # Application tracker (/tracker)
│   │   │   │
│   │   │   ├── settings/
│   │   │   │   └── page.jsx           # User preferences (/settings)
│   │   │   │
│   │   │   └── onboarding/
│   │   │       └── page.jsx           # First-time setup (/onboarding)
│   │   │
│   │   ├── components/                # Reusable UI components
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx        # Main navigation sidebar
│   │   │   │   ├── Header.jsx         # Top bar with search + profile
│   │   │   │   ├── AppShell.jsx       # Sidebar + header + main content wrapper
│   │   │   │   └── MobileNav.jsx      # Mobile navigation
│   │   │   │
│   │   │   ├── opportunity/
│   │   │   │   ├── OpportunityCard.jsx    # Card in feed
│   │   │   │   ├── OpportunityList.jsx    # Scrollable feed
│   │   │   │   ├── OpportunityDetail.jsx  # Full detail view
│   │   │   │   ├── ScoreBadge.jsx         # Score visualization
│   │   │   │   ├── ChainBadge.jsx         # Chain indicator
│   │   │   │   └── CategoryTag.jsx        # Category pill
│   │   │   │
│   │   │   ├── chat/
│   │   │   │   ├── ChatPanel.jsx      # Main chat container
│   │   │   │   ├── ChatMessage.jsx    # Individual message bubble
│   │   │   │   ├── ChatInput.jsx      # Message input with actions
│   │   │   │   └── ChatToggle.jsx     # Floating chat button
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── StatsBar.jsx       # Key metrics bar
│   │   │   │   ├── TrendChart.jsx     # Opportunity trends
│   │   │   │   ├── TopOpportunities.jsx   # Highlighted picks
│   │   │   │   └── ActivityFeed.jsx   # Recent activity
│   │   │   │
│   │   │   ├── filters/
│   │   │   │   ├── FilterBar.jsx      # Main filter controls
│   │   │   │   ├── ChainFilter.jsx    # Chain selection
│   │   │   │   ├── CategoryFilter.jsx # Category selection
│   │   │   │   └── SortDropdown.jsx   # Sort options
│   │   │   │
│   │   │   └── common/
│   │   │       ├── Button.jsx
│   │   │       ├── Modal.jsx
│   │   │       ├── Loader.jsx
│   │   │       ├── Badge.jsx
│   │   │       ├── SearchBar.jsx
│   │   │       ├── Toast.jsx
│   │   │       └── EmptyState.jsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useOpportunities.js    # Fetch & manage opportunities
│   │   │   ├── useChat.js             # Chat state & WebSocket
│   │   │   ├── useFilters.js          # Filter state management
│   │   │   ├── useAuth.js             # Authentication state
│   │   │   ├── useWebSocket.js        # WebSocket connection
│   │   │   └── useLocalStorage.js     # Persistent local state
│   │   │
│   │   ├── services/
│   │   │   ├── api.js                 # Axios instance + interceptors
│   │   │   ├── opportunityService.js  # Opportunity API calls
│   │   │   ├── chatService.js         # Chat API calls
│   │   │   ├── authService.js         # Auth API calls
│   │   │   └── websocketService.js    # WebSocket manager
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx        # Auth provider
│   │   │   ├── ThemeContext.jsx       # Theme provider
│   │   │   └── FilterContext.jsx      # Global filter state
│   │   │
│   │   └── utils/
│   │       ├── constants.js           # App-wide constants
│   │       ├── formatters.js          # Date, number formatters
│   │       ├── chains.js              # Chain configs & icons
│   │       └── categories.js          # Category configs
│   │
│   ├── package.json
│   ├── next.config.mjs                # Next.js configuration
│   ├── jsconfig.json                  # Path aliases (@/*)
│   └── .env.local                     # Environment variables
│
├── backend/                           # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app entry point
│   │   ├── config.py                  # Environment & app config
│   │   │
│   │   ├── api/                       # API routes
│   │   │   ├── __init__.py
│   │   │   ├── routes/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── opportunities.py   # CRUD + search + filters
│   │   │   │   ├── chat.py            # Chat endpoints + WebSocket
│   │   │   │   ├── auth.py            # Login, register, profile
│   │   │   │   ├── tracker.py         # Application tracking
│   │   │   │   ├── preferences.py     # User preferences
│   │   │   │   └── health.py          # Health check
│   │   │   └── deps.py                # Shared dependencies
│   │   │
│   │   ├── models/                    # Database models (SQLAlchemy)
│   │   │   ├── __init__.py
│   │   │   ├── opportunity.py         # Opportunity model
│   │   │   ├── user.py                # User model
│   │   │   ├── chat.py                # Chat history model
│   │   │   ├── tracker.py             # Application tracker model
│   │   │   └── preference.py          # User preference model
│   │   │
│   │   ├── schemas/                   # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── opportunity.py
│   │   │   ├── user.py
│   │   │   ├── chat.py
│   │   │   └── tracker.py
│   │   │
│   │   ├── services/                  # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── opportunity_service.py
│   │   │   ├── chat_service.py
│   │   │   ├── auth_service.py
│   │   │   ├── tracker_service.py
│   │   │   ├── email_service.py       # Email notifications (SMTP)
│   │   │   └── notification_service.py
│   │   │
│   │   ├── scrapers/                  # Data collection modules
│   │   │   ├── __init__.py
│   │   │   ├── base_scraper.py        # Abstract base scraper
│   │   │   ├── twitter_scraper.py     # Twitter/X scraper (via RSS/Nitter)
│   │   │   ├── reddit_scraper.py      # Reddit API scanner
│   │   │   ├── web_scraper.py         # Announcement page / news portal crawler
│   │   │   ├── gitcoin_scraper.py     # Gitcoin grants
│   │   │   ├── superteam_scraper.py   # Superteam Earn
│   │   │   ├── immunefi_scraper.py    # Bug bounties
│   │   │   ├── layer3_scraper.py      # Layer3 quests
│   │   │   ├── blog_scraper.py        # Protocol blog crawler
│   │   │   └── rss_scraper.py         # RSS feed reader
│   │   │   # V2 (post-MVP):
│   │   │   # discord_scraper.py    # Discord bot monitor
│   │   │   # telegram_scraper.py   # Telegram channel monitor
│   │   │
│   │   ├── tasks/                     # Celery async tasks
│   │   │   ├── __init__.py
│   │   │   ├── scraping_tasks.py      # Scheduled scraping jobs
│   │   │   ├── scoring_tasks.py       # Batch scoring jobs
│   │   │   └── notification_tasks.py  # Send notifications
│   │   │
│   │   └── db/                        # Database utilities
│   │       ├── __init__.py
│   │       ├── database.py            # DB connection & session
│   │       ├── migrations/            # Alembic migrations
│   │       └── seed.py                # Seed data for development
│   │
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── ai-engine/                         # AI/ML Processing Engine
│   ├── __init__.py
│   ├── config.py                      # AI engine configuration
│   │
│   ├── agents/                        # LangChain/LangGraph agents
│   │   ├── __init__.py
│   │   ├── classifier_agent.py        # Classify opportunity type
│   │   ├── scoring_agent.py           # Score opportunities
│   │   ├── chat_agent.py              # Conversational AI assistant
│   │   ├── proposal_agent.py          # Generate proposal drafts
│   │   ├── strategy_agent.py          # Generate farming strategies
│   │   └── enrichment_agent.py        # Enrich raw data with context
│   │
│   ├── models/                        # ML models
│   │   ├── __init__.py
│   │   ├── scoring_model.py           # scikit-learn scoring model
│   │   ├── embeddings.py              # Sentence-Transformers
│   │   └── feature_extractor.py       # Feature engineering
│   │
│   ├── prompts/                       # Prompt templates
│   │   ├── classifier_prompt.py
│   │   ├── scorer_prompt.py
│   │   ├── chat_system_prompt.py
│   │   ├── proposal_prompt.py
│   │   └── strategy_prompt.py
│   │
│   ├── pipelines/                     # Data processing pipelines
│   │   ├── __init__.py
│   │   ├── ingestion_pipeline.py      # Raw data → structured data
│   │   ├── scoring_pipeline.py        # Structured → scored
│   │   ├── dedup_pipeline.py          # Deduplication logic
│   │   └── enrichment_pipeline.py     # Add chain/protocol metadata
│   │
│   ├── vectorstore/                   # Vector database management
│   │   ├── __init__.py
│   │   ├── chroma_client.py           # ChromaDB connection
│   │   └── embedder.py                # Document embedding
│   │
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── shared/                            # Shared utilities & configs
│   ├── constants.py                   # Shared constants
│   ├── chains.py                      # Chain configurations
│   ├── categories.py                  # Opportunity categories
│   └── types.py                       # Shared type definitions
│
├── scripts/                           # Utility scripts
│   ├── seed_data.py                   # Generate seed/test data
│   ├── run_scrapers.py                # Manual scraper trigger
│   └── setup.sh                       # One-command setup script
│
├── docker-compose.yml                 # Multi-service orchestration
├── docker-compose.dev.yml             # Development overrides
├── .env.example                       # Environment template
├── .gitignore
├── LICENSE
├── README.md
├── PRODUCT.md                         # Product Requirements Document
├── TECHNICAL.md                       # This document
└── ROADMAP.md                         # 30-Hour Build Roadmap
```

---

## 3. Technology Stack — Deep Dive

### 3.1 Frontend

#### Core Framework: Next.js 14+ (App Router)
- **Why Next.js**: File-based routing, React Server Components, built-in image/font optimization, seamless Vercel deployment, SEO-friendly SSR/SSG
- **App Router**: Uses the new `app/` directory with layouts, server components, and streaming
- **Version**: Next.js 14+ with React 18

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^10.16.0",
    "recharts": "^2.9.0",
    "axios": "^1.6.0",
    "socket.io-client": "^4.7.0",
    "react-markdown": "^9.0.0",
    "react-hot-toast": "^2.4.0",
    "date-fns": "^2.30.0",
    "lucide-react": "^0.292.0"
  }
}
```

#### Styling: Custom Cyberpunk-Brown CSS Design System

```css
/* Core Design Tokens */
:root {
  /* Base Browns (Forge/Wood/Leather) */
  --bg-primary: #0D0A07;           /* Near-black espresso */
  --bg-secondary: #1A1410;         /* Dark walnut */
  --bg-tertiary: #2C1810;          /* Deep mahogany */
  --bg-card: #1E1610;              /* Card background */
  --bg-hover: #342418;             /* Hover state */
  
  /* Accent Colors (Fire/Forge/Ember) */
  --accent-primary: #FF6B1A;       /* Forge orange */
  --accent-secondary: #FFD700;     /* Gold */
  --accent-tertiary: #FF9500;      /* Amber */
  --accent-glow: #FF6B1A33;        /* Soft orange glow */
  
  /* Cyber Accents */
  --cyber-cyan: #00E5FF;           /* Status/info */
  --cyber-green: #00FF88;          /* Success/online */
  --cyber-red: #FF3D3D;            /* Error/urgent */
  --cyber-purple: #B388FF;         /* Premium/special */
  
  /* Text */
  --text-primary: #F5E6D3;         /* Warm white */
  --text-secondary: #B8A594;       /* Muted warm */
  --text-tertiary: #7A6A5A;        /* Subtle */
  --text-accent: #FFD700;          /* Highlighted */
  
  /* Borders & Dividers */
  --border-primary: #3D2E22;       /* Subtle border */
  --border-accent: #FF6B1A44;      /* Glowing border */
  
  /* Shadows & Glows */
  --shadow-card: 0 4px 24px rgba(0,0,0,0.4);
  --glow-orange: 0 0 20px rgba(255,107,26,0.3);
  --glow-gold: 0 0 20px rgba(255,215,0,0.2);
  
  /* Typography */
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --font-sans: 'Space Grotesk', 'Inter', sans-serif;
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  
  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 400ms ease;
}
```

#### Key UI Effects
```css
/* Glassmorphism Card */
.card-glass {
  background: linear-gradient(135deg, 
    rgba(30, 22, 16, 0.8), 
    rgba(44, 24, 16, 0.4));
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
}

/* Scanline Effect (subtle background animation) */
.scanline::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(255,107,26,0.03) 2px,
    rgba(255,107,26,0.03) 4px
  );
  pointer-events: none;
  animation: scanline-move 8s linear infinite;
}

/* Glowing Border on Hover */
.card-glow:hover {
  border-color: var(--accent-primary);
  box-shadow: var(--glow-orange);
  transform: translateY(-2px);
  transition: all var(--transition-normal);
}

/* Neon Text Effect */
.text-neon {
  color: var(--accent-primary);
  text-shadow: 0 0 10px var(--accent-glow);
}
```

### 3.2 Authentication & Identity Layer

#### **Privy (Auth + Embedded Wallets)**
We utilize **Privy** to bridge Web2 UX with Web3 capabilities. 
-   **Frontend**: `@privy-io/react-auth` manages the login modal and session state.
-   **Backend**: `privy-python` (or custom JWT verifier) validates the `authToken` sent in headers.
-   **Wallet Strategy**: 
    -   **Embedded**: Created for users who login via Email/Socials.
    -   **External**: Metamask/Phantom for power users.
    -   **Cross-App**: Allow linking multiple wallets to one User ID (= single subscription).

### 3.3 Payment Infrastructure

#### **Crypto: Helio / Sphere**
-   **Integration**: Hosted checkout pages or embedded widgets.
-   **Flow**:
    1.  Frontend requests checkout URL from Backend.
    2.  User pays in USDC/SOL/ETH.
    3.  Helio sends webhook to `/api/webhooks/helio`.
    4.  Backend validates signature & upgrades user.

#### **Fiat: Stripe**
-   **Integration**: Standard Stripe Checkout.
-   **Webhook**: `/api/webhooks/stripe`.

---

### 3.4 Backend


#### Core Framework: FastAPI (Python 3.11+)
- **Why FastAPI**: Fastest Python framework, async by default, auto-generated OpenAPI docs, Pydantic validation
- **ASGI Server**: Uvicorn

```
# requirements.txt
fastapi==0.104.0
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
alembic==1.12.1
pydantic==2.5.0
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0      # JWT tokens
passlib[bcrypt]==1.7.4                 # Password hashing
python-multipart==0.0.6               # Form data
httpx==0.25.1                          # Async HTTP client
celery==5.3.4                          # Task queue
redis==5.0.1                           # Redis client
beautifulsoup4==4.12.2                 # HTML parsing
playwright==1.40.0                     # Browser automation
feedparser==6.0.11                     # RSS parsing
python-dotenv==1.0.0                   # Environment variables
websockets==12.0                       # WebSocket support
aiosqlite==0.19.0                      # Async SQLite
```

#### API Design

```
Base URL: /api/v1

# Auth
POST   /auth/register              # Create account
POST   /auth/login                  # Login → JWT
GET    /auth/me                     # Current user profile
PUT    /auth/preferences            # Update preferences

# Opportunities
GET    /opportunities               # List (paginated, filtered, sorted)
GET    /opportunities/{id}          # Detail
GET    /opportunities/search        # Full-text search
GET    /opportunities/trending      # Top trending right now
GET    /opportunities/recommended   # Personalized recommendations

# Chat
POST   /chat/message                # Send message → AI response
GET    /chat/history                # Chat history
WS     /ws/chat                     # WebSocket for real-time chat

# Tracker
GET    /tracker                     # All tracked applications
POST   /tracker                     # Add new tracking entry
PUT    /tracker/{id}                # Update status
DELETE /tracker/{id}                # Remove

# System
GET    /health                      # Health check
GET    /stats                       # Platform stats
```

#### Database Schema

```sql
-- Users
CREATE TABLE users (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email           TEXT UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    display_name    TEXT,
    skills          JSON DEFAULT '[]',        -- ["rust", "solidity", "python"]
    preferred_chains JSON DEFAULT '[]',       -- ["solana", "ethereum", "arbitrum"]
    preferred_categories JSON DEFAULT '[]',   -- ["grants", "airdrops", "hackathons"]
    experience_level TEXT DEFAULT 'intermediate',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Opportunities
CREATE TABLE opportunities (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    title           TEXT NOT NULL,
    description     TEXT,
    category        TEXT NOT NULL,            -- grant, airdrop, hackathon, bounty, ecosystem
    chain           TEXT,                      -- solana, ethereum, arbitrum, base, multi
    protocol        TEXT,                      -- Protocol/project name
    reward_min      REAL,
    reward_max      REAL,
    reward_currency TEXT DEFAULT 'USD',
    deadline        DATETIME,
    url             TEXT,
    source          TEXT,                      -- Where we found it
    source_url      TEXT,
    requirements    JSON DEFAULT '[]',
    tags            JSON DEFAULT '[]',
    difficulty      TEXT DEFAULT 'medium',     -- easy, medium, hard, expert
    status          TEXT DEFAULT 'active',     -- active, closing_soon, closed, upcoming
    ai_score        REAL DEFAULT 0,            -- 0-100
    ai_analysis     TEXT,                      -- AI-generated analysis
    ai_summary      TEXT,                      -- Short AI summary
    raw_data        JSON,                      -- Original scraped data
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Chat History
CREATE TABLE chat_messages (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id         TEXT NOT NULL REFERENCES users(id),
    role            TEXT NOT NULL,             -- user, assistant
    content         TEXT NOT NULL,
    context         JSON,                      -- {opportunity_id, page, etc.}
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Application Tracker
CREATE TABLE tracked_applications (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id         TEXT NOT NULL REFERENCES users(id),
    opportunity_id  TEXT REFERENCES opportunities(id),
    status          TEXT DEFAULT 'interested', -- interested, applied, in_review, won, lost
    notes           TEXT,
    applied_at      DATETIME,
    result_at       DATETIME,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_opps_category ON opportunities(category);
CREATE INDEX idx_opps_chain ON opportunities(chain);
CREATE INDEX idx_opps_status ON opportunities(status);
CREATE INDEX idx_opps_deadline ON opportunities(deadline);
CREATE INDEX idx_opps_score ON opportunities(ai_score DESC);
CREATE INDEX idx_chat_user ON chat_messages(user_id, created_at DESC);
CREATE INDEX idx_tracker_user ON tracked_applications(user_id);
```

### 3.3 AI Engine

#### LLM Strategy: Ollama (Local) + Free API Fallback

```python
# Primary: Ollama running locally (FREE)
# Models: llama3:8b (fast) or llama3:70b (accurate) or mistral:7b (balanced)
# Fallback: Groq API (free tier: 30 req/min with Llama 3)

OLLAMA_CONFIG = {
    "base_url": "http://localhost:11434",
    "model": "llama3:8b",              # 8B param for speed
    "model_accurate": "llama3:70b",     # 70B for proposals (if GPU allows)
    "temperature": 0.3,                 # Low for factual tasks
    "temperature_creative": 0.7,        # Higher for proposals
}

GROQ_FALLBACK = {
    "api_key": "free-tier-key",
    "model": "llama3-8b-8192",
    "base_url": "https://api.groq.com/openai/v1",
}
```

#### Agent Architecture (LangGraph)

```
                    ┌─────────────┐
                    │  User Input  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Router     │──── Classify intent
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
    ┌──────────────┐ ┌───────────┐ ┌───────────────┐
    │ Chat Agent    │ │ Proposal  │ │ Strategy      │
    │               │ │ Agent     │ │ Agent         │
    │ General Q&A,  │ │ Drafts    │ │ Farming plans │
    │ Opp analysis  │ │ proposals │ │ step-by-step  │
    └──────────────┘ └───────────┘ └───────────────┘
            │              │              │
            └──────────────┼──────────────┘
                           ▼
                    ┌──────────────┐
                    │  Response     │
                    │  + Sources    │
                    └──────────────┘
```

#### Scoring Algorithm

```python
# Opportunity Score = Weighted sum of factors (0-100)

SCORING_WEIGHTS = {
    "reward_value":       0.20,   # Higher rewards = higher score
    "skill_match":        0.25,   # How well it matches user skills
    "deadline_proximity": 0.10,   # Urgency (closer = higher)
    "difficulty_match":   0.15,   # Appropriate for user level
    "competition_level":  0.10,   # Lower competition = higher score
    "source_reliability": 0.10,   # Verified sources score higher
    "chain_preference":   0.10,   # Matches preferred chains
}

# Feature extraction for ML scoring
features = [
    "reward_usd_normalized",      # 0-1 (normalized reward value)
    "days_until_deadline",        # 0-1 (closer = higher)
    "skill_overlap_ratio",        # 0-1 (matched skills / required skills)
    "difficulty_numeric",         # 1-5 (easy to expert)
    "source_trust_score",         # 0-1 (Gitcoin=1.0, random blog=0.3)
    "chain_preference_match",     # 0/1 (matches user preference)
    "category_preference_match",  # 0/1 (matches user preference)
    "historical_win_rate",        # 0-1 (similar opportunities)
    "text_quality_score",         # 0-1 (how well-written the listing is)
    "protocol_maturity",          # 0-1 (TVL, age, community size)
]
```

#### Vector Search (ChromaDB)

```python
# Use Sentence-Transformers for embedding + ChromaDB for storage

EMBEDDING_MODEL = "all-MiniLM-L6-v2"  # Fast, 384-dim, free
COLLECTION_NAME = "opportunities"

# Use cases:
# 1. Semantic search: "Find grants for building developer tools on Solana"
# 2. Deduplication: Find and merge duplicate opportunities
# 3. Similarity: "Show me opportunities similar to this one"
# 4. Context for chat: Retrieve relevant opportunities for AI responses
```

### 3.4 Data Pipeline

#### Scraping Sources & Methods

| # | Source | Method | Frequency | Data Type |
|---|--------|--------|-----------|-----------|
| 1 | **Gitcoin** | API + scraping | Every 6 hours | Grants |
| 2 | **Superteam Earn** | API scraping | Every 6 hours | Bounties, Grants |
| 3 | **Layer3** | API scraping | Every 6 hours | Quests, Bounties |
| 4 | **Immunefi** | Page scraping | Every 12 hours | Bug Bounties |
| 5 | **Twitter/X** | Keyword monitoring | Every 1 hour | All types |
| 6 | **Protocol Blogs** | RSS + scraping | Every 12 hours | Grants, Ecosystem |
| 7 | **Snapshot** | GraphQL API | Every 6 hours | Governance |
| 8 | **GitHub** | API | Every 12 hours | Hackathons, Bounties |
| 9 | **DefiLlama** | API | Every 24 hours | Ecosystem data |
| 10 | **Discord** (future) | Bot | Real-time | All types |

#### Data Pipeline Flow

```
Raw HTML/JSON → Parse & Extract → Normalize Schema → Classify
    → Score → Deduplicate → Embed → Store → Index → Serve
```

```python
# Pipeline stages
class PipelineStage:
    INGEST    = "ingest"      # Scrape raw data
    PARSE     = "parse"       # Extract structured fields
    NORMALIZE = "normalize"   # Normalize to standard schema
    CLASSIFY  = "classify"    # AI classifies category/chain
    SCORE     = "score"       # AI + ML scores 0-100
    DEDUP     = "dedup"       # Find and merge duplicates
    EMBED     = "embed"       # Create vector embeddings
    STORE     = "store"       # Save to database
    INDEX     = "index"       # Update search index
    NOTIFY    = "notify"      # Alert users of new high-score opps
```

### 3.5 Infrastructure

#### Docker Compose Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite:///./data/oppforge.db
      - REDIS_URL=redis://redis:6379/0
      - AI_ENGINE_URL=http://ai-engine:8001
      - OLLAMA_HOST=http://ollama:11434
    volumes:
      - ./data:/app/data
    depends_on:
      - redis
      - ollama

  ai-engine:
    build: ./ai-engine
    ports:
      - "8001:8001"
    environment:
      - OLLAMA_HOST=http://ollama:11434
      - CHROMA_PATH=/app/data/chromadb
    volumes:
      - ./data:/app/data
    depends_on:
      - ollama

  celery-worker:
    build: ./backend
    command: celery -A app.tasks worker -l info
    environment:
      - REDIS_URL=redis://redis:6379/0
      - DATABASE_URL=sqlite:///./data/oppforge.db
    volumes:
      - ./data:/app/data
    depends_on:
      - redis
      - backend

  celery-beat:
    build: ./backend
    command: celery -A app.tasks beat -l info
    environment:
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - redis
      - celery-worker

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama-data:/root/.ollama

volumes:
  ollama-data:
```

#### Deployment Strategy (Free Tier)

| Service | Platform | Free Tier Limits |
|---------|----------|-----------------|
| Frontend | Vercel | 100GB bandwidth, unlimited deploys |
| Backend | Railway or Render | 500 hrs/month, 512MB RAM |
| Database | SQLite (file) → Supabase free | 500MB, 50K rows |
| Redis | Upstash | 10K commands/day |
| AI/LLM | Groq free tier (cloud) | 30 req/min, 14.4K tokens/min |
| Vector DB | ChromaDB (embedded) | Unlimited (file-based) |
| CI/CD | GitHub Actions | 2,000 min/month |
| Domain | Vercel (free subdomain) | oppforge.vercel.app |

---

## 4. Security Considerations

| Area | Implementation |
|------|----------------|
| **Auth** | JWT tokens with httpOnly cookies, bcrypt password hashing |
| **API** | Rate limiting (60 req/min), input validation via Pydantic |
| **CORS** | Whitelist frontend origin only |
| **Data** | No private keys stored, no wallet connections in MVP |
| **Scraping** | Respectful rate limiting, robots.txt compliance |
| **Environment** | All secrets in `.env`, never committed to git |
| **Dependencies** | Regular audit with `pip-audit` and `npm audit` |

---

## 5. Performance Targets

| Metric | Target | How |
|--------|--------|-----|
| Initial page load | < 2s | Vite code splitting, lazy loading |
| API response | < 200ms | FastAPI async, DB indexing |
| Opportunity feed load | < 500ms | Paginated (20 per page), cached |
| Chat response | < 3s | Streaming via WebSocket |
| Scraping cycle | < 5 min | Async scrapers, Celery parallelism |
| Search results | < 300ms | SQLite FTS5 + ChromaDB hybrid |

---

## 6. Development Workflow

### Local Development
```bash
# 1. Clone & setup
git clone https://github.com/ayomide/oppforge.git
cd OppForge
cp .env.example .env

# 2. Start all services
docker-compose -f docker-compose.dev.yml up

# 3. Or run individually:
# Terminal 1: Frontend
cd frontend && npm install && npm run dev

# Terminal 2: Backend
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload

# Terminal 3: AI Engine
cd ai-engine && pip install -r requirements.txt && uvicorn main:app --port 8001 --reload

# Terminal 4: Celery worker
cd backend && celery -A app.tasks worker -l info

# Terminal 5: Redis
redis-server

# Terminal 6: Ollama
ollama serve
ollama pull llama3:8b
```

### Git Workflow
```
main          ← Production (protected)
├── develop   ← Integration branch
│   ├── feature/opportunity-feed
│   ├── feature/chat-panel
│   ├── feature/scoring-engine
│   └── fix/scraper-timeout
```

---

## 7. Testing Strategy

### Backend Tests
```bash
# Unit tests (pytest)
pytest tests/unit/ -v

# Integration tests
pytest tests/integration/ -v

# API tests
pytest tests/api/ -v

# Coverage
pytest --cov=app tests/
```

### Frontend Tests
```bash
# Component tests (Jest + React Testing Library)
npm run test

# E2E tests (Playwright — future)
npx playwright test
```

### AI Engine Tests
```bash
# Agent tests
pytest tests/agents/ -v

# Pipeline tests
pytest tests/pipelines/ -v

# Scoring accuracy tests
pytest tests/scoring/ -v
```

---

## 8. Monitoring & Observability

| Tool | Purpose | Cost |
|------|---------|------|
| **Sentry** (free tier) | Error tracking | Free (5K events/month) |
| **Vercel Analytics** | Frontend performance | Free |
| **Uptime Robot** | Uptime monitoring | Free (50 monitors) |
| **Custom `/health`** | Backend health check | Free |
| **Celery Flower** | Task queue monitoring | Free |

---

## 9. Environment Variables

```bash
# .env.example

# Backend
DATABASE_URL=sqlite:///./data/oppforge.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Redis
REDIS_URL=redis://localhost:6379/0

# AI Engine
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3:8b
GROQ_API_KEY=your-groq-key        # Free tier fallback
CHROMA_PATH=./data/chromadb

# Scraping
TWITTER_BEARER_TOKEN=              # Optional
GITHUB_TOKEN=                      # Optional (higher rate limits)

# Frontend (Next.js uses NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws

# Deployment
VERCEL_TOKEN=                      # For CI/CD
RAILWAY_TOKEN=                     # For CI/CD
```

---

*This technical specification serves as the engineering blueprint for OppForge. All implementation decisions should reference this document.*
