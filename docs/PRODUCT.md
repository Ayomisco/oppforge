# OppForge — Product Requirements Document (PRD)

> **Version**: 1.0  
> **Author**: Ayomide  
> **Date**: February 11, 2026  
> **Status**: Pre-Development

---

## 1. Product Identity

| Field | Details |
|-------|---------|
| **Name** | OppForge |
| **Tagline** | *"Forge your next opportunity."* |
| **Category** | Web3 AI Agent / Opportunity Intelligence Platform |
| **Target Launch** | MVP within 48 hours of focused development |

### Short Description
OppForge is an autonomous AI agent that scans, scores, and surfaces Web3 opportunities — grants, airdrops, hackathons, bug bounties, and new ecosystem launches — across Solana, EVM chains, and emerging networks, then helps users prepare winning submissions and optimized farming strategies through a personalized AI chat interface.

### Long Description
In the rapidly evolving Web3 ecosystem, thousands of opportunities emerge daily across dozens of blockchains — grants worth $10K–$500K, airdrops that can yield $1K–$50K+, hackathons with prize pools exceeding $100K, and bug bounties paying $5K–$1M. Yet most builders miss 90%+ of these because they're scattered across Twitter/X, Discord servers, governance forums, and protocol blogs.

OppForge solves this by deploying AI agents that autonomously hunt, aggregate, analyze, and score these opportunities in real-time, delivering a personalized feed ranked by your skills, interests, and win probability. The built-in AI chat assistant ("Forge AI") goes further — helping you draft proposals, plan farming strategies, and prepare hackathon submissions, turning discovery into action.

---

## 2. Problem Statement

### The Pain Points

1. **Information Overload**: 500+ new Web3 opportunities emerge weekly across 50+ chains. No human can track them all.

2. **Fragmented Sources**: Opportunities are scattered across:
   - Twitter/X threads and announcements
   - Discord servers (100s of channels)
   - Governance forums (Snapshot, Tally, Commonwealth)
   - Protocol blogs and Medium posts
   - Gitcoin, Questbook, Superteam Earn, Layer3
   - Chain-specific grant programs
   - Bug bounty platforms (Immunefi, Code4rena, Sherlock)

3. **No Personalization**: Existing aggregators show everything — they don't know YOUR skills (Rust, Solidity, Python), YOUR chains (Solana, Arbitrum, Base), or YOUR track record.

4. **Discovery ≠ Action**: Finding an opportunity is 20% of the work. Writing proposals, understanding requirements, planning farming strategies — that's the other 80%. No tool helps with both.

5. **Time Sensitivity**: Many opportunities have short windows (24–72 hours for airdrops, 7–14 days for grants). By the time you find them manually, they're often closed.

6. **Language & Quality Barriers**: Many builders (especially in Africa, SEA, LATAM) have great skills but struggle with writing English proposals that win.

### Who Suffers
- **Independent Web3 builders** hunting for funding and income
- **Hackathon participants** who miss events or submit weak proposals
- **Airdrop farmers** who can't keep up with the pace of new protocols
- **Security researchers** looking for bug bounty programs
- **Web3 communities and DAOs** seeking grants for their projects

---

## 3. Solution

### Core Thesis
**An AI agent that turns the chaos of Web3 opportunities into a personalized, actionable feed — and then helps you WIN them.**

### How OppForge Works

```
┌──────────────────────────────────────────────────┐
│  Twitter/X · Discord · Reddit · Blogs · Platforms   │
│  Announcement Pages · News Sites · Forums          │
└──────────────────┬───────────────────────────────┘
                   │ Scrape & Ingest
                   ▼
┌──────────────────────────────────────────────────┐
│              AI PROCESSING ENGINE                 │
│  Classify · Score · Rank · Deduplicate · Enrich   │
└──────────────────┬───────────────────────────────┘
                   │ Scored & Ranked
                   ▼
┌──────────────────────────────────────────────────┐
│            PERSONALIZED DASHBOARD                 │
│  Feed · Details · Alerts · Chat · Tracker         │
└──────────────────────────────────────────────────┘
```

### Solution Pillars

1. **Autonomous Discovery** — AI agents continuously scan 20+ data sources including **Twitter/X, Reddit**, protocol announcement pages, news sites, and Web3 platforms, extracting and classifying opportunities without human intervention.

2. **Web & Announcement Page Scanning** — Crawls official project websites, announcement pages, and news portals to catch opportunities at the source — not just social media.

3. **Real-Time Social Media Monitoring** — Dedicated scrapers monitor Twitter/X feeds and Reddit in real-time, catching grant announcements, airdrop alpha, hackathon launches, and bounty postings the moment they’re published. *(Discord/Telegram scrapers planned for V2.)*

4. **Intelligent Scoring** — Each opportunity is scored (0–100) based on: reward value, deadline proximity, difficulty, your skill match, historical win rates, and competition level.

5. **Personalized Feed** — Your dashboard shows only what matters to YOU, ranked by probability of success and ROI.

6. **Forge AI Chat** — A contextual AI assistant that helps you:
   - Evaluate if an opportunity is worth your time
   - Understand technical requirements
   - Get personalized strategy advice

7. **Action Tracking** — Track your applications, farming activities, and results in one place.

8. **Email Notifications** — Users who sign up receive email alerts when high-score opportunities match their profile, ensuring they never miss a deadline.

---

## 4. Features

### 4.1 Must-Have (MVP — 48 Hours)

| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| 1 | **Social Media Scanner** | Real-time monitoring of Twitter/X (via RSS/Nitter) and Reddit API for opportunity announcements | P0 |
| 2 | **Web & Announcement Scanning** | Crawl official project websites, announcement pages, and news portals | P0 |
| 3 | **Opportunity Feed** | Real-time scrollable feed of scored opportunities | P0 |
| 4 | **AI Scoring Engine** | Score each opportunity 0–100 with breakdown | P0 |
| 5 | **🔥 Testnet Tracker** | "New testnets to farm" section — track active testnets across chains | P0 |
| 6 | **🪂 Airdrop Alerts** | "Potential airdrop criteria detected" based on protocol activity | P0 |
| 7 | **⏰ Deadline Urgency** | "Closing in 48hrs!" urgency badges and countdown timers | P0 |
| 8 | **💰 Reward Estimator** | "This grant typically awards $5K–$20K based on past rounds" | P0 |
| 9 | **Category Filters** | Filter by: Grants, Airdrops, Hackathons, Bounties, Testnets | P0 |
| 10 | **Chain Filters** | Filter by: Solana, Ethereum, Arbitrum, Base, Optimism, etc. | P0 |
| 11 | **Opportunity Detail Page** | Full details: description, requirements, deadline, reward, AI analysis | P0 |
| 12 | **Forge AI Chat** | AI chat assistant for personalized guidance and evaluation | P0 |
| 13 | **Data Scraping Pipeline** | Automated scraping from 5+ sources (Twitter/X, Reddit, Gitcoin, Superteam, Immunefi, blogs) | P0 |
| 14 | **Search** | Full-text search across all opportunities | P0 |
| 15 | **Email Notifications** | Alert users via email when high-score opportunities match their profile | P0 |
| 16 | **Responsive UI** | Works on desktop and mobile | P0 |
| 17 | **User Preferences** | Set your skills, preferred chains, opportunity types | P0 |

### 4.2 Should-Have (Week 2)

| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| 18 | **Discord Bot Scraper** | Self-hosted bot monitoring #announcement channels in major Discord servers | P1 |
| 19 | **Telegram Scraper** | Monitor public alpha channels and protocol groups via Telethon | P1 |
| 20 | **Proposal Generator** | AI generates full grant/hackathon proposal drafts | P1 |
| 21 | **Farming Strategy Builder** | Step-by-step airdrop farming guides | P1 |
| 22 | **Application Tracker** (enhanced) | Kanban-style tracking with status updates | P1 |
| 23 | **Bookmarks/Watchlist** | Save opportunities for later | P1 |
| 24 | **Push Notifications** | Browser push alerts for urgent deadlines | P1 |

### 4.3 Nice-to-Have (Month 2+)

| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| 25 | **Community Leaderboard** | Gamify — show top hunters and their wins | P2 |
| 26 | **Team Formation** | Match with other builders for hackathons | P2 |
| 27 | **On-chain Verification** | Verify user skills via on-chain activity | P2 |
| 28 | **API Access** | Let other apps query OppForge data | P2 |
| 29 | **Browser Extension** | Overlay opportunity data on any Web3 page | P2 |
| 30 | **Telegram/Discord Bot** | Push opportunities to your preferred channels | P2 |
| 31 | **Portfolio Analytics** | Track cumulative earnings from opportunities | P2 |

---

## 5. User Flow

### 5.1 First-Time User Flow
```
Landing Page → Sign Up (email/wallet) → Onboarding Quiz
    → Select Skills (Rust, Solidity, Python, JS, Design, Writing)
    → Select Chains (Solana, Ethereum, Arbitrum, Base, etc.)
    → Select Interest (Grants, Airdrops, Hackathons, Bounties)
    → Dashboard (personalized feed loads)
```

### 5.2 Daily User Flow
```
Open Dashboard → Scan Top Opportunities (sorted by score)
    → Click Opportunity → Read AI Analysis
    → Ask Forge AI: "Should I apply?"
    → Forge AI: "Yes, 82% match. Here's a draft proposal..."
    → Copy/refine proposal → Submit application
    → Track in Portfolio
```

### 5.3 Airdrop Farming Flow
```
Dashboard → Filter: "Airdrops" → View Top Farming Opportunities
    → Click Opportunity → View Farming Strategy
    → Ask Forge AI: "Give me a step-by-step farming plan"
    → Forge AI generates: wallet setup → interactions → timeline
    → Follow steps → Mark as completed → Track potential value
```

---

## 6. What Makes OppForge Stand Out

### vs. Manual Hunting (Twitter/X, Discord)
- **10x faster** — AI scans in seconds what takes hours manually
- **Zero FOMO** — Nothing slips through the cracks
- **Scored & ranked** — No more analysis paralysis

### vs. Existing Aggregators (Gitcoin, Layer3, Superteam Earn)
- **Cross-chain** — They focus on 1 chain; we cover ALL chains
- **Cross-category** — They do grants OR bounties; we do everything
- **AI-powered** — They just list; we score, rank, and help you win
- **Chat assistant** — No competitor has an integrated AI that helps draft proposals

### Unique Differentiators
1. **AI Scoring Algorithm** — Proprietary scoring that considers YOUR profile, not just the opportunity
2. **Forge AI Chat** — The only Web3 opportunity tool with a built-in AI assistant
3. **Cross-chain, Cross-category** — One dashboard for ALL Web3 opportunities
4. **Action-oriented** — Not just discovery, but proposal generation and strategy building
5. **Built by a hunter, for hunters** — Created by someone who actually hunts these opportunities daily

---

## 7. Competitive Analysis

### Competitor Landscape

| # | Competitor | What They Do | Strengths | Weaknesses | OppForge Advantage |
|---|-----------|-------------|-----------|------------|-------------------|
| 1 | **Gitcoin** | Grants platform (primarily Ethereum) | Large community, established brand, quadratic funding | Single-chain focused, no AI, no airdrops/bounties | Multi-chain + AI scoring + chat |
| 2 | **Superteam Earn** | Solana bounties & grants | Clean UI, strong Solana community, curated | Solana-only, no AI, manual curation only | Multi-chain + AI + auto-discovery |
| 3 | **Layer3** | Quests & bounties across chains | Gamified UX, multi-chain, good community | Focused on quests (small tasks), no grants, no AI | Full opportunity spectrum + AI proposals |
| 4 | **Immunefi** | Bug bounties | Largest bug bounty platform, massive payouts | Bug bounties only, no AI, intimidating UX | All categories + AI analysis + accessibility |
| 5 | **Dune Analytics** | On-chain data analytics | Powerful data queries, community dashboards | Not an opportunity finder, requires SQL, no AI | Purpose-built for opportunity hunting |

### Competitive Moat
1. **Data moat** — The more opportunities we index, the harder to replicate
2. **AI moat** — Scoring model improves with user feedback over time
3. **User moat** — Personalized profiles create switching costs
4. **Speed moat** — First comprehensive cross-chain opportunity agent

---

## 8. Value Proposition

### For Individual Builders
> "Stop scrolling Twitter for hours. OppForge finds, scores, and helps you win Web3 opportunities while you focus on building."

- **Save 10+ hours/week** on opportunity hunting
- **Never miss a deadline** with automated alerts
- **Win more** with AI-assisted proposals and strategies
- **Track everything** in one dashboard

### For Web3 Teams & DAOs
> "Your team's opportunity intelligence center. OppForge ensures you never miss funding that could accelerate your project."

- Centralized opportunity tracking for the whole team
- AI-drafted proposals save senior team members' time
- Cross-chain visibility for multi-chain projects

---

## 9. Revenue Model & Monetization

### 9.1 Payment Architecture
We employ a **Hybrid Payment System** accepting both Crypto (USDC/SOL) and Fiat (USD).

-   **Crypto Subscriptions**: Powered by **Helio** or **Sphere** (Solana/EVM).
    -   *Why*: Native to our user base, instant settlement, low fees.
    -   *Flow*: User signs tx -> Smart Contract/API confirms -> Webhook grants 'Pro' role.
-   **Fiat Subscriptions**: Powered by **Stripe**.
    -   *Why*: Lower friction for non-degen users, recurring billing reliability.

### 9.2 Subscription Tiers

#### **Free Tier (The "Scout")**
-   **Feed**: delayed by 24 hours (No real-time alpha).
-   **AI Chat**: Limit 5 messages/day.
-   **Access**: Read-only public opportunities.

#### **Pro Tier (The "Hunter") — $29/month or $299/year**
-   **Feed**: Real-time (<5s latency from Twitter/Discord).
-   **AI Chat**: Unlimited access to Forge AI (GPT-4 class).
-   **Tools**:
    -   Auto-Draft Proposals (grants/hackathons).
    -   Farming Strategy Builder (step-by-step guides).
    -   "One-Click Apply" (where supported).
-   **Alerts**: Instant Email + Push notifications for high-match opportunities.

#### **Lifetime Tier (The "Founder") — $499 NFT / One-time**
-   **Access**: Lifetime Pro access.
-   **Perks**: Private "Alpha" Discord channel, early access to new scrapers.
-   **Tradable**: Can be sold on secondary markets (royalties to OppForge).

---

## 10. Authentication & User Identity

### 10.1 Privy Integration
We use **Privy** for best-in-class onboarding.
-   **Social Login**: Users can sign in with **Google**, **Twitter**, or **Email**.
-   **Embedded Wallets**: Privy automatically creates a secure, self-custodial wallet for non-crypto users.
-   **Connect Wallet**: Existing Web3 users can connect **Phantom**, **Metamask**, or **Rabby** directly.
-   **Unified Identity**: Link multiple wallets and socials to a single profile.

### 10.2 Why This Matters
-   **Drastically Higher Conversion**: No "Connect Wallet" friction at landing.
-   **Mobile Native**: Works perfectly on mobile browsers.
-   **Context Rich**: We can pull Twitter/GitHub reputation data to improve AI scoring (e.g., "GitHub score: High" = higher grant win probability).

---

## 11. Chance of Winning (Hackathons & Grants)

### Why OppForge Can Win

| Factor | Score | Reasoning |
|--------|-------|-----------|
| **Problem clarity** | 9/10 | Every Web3 builder has this exact pain point |
| **Solution quality** | 8/10 | AI + aggregation + action is a unique combo |
| **Technical impressiveness** | 9/10 | LangChain agents + ML scoring + multi-chain scraping |
| **Demo-ability** | 9/10 | Live feed + AI chat = instant wow factor |
| **Market size** | 8/10 | 50K+ active Web3 builders globally |
| **Founder-market fit** | 10/10 | You literally hunt these opportunities daily |
| **Novelty** | 8/10 | No direct competitor does all of this |
| **Overall win probability** | **85%** | Top 10% of any hackathon, strong grant candidate |

### Target Hackathons & Grants
1. **ETHGlobal** — AI track, Tooling track
2. **Solana Hackathon** — Infrastructure/Tools
3. **Arbitrum Grants** — Developer tooling
4. **Optimism RetroPGF** — Public goods
5. **Gitcoin Grants** — Developer tools category
6. **Summer of Bitcoin** — Shows Rust + AI capabilities
7. **ILINA** — Perfect for agent evaluation & safety track
8. **Polygon Grants** — Developer ecosystem
9. **Base Grants** — Ecosystem growth

### Why It Should Be Built
1. **Founder scratches own itch** — You need this tool TODAY
2. **Clear monetization** — Not a charity, it makes money from day 1
3. **Compounding value** — Use it to win grants → fund OppForge → build more → win more
4. **Portfolio piece** — Shows Rust + AI + Web3 + Full-stack skills
5. **Community need** — Thousands of builders in Africa, SEA, LATAM need this
6. **Market timing** — Web3 is in a bull cycle, more opportunities than ever
7. **AI timing** — LLMs are mature enough to make this possible now

---

## 11. System Architecture (High-Level)

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 14+ App Router)            │
│  Dashboard · Detail · Chat · Tracker · Settings · Onboarding    │
└──────────────────────────┬──────────────────────────────────────┘
                           │ REST API + WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI + Python)                    │
│  Auth · API Routes · WebSocket · Job Queue · Data Layer         │
└──────────┬────────────────────────────┬─────────────────────────┘
           │ Internal API               │ Celery Tasks
           ▼                            ▼
┌────────────────────────┐  ┌──────────────────────────────────┐
│   AI ENGINE            │  │   DATA PIPELINE                   │
│   (LangChain/LangGraph)│  │   (Scrapers + Processors)         │
│                        │  │                                    │
│  · Scoring Agent       │  │  · Twitter/X Scraper (RSS/Nitter) │
│  · Chat Agent          │  │  · Reddit Scraper (API)           │
│  · Classification      │  │  · Web/Announcement Crawlers      │
│                        │  │  · Platform Scrapers (Gitcoin etc) │
│                        │  │  · Blog/News Crawlers             │
└──────────┬─────────────┘  └──────────┬───────────────────────┘
           │                            │
           ▼                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA STORES                                   │
│  SQLite/PostgreSQL · ChromaDB (vectors) · Redis (cache/queue)    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 12. Technologies Summary

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 14+ (App Router) | SSR, file-based routing, Vercel-native, free |
| Styling | Vanilla CSS (custom cyberpunk theme) | Full control, unique design |
| Animations | Framer Motion | Smooth, professional |
| Charts | Recharts | React-native charting |
| Backend | FastAPI (Python) | Async, fast, modern |
| Database | SQLite → PostgreSQL | Free, robust |
| Vector DB | ChromaDB | Free, embeddable |
| Cache/Queue | Redis + Celery | Free, industry standard |
| AI Framework | LangChain + LangGraph | Free, battle-tested |
| Local LLM | Ollama (Llama 3 / Mistral) | Free, no API costs |
| Embeddings | Sentence-Transformers | Free, local |
| Scoring | scikit-learn | Free, reliable |
| Scraping | BeautifulSoup + Playwright | Free, powerful |
| Blockchain | Solana RPC + EVM RPC (Alchemy free) | Free tiers |
| Hosting | Vercel (FE) + Railway/Render (BE) | Free tiers |
| CI/CD | GitHub Actions | Free |
| Containerization | Docker + Docker Compose | Free |

---

## 13. Success Metrics

### MVP Success (Week 1)
- [ ] 50+ opportunities indexed from 5+ sources
- [ ] AI scoring working with >70% accuracy
- [ ] Chat assistant functional with context awareness
- [ ] <3s page load time
- [ ] Positive feedback from 5 beta testers

### Growth Metrics (Month 1–3)
- [ ] 500+ registered users
- [ ] 50+ paying subscribers
- [ ] 1,000+ opportunities indexed
- [ ] 20+ data sources active
- [ ] 10+ hackathon/grant submissions made via OppForge

### North Star Metric
> **"Opportunities won per user per month"** — If users are WINNING more grants, hackathons, and airdrops because of OppForge, everything else follows.

---

## 14. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Twitter/X API changes | High | Medium | Multiple data sources, RSS fallback |
| LLM quality issues | Medium | Low | Use Llama 3 70B, add human review layer |
| Scraping blocked by sites | Medium | Medium | Rotate proxies, use official APIs where available |
| Low initial user adoption | Medium | Medium | Use it yourself, share wins on Twitter, build in public |
| Competitor launches similar | Low | Low | Move fast, build community, iterate on feedback |
| Too many false positives | Medium | Medium | User feedback loop to improve scoring model |

---

*This document is a living PRD. Update as the product evolves.*

---

## 15. Web3 & Smart Contract Features

### 15.1 Access Control & Identity
- **Wallet Connection**: Supports Solana (Phantom/Backpack) and EVM (Metamask/Rabby) via **RainbowKit** & **Solana Adapter**.
- **NFT Gating**: "Founder" tier is an NFT. The app checks wallet balance for this NFT to unlock features.
- **SIWE (Sign-In with Ethereum)**: Secure authentication proving wallet ownership.

### 15.2 Payments & Monetization
- **Crypto Subscriptions**:
    - **Helio/Sphere**: Subscription management (USDC/SOL) with webhook integration.
    - **Smart Contract Audits**: Payment logic auditing handled by providers.
- **Fiat Bridge**: Stripe integration for simple credit card payments.

### 15.3 On-Chain Actions (Future Roadmap)
- **Airdrop Claiming**: Integrated claiming for supported airdrops.
- **DAO Voting**: Snapshot integration for voting.
- **Token Gated Chat**: Discord-like channels gated by token holdings.
