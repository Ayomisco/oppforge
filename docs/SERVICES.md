# OppForge — External Services & Resources

## 1. Authentication & Wallet

| Service | Purpose | Cost | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Google OAuth** | Social Login / Profile | **Free** | ✅ Live | Client ID moved to `auth/google` endpoint. |
| **NextAuth.js** | Frontend Auth Wrapper | **Free** | ⏳ Planned | For Next.js client-side state. |
| **RainbowKit** | Crypto Wallet UI | **Free** | ⏳ Planned | For future wallet connection. |
| **Wagmi** | EVM Hooks | **Free** | ⏳ Planned | React hooks for Ethereum interaction. |
| **WalletConnect** | Mobile Linking | **Free** | ⏳ Planned | Project ID required. |

---

## 2. Artificial Intelligence (LLMs)

| Service | Model | Cost | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Groq Cloud** | **Llama 3.1 8B Instant** | **Free** | ✅ Live | Ultra-fast inference for Chat & Scoring. |
| **Ollama** | Llama 3 / Mistral | **Free** | ⏳ Backup | Local fallback option. |
| **HuggingFace** | Embeddings | **Free** | ⏳ Planned | For vector search/deduplication. |

---

## 3. Data Sources & Scrapers

| Service | Purpose | Cost | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **RapidAPI** | **Twitter/X Scraper** | **Paid** | ✅ Live | `twitter-api45` (Key: 0ee1b...). Used for 100+ ecosystems. |
| **Reddit API** | Scrape r/ethdev, etc. | **Free** | ✅ Live | JSON endpoints (`/r/sub/new.json`). |
| **Gitcoin** | Grant Data | **Free** | 🟡 Stub | Public Grants Explorer. |
| **Helius** | Solana RPC | **Free** | ✅ Live | High-performance Solana data. |
| **Alchemy** | EVM RPC | **Free** | ⏳ Planned | Ethereum/Base/Arb data. |
| **RSShub** | Fallback Scraping | **Free** | ⏳ Backup | If API quotas run out. |

---

## 4. Database & Storage

| Service | Tech | Cost | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Aiven** | **PostgreSQL (v16)** | **Paid** | ✅ **Primary** | `postgres://avnadmin:...` (SSL Required). |
| **SQLite** | Local Relational DB | **Free** | ✅ **Dev** | `oppforge.db` for offline/local dev. |
| **Turso** | LibSQL | **Free** | ❌ Error | `405 Method Not Allowed` (Protocol issue). |
| **Supabase** | Postgres + Auth | **Free** | ⏳ Client | Good alternative for Auth/Storage. |
| **ChromaDB** | Vector DB | **Free** | ⏳ Planned | For AI memory / detailed search. |

---

## 6. Communication & Notifications

| Service | Purpose | Cost | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Plunk** | Marketing/Transac Email | **Free** | ⏳ Planned | Open source alternative to Resend/SendGrid. |
| **Discord Webhooks** | Admin Alerts | **Free** | ⏳ Planned | For internal monitoring. |

---

## 🔐 Environmental Variables (.env)

| Key | Purpose | Current Value (masked) |
| :--- | :--- | :--- |
| `DATABASE_URL` | Aiven Connection | `postgres://avnadmin:AVNS...@...aivencloud.com:25460/defaultdb` |
| `GROQ_API_KEY` | AI Inference | `gsk_i0k6...` |
| `RAPIDAPI_KEY` | Twitter Scraping | `0ee1baae...` |
| `HELIUS_API_KEY` | Solana RPC | `1301b4c8...` |
| `GOOGLE_CLIENT_ID` | OAuth | `96703723...` |
