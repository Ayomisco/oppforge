# OppForge — External Services & Resources (Zero Cost Edition)

> **Philosophy**: All selected services must have a generous **Forever Free Tier** or be **Open Source** (Self-Hosted). The goal is $0 operational cost until revenue is generated.

---

## 1. Authentication & Wallet (The "Free Stack")

Instead of Privy (which costs money at scale), we use a composite open-source stack.

| Service | Purpose | Cost | Where to Get | Limits |
| :--- | :--- | :--- | :--- | :--- |
| **NextAuth.js (Auth.js)** | Manage sessions, Google/Social login | **$0** (Library) | [Use Library](https://authjs.dev/) | None (Self-hosted) |
| **RainbowKit** | UI for connecting crypto wallets | **$0** (Open Source) | [Docs](https://www.rainbowkit.com/) | None |
| **Wagmi** | React Hooks for Ethereum/EVM | **$0** (Open Source) | [Docs](https://wagmi.sh/) | None |
| **Google Cloud Console** | Oauth Credentials for "Login with Google" | **$0** | [Console](https://console.cloud.google.com/) | Free usage quotas are massive |
| **WalletConnect** | Protocol for mobile wallet linking | **Free** | [Cloud](https://cloud.walletconnect.com/) | Project ID required (Free) |

---

## 2. Artificial Intelligence (LLMs)

We avoid paid OpenAI API keys by using high-performance open models via free-tier cloud providers or local hosting.

| Service | Model | Cost | Link | Use For |
| :--- | :--- | :--- | :--- | :--- |
| **Groq Cloud** | **Llama 3 8B / 70B** | **Free** (Beta) | [Console](https://console.groq.com/keys) | **Primary**. Ultra-fast, ideal for Chat & Scoring. |
| **Ollama** | Llama 3 / Mistral | **$0** (Local) | [Download](https://ollama.com/) | **Backup**. Runs on your own machine/server. |
| **HuggingFace** | Various Models | **Free** | [Hub](https://huggingface.co/) | Embeddings (Sentence-Transformers). |

---

## 3. Data Sources & APIs

| Service | Purpose | Cost | Link | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Reddit API** | Scrape r/ethdev, r/solana, etc. | **Free** | [Prefs](https://www.reddit.com/prefs/apps) | Create "Script" app. <60 reqs/min is free. |
| **RSShub / Nitter** | "Twitter" scraping via RSS | **$0** (Self-host) | [GitHub](https://github.com/DIYgod/RSSHub) | Bypasses $100/mo Twitter API. |
| **Gitcoin Grants** | Source for Grant Data | **Free** | Public | Scrape public indexer/API. |
| **Alchemy** | Ethereum/Base/Arb RPC | **Free** | [Dashboard](https://dashboard.alchemy.com/) | 300M Compute Units/month (Plenty). |
| **Helius** | Solana RPC & Webhooks | **Free** | [Dev Portal](https://dev.helius.xyz/) | Best free tier for Solana data. |

---

## 4. Database & Storage

| Service | Tech | Cost | Link | Limits |
| :--- | :--- | :--- | :--- | :--- |
| **Turso** | SQL (libSQL) | **Free** | [Turso.tech](https://turso.tech) | 9 Billion reads/mo (Insane value). |
| **Supabase** | Postgres + Auth | **Free** | [Supabase](https://supabase.com/) | 500MB DB. Good alternative to Turso. |
| **ChromaDB** | Vector DB (AI Memory) | **$0** (Local) | [GitHub](https://github.com/chroma-core/chroma) | Self-hosted alongside backend. |

---

## 5. Deployment & Hosting

| Service | Purpose | Cost | Link | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Vercel** | Frontend Hosting (Next.js) | **Free** | [Vercel](https://vercel.com/) | Best for Next.js. |
| **Render** | Backend Hosting (Python) | **Free** | [Render](https://render.com/) | Webservice spins down after inactivity (slow start). |
| **Railway** | Backend Hosting | **$5** (Trial) | [Railway](https://railway.app/) | Better performance, standard choice if Render is too slow. |

---

## 🔐 Action Items: Keys You Need to Generate

1.  **Google OAuth Client ID & Secret** (For Social Login)
    -   Go to Google Cloud Console -> APIs & Services -> Credentials -> Create OAuth Client ID.
2.  **WalletConnect Project ID** (For RainbowKit)
    -   Go to WalletConnect Cloud -> Create Project.
3.  **Groq API Key** (For Intelligence)
    -   Go to Groq Console -> Create API Key.
4.  **Helius API Key** (For Solana Data)
    -   Go to Helius Dev Portal.
5.  **Alchemy API Key** (For Ethereum/Base Data)
    -   Go to Alchemy Dashboard.
6.  **Reddit App ID & Secret** (For Scraping)
    -   Go to Reddit Prefs -> Create App (script type).
