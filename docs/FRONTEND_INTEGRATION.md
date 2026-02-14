# Frontend API Integration Plan

## Goal
Replace all `mockData` in the Next.js `platform/` with real-time data from the FastAPI Backend (`http://localhost:8000`).

## 1. Environment & API Client
- **File**: `platform/.env.local`
- **Variable**: `NEXT_PUBLIC_API_URL=http://localhost:8000`
- **Client**: Create `platform/lib/api.js` (using `fetch` or `axios`) to handle:
    - Base URL prefixing.
    - JWT Token injection (Authorization Header).
    - Error handling (redirect to Login on 401).

## 2. Authentication Flow (The "Agent Check-in")
- **Component**: `platform/app/login/page.js` & `platform/components/header.js`
- **Action**: 
    - Enhance "Sign in with Google" button.
    - On success (Google returns token), POST to `/auth/google`.
    - Store returned JWT in `localStorage` / Cookies.
    - Update `UserContext` with profile data (`/auth/me`).

## 3. Dashboard (Mission Control)
- **Component**: `platform/app/dashboard/page.js`
- **Data Source**: 
    - `GET /stats/dashboard` -> Populates "Total Opportunities", "Applications Sent", "Earned".
    - `GET /opportunities/trending` -> Populates "Recommended for You" cards.
    - `GET /notifications` -> Populates Bell Icon dropdown.

## 4. Opportunity Feed (The "Scanner")
- **Component**: `platform/app/opportunities/page.js`
- **Features**:
    - **Search Bar**: Debounced call to `GET /opportunities/search?q=...`.
    - **Filters**: Dropdowns for Chain/Category -> `GET /opportunities?chain=Solana&category=Grant`.
    - **Cards**: Render `OpportunityCard` with real data (Logo, Reward, Description).
    - **"Track" Button**: `POST /tracker` (Moves item to Kanban).

## 5. Tracker Board (The "Agent Workflow")
- **Component**: `platform/app/tracker/page.js`
- **Data Source**: `GET /tracker` (Returns list of applications).
- **Kanban Columns**: Group by status (`Interested`, `Applied`, `Interview`, `Won`).
- **Drag & Drop**: Updates status via `PUT /tracker/{id}`.

## 6. Real-Time Updates (SWR / Polling)
- Use **SWR** (Stale-While-Revalidate) for auto-refreshing data without full page reloads.
- **Polling**: Check notifications every 30s.

## 7. Agentic Chat (The "Consultant") - *Later Phase*
- **Component**: `platform/components/chat-widget.js`
- **Action**: Connect input to `POST /chat` (API sends context to Groq).
- **Display**: Stream AI response.

---

## Technical Stack
- **Framework**: Next.js 14 (App Router)
- **Data Fetching**: `swr` (Recommended for simplicity & caching)
- **State Management**: React `Context` (for User/Auth state)
- **Styling**: Tailwind CSS (Existing)
