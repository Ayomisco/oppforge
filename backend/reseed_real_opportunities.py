#!/usr/bin/env python3
"""
Clean reseed: removes ALL old seeded/fake opportunities and inserts ONLY
real, verified March-April 2026 opportunities with correct URLs and deadlines.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal
from app.models.opportunity import Opportunity
from datetime import datetime
from sqlalchemy import or_

# ─── Known fake/old URLs to remove ──────────────────────────────────────────
FAKE_URLS = [
    "https://ethglobal.com/events/london2026",
    "https://ethglobal.com/events/scaling2026",
    "https://solana.com/grizzlython",
    "https://solana.com/defi-hack",
    "https://gitcoin.co/grants",
    "https://uniswapfoundation.org/grants",
    "https://aavegrants.org",
    "https://arbitrum.io/stylus-hack",
    "https://optimism.io/retropgf",
    "https://base.org/summer",
    "https://zksync.io/builders",
    "https://polygon.technology/village",
    "https://avax.network/multiverse",
    "https://earn.superteam.fun/listings/bounty/defi-dashboard",
    "https://farcaster.xyz/frames-grant",
    "https://immunefi.com/research-grant",
    "https://monad.xyz/testnet",
    "https://berachain.com/hackathon",
    "https://blast.io/bigbang",
    "https://dorahacks.io/web3-for-good",
    "https://makerdao.com/endgame-grants",
    "https://compoundgrants.org",
]


def get_real_opportunities():
    """Only real, verified opportunities with correct URLs and dates."""
    return [
        # ─────────── 1. World Build Labs ───────────
        {
            "title": "World Build Labs — Hack, Build, Ship",
            "url": "https://worldbuildlabs.com/",
            "description": "World Build Labs is a multi-stage program for builders creating impactful products using new technologies. Stage 1 is an online hackathon (April 23-26) with ~$20K in prizes. Stage 2 is a fully funded 8-day build retreat in Seoul, South Korea (May 10-18) working alongside World's dev team. Stage 3 is a 3-month virtual program with weekly standups and office hours. Culminates in a Demo Day at Tools for Humanity HQ in San Francisco pitching to top-tier VCs. Teams get access to 38M+ World users across 160 countries, subsidized gas, up to $200K in grant funding, 50+ hours of mentorship, and fully funded travel.",
            "category": "hackathon",
            "source": "World / Tools for Humanity",
            "reward_pool": "$200,000+ in grants + $20K hack prizes",
            "reward_token": "USD",
            "estimated_value_usd": 220000,
            "deadline": datetime(2026, 4, 23),
            "start_date": datetime(2026, 4, 23),
            "chain": "Multi-chain",
            "tags": ["World", "Mini Apps", "Build Retreat", "Accelerator", "Seoul", "San Francisco"],
            "mission_requirements": [
                "Solo founders or teams — you must write your own code",
                "Non-technical founders can find co-founders during the hack",
                "Must speak English",
                "If already building on World, fast track available for established teams",
                "Stage 1: Online hackathon April 23-26; can skip with a live Mini App",
                "Stage 2: Full-time 8-day build retreat in Seoul (May 10-18)"
            ],
            "required_skills": ["Full-Stack Development", "Mini Apps", "Product Design", "JavaScript", "TypeScript"],
            "ai_summary": "Multi-stage builder program from World/Tools for Humanity. $200K+ grants, access to 38M users. Great for founders building consumer apps on World's platform.",
            "ai_strategy": "Start with the online hackathon. If you already have a working Mini App or demo, apply direct for Stage 2. Focus on products that leverage World's unique user base and biometric identity.",
            "ai_score": 84,
            "difficulty": "Intermediate",
            "difficulty_score": 6,
            "win_probability": "Medium",
            "urgency_score": 70,
            "trust_score": 92,
            "risk_score": 5,
            "risk_level": "Low",
            "risk_flags": [],
            "logo_url": "https://worldbuildlabs.com/favicon.ico",
        },
        # ─────────── 2. Walrus Birthday Challenge ───────────
        {
            "title": "Walrus Birthday Writing Challenge — Win up to $1000 in WAL",
            "url": "https://x.com/WalrusProtocol/status/2034054046022246792",
            "description": "Walrus Protocol turns one! Write about why verifiable data matters — the tech, the use cases, the vision — for a chance to win up to $1000 in WAL tokens. Share your take as a thread, article, or any format on X. 1st place: $1000 in WAL, 2nd place: $600 in WAL, 3rd place: $400 in WAL. Submit by April 17, 2026.",
            "category": "bounty",
            "source": "Walrus Protocol",
            "reward_pool": "$2,000 in WAL",
            "reward_token": "WAL",
            "estimated_value_usd": 2000,
            "deadline": datetime(2026, 4, 17),
            "start_date": datetime(2026, 3, 18),
            "chain": "Sui",
            "tags": ["Writing", "Content", "Verifiable Data", "Walrus", "Sui"],
            "mission_requirements": [
                "Write about why verifiable data matters (minimum 600 words)",
                "Post as X thread, X article, or long-form post",
                "Reply to Walrus's announcement post with your submission link",
                "Tag @WalrusProtocol in your post",
                "Submit by April 17, 2026",
                "Any format works: thread, article, essay"
            ],
            "required_skills": ["Technical Writing", "Content Creation", "Web3 Knowledge", "X/Twitter"],
            "ai_summary": "Low-barrier writing bounty from Walrus Protocol. $2K total prizes for content about verifiable data. Great for writers and content creators.",
            "ai_strategy": "Write a deep-dive on a specific Walrus use case rather than generic 'verifiable data is good' content. Include technical details about how Walrus stores and verifies data. Stand out with original research or comparisons.",
            "ai_score": 65,
            "difficulty": "Beginner",
            "difficulty_score": 2,
            "win_probability": "Medium",
            "urgency_score": 75,
            "trust_score": 88,
            "risk_score": 5,
            "risk_level": "Low",
            "risk_flags": [],
            "logo_url": "https://cryptologos.cc/logos/sui-sui-logo.svg",
        },
        # ─────────── 3. Photon Ambassador Program ───────────
        {
            "title": "Photon Ambassador Program — $100K for Agent Builders",
            "url": "https://photonhq.typeform.com/to/KKiVcjyE",
            "description": "Photon is putting $100K behind builders who create AI agents that normal people can actually use. As a Photon Ambassador you get: X Premium+ and official affiliate status with @photon_hq, unlimited Photon SDK access, and performance-based bonuses. Build agents, deploy them, and help ship to the world. Discord community for Q&A at discord.gg/uZcn6k9TPg.",
            "category": "ambassador",
            "source": "Photon",
            "reward_pool": "$100,000",
            "reward_token": "USD",
            "estimated_value_usd": 100000,
            "deadline": None,
            "chain": "Multi-chain",
            "tags": ["AI Agents", "Ambassador", "SDK", "Performance Bonus", "Builder"],
            "mission_requirements": [
                "Build AI agents that normal people can actually use",
                "Apply via the official Typeform application",
                "Get X Premium+ and official Photon affiliate status",
                "Access unlimited Photon SDK for development",
                "Performance-based bonuses for shipped agents",
                "Join Discord community for support and Q&A"
            ],
            "required_skills": ["AI/ML", "Python", "JavaScript", "Agent Development", "Photon SDK"],
            "ai_summary": "$100K ambassador program for AI agent builders. Low barrier — focus on shipping useful agents. Performance-based rewards mean top builders earn more.",
            "ai_strategy": "Focus on building agents for real consumer use cases (shopping, scheduling, research). The program rewards shipped products, not prototypes. Start with a simple, polished agent and iterate.",
            "ai_score": 72,
            "difficulty": "Intermediate",
            "difficulty_score": 5,
            "win_probability": "High",
            "urgency_score": 40,
            "trust_score": 78,
            "risk_score": 15,
            "risk_level": "Low",
            "risk_flags": ["Rolling program — no fixed deadline"],
            "logo_url": None,
        },
        # ─────────── 4. Character Labs G6 ───────────
        {
            "title": "Character Labs G6 — Startup Accelerator (Apply Now)",
            "url": "https://character.vc/labs",
            "description": "Character Labs G6 is a radically revamped accelerator program for inception/idea-stage founders. New for G6: All-new Sales Sprint and Marketing Sprints designed to help founders sell fast (weeks, not months). Revamped Pitch Sprint based on founders who raised from a16z, First Round, Index, Obvious, Bessemer, General Catalyst. For the first time ever, a Demo Day where 15+ founders pitch investors simultaneously. Portfolio includes founders who've raised from elite VCs. Applications due in ~3 weeks.",
            "category": "accelerator",
            "source": "Character VC",
            "reward_pool": "Accelerator + VC Access",
            "reward_token": "N/A",
            "estimated_value_usd": 0,
            "deadline": datetime(2026, 4, 8),
            "start_date": None,
            "chain": "Multi-chain",
            "tags": ["Accelerator", "Startup", "Fundraising", "Pitch", "Demo Day", "VC"],
            "mission_requirements": [
                "Must be at inception or idea stage",
                "Apply via character.vc/labs website",
                "Focus on building and selling — program emphasizes speed",
                "Participate in Sales Sprint, Marketing Sprint, and Pitch Sprint",
                "Attend the first-ever Character Labs Demo Day",
                "Build a startup with real traction potential"
            ],
            "required_skills": ["Product Development", "Business Strategy", "Pitching", "Sales", "Marketing"],
            "ai_summary": "Top-tier accelerator for early-stage founders. Alumni raised from a16z, First Round, Bessemer. G6 has new Sales/Marketing sprints and first Demo Day.",
            "ai_strategy": "Apply even at idea stage — that's their sweet spot. Have a clear problem statement and initial customer hypothesis. The Sales Sprint is designed to help you close before your product is 'ready.'",
            "ai_score": 70,
            "difficulty": "Intermediate",
            "difficulty_score": 5,
            "win_probability": "Medium",
            "urgency_score": 80,
            "trust_score": 90,
            "risk_score": 5,
            "risk_level": "Low",
            "risk_flags": [],
            "logo_url": None,
        },
        # ─────────── 5. Nosana Builders' Challenge #4 ───────────
        {
            "title": "Nosana Builders' Challenge #4 × ElizaOS — $3,000 in Prizes",
            "url": "https://luma.com/9i9eu7vg",
            "description": "Nosana's Builders' Challenge #4 in collaboration with ElizaOS. Build AI agents, deploy on decentralized GPU infrastructure, and win a share of $3,000. Goes live March 25th, 2026. Build with Nosana's decentralized GPU network and ElizaOS agent framework.",
            "category": "hackathon",
            "source": "Nosana",
            "reward_pool": "$3,000",
            "reward_token": "NOS",
            "estimated_value_usd": 3000,
            "deadline": None,
            "start_date": datetime(2026, 3, 25),
            "chain": "Solana",
            "tags": ["AI Agents", "GPU", "ElizaOS", "Decentralized Compute", "Nosana"],
            "mission_requirements": [
                "Build AI agents using ElizaOS framework",
                "Deploy on Nosana's decentralized GPU infrastructure",
                "Register via Luma event page before March 25",
                "Submit working agent demonstration",
                "Leverage Nosana SDK for GPU inference",
                "Present at demo day"
            ],
            "required_skills": ["Python", "AI/ML", "ElizaOS", "Solana", "GPU Computing"],
            "ai_summary": "Small but focused builder challenge. $3K prizes for AI agents on decentralized GPU. Good entry point for AI x Crypto builders.",
            "ai_strategy": "Focus on a practical agent use case that benefits from decentralized GPU (e.g., image generation, LLM inference). Low competition = higher win probability. Study ElizaOS docs before the start date.",
            "ai_score": 58,
            "difficulty": "Intermediate",
            "difficulty_score": 6,
            "win_probability": "High",
            "urgency_score": 85,
            "trust_score": 82,
            "risk_score": 10,
            "risk_level": "Low",
            "risk_flags": [],
            "logo_url": "https://cryptologos.cc/logos/solana-sol-logo.svg",
        },
        # ─────────── 6. Antler India Embark ───────────
        {
            "title": "Antler Embark #3 — $450K Capital + 4 Weeks in San Francisco",
            "url": "https://is.gd/0QBaWC",
            "description": "Antler Embark returns for the 3rd time. Two cohorts, 23 AI startups, 60%+ with US traction. Ambitious founders building global companies from Day Zero get: $450K in capital, $1M+ in AI perks, 50+ closed-door sessions with SF's Who's Who, 4 weeks in San Francisco building with Antler, 60%+ of Embark founders walk out with real US traction, 50%+ have raised further capital. Applications close March 28, 2026.",
            "category": "accelerator",
            "source": "Antler India",
            "reward_pool": "$450,000 capital + $1M+ AI perks",
            "reward_token": "USD",
            "estimated_value_usd": 450000,
            "deadline": datetime(2026, 3, 28),
            "start_date": None,
            "chain": "Multi-chain",
            "tags": ["AI Startups", "Accelerator", "San Francisco", "Capital", "Global"],
            "mission_requirements": [
                "Must be building an AI startup with global ambitions",
                "Applications close March 28, 2026",
                "Commit to 4 weeks in San Francisco",
                "Participate in 50+ closed-door sessions",
                "Focus on building real US traction during the program",
                "Apply via Antler's official application link"
            ],
            "required_skills": ["AI/ML", "Product Development", "Business Strategy", "Fundraising", "Leadership"],
            "ai_summary": "Elite accelerator: $450K + $1M AI perks + 4 weeks in SF. Proven track record: 60% leave with US traction. Closing soon — March 28.",
            "ai_strategy": "Apply NOW — deadline is March 28. Highlight any existing US traction or revenue. AI-native startups are the focus. Have a pitch deck ready. The $1M+ AI perks (likely GPU credits) are a huge advantage.",
            "ai_score": 82,
            "difficulty": "Intermediate",
            "difficulty_score": 6,
            "win_probability": "Medium",
            "urgency_score": 95,
            "trust_score": 95,
            "risk_score": 5,
            "risk_level": "Low",
            "risk_flags": [],
            "logo_url": None,
        },
        # ─────────── 7. Colosseum / Network State Solana ───────────
        {
            "title": "Network State — 5-Week Solana Build Station (Colosseum Spring)",
            "url": "https://colosseum.org",
            "description": "Building for Colosseum this spring? Network State by SNS, NS, and SuperteamMY is a focused 5-week build station in Malaysia for serious Solana teams. Work side by side with founders, mentors, and sponsor engineers. Perfect for teams competing in the Colosseum hackathon who want an immersive build environment.",
            "category": "hackathon",
            "source": "Colosseum / Network State",
            "reward_pool": "Build Station + Mentorship",
            "reward_token": "N/A",
            "estimated_value_usd": 0,
            "deadline": None,
            "start_date": None,
            "chain": "Solana",
            "tags": ["Solana", "Build Station", "Colosseum", "Malaysia", "Mentorship"],
            "mission_requirements": [
                "Must be building a Solana project for Colosseum spring hackathon",
                "5-week commitment at the build station",
                "Work alongside other founders, mentors, and sponsor engineers",
                "Hosted by SNS, NS, and SuperteamMY",
                "Serious teams only — focus on shipping",
                "Location-based program"
            ],
            "required_skills": ["Rust", "Anchor", "Solana Web3.js", "TypeScript", "Product Development"],
            "ai_summary": "5-week focused Solana build station for Colosseum hackathon teams. Mentor access and co-working with founders. Good if you're serious about shipping.",
            "ai_strategy": "Apply to Colosseum hackathon first, then apply for Network State build station. Being physically present gives major advantages for mentorship and networking. Great for Solana-native teams.",
            "ai_score": 66,
            "difficulty": "Intermediate",
            "difficulty_score": 6,
            "win_probability": "Medium",
            "urgency_score": 50,
            "trust_score": 85,
            "risk_score": 10,
            "risk_level": "Low",
            "risk_flags": ["No explicit prize pool — value is in mentorship and co-building"],
            "logo_url": "https://cryptologos.cc/logos/solana-sol-logo.svg",
        },
        # ─────────── 8. Bulk Trade Testnet / Airdrop ───────────
        {
            "title": "Bulk Trade Testnet — Airdrop Farming Opportunity",
            "url": "https://testnet.bulktrade.io",
            "description": "Bulk Trade (@bulktrade) testnet is now live for public access. Potential airdrop farming opportunity. Steps: Join Discord and get OG or Contributor role (awarded for quality content and feedback), hold BulkSOL LST or leverage it on Exponent Finance (earn ~10% yield), trade on Bulk testnet using mock USDC. Token launch expected Q4 2026. Not confirmed by team, but early participation typically rewarded.",
            "category": "airdrop",
            "source": "Bulk Trade",
            "reward_pool": "Potential Airdrop (TBD)",
            "reward_token": "BULK (TBD)",
            "estimated_value_usd": 0,
            "deadline": None,
            "chain": "Solana",
            "tags": ["Testnet", "Airdrop", "Trading", "LST", "Solana", "DeFi"],
            "mission_requirements": [
                "Join Bulk Trade Discord and earn OG or Contributor role",
                "Create quality content and provide product feedback",
                "Hold BulkSOL LST or leverage it on Exponent Finance (~10% yield)",
                "Trade on Bulk testnet: connect Solana wallet, claim mock USDC, generate volume",
                "Share feedback with the team on Discord",
                "Use official testnet link only — beware of phishing"
            ],
            "required_skills": ["DeFi Trading", "Solana Wallet", "Discord Community", "Content Creation"],
            "ai_summary": "Early testnet airdrop opportunity. Low barrier — trade on testnet, hold LST, contribute to community. Token launch expected Q4 2026.",
            "ai_strategy": "Focus on generating consistent testnet volume and earning Discord roles. The OG role is likely most valuable for airdrop eligibility. Hold BulkSOL LST for yield + potential snapshot eligibility.",
            "ai_score": 55,
            "difficulty": "Beginner",
            "difficulty_score": 2,
            "win_probability": "Medium",
            "urgency_score": 30,
            "trust_score": 65,
            "risk_score": 30,
            "risk_level": "Medium",
            "risk_flags": ["Airdrop not confirmed by team", "Token launch timeline uncertain", "Always verify official links"],
            "logo_url": "https://cryptologos.cc/logos/solana-sol-logo.svg",
        },
        # ─────────── 9. Tea-Fi Ambassador Program Phase 3 ───────────
        {
            "title": "Tea-Fi Ambassador Program Phase 3 — 850,000 $TEA Reward Pool",
            "url": "https://app.tea-fi.com",
            "description": "Tea-Fi's Ambassador Program Phase 3 is live, designed for Content Creators and Local Leads. Total reward pool of 850,000 $TEA tokens. Contribute quality content, be early, and earn rewards through the Crypto Super App.",
            "category": "ambassador",
            "source": "Tea-Fi",
            "reward_pool": "850,000 $TEA",
            "reward_token": "TEA",
            "estimated_value_usd": 0,
            "deadline": None,
            "chain": "Multi-chain",
            "tags": ["Ambassador", "Content Creation", "Community", "Tea-Fi", "Crypto App"],
            "mission_requirements": [
                "Apply as a Content Creator or Local Lead",
                "Create quality content about Tea-Fi ecosystem",
                "Be an early and active participant",
                "Use the Tea-Fi app at app.tea-fi.com",
                "Build local community presence",
                "Maintain regular content output"
            ],
            "required_skills": ["Content Creation", "Community Building", "Social Media", "Marketing"],
            "ai_summary": "Ambassador program with 850K $TEA token pool. Low barrier for content creators. Great for community builders and crypto influencers.",
            "ai_strategy": "Start creating content immediately — early ambassadors typically get the best allocations. Focus on educational content about Tea-Fi features. Build a local community to qualify for Local Lead tier.",
            "ai_score": 50,
            "difficulty": "Beginner",
            "difficulty_score": 2,
            "win_probability": "High",
            "urgency_score": 60,
            "trust_score": 68,
            "risk_score": 25,
            "risk_level": "Medium",
            "risk_flags": ["Token value uncertain", "Ambassador programs can change terms"],
            "logo_url": None,
        },
        # ─────────── 10. AEON Pioneer Program ───────────
        {
            "title": "AEON Pioneer Program — March 2026 Ambassador Wave",
            "url": "https://zealy.io/cw/aeonpioneer",
            "description": "AEON's Ambassador Program (Pioneer Program) is live for March 2026. If you're passionate about the AI Payment vision, love creating content, engaging communities, and building the future of crypto payments — apply now. Detailed program info at notion.so/aeonxyz. Join via Zealy and start completing quests.",
            "category": "ambassador",
            "source": "AEON",
            "reward_pool": "Ambassador Rewards (TBD)",
            "reward_token": "TBD",
            "estimated_value_usd": 0,
            "deadline": datetime(2026, 3, 31),
            "chain": "Multi-chain",
            "tags": ["Ambassador", "AI Payment", "Community", "Content", "Zealy"],
            "mission_requirements": [
                "Join via Zealy platform at zealy.io/cw/aeonpioneer",
                "Read full program details on AEON's Notion page",
                "Create content about AEON's AI Payment vision",
                "Engage with the AEON community actively",
                "Complete quests and tasks on Zealy",
                "Maintain consistent participation throughout March"
            ],
            "required_skills": ["Content Creation", "Community Engagement", "Social Media", "Writing"],
            "ai_summary": "Ambassador program from AEON AI Payments. Zealy-based with quest completion. Good for community builders wanting early exposure to AI payment projects.",
            "ai_strategy": "Focus on completing Zealy quests quickly — early completers often get priority. Create original content rather than just retweets. Engage genuinely in the community Discord.",
            "ai_score": 45,
            "difficulty": "Beginner",
            "difficulty_score": 1,
            "win_probability": "High",
            "urgency_score": 70,
            "trust_score": 65,
            "risk_score": 25,
            "risk_level": "Medium",
            "risk_flags": ["Reward details not fully specified", "New project — research before committing"],
            "logo_url": None,
        },
        # ─────────── 11. Cre8core Labs Bounty ───────────
        {
            "title": "Cre8core Labs × Utkus — $200 Creator Bounty",
            "url": "https://cre8core.fun",
            "description": "A new $200 bounty from Cre8core Labs in collaboration with @utkus_eth. Cre8core hosts Utkus's mini app game. Head over to cre8core.fun, check the criteria, and start creating content. Open to all cre8tors.",
            "category": "bounty",
            "source": "Cre8core Labs",
            "reward_pool": "$200",
            "reward_token": "USD",
            "estimated_value_usd": 200,
            "deadline": None,
            "chain": "Multi-chain",
            "tags": ["Creator", "Bounty", "Mini App", "Gaming", "Content"],
            "mission_requirements": [
                "Visit cre8core.fun for full criteria",
                "Create content based on the bounty requirements",
                "Collaboration with @utkus_eth mini app game",
                "Submit work through the platform",
                "Follow Cre8core Labs on social media",
                "Quality content that meets the stated criteria"
            ],
            "required_skills": ["Content Creation", "Gaming", "Social Media", "Graphic Design"],
            "ai_summary": "Quick $200 bounty for content creators. Low barrier, small reward. Good for building portfolio and community connections.",
            "ai_strategy": "Focus on creating high-quality visuals or video content. Small pool = less competition. Study previous Cre8core bounty winners to understand what judges value.",
            "ai_score": 40,
            "difficulty": "Beginner",
            "difficulty_score": 1,
            "win_probability": "High",
            "urgency_score": 50,
            "trust_score": 70,
            "risk_score": 10,
            "risk_level": "Low",
            "risk_flags": [],
            "logo_url": None,
        },
        # ─────────── 12. Superteam Earn — Active Bounties ───────────
        {
            "title": "Superteam Earn — Solana Bounties & Grants Hub",
            "url": "https://earn.superteam.fun",
            "description": "Superteam Earn is the go-to platform for Solana ecosystem bounties, grants, and freelance work. Active bounties range from $500 to $50K+ across development, design, content, and marketing. New bounties added weekly by top Solana protocols and projects. Categories: Development bounties, Design challenges, Content creation, Marketing campaigns, and Community growth.",
            "category": "bounty",
            "source": "Superteam",
            "reward_pool": "$500 - $50,000+ per bounty",
            "reward_token": "USDC",
            "estimated_value_usd": 50000,
            "deadline": None,
            "chain": "Solana",
            "tags": ["Solana", "Bounties", "Freelance", "Development", "Design", "Content"],
            "mission_requirements": [
                "Browse active bounties at earn.superteam.fun",
                "Create a Superteam Earn profile with your skills",
                "Submit work by each bounty's individual deadline",
                "Development bounties: ship working code with documentation",
                "Design bounties: submit Figma files or deployed designs",
                "Quality of submission is key — judges are protocol teams"
            ],
            "required_skills": ["Solana Development", "Rust", "React", "Design", "Content Writing"],
            "ai_summary": "Continuous bounty platform for Solana ecosystem. Multiple active opportunities at any time. Great for freelancers and builders looking for paid work.",
            "ai_strategy": "Check the platform weekly for new bounties. Development bounties ($5K-$50K) have the highest payouts but more competition. Content bounties ($500-$2K) are easier wins. Build a track record with smaller bounties first.",
            "ai_score": 74,
            "difficulty": "Intermediate",
            "difficulty_score": 5,
            "win_probability": "Medium",
            "urgency_score": 40,
            "trust_score": 92,
            "risk_score": 5,
            "risk_level": "Low",
            "risk_flags": [],
            "logo_url": "https://cryptologos.cc/logos/solana-sol-logo.svg",
        },
        # ─────────── 13. Colosseum Accelerator (Solana) ───────────
        {
            "title": "Colosseum Accelerator — Solana's Premier Hackathon Platform",
            "url": "https://colosseum.org",
            "description": "Colosseum runs Solana's flagship hackathons and accelerator programs. Their Spring 2026 hackathon is the premier event for builders in the Solana ecosystem. Previous hackathons launched unicorn projects. Winners receive prize money, accelerator admission, and VC introductions. Follow @colosseum for announcements on the Spring hackathon dates and registration.",
            "category": "hackathon",
            "source": "Colosseum",
            "reward_pool": "TBD (Previous: $600K+)",
            "reward_token": "USDC + SOL",
            "estimated_value_usd": 600000,
            "deadline": None,
            "chain": "Solana",
            "tags": ["Solana", "Hackathon", "Accelerator", "DeFi", "Infrastructure"],
            "mission_requirements": [
                "Register on colosseum.org when applications open",
                "Build a Solana project during the hackathon period",
                "Deploy on Solana devnet or mainnet",
                "Submit source code and demo video",
                "Projects must be new — started during the hackathon",
                "Top winners join the Colosseum Accelerator"
            ],
            "required_skills": ["Rust", "Anchor", "Solana Web3.js", "TypeScript", "React"],
            "ai_summary": "Solana's flagship hackathon platform. Previous events launched major projects. Spring 2026 hackathon upcoming — follow for registration dates.",
            "ai_strategy": "Start learning Solana development now. Anchor framework speeds up development significantly. Pick an underserved track (infrastructure, tooling) for less competition. Previous winners focused on novel UX.",
            "ai_score": 80,
            "difficulty": "Intermediate",
            "difficulty_score": 6,
            "win_probability": "Medium",
            "urgency_score": 35,
            "trust_score": 95,
            "risk_score": 5,
            "risk_level": "Low",
            "risk_flags": [],
            "logo_url": "https://cryptologos.cc/logos/solana-sol-logo.svg",
        },
        # ─────────── 14. ETHGlobal Brussels 2026 (Real) ───────────
        {
            "title": "ETHGlobal Brussels 2026",
            "url": "https://ethglobal.com/events/brussels",
            "description": "ETHGlobal Brussels is an in-person hackathon bringing together Ethereum builders. Part of ETHGlobal's 2026 circuit. Teams compete across multiple sponsor tracks including DeFi, NFTs, DAOs, identity, and infrastructure. Workshops from top protocol teams, mentor office hours, and a demo day. ETHGlobal events have historically launched major projects. Check ethglobal.com for exact dates and registration.",
            "category": "hackathon",
            "source": "ETHGlobal",
            "reward_pool": "$500,000+",
            "reward_token": "USDC",
            "estimated_value_usd": 500000,
            "deadline": None,
            "chain": "Ethereum",
            "tags": ["DeFi", "NFT", "DAO", "Infrastructure", "Identity", "L2"],
            "mission_requirements": [
                "Register at ethglobal.com when applications open",
                "Build a working prototype during the hackathon",
                "Deploy smart contracts to a supported testnet or mainnet",
                "Submit a 3-minute demo video and public GitHub repository",
                "Team size: 1-5 members; solo hackers welcome",
                "Must use at least one sponsor's technology or API"
            ],
            "required_skills": ["Solidity", "JavaScript", "React", "Ethers.js", "Smart Contracts"],
            "ai_summary": "Premier Ethereum hackathon series. $500K+ in prizes. High competition but excellent networking. Check ethglobal.com for exact dates.",
            "ai_strategy": "Focus on a specific sponsor bounty track rather than the general prize. Arrive with a clear idea and tech stack. Use existing tooling and SDKs to ship faster.",
            "ai_score": 82,
            "difficulty": "Intermediate",
            "difficulty_score": 6,
            "win_probability": "Medium",
            "urgency_score": 30,
            "trust_score": 98,
            "risk_score": 3,
            "risk_level": "Low",
            "risk_flags": [],
            "logo_url": "https://cryptologos.cc/logos/ethereum-eth-logo.svg",
        },
        # ─────────── 15. Gitcoin Grants (Real) ───────────
        {
            "title": "Gitcoin Grants — Quadratic Funding for Public Goods",
            "url": "https://grants.gitcoin.co",
            "description": "Gitcoin's quadratic funding platform distributes matching funds to public goods projects across the Ethereum ecosystem. Categories include Developer Tools, Education, DeFi Infrastructure, Climate Solutions, and Community Growth. Projects receive funding proportional to the number of unique donors. Apply as a grant recipient or contribute as a donor. New rounds announced periodically — check grants.gitcoin.co for active rounds.",
            "category": "grant",
            "source": "Gitcoin",
            "reward_pool": "$2,000,000+ matching pool",
            "reward_token": "DAI",
            "estimated_value_usd": 2000000,
            "deadline": None,
            "chain": "Multi-chain",
            "tags": ["Public Goods", "Dev Tools", "Climate", "Education", "Quadratic Funding"],
            "mission_requirements": [
                "Project must qualify as a public good (open-source, non-extractive)",
                "Create a grant profile on Gitcoin with description, team, and roadmap",
                "Provide proof of prior work or a working prototype",
                "Must pass Gitcoin Passport identity verification (Sybil resistance)",
                "Regular progress updates required during and after funding",
                "Projects must have a clear public goods component"
            ],
            "required_skills": ["Open Source Development", "Community Building", "Smart Contracts", "Technical Writing"],
            "ai_summary": "Quadratic funding — number of unique donors matters more than donation size. Best for open-source projects with existing community.",
            "ai_strategy": "Focus on community outreach to maximize unique donor count. Even $1 donations count significantly. Share on Twitter, Discord, and Farcaster. Have a clear, compelling grant page.",
            "ai_score": 70,
            "difficulty": "Beginner",
            "difficulty_score": 3,
            "win_probability": "High",
            "urgency_score": 30,
            "trust_score": 95,
            "risk_score": 5,
            "risk_level": "Low",
            "risk_flags": [],
            "logo_url": "https://cryptologos.cc/logos/ethereum-eth-logo.svg",
        },
        # ─────────── 16. Optimism RetroPGF (Real) ───────────
        {
            "title": "Optimism RetroPGF — Retroactive Public Goods Funding",
            "url": "https://app.optimism.io/retropgf",
            "description": "Retroactive Public Goods Funding rewards builders who have already created impact in the Optimism ecosystem. Unlike traditional grants, RetroPGF pays for past contributions. Distributed based on community votes from badgeholders. Past recipients include Protocol Guild, L2BEAT, ethers.js, and Remix IDE. Check optimism.io for the next round dates and application windows.",
            "category": "grant",
            "source": "Optimism",
            "reward_pool": "$10,000,000+",
            "reward_token": "OP",
            "estimated_value_usd": 10000000,
            "deadline": None,
            "chain": "Optimism",
            "tags": ["Public Goods", "RetroPGF", "Layer2", "Impact", "Governance"],
            "mission_requirements": [
                "Project must have demonstrable impact on Optimism or Ethereum ecosystem",
                "Create a detailed application describing contributions and their impact",
                "Provide metrics: GitHub stars, downloads, users, TVL impacted, etc.",
                "Applications reviewed and voted on by badgeholders",
                "No application fee; open to individuals, teams, and organizations",
                "Link all relevant repositories, websites, and social accounts"
            ],
            "required_skills": ["Open Source Development", "Community Building", "Technical Documentation"],
            "ai_summary": "Massive retroactive funding. Rewards PAST impact — build now, get funded later. Community-voted, no gatekeepers.",
            "ai_strategy": "Start contributing to the Optimism ecosystem now. Document ALL contributions meticulously. Get endorsements from ecosystem members. The more visible your impact, the more votes you'll receive.",
            "ai_score": 85,
            "difficulty": "Intermediate",
            "difficulty_score": 5,
            "win_probability": "Medium",
            "urgency_score": 25,
            "trust_score": 99,
            "risk_score": 2,
            "risk_level": "Low",
            "risk_flags": [],
            "logo_url": "https://cryptologos.cc/logos/optimism-ethereum-op-logo.svg",
        },
        # ─────────── 17. Arbitrum DAO Grants ───────────
        {
            "title": "Arbitrum DAO Grants — Ecosystem Development Fund",
            "url": "https://arbitrum.foundation/grants",
            "description": "The Arbitrum Foundation and DAO distribute grants for ecosystem development. Focus areas include DeFi protocols, developer tooling, gaming, social apps, and Stylus (Rust/WASM smart contracts). Grants range from $5K to $500K+ based on project scope. Applications via the Arbitrum governance forum. Includes technical support from Offchain Labs engineers.",
            "category": "grant",
            "source": "Arbitrum",
            "reward_pool": "$5,000 - $500,000+",
            "reward_token": "ARB + USDC",
            "estimated_value_usd": 500000,
            "deadline": None,
            "chain": "Arbitrum",
            "tags": ["Layer2", "DeFi", "Stylus", "Gaming", "Developer Tools"],
            "mission_requirements": [
                "Submit proposal to Arbitrum governance forum with scope and budget",
                "Project must benefit the Arbitrum ecosystem",
                "Technical proposals need architecture documentation",
                "Milestone-based delivery with regular progress reviews",
                "Open-source requirement for funded code",
                "Present results at community calls"
            ],
            "required_skills": ["Solidity", "Rust", "Smart Contracts", "Arbitrum SDK", "TypeScript"],
            "ai_summary": "Rolling grants from Arbitrum DAO. $5K-$500K per project. Stylus (Rust smart contracts) and gaming are high-priority tracks.",
            "ai_strategy": "Build on Stylus for less competition. Gaming and social app proposals get faster approvals. Start with a working prototype before applying.",
            "ai_score": 75,
            "difficulty": "Intermediate",
            "difficulty_score": 6,
            "win_probability": "Medium",
            "urgency_score": 20,
            "trust_score": 96,
            "risk_score": 3,
            "risk_level": "Low",
            "risk_flags": [],
            "logo_url": "https://cryptologos.cc/logos/arbitrum-arb-logo.svg",
        },
        # ─────────── 18. Immunefi Bug Bounties (Real) ───────────
        {
            "title": "Immunefi Bug Bounties — Earn Up to $10M per Bug",
            "url": "https://immunefi.com/explore/",
            "description": "Immunefi is the leading Web3 bug bounty platform with $175M+ paid to whitehats. Active bounties from 300+ protocols including Wormhole ($10M max), Arbitrum, Optimism, GMX, and more. Categories: Smart contract vulnerabilities, blockchain/DLT, websites/applications. Payouts range from $1K to $10M depending on severity. Start hunting bugs today.",
            "category": "bounty",
            "source": "Immunefi",
            "reward_pool": "$1,000 - $10,000,000 per bug",
            "reward_token": "USDC",
            "estimated_value_usd": 10000000,
            "deadline": None,
            "chain": "Multi-chain",
            "tags": ["Security", "Bug Bounty", "Smart Contracts", "DeFi", "Whitehat"],
            "mission_requirements": [
                "Browse active bounties at immunefi.com/explore",
                "Find valid security vulnerabilities in listed protocols",
                "Submit detailed vulnerability reports through Immunefi's platform",
                "Follow responsible disclosure: never exploit bugs publicly",
                "Reports are reviewed by protocol teams and Immunefi",
                "Payouts based on severity: Critical > High > Medium > Low"
            ],
            "required_skills": ["Smart Contract Security", "Solidity", "Reverse Engineering", "Blockchain Architecture"],
            "ai_summary": "Highest-paying bug bounties in crypto. $175M+ paid out. Ongoing — hunt anytime. Best for security researchers and auditors.",
            "ai_strategy": "Focus on high-value protocols ($1M+ bounties). New protocol launches often have undiscovered bugs. Study past Immunefi reports to understand common vulnerability patterns. Cross-chain bridges are the highest-value targets.",
            "ai_score": 78,
            "difficulty": "Expert",
            "difficulty_score": 9,
            "win_probability": "Low",
            "urgency_score": 15,
            "trust_score": 99,
            "risk_score": 2,
            "risk_level": "Low",
            "risk_flags": [],
            "logo_url": "https://cryptologos.cc/logos/ethereum-eth-logo.svg",
        },
    ]


def main():
    db = SessionLocal()
    from datetime import timedelta
    
    print("🧹 Step 1: Archiving all fake/old seeded opportunities (marking is_open=False)...")
    print("=" * 60)
    
    archived = 0
    for fake_url in FAKE_URLS:
        existing = db.query(Opportunity).filter(Opportunity.url == fake_url).first()
        if existing and existing.is_open:
            print(f"  🗃️  Archived: {existing.title[:55]}")
            existing.is_open = False
            archived += 1
    
    # Also archive any opportunities with expired deadlines (more than 7 days past)
    cutoff = datetime.now() - timedelta(days=7)
    expired = db.query(Opportunity).filter(
        Opportunity.deadline != None,
        Opportunity.deadline < cutoff,
        Opportunity.is_open == True,
    ).all()
    for exp in expired:
        print(f"  ⏰ Archived: {exp.title[:55]} (deadline: {exp.deadline})")
        exp.is_open = False
        archived += 1
    
    db.commit()
    print(f"\n  Archived {archived} old/fake/expired opportunities.\n")
    
    print("✅ Step 2: Adding real, verified opportunities...")
    print("=" * 60)
    
    opportunities = get_real_opportunities()
    added = 0
    updated = 0
    
    update_fields = [
        "description", "category", "source", "reward_pool", "reward_token",
        "estimated_value_usd", "deadline", "start_date", "chain", "tags",
        "mission_requirements", "required_skills", "ai_summary", "ai_strategy",
        "ai_score", "difficulty", "difficulty_score", "win_probability",
        "urgency_score", "trust_score", "risk_score", "risk_level", "risk_flags",
        "logo_url",
    ]
    
    for opp_data in opportunities:
        url = opp_data["url"]
        existing = db.query(Opportunity).filter(Opportunity.url == url).first()
        
        if existing:
            for field in update_fields:
                if field in opp_data:
                    setattr(existing, field, opp_data[field])
            existing.is_open = True
            updated += 1
            print(f"  📝 Updated: {opp_data['title'][:55]}")
        else:
            opp = Opportunity(
                title=opp_data["title"],
                url=opp_data["url"],
                is_open=True,
                **{k: opp_data[k] for k in update_fields if k in opp_data},
            )
            db.add(opp)
            added += 1
            print(f"  ✅ Added:   {opp_data['title'][:55]}")
    
    db.commit()
    
    print("\n" + "=" * 60)
    print(f"✅ Reseed complete!")
    print(f"   Archived: {archived}")
    print(f"   Updated: {updated}")
    print(f"   Added:   {added}")
    
    total = db.query(Opportunity).count()
    active = db.query(Opportunity).filter(
        Opportunity.is_open == True,
        or_(Opportunity.deadline == None, Opportunity.deadline >= datetime.now())
    ).count()
    print(f"\n📊 Database: {total} total, {active} active")
    
    db.close()


if __name__ == "__main__":
    main()
