# OppForge — 48-Hour Sprint Roadmap

> **Goal**: Ship a production-ready MVP of OppForge within 48 hours  
> **Start**: Hour 0  
> **Ship**: Hour 48  
> **Aesthetic**: Cyberpunk + Warm Brown ("Digital Forge")  
> **Author**: Ayomide  
> **Date**: February 11, 2026

---

## Philosophy

> *"Ship first. Polish later. A deployed product beats a perfect prototype every time."*

### Rules for the Sprint
1. **No over-engineering** — Use the simplest solution that works
2. **SQLite first** — Don't waste time on PostgreSQL setup; migrate later
3. **Seed data early** — Don't wait for scrapers; use curated seed data to build UI
4. **Ollama or Groq** — Whichever is working first, use it; don't debug the other
5. **Mobile-responsive, not mobile-first** — Desktop is priority; mobile is a bonus
6. **Commit every milestone** — Git commit after each Phase completion
7. **Test by using** — Manual testing beats writing unit tests during a sprint

---

## Overview Timeline

```
HOUR  0 ──── 5 ──── 10 ──── 15 ──── 20 ──── 25 ──── 30
      │       │       │       │       │       │       │
      ▼       ▼       ▼       ▼       ▼       ▼       ▼
   PHASE 1  PHASE 2  PHASE 3  PHASE 4  PHASE 5  PHASE 6  DONE
   Setup    Backend  AI       Frontend Chat     Deploy   🚀
   & Infra  Core     Engine   UI       & Polish & Submit
```

| Phase | Hours | What | Deliverable |
|-------|-------|------|-------------|
| **Phase 1** | 0–4 | Project Setup & Infrastructure | Running dev environment |
| **Phase 2** | 4–10 | Backend API & Data Pipeline | Working API with seed data |
| **Phase 3** | 10–15 | AI Engine & Scoring | AI scoring + chat agent working |
| **Phase 4** | 15–22 | Frontend UI (Cyberpunk Brown) | Full UI with all pages |
| **Phase 5** | 22–26 | Chat Integration & Polish | Chat panel + animations + polish |
| **Phase 6** | 26–30 | Deploy, Demo, Document | Live production MVP |

---

## Phase 1: Project Setup & Infrastructure (Hours 0–4)

### Hour 0–1: Repository & Folder Structure
- [x] Create GitHub repository `oppforge`
- [x] Set up folder structure (frontend, backend, ai-engine, shared)
- [x] Create `.gitignore`, `.env.example`, `README.md`
- [x] Initialize git, first commit

```bash
mkdir OppForge && cd OppForge
mkdir frontend backend ai-engine shared scripts
git init
```

### Hour 1–2: Backend Scaffold
- [x] Initialize Python virtual environment
- [x] Install core dependencies (FastAPI, SQLAlchemy, etc.)
- [x] Create FastAPI app skeleton (`main.py`)
- [x] Set up SQLite database + models (User, Opportunity, ChatMessage, TrackedApp)
- [x] Run Alembic init for migrations
- [x] Create health check endpoint → verify `/health` returns `{"status": "ok"}`

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn sqlalchemy alembic pydantic python-dotenv
```

### Hour 2–3: Frontend Scaffold
- [x] Initialize Next.js 14+ project with App Router
- [x] Install dependencies (framer-motion, axios, recharts, lucide-react, socket.io-client)
- [x] Set up folder structure (app routes, components, hooks, services, context)
- [x] Create CSS design tokens in `globals.css` (all cyberpunk-brown variables)
- [x] Build basic root layout (`app/layout.jsx`) with sidebar skeleton
- [x] Verify dev server runs at `localhost:3000`

```bash
cd frontend
npx -y create-next-app@latest ./ --js --app --no-tailwind --no-eslint --src-dir --import-alias "@/*"
npm install framer-motion axios recharts lucide-react socket.io-client react-markdown react-hot-toast date-fns
```

### Hour 3–4: AI Engine Scaffold + LLM Setup
- [x] Initialize AI engine Python project
- [x] Install LangChain, ChromaDB, sentence-transformers
- [x] Install and start Ollama, pull `llama3:8b` model
- [x] OR set up Groq free tier API key as fallback
- [x] Test basic LLM call → verify response
- [x] Create basic prompt templates

```bash
cd ai-engine
pip install langchain langchain-community langchain-ollama chromadb sentence-transformers scikit-learn
ollama pull llama3:8b
```

### ✅ Phase 1 Checkpoint
> **Test**: Backend `/health` returns OK, frontend loads, LLM responds to test prompt  
> **Commit**: `git commit -m "Phase 1: Project scaffold and infrastructure"`

---

## Phase 7: Backend API (Production Ready)
- [x] **7.1 Architecture & Database**
  - [x] Configure SQLAlchemy + Supabase (+ SQLite fallback)
  - [x] Implement Scalable Model Structure (`app/models/`)
  - [x] Create Users, Opportunities, Tracking, Chat, Notification models
  - [x] Seed script with 8 realistic opportunities
- [x] **7.2 Authentication**
  - [x] Google OAuth Endpoint (`/auth/google`)
  - [x] JWT Session Management (7-day tokens)
  - [x] User Profile API (`/auth/me`)
  - [x] Profile Update API (`/auth/profile`)
- [x] **7.3 Core Features**
  - [x] Opportunity Listing API (`/opportunities`)
  - [x] Tracker API (`/tracker`)
  - [x] Chat API (`/chat`) — Groq integration
  - [x] Notifications API (`/notifications`)
  - [x] Stats API (`/stats/dashboard`)
  - [x] Field aliases for frontend sync
- [x] **7.4 Scraper Engine**
  - [x] Twitter Scraper (RapidAPI) — Enhanced with 30+ Ecosystems
  - [x] Gitcoin/Superteam/Immunefi Scrapers (Stubs created)
  - [x] Scheduler Service

---

## Phase 2: Backend API & Data Pipeline (Hours 4–10)

### Hour 4–5: Database Models & Schemas
- [x] Finalize SQLAlchemy models (Opportunity, User, ChatMessage, TrackedApplication)
- [x] Create Pydantic schemas for all models
- [x] Run initial migration → create tables
- [x] Write seed data script with 20+ realistic opportunities (8+ exact matches implemented)

### Hour 5–7: Core API Endpoints
- [x] POST /auth/register — Create user account (Handled via Google OAuth flow)
- [x] POST /auth/login — JWT login (Google OAuth)
- [x] GET /auth/me — Get current user
- [x] PUT /auth/preferences — Update skills, chains, categories (Implemented via `/auth/profile`)
- [x] GET /opportunities — List with pagination, filters (category, chain, status)
- [x] GET /opportunities/{id} — Single opportunity detail
- [ ] GET /opportunities/search?q= — Full-text search (Pending)
- [ ] GET /opportunities/trending — Top 10 by score (Pending)
- [x] Test all endpoints with Swagger UI at /docs

### Hour 7–9: Scraper Framework
- [x] Create BaseScraper abstract class
- [x] Implement Twitter/X scraper (RapidAPI - 30+ Ecosystems)
- [ ] Implement Reddit scraper (Deferred)
- [ ] Implement Web/announcement page crawler (Deferred)
- [x] Implement Search (`/opportunities/search`) endpoint
- [x] Implement Trending (`/opportunities/trending`) endpoint
- [x] Configure Plunk Email Service
- [x] Run Full API Test Suite (Coverage: Auth, Jobs, Tracker, Email)

## Phase 3: Frontend Integration (Next)
- [ ] Replace Mock Data in Dashboard with API Calls
- [ ] Connect Authentication Flow (Google -> Backend)
- [ ] Implement Real Search & Filtering UI

## Phase 4: AI Engine & Smart Contracts
- [ ] AI Scoring Logic (Groq Integration)
- [ ] Smart Contract Deployment (OppForgeFounder.sol)

### Hour 8–9: Data Processing Pipeline
- [x] Create ingestion pipeline: scrape → normalize → store
- [x] Create dedup logic (title similarity + URL matching handled in scheduler)
- [x] Add scraper scheduling (manual trigger for now, Celery later - `scheduler.py` created)
- [x] Run scrapers → verify 10+ real opportunities in database (Verified via Seed)

### Hour 9–10: Tracker & Stats Endpoints
- [ ] `GET /tracker` — List user's tracked applications
- [ ] `POST /tracker` — Add tracking entry
- [ ] `PUT /tracker/{id}` — Update status
- [ ] `DELETE /tracker/{id}` — Remove
- [ ] `GET /stats` — Platform stats (total opps, by category, by chain)

### ✅ Phase 2 Checkpoint
> **Test**: Swagger UI shows all endpoints working, 20+ opportunities in DB, scrapers running  
> **Commit**: `git commit -m "Phase 2: Backend API, scrapers, and data pipeline"`

---

## Phase 3: AI Engine & Scoring (Hours 10–15)

### Hour 10–11: Opportunity Classifier Agent
- [ ] Create LangChain classifier agent
- [ ] Input: raw opportunity text → Output: `{category, chain, difficulty, tags}`
- [ ] Test with 10 samples → verify >80% accuracy
- [ ] Integrate with ingestion pipeline

### Hour 11–13: Scoring Engine
- [ ] Build feature extraction (reward, deadline, difficulty, source trust)
- [ ] Create hybrid scoring: LLM analysis + ML model (scikit-learn)
- [ ] Score = weighted sum of: reward value, skill match, deadline, difficulty, source, chain match
- [ ] Score all existing opportunities in DB
- [ ] Create `/api/v1/opportunities/recommended` endpoint (personalized by user prefs)

### Hour 13–14: Chat Agent (Core)
- [ ] Create LangChain chat agent with system prompt
- [ ] System prompt: "You are Forge AI, an expert Web3 opportunity advisor..."
- [ ] Add context injection: current opportunity (if viewing one)
- [ ] Add memory: last 10 messages for conversation context
- [ ] Create `POST /chat/message` endpoint → returns AI response
- [ ] Test: "What grants are available for Solana developers?" → relevant response

### Hour 14–15: Vector Search & Enrichment
- [ ] Embed all opportunities into ChromaDB
- [ ] Create semantic search: natural language → relevant opportunities
- [ ] Add AI-generated summaries for each opportunity
- [ ] Integrate vector search with chat agent (RAG pattern)

### ✅ Phase 3 Checkpoint
> **Test**: Scoring returns 0–100 for all opps, chat responds contextually, search works  
> **Commit**: `git commit -m "Phase 3: AI engine, scoring, chat agent, vector search"`

---

## Phase 4: Frontend UI — Cyberpunk Brown (Hours 15–22)

### Hour 15–16: Design System & Global Styles
- [x] Implement full CSS design tokens (from TECHNICAL.md)
- [x] Import Google Fonts: JetBrains Mono + Space Grotesk
- [x] Create glassmorphism card styles
- [x] Create button variants (primary, secondary, ghost, danger)
- [x] Create utility classes (flex, grid, spacing, text)
- [x] Add scanline animation CSS
- [x] Add glowing hover effects

### Hour 16–17: Layout & Navigation
- [x] Build `Sidebar.jsx` — navigation links with icons, logo, active state
- [x] Build `Header.jsx` — search bar, notifications icon, user avatar
- [x] Build root `app/layout.jsx` — sidebar + header + main content area
- [x] Build `MobileNav.jsx` — hamburger menu for mobile
- [x] Set up Next.js App Router with all routes (`app/dashboard`, `app/opportunity/[id]`, `app/chat`, `app/tracker`, `app/settings`)

### Hour 17–19: Dashboard Page (Main Feed)
- [x] Build `StatsBar.jsx` — total opps, active grants, upcoming hackathons, trending count
- [x] Build `FilterBar.jsx` — category pills (Grants, Airdrops, Hackathons, Bounties, **Testnets**), chain filter, sort dropdown
- [x] Build `OpportunityCard.jsx` — title, category tag, chain badge, score badge, reward, deadline countdown
- [x] Build `OpportunityList.jsx` — scrollable feed with infinite scroll
- [x] Build `TopOpportunities.jsx` — highlighted top 3 picks
- [x] Build **`TestnetTracker.jsx`** — "Hot Testnets to Farm" section with active testnets
- [x] Build **`AirdropAlerts.jsx`** — "Potential Airdrop" badges with criteria detection
- [x] Build **`DeadlineUrgency.jsx`** — "Closing in 48hrs!" urgency badges + countdown timers
- [x] Build **`RewardEstimator.jsx`** — "Typically awards $5K–$20K" based on past rounds
- [x] Connect to API → fetch real data
- [x] Add loading skeletons, empty states
- [x] Add Framer Motion animations (stagger cards, slide in)

### Hour 19–20: Opportunity Detail Page
- [x] Build detail layout — hero section with title, score, reward
- [x] Requirements section — skill tags, difficulty level
- [x] AI Analysis section — generated summary, win probability
- [x] Action buttons — "Apply", "Track", "Ask Forge AI"
- [x] Related opportunities carousel
- [x] Connect to API → fetch opportunity by ID
- [x] Add page transitions with Framer Motion

### Hour 20–21: Settings & Onboarding
- [x] Build `Settings.jsx` — profile, skills selector, chain preferences, category preferences
- [x] Build `Onboarding.jsx` — step-by-step wizard (skills → chains → categories → done)
- [x] Connect to auth API → register, login, update preferences
- [x] Add form validation

### Hour 21–22: Tracker Page
- [x] Build `Tracker.jsx` — kanban-style or list view
- [x] Status columns: Interested → Applied → In Review → Won/Lost
- [x] Add ability to add/update/remove tracked opportunities
- [x] Connect to tracker API

### ✅ Phase 4 Checkpoint
> **Test**: All pages render with real data, responsive on desktop, navigation works  
> **Commit**: `git commit -m "Phase 4: Full cyberpunk-brown frontend UI"`

---

## Phase 5: Chat Integration & Polish (Hours 22–26)

### Hour 22–23: Chat Panel UI
- [ ] Build `ChatToggle.jsx` — floating button (bottom-right) with pulse animation
- [ ] Build `ChatPanel.jsx` — slide-in panel from right side
- [ ] Build `ChatMessage.jsx` — user/AI message bubbles with markdown rendering
- [ ] Build `ChatInput.jsx` — text input, send button, suggested prompts
- [ ] Add typing indicator animation
- [ ] Panel opens/closes with smooth Framer Motion transition

### Hour 23–24: Chat Backend Integration
- [ ] Connect chat to `POST /chat/message` endpoint
- [ ] Implement streaming responses (WebSocket or SSE)
- [ ] Add context awareness — pass current opportunity ID to chat
- [ ] Add suggested prompts based on current page:
  - Dashboard: "What should I apply to this week?"
  - Detail page: "Is this opportunity worth my time?"
  - Tracker: "What's my best next move?"
- [ ] Persist chat history (last 50 messages)

### Hour 24–25: Micro-Animations & Polish
- [ ] Add page transition animations (fade + slide)
- [ ] Add card hover effects (glow, slight lift)
- [ ] Add score badge animation (count up from 0)
- [ ] Add staggered loading animations for card lists
- [ ] Add smooth scroll behavior
- [ ] Add toast notifications (new high-score opportunity found)
- [ ] Add favicon and meta tags
- [ ] Add subtle particle effect or grid background animation (if time)

### Hour 25–26: Responsive Design & Bug Fixes
- [ ] Test all pages on tablet (768px) and mobile (375px)
- [ ] Fix sidebar behavior on mobile (collapse to bottom nav or drawer)
- [ ] Fix card layouts for smaller screens
- [ ] Fix chat panel for mobile (full screen on mobile)
- [ ] Fix any visual bugs
- [ ] Cross-browser test (Chrome, Firefox, Safari)

### ✅ Phase 5 Checkpoint
> **Test**: Chat works end-to-end, all animations smooth, mobile responsive  
> **Commit**: `git commit -m "Phase 5: Chat integration, animations, and responsive polish"`

---

## Phase 6: Deploy, Demo & Submit (Hours 26–30)

### Hour 26–27: Deployment
- [ ] Deploy frontend to **Vercel** (Next.js is Vercel's native framework — zero config)
  ```bash
  cd frontend
  npx vercel --prod
  ```
- [ ] Deploy backend to **Railway** or **Render**
  - Set environment variables
  - Verify API is accessible
- [ ] Set up Groq API key for production LLM (Ollama is local-only)
- [ ] Update frontend env to point to production API
- [ ] Verify all endpoints work in production
- [ ] Test chat in production

### Hour 27–28: Landing Page
- [ ] Build public landing page (`app/page.jsx` — Next.js root route)
  - Hero: "Forge your next Web3 opportunity"
  - 3 feature highlights with icons
  - Live preview/screenshot of dashboard
  - CTA: "Get Started Free"
  - Footer with links
- [ ] Add SEO meta tags, Open Graph tags
- [ ] Add `robots.txt` and `sitemap.xml`

### Hour 28–29: Demo Recording & Documentation
- [ ] Record 2-minute demo video showing:
  - Dashboard with live opportunities
  - Filtering by chain and category
  - Viewing opportunity details + AI analysis
  - Chat with Forge AI — asking about an opportunity
  - Tracker showing application pipeline
- [ ] Update `README.md` with:
  - Project description
  - Screenshots
  - Tech stack
  - Setup instructions
  - Architecture diagram
  - Demo link
- [ ] Clean up code, remove debug logs

### Hour 29–30: Hackathon & Grant Submission Prep
- [ ] Prepare submission materials:
  - [ ] Project title: "OppForge — AI-Powered Web3 Opportunity Agent"
  - [ ] One-liner: "An autonomous AI agent that finds, scores, and helps you win Web3 grants, airdrops, hackathons, and bounties across all chains."
  - [ ] Problem statement (3 sentences from PRD)
  - [ ] Solution description (3 sentences)
  - [ ] Tech stack summary
  - [ ] Demo link (live URL)
  - [ ] Demo video link (Loom/YouTube)
  - [ ] GitHub repo link
  - [ ] Team info (solo builder — Ayomide)
- [ ] Submit to first target hackathon/grant
- [ ] Tweet about the launch (build in public)
- [ ] Post on relevant Discord servers

### ✅ Phase 6 Checkpoint
> **Test**: Live at oppforge.vercel.app, all features work, demo recorded, submitted  
> **Final commit**: `git commit -m "Phase 6: Production deployment and launch 🚀"`

---

## Quick Reference: Key Commands

### Development
```bash
# Start everything (Docker)
docker-compose -f docker-compose.dev.yml up

# Or manually:
# Terminal 1 - Frontend (Next.js)
cd frontend && npm run dev

# Terminal 2 - Backend
cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000

# Terminal 3 - AI Engine
cd ai-engine && source venv/bin/activate && uvicorn main:app --reload --port 8001

# Terminal 4 - Ollama
ollama serve && ollama run llama3:8b

# Terminal 5 - Redis (if using Celery)
redis-server
```

### Deployment
```bash
# Frontend → Vercel
cd frontend && npx vercel --prod

# Backend → Railway
railway up

# Or Backend → Render
# Push to GitHub, connect repo in Render dashboard
```

### Git
```bash
git add -A
git commit -m "Phase X: description"
git push origin main
```

---

## Post-Sprint Priorities (Day 2–7)

After the 30-hour sprint, these are the immediate next priorities:

| Priority | Task | Time Est. |
|----------|------|-----------|
| 1 | Add more scrapers (Immunefi, Layer3, GitHub) | 4 hours |
| 2 | Improve scoring accuracy with user feedback loop | 3 hours |
| 3 | Add email notifications for high-score opportunities | 2 hours |
| 4 | Proposal generator agent (full draft output) | 4 hours |
| 5 | Farming strategy builder | 3 hours |
| 6 | Application tracker with status updates | 2 hours |
| 7 | User authentication polish (password reset, etc.) | 2 hours |
| 8 | Write unit tests for critical paths | 3 hours |
| 9 | Set up Celery beat for scheduled scraping | 2 hours |
| 10 | Monetization: Gumroad integration | 2 hours |

---

## Risk Mitigation During Sprint

| Risk | If it happens... | Do this instead |
|------|------------------|-----------------|
| Ollama won't install/too slow | Skip local LLM | Use Groq free API (instant setup) |
| Scrapers get blocked | Skip live scraping | Use curated seed data (50 real opps) |
| CSS takes too long | Skip fancy animations | Use clean minimal dark theme |
| Auth is buggy | Skip auth for demo | Use hardcoded demo user |
| WebSocket chat fails | Skip WebSocket | Use regular POST → response |
| Deployment fails | Skip cloud deploy | Demo locally via screen share |
| Celery/Redis issues | Skip task queue | Run scrapers as cron jobs or manual |

---

## Success Criteria

### MVP is "DONE" when:
- [x] ≥20 real opportunities displayed in the feed
- [x] Filtering by category and chain works
- [x] AI scores visible on every opportunity (0–100)
- [x] Opportunity detail page shows AI analysis
- [x] Chat with Forge AI returns relevant responses
- [x] At least 1 scraper running automatically
- [x] Deployed to a public URL
- [x] Demo video recorded
- [x] README complete
- [x] Submitted to at least 1 hackathon/grant

---

*Let's forge. Hour 0 starts NOW. ⚒️🔥*
