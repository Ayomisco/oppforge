<p align="center">
  <h1 align="center">⚒️ OppForge</h1>
  <p align="center"><strong>Forge your next Web3 opportunity.</strong></p>
  <p align="center">
    An AI-powered agent that discovers, scores, and helps you win Web3 grants, airdrops, hackathons, and bounties across all chains.
  </p>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

---

## 🔥 The Problem

Web3 builders miss **90%+ of opportunities** because they're scattered across Twitter/X, Discord, Telegram, Reddit, governance forums, protocol blogs, and dozens of platforms. Manually tracking grants, airdrops, hackathons, and bug bounties across 50+ chains is impossible.

## 💡 The Solution

**OppForge** is an autonomous AI agent that:

- 🔍 **Scans 20+ sources** including **Twitter/X, Reddit**, Web3 platforms, announcement pages, and news sites
- 🌐 **Crawls the internet** — official project websites, announcement pages, news portals, and blogs
- 📡 **Real-time social media monitoring** — catches opportunity announcements the moment they drop
- 🧠 **Scores opportunities 0–100** based on your skills, interests, and win probability
- 🔥 **Testnet Tracker** — tracks active testnets to farm across all chains
- 🪂 **Airdrop Alerts** — detects potential airdrop criteria from protocol activity
- ⏰ **Deadline Urgency** — "Closing in 48hrs!" badges so you never miss out
- 💬 **AI Chat Assistant (Forge AI)** helps evaluate opportunities and give personalized advice
- 📧 **Email Notifications** — get alerted when high-score opportunities match your profile
- 📊 **Personalized Dashboard** shows only what matters to YOU
- 📋 **Application Tracker** to manage your submissions and results

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Social Media Scanner** | Real-time monitoring of Twitter/X (via RSS/Nitter) and Reddit for opportunity announcements |
| **Web & Announcement Scanning** | Crawls official project websites, announcement pages, and news portals |
| **Opportunity Feed** | Real-time, scored feed of grants, airdrops, hackathons, and bounties |
| **AI Scoring** | Each opportunity scored 0–100 with detailed breakdown |
| **🔥 Testnet Tracker** | "Hot Testnets to Farm" — track active testnets across all chains |
| **🪂 Airdrop Alerts** | "Potential airdrop criteria detected" based on protocol activity |
| **⏰ Deadline Urgency** | "Closing in 48hrs!" badges + countdown timers |
| **💰 Reward Estimator** | "This grant typically awards $5K–$20K based on past rounds" |
| **Forge AI Chat** | Built-in AI assistant for personalized guidance |
| **📧 Email Notifications** | Get alerted when high-score opportunities match your profile |
| **Multi-Chain** | Covers Solana, Ethereum, Arbitrum, Base, Optimism, and more |
| **Smart Filters** | Filter by category, chain, difficulty, reward size, and deadline |
| **Application Tracker** | Track submissions from "Interested" to "Won" |
| **Semantic Search** | Natural language search across all opportunities |
| **User Profiles** | Set your skills, preferred chains, and interests for personalized scoring |

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14+ (App Router), Vanilla CSS, Framer Motion |
| **Backend** | FastAPI (Python), SQLAlchemy, Celery |
| **AI Engine** | LangChain, LangGraph, Ollama (local LLMs), scikit-learn |
| **Database** | SQLite → PostgreSQL |
| **Vector DB** | ChromaDB (semantic search) |
| **Cache/Queue** | Redis + Celery |
| **LLM** | Llama 3 / Mistral (via Ollama) — **100% free, runs locally** |

## 🏗 Architecture

```
┌─────────────────────────────────────┐
│         DATA SOURCES                │
│  Twitter/X · Reddit · Blogs         │
│  Announcement Pages · News Sites    │
│  Web3 Platforms · Forums            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       AI PROCESSING ENGINE          │
│  Classify · Score · Rank · Enrich   │
│  LangChain + LangGraph + Ollama     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        BACKEND API (FastAPI)        │
│  Auth · REST · WebSocket · Jobs     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     FRONTEND (Next.js 14+)          │
│  Dashboard · Chat · Tracker         │
│  Cyberpunk-Brown UI Theme           │
└─────────────────────────────────────┘
```

## 📁 Project Structure

```
OppForge/
├── frontend/        # Next.js 14+ (App Router) — UI & pages
├── backend/         # FastAPI — REST API, scrapers, auth
├── ai-engine/       # LangChain agents, scoring, embeddings
├── shared/          # Shared constants, types, chain configs
├── scripts/         # Utility & setup scripts
└── docker-compose.yml
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **Redis** (for task queue)
- **Ollama** (for local LLM) — [Install Ollama](https://ollama.ai)

### Quick Setup

```bash
# 1. Clone the repository
git clone https://github.com/Ayomisco/oppforge.git
cd OppForge

# 2. Set up Backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env

# 3. Set up AI Engine
cd ../ai-engine
pip install -r requirements.txt

# 4. Set up Frontend
cd ../frontend
npm install

# 5. Pull LLM model
ollama pull llama3:8b

# 6. Start Redis
redis-server

# 7. Run all services (in separate terminals)
# Terminal 1: Backend
cd backend && uvicorn app.main:app --reload --port 8000

# Terminal 2: AI Engine
cd ai-engine && uvicorn main:app --reload --port 8001

# Terminal 3: Frontend
cd frontend && npm run dev

# Terminal 4: Ollama
ollama serve
```

### Docker (Alternative)

```bash
docker-compose up
```

Open [http://localhost:3000](http://localhost:3000) to see OppForge.

## 🎨 UI Design

OppForge features a unique **Cyberpunk-Brown** aesthetic — a blend of warm espresso/walnut tones with neon forge-orange accents, glassmorphism cards, and subtle scanline animations.

**Design tokens:**
- Base: Deep espresso (`#0D0A07`), walnut (`#1A1410`), mahogany (`#2C1810`)
- Accents: Forge orange (`#FF6B1A`), gold (`#FFD700`), amber (`#FF9500`)
- Typography: JetBrains Mono (code) + Space Grotesk (UI)

## 🤖 AI Features

### Forge AI Chat
A contextual AI assistant built into every page:

```
You: "Is this Solana grant worth applying to?"
Forge AI: "Based on your profile, this has a 78% match score.
           The deadline is in 12 days. You have 3 matching skills.
           I can draft an application outline for you."
```

### Opportunity Scoring
Each opportunity is scored using a hybrid approach:
- **LLM Analysis** — AI evaluates opportunity quality and fit
- **ML Model** — scikit-learn model scores based on extracted features
- **Personalization** — Score adjusted for YOUR skills, chains, and preferences

## 🗺 Roadmap

- [x] Project scaffold and infrastructure
- [ ] Backend API with auth, CRUD, and scrapers
- [ ] AI scoring engine and chat agent
- [ ] Cyberpunk-brown frontend UI with testnet tracker + airdrop alerts
- [ ] Chat integration and polish
- [ ] Email notification system
- [ ] Production deployment
- [ ] Discord/Telegram scrapers (V2)
- [ ] Proposal generator (V2)
- [ ] Farming strategy builder (V2)
- [ ] Monetization (Gumroad subscription)

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create a branch** (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Areas where help is needed:
- Additional data source scrapers (new platforms, chains)
- UI/UX improvements and animations
- AI prompt engineering for better scoring
- Testing and bug reports
- Documentation improvements

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with ❤️ by [Ayomide](https://github.com/Ayomisco)
- Powered by [LangChain](https://langchain.com), [Ollama](https://ollama.ai), [FastAPI](https://fastapi.tiangolo.com), and [Next.js](https://nextjs.org)

---

<p align="center">
  <strong>⚒️ Stop hunting. Start forging. ⚒️</strong>
</p>
