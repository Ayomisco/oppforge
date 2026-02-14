# OppForge Services & Infrastructure

## Database

### Current: Local SQLite
For development stability (due to DNS issues with external providers), the app uses a local SQLite database: `backend/oppforge.db`.

### Production Options

#### Option 1: Aiven PostgreSQL
Connection String:
```
postgres://avnadmin:******@oppforge-oppforge-8e7e.k.aivencloud.com:25460/defaultdb?sslmode=require
```
**To Switch**: Uncomment the Aiven line in `backend/.env`.

#### Option 2: Turso (LibSQL)
Connection String:
```
sqlite+libsql://oppforge-ayomisco.aws-us-east-1.turso.io?authToken=...
```
**Required Package**: `pip install sqlalchemy-libsql`

#### Option 3: Railway PostgreSQL (Recommended for Production)
If you deploy to Railway, it provides a `DATABASE_URL` automatically.

---

## Scraper Engine

### Twitter/X Scraper
- **Provider**: RapidAPI (`twitter-api45`)
- **Key**: Configured in `.env` (`RAPIDAPI_KEY`)
- **Coverage**: Top 30+ Ecosystems (Solana, Monad, Berachain, etc.)
- **Keywords**: Grant, Hackathon, Bounty, Testnet, Airdrop

### Scheduler
- Runs every 6 hours.
- Defined in `app/services/scheduler.py`.
- **To Start**: call `start_scheduler_thread()` in `main.py` (currently disabled for dev testing).
