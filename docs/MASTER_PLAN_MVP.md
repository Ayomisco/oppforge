# OppForge MVP Master Plan: "The Open Forge"

## 1. 🛡️ Comprehensive Codebase Audit
**Goal:** Ensure security, performance, and scalability before deployment.
- [ ] **Security Scan:** Check API endpoints for unauthenticated access (especially the new open routes).
- [ ] **Performance:** optimizing images, lazy loading components, and verifying database query efficiency (indexing).
- [ ] **Code Quality:** Remove unused code, console logs, and "mock" data remnants in critical paths.
- [ ] **Scraper Resilience:** Verify all scrapers have `try/except` blocks and fallback data (already partially done).

## 2. 🚀 Deployment Strategy (Railway & Self-Host)
**Goal:** A fully autonomous, self-hosted stack on Railway.

### Architecture on Railway
- **Service A (Frontend):** Next.js (Node.js) -> `platform/`
- **Service B (Backend):** FastAPI (Python) -> `backend/`
- **Service C (AI Engine):** FastAPI (Python/LangChain) -> `ai-engine/`
  - *Note:* Hosting LLMs on Railway is expensive/slow. We will host the *Orchestrator* there, but route heavy inference to **Groq** (fast, cheap) or a dedicated GPU provider if needed.
- **Database:** PostgreSQL (Railway Managed).
- **Queue:** Redis (Railway Managed) for Celery.
- **Worker:** Celery Worker (Python) -> `backend/` (Same repo, different start command).

### Action Items
- [ ] Create `Dockerfile` for Backend (API + Worker).
- [ ] Create `Dockerfile` for AI Engine.
- [ ] Configure `railway.toml` or `docker-compose.prod.yml`.
- [ ] Set up Environment Variables (Migration from `.env` to Railway config).

## 3. 🔓 "Open Forge" Architecture (Web3 Native Access)
**Goal:** "Show, don't tell." Users see value *before* connecting.

### User Flow
1.  **Visitor (Unauthenticated):**
    - Can view `/dashboard` (Recent Opportunities).
    - Can view `/opportunities/[id]` (Details, Analysis).
    - *Restriction:* Cannot Chat, Save, Track, or One-Click Apply.
    - *Call to Action:* "Connect Wallet/Login to Unlock AI Tools."
2.  **Authenticated (Free):**
    - Basic access, limited AI usage.
3.  **Pro Member (Subscription):**
    - Unlimited AI, Auto-Apply, Advanced Analytics.

### Technical Changes
- **Middleware:** Remove `/dashboard` and `/opportunities` from valid token checks.
- **Frontend:** Add `useAuth` checks to buttons ("Apply", "Chat"). If (!user) -> Open Login Modal.
- **Soft-Gating:** Implement a "20-minute session" timer or "3-view limit" for guests (optional, strictly requested by user).

## 4. 👑 Admin Command Center
**Goal:** God-mode view of the platform.
- **Route:** `/admin` (Protected, requires `role="admin"`).
- **Features:**
  - **User Stats:** Total users, active today, conversion rate.
  - **Scraper Health:** Live status of DoraHacks, Superteam, etc. (Green/Red dots).
  - **Content Moderation:** Ability to "Hide" or "Boost" opportunities.

## 5. 💎 Subscription & Monetization Refactor
**Goal:** Realistic, crypto-native pricing.
- **Location:** Move from Sidebar -> `Settings > Membership`.
- **Pricing Model:**
  - **Monthly:** $15 (Paid in ETH/ARB/USDC).
  - **Yearly:** $150 (2 months free).
  - **Payment:** Integrate **Helio** or **Sphere** for crypto payments.
  - **Pricing in ARB:** Fetch live price or hardcode approx (e.g., 15 ARB/month).

## 6. ✨ "Standout" Features (The X-Factor)
To make OppForge a "Go-To" app:
1.  **"Win Probability" Score:** AI analyzes the user's Github/profile vs. the bounty requirements and gives a % chance of winning.
2.  **"One-Click Cover Letter":** AI generates a tailored proposal based on the user's specific past projects.
3.  **"Team Formation":** "This bounty requires Rust + Frontend. You have Rust. Find a Frontend Dev?" (Social graph).
4.  **"Smart Alerts":** "A new Arbitrum grant just dropped that matches your profile perfectly." (Push/Email).

## 7. Execution Plan
1.  **Phase 1: Open Access (Immediate):** Modify middleware, allow guest viewing.
2.  **Phase 2: Admin & Subscription:** Build the Admin dashboard and refactor the pricing page.
3.  **Phase 3: Deployment Prep:** Containerize everything.
4.  **Phase 4: Launch:** Deploy to Railway.
