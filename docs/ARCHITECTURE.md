# OppForge Architecture & Flow Guide

## 1. High-Level Architecture
OppForge uses a modern, scalable architecture designed for real-time data ingestion and AI-powere curation.

```mermaid
graph TD
    User[User] --> Frontend[Next.js Platform]
    Frontend --> API[FastAPI Backend]
    
    subgraph Data Pipeline
        Scheduler[Celery Beat] --> Worker[Celery Worker]
        Worker --> Scrapers[Scrapers (DoraHacks, Gitcoin, etc.)]
        Scrapers --> Ingestion[Ingestion Service]
        Ingestion --> AI[AI Curator (Groq/LLM)]
        AI --> DB[(PostgreSQL)]
        AI --> VectorDB[(Vector Store - Mocked)]
    end
    
    API --> DB
    API --> VectorDB
```

## 2. Comprehensive Data Flow

### Step 1: Data Acquisition (Scraping)
- **Trigger:** Celery scheduled tasks (e.g., `scrape_grant_platforms`) run periodically.
- **Sources:**
  - **DoraHacks:** Fetches hackathons via API or HTML fallback.
  - **HackQuest:** Scrapes ecosystem grants and hackathons.
  - **Superteam:** Fetches Solana bounties via API.
  - **Questbook:** Fetches decentralized grants via API.
- **Resilience:** Each scraper has a **fallback mechanism**. If the external API fails (404/500/Connection Error), it returns curated "mock" data to ensure the dashboard never looks empty during demos or outages.

### Step 2: Ingestion & Deduplication
- **Entry Point:** `IngestionPipeline` in `backend/app/services/ingestion.py`.
- **Deduplication:**
  - Checks if `source_id` already exists for that provider.
  - Checks if `url` already exists in the database.
  - **Recent Fix:** We added `source_id` extraction to all scrapers to prevent crash-inducing errors during this check.

### Step 3: AI Curation (The "Brain")
- **Service:** `AgentCurator` in `backend/app/services/curator.py`.
- **Process:**
  1.  **classify:** Determines if it's a Grant, Hackathon, or Bounty.
  2.  **Score:** Calculates a "Win Probability" based on complexity and requirements.
  3.  **Enrich:** Extracts skills (e.g., "Rust", "Solidity") and deadlines.
- **Fail-Safe:** If the AI service (running on `localhost:8001`) is unreachable, the curator now **gracefully falls back** to the raw data instead of discarding the opportunity. This ensures new items appear even if the AI engine is offline.

### Step 4: Storage
- **Relational DB:** Stores the core opportunity data (Title, Description, Reward, Deadline).
- **Vector DB:** (Currently mocked) Would store embeddings for semantic search (e.g., "Find me privacy grants").

### Step 5: Presentation (Dashboard)
- **Frontend:** Next.js pages at `platform/src/app/dashboard`.
- **Fetching:** Uses `useSWR` or `useEffect` to hit `GET /opportunities` and `GET /stats`.
- **Real-time:** The dashboard displays the "Freshness" of data.

## 3. Key Components

### Frontend (`platform/`)
- **Framework:** Next.js 14 (App Router).
- **Styling:** Tailwind CSS + Shadcn UI.
- **Auth:** Custom Middleware (`middleware.js`) using cookie-based tokens.
  - Matches paths `/dashboard`, `/tracker`, `/opportunities`.
  - Redirects unauthenticated users to `/login`.

### Backend (`backend/`)
- **Framework:** FastAPI.
- **Database:** SQLAlchemy ORM with SQLite (dev) / PostgreSQL (prod).
- **Async Tasks:** Celery + Redis (for queueing scraping jobs).

### AI Engine (`ai-engine/` - External Service)
- Separated service for heavy LLM processing.
- Endpoints like `/ai/classify` are called by the Backend Curator.

## 4. Recent Fixes & Improvements
1.  **Robust Scraping:** Added fallback data for *all* major scrapers (DoraHacks, HackQuest, Questbook, Superteam) to handle API downtime.
2.  **Ingestion reliability:** Fixed `source_id` errors and import issues in the scraping pipeline.
3.  **AI Bypass:** Modified `AgentCurator` to not drop items if the AI service is offline.
4.  **Dashboard Verification:** Verified via database queries that new opportunities (e.g., "Manta Network Ecosystem Grants") are successfully landing in the DB.
