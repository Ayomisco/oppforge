# OppForge

> AI-powered Web3 opportunity intelligence platform. Discovers, scores, and surfaces grants, airdrops, hackathons, and bounties — then helps you win them.

**Live**: [app.oppforge.xyz](https://app.oppforge.xyz)  
**API**: [oppbackendapi.oppforge.xyz](https://oppbackendapi.oppforge.xyz/docs)  
**Stack**: Next.js · FastAPI · PostgreSQL · Groq AI · Hardhat  
**Status**: MVP live — actively developed

---

## What's Built

| Layer | Tech | Status |
|---|---|---|
| Frontend | Next.js 14, Tailwind, Framer Motion | ✅ Live on Railway |
| Backend API | FastAPI, SQLAlchemy, PostgreSQL (Aiven) | ✅ Live on Railway |
| AI Engine | Groq (Llama 3.1 8B), LangChain | ✅ Live |
| Scrapers | 20+ sources — Twitter/X, Reddit, Gitcoin, Superteam, Immunefi | ✅ Live (Celery) |
| Smart Contracts | Solidity 0.8.20, Hardhat, OpenZeppelin | ✅ ETH Sepolia deployed |
| Auth | Google OAuth | ✅ Live |
| Email | Plunk | ✅ Live |

---

## Documentation

| File | Contents |
|---|---|
| [TECHNICAL.md](TECHNICAL.md) | Architecture, infrastructure, services, env vars, deployment |
| [PRODUCT.md](PRODUCT.md) | Product vision, current features, roadmap |
| [COMMANDS.md](COMMANDS.md) | All dev, admin, scraper, deploy commands |
| [CONTRACTS.md](CONTRACTS.md) | Smart contracts — code, deployments, multi-chain rollout |
| [LAUNCH_STRATEGY_V01.md](LAUNCH_STRATEGY_V01.md) | Go-to-market, grant targets, ecosystem outreach |

---

## Quick Start (Local Dev)

```bash
# Backend
cd backend && python -m venv venv && source venv/bin/activate
pip install -r requirements.txt && cp .env.example .env
uvicorn app.main:app --reload --port 8000

# Frontend
cd platform && pnpm install && pnpm dev

# Smart Contracts
cd contracts && npm install && npx hardhat compile
```

---

## Deploy (Production — Railway)

```bash
# Push backend (has its own Railway remote)
cd backend && git add -A && git commit -m "..." && git push

# Push platform (subtree deploy from monorepo root)
git add -A && git commit -m "..."
git subtree push --prefix=platform platform-remote main
```

---

## Monorepo Structure

```
OppForge/
├── platform/          # Next.js frontend  → app.oppforge.xyz
├── backend/           # FastAPI backend   → oppbackendapi.oppforge.xyz
├── ai-engine/         # Groq/LangChain AI engine
├── contracts/         # Solidity smart contracts (Hardhat)
├── docs/              # All documentation (this folder)
├── scripts/           # Utility scripts
└── tools/             # Master test suite
```
