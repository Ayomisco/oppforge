# OppForge Deployment Guide

This guide outlines the steps to deploy the various components of the OppForge ecosystem.

## 1. 🏗️ Backend (FastAPI)
The core intelligence and API layer.
*   **Technology**: Python 3.13, FastAPI, SQLAlchemy (PostgreSQL).
*   **Recommended Host**: [Railway](https://railway.app), [Render](https://render.com), or [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform).

### Steps:
1.  **Set Environment Variables**:
    *   `DATABASE_URL`: Your PostgreSQL connection string.
    *   `GROQ_API_KEY`: For AI Triage & Analysis.
    *   `ENVIRONMENT`: `production`.
2.  **Deployment Command**:
    ```bash
    gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
    ```
3.  **Ensure `requirements.txt` is updated**:
    ```bash
    pip freeze > requirements.txt
    ```

---

## 2. 💻 Platform (Dashboard)
The main web application for users.
*   **Technology**: Next.js (App Router).
*   **Recommended Host**: [Vercel](https://vercel.com).

### Steps:
1.  **Set Environment Variables**:
    *   `NEXT_PUBLIC_API_URL`: The URL of your deployed backend.
2.  **Build Command**: `npm run build`
3.  **Output**: Auto-detected by Vercel.

---

## 3. 🌐 Website (Landing Page)
The public-facing marketing site.
*   **Technology**: Next.js.
*   **Recommended Host**: [Vercel](https://vercel.com).

### Steps:
1.  **Build Command**: `npm run build`
2.  **Deploy**: Connect the repository to Vercel and point to the `website` directory.

---

## 4. 🧠 AI Engine
Independent background worker for heavy scraping and processing.
*   **Technology**: Python, Playwright/Browserless.
*   **Recommended Host**: Render (Background Worker) or Railway.

### Steps:
1.  **Installation**: Ensure `playwright install` is run in the build step.
2.  **Command**: `python main.py`
3.  **Resources**: Needs at least 1GB RAM if running browser-based scrapers.

---

## 5. 📜 Contracts (Smart Contracts)
*   **Technology**: Hardhat, Solidity.
*   **Deployment**: EVM Chains (Arbitrum, Solana via local bridges, etc.).

### Steps:
1.  **Configure `hardhat.config.js`**: Add your RPC URLs and Private Keys (use `.env`).
2.  **Deploy**:
    ```bash
    npx hardhat run scripts/deploy.js --network <network_name>
    ```

---

## 🛠️ Typical Workflow for Updates
1.  **Backend Changes**: Push to `backend/`, Railway auto-deploys.
2.  **UI Changes**: Push to `platform/` or `website/`, Vercel auto-deploys.
3.  **New Contract**: Deploy via Hardhat, update contract addresses in `backend` and `platform`.
