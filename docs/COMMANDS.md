# OppForge — Commands Reference

> **Updated**: March 7, 2026

---

## Local Development

### Start Backend
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### Start Frontend
```bash
cd platform
pnpm dev           # http://localhost:3000
```

### Start All Services (script)
```bash
./start-all.sh     # Redis + Backend + AI Engine + Celery Worker + Beat
./stop-all.sh      # Stop everything
```

### Start Celery (manually)
```bash
cd backend
bash start_celery_worker.sh
bash start_celery_beat.sh
```

### Run Scrapers Manually
```bash
cd backend
python run_scrapers.py                       # run all scrapers
python -c "from app.scrapers.gitcoin import GitcoinScraper; GitcoinScraper().run()"
```

### Seed Opportunities
```bash
cd backend
python seed_fresh_opportunities.py           # seed curated opportunities to DB
```

---

## Admin CLI

All admin actions run from `backend/admin.py`.

```bash
cd backend && source venv/bin/activate

python admin.py promote <email>              # grant ADMIN role
python admin.py promote-sub-admin <email>    # grant SUB_ADMIN role
python admin.py demote <email>               # demote back to USER
python admin.py users                        # list all users
python admin.py add-user <email> <username> --role admin
python admin.py search-user <query>
python admin.py delete-user <email>

python admin.py opps                         # list recent opportunities
python admin.py create-opp "Title" "https://..." --chain Solana
python admin.py verify <uuid>                # approve an opp
python admin.py delete-opp <uuid>
python admin.py clear-opps                   # wipe all opportunities (careful)
```

### Role Permissions

| Role | Analytics | Audit Logs | Manage Users | Edit Opps | Send Notifications |
|---|---|---|---|---|---|
| ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ |
| SUB_ADMIN | ✅ | ✅ | ❌ | Flag only | ❌ |
| USER | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Testing

### Master test suite (full stack)
```bash
python tools/master_test.py
```

### Backend API tests
```bash
cd backend && python test_api.py
python test_api.py https://oppbackendapi.oppforge.xyz    # test live
```

### AI Engine tests
```bash
cd ai-engine && python test_engine.py
```

### Backend unit tests
```bash
cd backend && pytest tests/
```

---

## Smart Contracts

```bash
cd contracts

# Compile
npx hardhat compile

# Test
npx hardhat test

# Deploy to Ethereum Sepolia (testnet)
npx hardhat run scripts/deploy-ethereum.js --network sepolia

# Deploy to Ethereum Mainnet
npx hardhat run scripts/deploy-ethereum.js --network mainnet

# Deploy to Arbitrum Sepolia
npx hardhat run scripts/deploy.js --network arbitrumSepolia

# Deploy to Arbitrum One
npx hardhat run scripts/deploy.js --network arbitrumOne

# Verify on Etherscan (after deploy)
npx hardhat verify --network sepolia <ADDRESS>
npx hardhat verify --network mainnet <ADDRESS>
npx hardhat verify --network arbitrumSepolia <ADDRESS>

# Check wallet address
node check_address.js
```

---

## Production Deployment (Railway)

### Deploy Backend
```bash
# Backend has its own Railway remote (backend-remote)
cd backend
git add -A && git commit -m "..."
git push    # pushes to backend Railway remote
```

### Deploy Platform (Frontend)
```bash
# From monorepo root — subtree push
git add -A && git commit -m "..."
git subtree push --prefix=platform platform-remote main
```

### Both at once
```bash
git add -A && git commit -m "feat: ..."
git push origin main
git subtree push --prefix=platform platform-remote main
```

---

## Health Checks

```bash
# Backend liveness
curl https://oppbackendapi.oppforge.xyz/health

# Priority opportunities feed
curl https://oppbackendapi.oppforge.xyz/opportunities/priority | head -20

# Local backend
curl http://localhost:8000/health
```

---

## Database

```bash
cd backend
# Run a migration script
python app/scripts/add_risk_fields.py

# Seed ecosystems
python -m app.scripts.add_remaining_ecosystems
```
