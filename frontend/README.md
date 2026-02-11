# OppForge Frontend

Next.js 14+ frontend with App Router for OppForge — the AI-powered Web3 opportunity agent.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Vanilla CSS (custom cyberpunk-brown design system)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                    # Next.js App Router (file-based routing)
│   ├── layout.jsx          # Root layout (sidebar + header)
│   ├── globals.css         # Design tokens + global styles
│   ├── page.jsx            # Landing page (/)
│   ├── dashboard/          # Main feed (/dashboard)
│   ├── opportunity/[id]/   # Opportunity detail (/opportunity/:id)
│   ├── chat/               # Full-page chat (/chat)
│   ├── tracker/            # Application tracker (/tracker)
│   ├── settings/           # User preferences (/settings)
│   └── onboarding/         # First-time setup (/onboarding)
│
├── components/             # Reusable UI components
│   ├── layout/             # Sidebar, Header, AppShell, MobileNav
│   ├── opportunity/        # OpportunityCard, ScoreBadge, ChainBadge
│   ├── chat/               # ChatPanel, ChatMessage, ChatInput
│   ├── dashboard/          # StatsBar, TrendChart, TopOpportunities
│   ├── filters/            # FilterBar, ChainFilter, CategoryFilter
│   └── common/             # Button, Modal, Loader, Badge, Toast
│
├── hooks/                  # Custom React hooks
├── services/               # API service layer (Axios)
├── context/                # React Context providers
└── utils/                  # Helpers, constants, formatters
```

## Design System

The frontend uses a custom **Cyberpunk-Brown** design system:

- **Base colors**: Espresso (`#0D0A07`), Walnut (`#1A1410`), Mahogany (`#2C1810`)
- **Accents**: Forge Orange (`#FF6B1A`), Gold (`#FFD700`), Amber (`#FF9500`)
- **Fonts**: JetBrains Mono (monospace) + Space Grotesk (sans-serif)
- **Effects**: Glassmorphism, scanline animations, glowing borders

## Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```
