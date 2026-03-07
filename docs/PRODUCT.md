# OppForge — Product

> **Updated**: March 7, 2026  
> **Status**: MVP live at app.oppforge.xyz

---

## What OppForge Is

OppForge is an AI-powered opportunity intelligence platform for Web3 builders. It autonomously scans 20+ data sources, scores every grant/airdrop/hackathon/bounty it finds, and surfaces a personalized feed ranked by your win probability. The built-in Forge AI workspace goes a step further — helping you draft proposals, plan strategies, and prepare winning submissions.

**Tagline**: *"Forge your next opportunity."*

---

## Current Build (Live Features)

### Discovery & Feed
- Real-time opportunity feed — 54+ active opps in DB from 20+ scrapers
- Categories: Grants, Airdrops, Hackathons, Bounties, Testnets
- AI scoring (0–100) with breakdown per opportunity
- Chain/type filters, full-text search
- Priority feed (`/opportunities/priority`) — highest-ROI opps first
- Deadline urgency badges ("Closes in 48hrs")

### Opportunity Detail
- Full detail page with requirements, reward pool, deadline, chain, tags
- AI trust score + win probability
- Strategy notes from AI
- "Save to Tracker" button → adds to kanban board

### Tracker (Kanban Board)
- 4 columns: Saved → In Progress → Applied → Results
- 3-dot dropdown per card: View Opportunity, Open in Forge, Move to (any status), Remove
- One-click status moves with backend sync
- Quick action buttons: Start, Draft (Forge), Submit, Won/Lost

### Forge AI Workspace
- Full AI workspace per opportunity
- 7 specialized modes: Strategy, Proposal, Research, Risk Analysis, Brainstorm, Score Breakdown, Quick Wins
- Auto-brief on load — AI analyzes the opportunity immediately when you open the workspace
- Sections canvas — AI response parsed into collapsible, editable sections
- Per-section regeneration with targeted prompts
- Brainstorm chips — 6 clickable conversation starters
- Preview / Edit / Sections view toggle
- PDF export of the full workspace
- Days-left counter in header

### Auth & Accounts
- Google OAuth login
- User profile with skills, preferred chains, opportunity type preferences
- Subscription tiers (Free / Hunter / Founder)

### Notifications
- Email alerts (Plunk) for high-score matches
- In-app notification bell

### Admin Panel
- Full admin dashboard at `/dashboard/admin`
- User management, opportunity management, analytics
- CLI-based role promotion (`admin.py`)

---

## Smart Contracts (On-Chain Layer)

Deployed on **Ethereum Sepolia** (March 7, 2026):
- **OppForgeFounder** — ERC-721 Founder Pass NFT
- **OppForgeMission** — On-chain reputation + mission tracker
- **OppForgeProtocol** — Tier access, reward vaults

WalletConnect/RainbowKit/Wagmi frontend integration: **planned next sprint**

---

## Roadmap

### Next (V1.1)
- [ ] WalletConnect integration — mint Founder NFT, on-chain mission status
- [ ] Mainnet contract deployment (ETH + Arbitrum)
- [ ] Multi-chain contract rollout (Base, Optimism, Polygon)
- [ ] Discord bot scraper
- [ ] Telegram alpha channel scraper

### V1.2
- [ ] Hunter reputation leaderboard (on-chain backed)
- [ ] Bounty vault — project owners lock rewards on-chain
- [ ] Push notifications (browser)
- [ ] Referral system

### V2
- [ ] Solana contracts (Anchor/Rust)
- [ ] Mobile app (React Native)
- [ ] Community features — share wins, upvote opps
- [ ] API access tier for builders

---

## Target Users

1. **Independent Web3 builders** — chasing grants and bounties
2. **Hackathon participants** — need discovery + proposal help
3. **Airdrop farmers** — need structured tracking and alerts
4. **Security researchers** — bug bounty aggregation
5. **Web3 DAOs and teams** — grant research and application management
