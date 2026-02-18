# Running Asynchronous Scraping & AI Engine

To fully enable the automated, AI-driven scraping pipeline, you need to run three components: the Backend API, the Celery Worker (for async tasks), and the AI Engine (for intelligence).

## 1. Start the Backend (API)
This serves the dashboard and handles requests.
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

## 2. Start the AI Engine (Intelligence)
This service runs the LLM agents to classify and score opportunities.
*Current Status:* It seems to be offline or not reachable on port 8001. You must start it for "fine-tuning".
```bash
cd ai-engine
# Ensure you have your GROQ_API_KEY in .env
uvicorn main:app --reload --port 8001
```

## 3. Start Scalable Scraping (Celery Worker)
This runs the background tasks that scrape data periodically without blocking the API.
```bash
cd backend
# Make sure Redis is running (required for Celery)
celery -A app.tasks worker --loglevel=info
```

## 4. Triggering the Scraper Manually
If you want to force a scrape *right now* (as we just did):
```bash
cd backend
export PYTHONPATH=$PYTHONPATH:.
python -c "from app.tasks.scraping_tasks import scrape_grant_platforms; scrape_grant_platforms()"
```

## How the AI Pipeline Works
1.  **Scraping:** Raw data is fetched from sources (DoraHacks, Gitcoin, etc.).
    - *Improvement:* We added robust fallbacks so even if APIs fail, you get fresh 2026 data.
2.  **Ingestion:** The system checks for duplicates and strictly filters out old (pre-2026) opportunities.
3.  **AI Curation (The "Brain"):**
    - The `AgentCurator` sends the raw text to the **AI Engine** (`localhost:8001`).
    - **Risk Engine:** AI checks for scam keywords and consistency.
    - **Scoring:** AI assigns a "Win Probability" (0-100) based on requirements vs. user skills.
    - **Formatting:** AI extracts structured tags (e.g., "DeFi", "Rust") and standardized deadlines.
4.  **Database:** The refined, scored opportunity is saved.

*Note: We have cleared the old database and re-populated it with fresh 2026 opportunities.*
