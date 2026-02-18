# Web Scrapers Documentation

OppForge includes comprehensive web scrapers for major Web3 opportunity platforms. This document outlines all available scrapers, their capabilities, and usage.

---

## 📊 Overview

### Scraper Categories

1. **Platform Scrapers** (7 scrapers)
   - DoraHacks
   - Questbook
   - HackQuest
   - Superteam
   - Devpost
   - Devfolio
   - Gitcoin

2. **Social Media Scrapers** (2 scrapers)
   - Twitter/X
   - Reddit

3. **Ecosystem Scrapers** (114 configured)
   - Tier 1: 30 high-priority ecosystems
   - Tier 2: 33 medium-priority ecosystems
   - Tier 3: 51 daily-scrape ecosystems

---

## 🏢 Platform Scrapers

### 1. DoraHacks
**File**: `backend/app/scrapers/dorahacks.py`

**Features**:
- API-first approach with HTML fallback
- Scrapes active hackathons and grants
- Extracts prize pools, deadlines, descriptions
- Multi-chain support

**Endpoints**:
- API: `https://api.dorahacks.io/v1/hackathons`
- Web: `https://dorahacks.io/hackathon`

**Data Extracted**:
- Title
- Description
- Prize pool
- Deadline
- Tags
- Logo

**Frequency**: Every 4 hours

---

### 2. Questbook
**File**: `backend/app/scrapers/questbook.py`

**Features**:
- Decentralized grants platform
- API-based scraping
- Curated, verified grants
- Detailed skill requirements

**Endpoints**:
- API: `https://api.questbook.app/v1/grants`

**Data Extracted**:
- Title
- Description
- Funding amount
- Token type
- Required skills
- Deadline
- Chain/Network

**Frequency**: Every 4 hours

---

### 3. HackQuest
**File**: `backend/app/scrapers/hackquest.py`

**Features**:
- Web3 learning & hackathon platform
- API + HTML scraping
- Educational opportunities
- Multi-chain hackathons

**Endpoints**:
- API: `https://api.hackquest.io/v1/hackathons`
- Web: `https://www.hackquest.io/en/hackathon`

**Data Extracted**:
- Title
- Description
- Prize
- URL
- Tags

**Frequency**: Every 4 hours

---

### 4. Superteam
**File**: `backend/app/scrapers/superteam.py`

**Features**:
- Solana-focused opportunities
- Bounties, projects, hackathons, jobs
- API-based scraping
- Curated listings

**Endpoints**:
- API: `https://earn.superteam.fun/api/listings`

**Data Extracted**:
- Title
- Description
- Compensation type
- Skills required
- Deadline
- Sponsor info

**Frequency**: Every 4 hours  
**Chain Focus**: Solana

---

### 5. Devpost
**File**: `backend/app/scrapers/heavy/devpost.py`

**Features**:
- Playwright-based (heavy scraper)
- JavaScript-rendered content
- Large hackathon database
- Blockchain-focused filtering

**Endpoints**:
- Web: `https://devpost.com/hackathons?search=blockchain`

**Data Extracted**:
- Title
- Description
- Prize pool
- Submission deadline
- Organizer
- URL

**Frequency**: Every 4 hours  
**Type**: Heavy (Playwright)

---

### 6. Devfolio
**File**: `backend/app/scrapers/heavy/devfolio.py`

**Features**:
- Playwright-based (heavy scraper)
- India/Asia-focused hackathons
- JavaScript-rendered content
- Detailed hackathon info

**Endpoints**:
- Web: `https://devfolio.co/hackathons`

**Data Extracted**:
- Title
- Description
- Prize pool
- Dates
- Location
- Registration status

**Frequency**: Every 4 hours  
**Type**: Heavy (Playwright)

---

### 7. Gitcoin
**File**: `backend/app/scrapers/gitcoin.py`

**Status**: Needs implementation  
**Priority**: High

**Planned Features**:
- GraphQL API integration
- Grants and bounties
- Grant rounds
- QF (Quadratic Funding) data

**Endpoints** (to implement):
- API: `https://grants-stack-indexer.gitcoin.co/graphql`

---

## 🐦 Social Media Scrapers

### Twitter/X
**File**: `backend/app/scrapers/twitter.py`

**Features**:
- RapidAPI integration
- Keyword-based search
- Web3 hashtag monitoring
- Real-time opportunities

**Keywords**:
- #Web3 #Hackathon
- #Grant #Bounty
- #Airdrop #DeFi

**Frequency**: Every 3 hours

---

### Reddit
**File**: `backend/app/scrapers/reddit.py`

**Features**:
- PRAW (Python Reddit API Wrapper)
- Subreddit monitoring
- Keyword filtering

**Subreddits**:
- r/web3
- r/ethereum
- r/solana
- r/cryptocurrency

**Frequency**: Every 6 hours

---

## 🌍 Ecosystem Scrapers

### Concept
Each ecosystem (Ethereum, Solana, Arbitrum, etc.) has specific grant/hackathon URLs that need custom scraping logic.

### Implementation Status
**Infrastructure**: ✅ Ready  
**Database**: ✅ 114 ecosystems seeded  
**Scrapers**: ⏳ Generic template needed

### Generic Ecosystem Scraper Template

```python
class EcosystemScraper(BaseScraper):
    def __init__(self, ecosystem):
        self.ecosystem = ecosystem
        self.grants_url = ecosystem.official_grants_url
        
    def fetch(self):
        # Try common patterns:
        # 1. /grants endpoint
        # 2. /api/grants endpoint
        # 3. HTML scraping
        pass
    
    def parse(self, raw_data):
        # Extract common fields:
        # - title, description, reward, deadline
        # - Apply ecosystem.chain automatically
        pass
```

### Priority Ecosystems (Tier 1)
Need custom scraper logic:
1. **Ethereum Foundation** - https://ethereum.org/en/grants/
2. **Solana Foundation** - https://solana.org/grants
3. **Avalanche** - https://www.avax.network/incentive-programs
4. **Polygon** - https://polygon.technology/village/grants
5. **Arbitrum** - https://arbitrum.foundation/grants

---

## 🔄 Scraping Architecture

### Task Organization
```python
# Celery tasks (backend/app/tasks/scraping_tasks.py)

scrape_tier1_ecosystems()     # Every 6 hours
scrape_tier2_ecosystems()     # Every 12 hours
scrape_tier3_ecosystems()     # Daily
scrape_twitter()              # Every 3 hours
scrape_grant_platforms()      # Every 4 hours
```

### Task Flow
```
Celery Beat (Scheduler)
    ↓
Task Queue (Redis)
    ↓
Celery Worker
    ↓
Scraper.run()
    ├─ fetch() → Get raw data
    └─ parse() → Standardize format
         ↓
Ingestion Service
    ├─ Deduplicate
    ├─ AI Classification
    ├─ Risk Assessment
    └─ Save to Database
```

---

## 📝 Scraper Base Class

All scrapers inherit from `BaseScraper`:

```python
class BaseScraper:
    def __init__(self, source_name: str):
        self.source_name = source_name
    
    def fetch(self) -> List[Dict[str, Any]]:
        """Override: Fetch raw data from source"""
        raise NotImplementedError
    
    def parse(self, raw_data: List[Dict]) -> List[Dict]:
        """Override: Parse into standard format"""
        raise NotImplementedError
    
    def run(self) -> List[Dict]:
        """Execute fetch + parse"""
        raw_data = self.fetch()
        return self.parse(raw_data)
```

### Standard Output Format
```python
{
    "title": str,              # Required
    "description": str,        # Required
    "url": str,                # Required
    "category": str,           # Grant, Hackathon, Bounty, Airdrop
    "source": str,             # Platform name
    "reward_pool": str,        # "$50,000" or "TBD"
    "deadline": datetime,      # ISO format or None
    "chain": str,              # Ethereum, Solana, Multi-chain
    "tags": List[str],         # ["DeFi", "NFT", "Gaming"]
    "required_skills": List[str],  # ["Solidity", "Rust"]
    "logo_url": str,           # Optional
    "is_verified": bool,       # False by default
}
```

---

## 🛠️ Adding New Scrapers

### Step 1: Create Scraper File
```python
# backend/app/scrapers/your_platform.py

from app.scrapers.base import BaseScraper
import httpx
import logging

logger = logging.getLogger(__name__)

class YourPlatformScraper(BaseScraper):
    def __init__(self):
        super().__init__("YourPlatform")
        self.api_url = "https://api.yourplatform.com/opportunities"
        
    def fetch(self):
        response = httpx.get(self.api_url, timeout=30)
        return response.json()
    
    def parse(self, raw_data):
        opportunities = []
        for item in raw_data:
            opp = {
                "title": item["name"],
                "description": item["description"],
                "url": item["link"],
                "category": "Grant",
                "source": "YourPlatform",
                "reward_pool": item.get("prize", "TBD"),
                "chain": "Multi-chain",
            }
            opportunities.append(opp)
        return opportunities
```

### Step 2: Register in Tasks
```python
# backend/app/tasks/scraping_tasks.py

from app.scrapers.your_platform import YourPlatformScraper

@shared_task
def scrape_grant_platforms():
    scrapers = [
        # ... existing scrapers
        YourPlatformScraper(),
    ]
    # ... rest of task
```

### Step 3: Test
```python
cd backend
python -c "from app.scrapers.your_platform import YourPlatformScraper; s = YourPlatformScraper(); print(s.run())"
```

---

## 🚨 Error Handling

### Retry Logic
All scraping tasks have automatic retry with exponential backoff:
- Max retries: 3
- Backoff: 5 min → 10 min → 15 min

### Rate Limiting
Implement delays to avoid being blocked:
```python
import time
import random

# Between requests
time.sleep(random.uniform(1, 3))

# User-Agent rotation
headers = {
    "User-Agent": random.choice(USER_AGENTS)
}
```

### Logging
```python
logger.info("✅ Success message")
logger.warning("⚠️ Warning message")
logger.error("❌ Error message")
```

---

## 📊 Monitoring

### Celery Flower Dashboard
```bash
celery -A app.celery_config.celery_app flower --port=5555
```
Visit: http://localhost:5555

**Metrics Available**:
- Task success/failure rates
- Execution time per scraper
- Queue lengths
- Worker status

### Database Queries
```python
# Check scraping stats per source
from app.models.opportunity import Opportunity
from app.database import SessionLocal

db = SessionLocal()
sources = db.query(Opportunity.source, func.count(Opportunity.id)).\
    group_by(Opportunity.source).all()
print(sources)
```

---

## 🔐 Security & Best Practices

### 1. Respect robots.txt
Always check if scraping is allowed

### 2. Use APIs When Available
Prefer official APIs over HTML scraping

### 3. Rate Limiting
Don't hammer servers - add delays

### 4. User-Agent
Use descriptive User-Agent:
```python
"User-Agent": "OppForge/1.0 (Opportunity Aggregator; contact@oppforge.com)"
```

### 5. Error Handling
Gracefully handle failures - don't crash the worker

### 6. Data Validation
Validate extracted data before ingestion

---

## 📈 Performance Tips

### 1. Parallel Scraping
Use asyncio for I/O-bound operations:
```python
import asyncio
import httpx

async def scrape_multiple():
    async with httpx.AsyncClient() as client:
        tasks = [client.get(url) for url in urls]
        results = await asyncio.gather(*tasks)
    return results
```

### 2. Caching
Cache frequently accessed data (e.g., ecosystem metadata)

### 3. Batch Processing
Process opportunities in batches for database inserts

### 4. Selective Scraping
Only scrape active/open opportunities

---

## 📚 Additional Resources

- [Playwright Docs](https://playwright.dev/python/)
- [httpx Docs](https://www.python-httpx.org/)
- [BeautifulSoup Docs](https://www.crummy.com/software/BeautifulSoup/)
- [Celery Best Practices](https://docs.celeryq.dev/en/stable/userguide/tasks.html#best-practices)

---

**Last Updated**: February 17, 2026  
**Total Scrapers**: 9 (7 platforms + 2 social)  
**Status**: Active and scraping
