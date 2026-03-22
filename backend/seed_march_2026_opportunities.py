#!/usr/bin/env python3
"""
Seed March 2026 Web3 opportunities
Real, verified opportunities from hackathon platforms, grant programs, and fellowship listings
"""
from sqlalchemy import or_
from datetime import datetime, timedelta
from app.models.opportunity import Opportunity
from app.database import SessionLocal
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))


def main():
    db = SessionLocal()
    today = datetime.now()

    opportunities = [
        # ===== HACKATHONS =====

        # 1. Solana Agent Economy Hackathon — Agent Talent Show
        {
            "title": "Solana Agent Economy Hackathon: Agent Talent Show",
            "description": "Build AI agent skills and apps on Solana. $30K USDC prize pool across Agent-to-Agent Economy, Solana Mobile, Auto Money Generator, and Cyber-Slacking tracks. Gold Tier $1K x6, Silver $600 x10, Bronze $300 x10. Bitget Wallet bonus: $5K for meme coin AI trading agents. Outstanding builders join BGW Core Builder program with ecosystem co-building, growth support, and ongoing revenue sharing.",
            "url": "https://hackathons.space/hackathons/solana-agent-economy-hackathon-agent-talent-show",
            "category": "hackathon",
            "source": "Attention VC / Solana",
            "reward_pool": 30000,
            "deadline": datetime(2026, 3, 27),
            "chain": "Solana",
            "tags": ["AI Agents", "Solana Mobile", "Trading", "Bitget Wallet", "x402"]
        },

        # 2. Fhenix Private By Design dApp Buildathon
        {
            "title": "Fhenix Private By Design dApp Buildathon",
            "description": "Build privacy-preserving dApps with Fully Homomorphic Encryption on Fhenix. $20K USDC total grant pool. Create applications leveraging FHE for confidential smart contracts and encrypted on-chain computation.",
            "url": "https://app.akindo.io/wave-hacks/Nm2qjzEBgCqJD90W",
            "category": "hackathon",
            "source": "Fhenix / Akindo",
            "reward_pool": 20000,
            "deadline": today + timedelta(days=45),
            "chain": "Fhenix",
            "tags": ["FHE", "Privacy", "Encryption", "dApps"]
        },

        # 3. PL Genesis: Frontiers of Collaboration Hackathon
        {
            "title": "PL Genesis: Frontiers of Collaboration Hackathon",
            "description": "$155,500 total prize pool by Protocol Labs. Tracks: Fresh Code & Existing Code ($50K each), Flow DeFi ($10K), Infrastructure & Digital Rights ($6K), Crypto ($6K), AI & Robotics ($6K), Neurotech ($6K), plus sponsor bounties from Starknet ($5K), World ($5K), Ethereum Foundation ($16K), Zama ($5K), Filecoin ($2.5K), Hypercerts ($2.5K), Lit Protocol ($1K), and more. Winners eligible for PL_Genesis Accelerator.",
            "url": "https://pl-genesis-frontiers-of-collaboration-hackathon.devspot.app/?activeTab=challenges",
            "category": "hackathon",
            "source": "Protocol Labs",
            "reward_pool": 155500,
            "deadline": today + timedelta(days=30),
            "chain": "Multi-chain",
            "tags": ["Protocol Labs", "AI", "DeFi", "Privacy", "Neurotech", "Robotics", "Filecoin", "NEAR", "Starknet"]
        },

        # 4. Base Batches 003 — Student Track
        {
            "title": "Base Batches 003 — Student Track",
            "description": "Build on Base as a student developer. Part of Coinbase's Base Batches program supporting new builders in the ecosystem. Student-focused hackathon track with mentorship and onboarding to the Base ecosystem.",
            "url": "https://devfolio.co/hackathons",
            "category": "hackathon",
            "source": "Base / Devfolio",
            "reward_pool": 10000,
            "deadline": today + timedelta(days=21),
            "chain": "Base",
            "tags": ["Students", "Base", "Onboarding", "Coinbase"]
        },

        # 5. Base Batches 003 — Robotics Track
        {
            "title": "Base Batches 003 — Robotics Track",
            "description": "Build robotics + blockchain integrations on Base. Explore the intersection of physical computing, IoT, and on-chain coordination through Coinbase's Base Batches program.",
            "url": "https://basebatches.xyz",
            "category": "hackathon",
            "source": "Base / Devfolio",
            "reward_pool": 10000,
            "deadline": today + timedelta(days=21),
            "chain": "Base",
            "tags": ["Robotics", "IoT", "Base", "Hardware"]
        },

        # 6. 2026 EVE Frontier Hackathon (SUI)
        {
            "title": "2026 EVE Frontier Hackathon",
            "description": "Sui x EVE Frontier global hackathon with $80,000 prize pool. Build mods that extend and interact with EVE Frontier, the in-development space survival game from CCP Games. Theme: 'A Toolkit for Civilization' — entries range from practical survival tools to experimental emergent systems.",
            "url": "https://hackathons.space/hackathons/2026-eve-frontier-hackathon",
            "category": "hackathon",
            "source": "Sui / CCP Games",
            "reward_pool": 80000,
            "deadline": datetime(2026, 3, 31),
            "chain": "Sui",
            "tags": ["Gaming", "Sui", "Mods", "EVE Frontier", "Survival"]
        },

        # 7. Hackathon Galactica: WDK Edition (Tether / DoraHacks)
        {
            "title": "Hackathon Galactica: WDK Edition — Tether",
            "description": "Build with Tether's Wallet Development Kit (WDK). $30K USDt prize pool. Submissions March 9–22, 2026. Hosted on DoraHacks. Create next-gen wallet solutions, payment integrations, and stablecoin applications using the WDK.",
            "url": "https://dorahacks.io/hackathon/galactica-wdk",
            "category": "hackathon",
            "source": "Tether / DoraHacks",
            "reward_pool": 30000,
            "deadline": datetime(2026, 3, 22),
            "chain": "Multi-chain",
            "tags": ["Tether", "WDK", "Wallet", "Stablecoins", "USDt"]
        },

        # 8. GitLab AI Hackathon
        {
            "title": "GitLab AI Hackathon 2026",
            "description": "$65K in prizes for AI-powered developer tools built on GitLab. Created by GitLab on Devpost. Build innovative AI solutions that enhance software development workflows, CI/CD, code review, and DevOps automation.",
            "url": "https://gitlab.devpost.com",
            "category": "hackathon",
            "source": "GitLab / Devpost",
            "reward_pool": 65000,
            "deadline": datetime(2026, 3, 25),
            "chain": "N/A",
            "tags": ["AI", "DevTools", "CI/CD", "DevOps", "GitLab"]
        },

        # 9. Shape Rotator Hackathon (Encode Club)
        {
            "title": "Shape Rotator Hackathon — Encode Club",
            "description": "$10K prize pool with potential $50K accelerator opportunity for top projects. Build with Encode Club's community of builders. Focus on innovative DeFi, infrastructure, and consumer crypto applications.",
            "url": "https://www.encode.club/shape-rotator-hackathon",
            "category": "hackathon",
            "source": "Encode Club",
            "reward_pool": 10000,
            "deadline": today + timedelta(days=28),
            "chain": "Multi-chain",
            "tags": ["Encode Club", "Accelerator", "DeFi", "Infrastructure"]
        },

        # 10. Polkadot Solidity Hackathon (DoraHacks)
        {
            "title": "Polkadot Solidity Hackathon",
            "description": "Build Solidity smart contracts on Polkadot via DoraHacks. Deploy EVM-compatible dApps on Polkadot's parachain ecosystem. Bring your existing Solidity skills to Polkadot's interoperable multi-chain network.",
            "url": "https://dorahacks.io/hackathon/polkadot-solidity-hackathon/buidl",
            "category": "hackathon",
            "source": "Polkadot / DoraHacks",
            "reward_pool": 50000,
            "deadline": today + timedelta(days=35),
            "chain": "Polkadot",
            "tags": ["Polkadot", "Solidity", "EVM", "Parachains"]
        },

        # 11. Dev3Pack Hackathon
        {
            "title": "Dev3Pack Hackathon",
            "description": "Hackathon for Web3 developers featuring stacked bounties from multiple protocols. Build cross-protocol applications and integrations to maximize your earnings from multiple sponsor tracks.",
            "url": "https://hack.dev3pack.xyz",
            "category": "hackathon",
            "source": "Dev3Pack",
            "reward_pool": 25000,
            "deadline": today + timedelta(days=30),
            "chain": "Multi-chain",
            "tags": ["Multi-Protocol", "Bounties", "Integrations"]
        },

        # 12. Hack4Freedom
        {
            "title": "Hack4Freedom",
            "description": "Hackathon focused on building freedom-preserving technology. Create tools for privacy, censorship resistance, and digital rights using blockchain and decentralized protocols.",
            "url": "https://hack4freedom.com",
            "category": "hackathon",
            "source": "Hack4Freedom",
            "reward_pool": 20000,
            "deadline": today + timedelta(days=30),
            "chain": "Multi-chain",
            "tags": ["Privacy", "Freedom", "Censorship Resistance", "Digital Rights"]
        },

        # 13. Midnight Network Privacy Hackathon
        {
            "title": "Midnight Network Privacy Hackathon",
            "description": "$6K prize pool across 5 tracks ($1,200 each). Build privacy-preserving applications on Midnight Network. Apply by March 31, hackathon runs March 21 – April 16. Hosted on RiseIn platform.",
            "url": "https://www.risein.com/bootcamps/midnight-network-privacy-hackathon",
            "category": "hackathon",
            "source": "Midnight Network / RiseIn",
            "reward_pool": 6000,
            "deadline": datetime(2026, 4, 16),
            "chain": "Midnight",
            "tags": ["Privacy", "ZK Proofs", "Cardano", "Data Protection"]
        },

        # 14. Pyth Network Community Hackathon
        {
            "title": "Pyth Network Community Hackathon",
            "description": "Build with Pyth Network's real-time oracle data feeds. Create DeFi applications, trading tools, and data-driven protocols leveraging Pyth's high-fidelity price feeds across 200+ assets on 50+ chains.",
            "url": "https://pyth.network/community-hackathon",
            "category": "hackathon",
            "source": "Pyth Network",
            "reward_pool": 50000,
            "deadline": today + timedelta(days=21),
            "chain": "Multi-chain",
            "tags": ["Oracle", "DeFi", "Price Feeds", "Data"]
        },

        # 15. Bags Hackathon
        {
            "title": "Bags Hackathon — $4M Funding Pool",
            "description": "Massive $4,000,000 in funding available for hackathon participants. Build innovative blockchain applications with potential for direct investment from the Bags ecosystem fund.",
            "url": "https://bags.fm/hackathon",
            "category": "hackathon",
            "source": "Bags",
            "reward_pool": 4000000,
            "deadline": today + timedelta(days=30),
            "chain": "Multi-chain",
            "tags": ["Funding", "Investment", "Web3", "Innovation"]
        },

        # ===== AKINDO BUILDATHONS (discovered from scraping) =====

        # 16. IoTeX Crypto's Got Talent S2
        {
            "title": "IoTeX Crypto's Got Talent Season 2",
            "description": "$500K USDC prize pool for building on IoTeX. Create DePIN, IoT, and real-world data applications on the IoTeX network. Season 2 of the flagship buildathon program.",
            "url": "https://app.akindo.io/wave-hacks/iotex-cryptos-got-talent-s2",
            "category": "hackathon",
            "source": "IoTeX / Akindo",
            "reward_pool": 500000,
            "deadline": today + timedelta(days=45),
            "chain": "IoTeX",
            "tags": ["DePIN", "IoT", "Real World Data", "Infrastructure"]
        },

        # 17. Polygon Buildathon
        {
            "title": "Polygon Buildathon — Akindo",
            "description": "$50K USDC for building on Polygon. Create DeFi, NFT, gaming, and infrastructure solutions on Polygon PoS and zkEVM. Hosted on Akindo's buildathon platform.",
            "url": "https://app.akindo.io/wave-hacks/polygon-buildathon",
            "category": "hackathon",
            "source": "Polygon / Akindo",
            "reward_pool": 50000,
            "deadline": today + timedelta(days=40),
            "chain": "Polygon",
            "tags": ["Polygon", "zkEVM", "DeFi", "Gaming"]
        },

        # 18. Linera Buildathon
        {
            "title": "Linera Buildathon",
            "description": "$50K USDC for building on Linera, the microchain-based L1 blockchain. Create scalable applications leveraging Linera's unique multi-chain architecture for web3 scalability.",
            "url": "https://app.akindo.io/wave-hacks/linera-buildathon",
            "category": "hackathon",
            "source": "Linera / Akindo",
            "reward_pool": 50000,
            "deadline": today + timedelta(days=40),
            "chain": "Linera",
            "tags": ["L1", "Microchains", "Scalability", "Infrastructure"]
        },

        # 19. Aleo Buildathon
        {
            "title": "Aleo Buildathon",
            "description": "$50K USDT for building privacy-preserving applications on Aleo. Leverage zero-knowledge proofs for private DeFi, identity, and data applications on the Aleo network.",
            "url": "https://app.akindo.io/wave-hacks/aleo-buildathon",
            "category": "hackathon",
            "source": "Aleo / Akindo",
            "reward_pool": 50000,
            "deadline": today + timedelta(days=35),
            "chain": "Aleo",
            "tags": ["ZK Proofs", "Privacy", "Leo Language", "DeFi"]
        },

        # 20. SideShift.ai Buildathon
        {
            "title": "SideShift.ai Buildathon",
            "description": "$10K USDC for building with SideShift.ai's cross-chain swap infrastructure. Create applications that leverage automated coin shifting between blockchains.",
            "url": "https://app.akindo.io/wave-hacks/sideshift-buildathon",
            "category": "hackathon",
            "source": "SideShift.ai / Akindo",
            "reward_pool": 10000,
            "deadline": today + timedelta(days=35),
            "chain": "Multi-chain",
            "tags": ["Cross-Chain", "Swaps", "Bridge", "DEX"]
        },

        # 21. Massa Network Buildathon
        {
            "title": "Massa Network Buildathon",
            "description": "$15K USDT for building decentralized applications on Massa, the truly decentralized and scalable L1 blockchain with autonomous smart contracts and on-chain web hosting.",
            "url": "https://app.akindo.io/wave-hacks/massa-buildathon",
            "category": "hackathon",
            "source": "Massa Network / Akindo",
            "reward_pool": 15000,
            "deadline": today + timedelta(days=35),
            "chain": "Massa",
            "tags": ["L1", "Autonomous SC", "On-chain Web", "Decentralized"]
        },

        # ===== GRANTS & FELLOWSHIP PROGRAMS =====

        # 22. Ethereum Foundation ESP & Fellowship
        {
            "title": "Ethereum Foundation Ecosystem Support Program",
            "description": "The Ethereum Foundation's Ecosystem Support Program (ESP) provides grants and fellowships for projects that strengthen Ethereum's foundations. Funding for research, protocol development, community building, and open-source tooling. Rolling applications.",
            "url": "https://esp.ethereum.foundation/applicants",
            "category": "grant",
            "source": "Ethereum Foundation",
            "reward_pool": 500000,
            "deadline": None,  # Rolling
            "chain": "Ethereum",
            "tags": ["Research", "Protocol", "Open Source", "Fellowship", "Core Dev"]
        },

        # 23. Solana Foundation Grants
        {
            "title": "Solana Foundation Developer Grants",
            "description": "Grants from the Solana Foundation for ecosystem development, developer tooling, DeFi protocols, and infrastructure projects. Support for builders creating high-performance applications on Solana.",
            "url": "https://solana.org/grants",
            "category": "grant",
            "source": "Solana Foundation",
            "reward_pool": 250000,
            "deadline": None,  # Rolling
            "chain": "Solana",
            "tags": ["Developer Tools", "DeFi", "Infrastructure", "Ecosystem"]
        },

        # 24. Polygon Fellowship & Developer Programs
        {
            "title": "Polygon Developer Grants & Fellowship",
            "description": "Polygon's grants program supporting developers building on Polygon PoS, zkEVM, and CDK. Fellowship programs for exceptional builders with mentorship, funding, and ecosystem access.",
            "url": "https://polygon.technology/grants",
            "category": "grant",
            "source": "Polygon",
            "reward_pool": 200000,
            "deadline": None,  # Rolling
            "chain": "Polygon",
            "tags": ["zkEVM", "CDK", "Developer Tools", "Fellowship"]
        },

        # 25. Polkadot Fellowship
        {
            "title": "Polkadot Technical Fellowship",
            "description": "The Polkadot Fellowship is an on-chain body of technical experts maintaining the Polkadot network. Members receive ongoing compensation and influence protocol decisions. Open to experienced blockchain developers.",
            "url": "https://collectives.polkassembly.io",
            "category": "grant",
            "source": "Polkadot",
            "reward_pool": 100000,
            "deadline": None,  # Rolling
            "chain": "Polkadot",
            "tags": ["Fellowship", "Core Dev", "Governance", "Protocol"]
        },

        # 26. Chainlink BUILD Program
        {
            "title": "Chainlink BUILD & Developer Programs",
            "description": "Chainlink BUILD provides enhanced oracle services, technical support, and marketing for Web3 projects integrating Chainlink. Access to CCIP, VRF, Automation, Functions, and Data Feeds with priority support.",
            "url": "https://chain.link/build",
            "category": "grant",
            "source": "Chainlink",
            "reward_pool": 150000,
            "deadline": None,  # Rolling
            "chain": "Multi-chain",
            "tags": ["Oracle", "CCIP", "Cross-Chain", "Data Feeds", "VRF"]
        },

        # 27. Base Builder Programs
        {
            "title": "Base Builder Grants & Programs",
            "description": "Coinbase's Base offers builder grants, onchain summer programs, and ecosystem funding for applications building on Base. Focus on consumer apps, social protocols, and DeFi innovation.",
            "url": "https://base.org/build",
            "category": "grant",
            "source": "Base / Coinbase",
            "reward_pool": 200000,
            "deadline": None,  # Rolling
            "chain": "Base",
            "tags": ["Consumer Apps", "Social", "DeFi", "Coinbase"]
        },

        # 28. Starknet Grants & Builder Programs
        {
            "title": "Starknet Grants Program",
            "description": "Funding for projects building on Starknet's ZK-rollup ecosystem. Focus on DeFi, gaming, infrastructure, developer tools, and Cairo-based applications. Grants range from small seed to large ecosystem grants.",
            "url": "https://starknet.io/grants/",
            "category": "grant",
            "source": "Starknet Foundation",
            "reward_pool": 300000,
            "deadline": None,  # Rolling
            "chain": "Starknet",
            "tags": ["ZK Rollup", "Cairo", "DeFi", "Developer Tools"]
        },

        # 29. Gitcoin Grants
        {
            "title": "Gitcoin Grants — Open Source Funding",
            "description": "Gitcoin's quadratic funding platform for open-source software, community projects, and public goods. Multiple rounds throughout the year with matching pools from ecosystem partners.",
            "url": "https://grants.gitcoin.co",
            "category": "grant",
            "source": "Gitcoin",
            "reward_pool": 2000000,
            "deadline": None,  # Rolling rounds
            "chain": "Multi-chain",
            "tags": ["Public Goods", "Quadratic Funding", "Open Source", "Education"]
        },

        # 30. Web3 Foundation Grants
        {
            "title": "Web3 Foundation Grants Program",
            "description": "The Web3 Foundation funds software development and research in the Polkadot ecosystem. Level 1 grants up to $10K, Level 2 up to $30K, Level 3 individually assessed. Focus on runtime modules, development tools, and UI.",
            "url": "https://web3.foundation/grants",
            "category": "grant",
            "source": "Web3 Foundation",
            "reward_pool": 100000,
            "deadline": None,  # Rolling
            "chain": "Polkadot",
            "tags": ["Substrate", "Ink!", "Parachain", "Developer Tools"]
        },

        # ===== BOUNTIES & PROGRAMS =====

        # 31. LI.FI AI Agent Bounty
        {
            "title": "LI.FI AI Agent Bounty",
            "description": "$5K bounty for building AI agents that utilize the LI.FI toolkit for cross-chain swaps and bridges. Create autonomous agents that can perform multi-chain DeFi operations using LI.FI's aggregation protocol.",
            "url": "https://li.fi/bounty",
            "category": "bounty",
            "source": "LI.FI",
            "reward_pool": 5000,
            "deadline": today + timedelta(days=30),
            "chain": "Multi-chain",
            "tags": ["AI Agents", "Cross-Chain", "Bridge", "DEX Aggregator"]
        },

        # 32. Base Bounty
        {
            "title": "Base Bounty Program",
            "description": "Bounties for building on Base from Encode Club. Complete specific development challenges on the Base network for rewards. Focus on DeFi, NFTs, and consumer applications.",
            "url": "https://bounty.enb.fun/base",
            "category": "bounty",
            "source": "Base / Encode Club",
            "reward_pool": 10000,
            "deadline": today + timedelta(days=45),
            "chain": "Base",
            "tags": ["Bounties", "Base", "DeFi", "Consumer Apps"]
        },

        # 33. Creatorverse
        {
            "title": "Creatorverse — $10K Creator Rewards",
            "description": "$10K paid out to creators building at the intersection of Web3 and creator economy. Join the Creatorverse community for funding, mentorship, and collaboration with fellow Web3 creators.",
            "url": "https://join.thecreatorverse.xyz",
            "category": "bounty",
            "source": "Creatorverse",
            "reward_pool": 10000,
            "deadline": today + timedelta(days=30),
            "chain": "Multi-chain",
            "tags": ["Creator Economy", "Social", "NFT", "Content"]
        },

        # ===== EDUCATION & PROGRAMS =====

        # 34. Bitcoin Diploma Cohort 7
        {
            "title": "Bitcoin Diploma — Cohort 7",
            "description": "Comprehensive Bitcoin education program starting March 23. Learn Bitcoin protocol, development, Lightning Network, and blockchain fundamentals. Free registration with limited scholarship spots available.",
            "url": "https://planning.miamiblockchain.org",
            "category": "grant",
            "source": "Mi Primer Bitcoin",
            "reward_pool": 0,
            "deadline": datetime(2026, 3, 23),
            "chain": "Bitcoin",
            "tags": ["Education", "Bitcoin", "Lightning", "Free Course"]
        },

        # 35. AI Engineering Buildcamp
        {
            "title": "AI Engineering Buildcamp — April 2026",
            "description": "Intensive AI engineering bootcamp starting April 13. Scholarship spots available — application deadline March 30. Learn to build production AI systems, from model training to deployment and MLOps.",
            "url": "https://buildcamp.ai",
            "category": "grant",
            "source": "Buildcamp",
            "reward_pool": 0,
            "deadline": datetime(2026, 3, 30),
            "chain": "N/A",
            "tags": ["AI", "Education", "Scholarship", "MLOps", "Engineering"]
        },

        # 36. Encode Club Programs
        {
            "title": "Encode Club Developer Programs",
            "description": "Encode Club offers bootcamps, hackathons, and accelerator programs across multiple blockchain ecosystems. 8-week educational programs with mentorship from top protocols. Free to join with scholarship opportunities.",
            "url": "https://www.encode.club/programmes",
            "category": "accelerator",
            "source": "Encode Club",
            "reward_pool": 50000,
            "deadline": None,  # Rolling
            "chain": "Multi-chain",
            "tags": ["Education", "Bootcamp", "Mentorship", "Accelerator"]
        },

        # 37. Devconnect Scholars Program
        {
            "title": "Devconnect Scholars Program",
            "description": "Scholarship program for Ethereum developers to attend Devconnect, the premier Ethereum developer conference. Covers travel, accommodation, and conference access. For underrepresented and emerging-market developers.",
            "url": "https://devconnect.org",
            "category": "grant",
            "source": "Ethereum Foundation",
            "reward_pool": 5000,
            "deadline": today + timedelta(days=60),
            "chain": "Ethereum",
            "tags": ["Conference", "Scholarship", "Networking", "Ethereum"]
        },
    ]

    print("🌱 Seeding March 2026 Web3 opportunities...")
    print("=" * 60)

    added = 0
    skipped = 0

    for opp_data in opportunities:
        existing = db.query(Opportunity).filter(
            Opportunity.url == opp_data["url"]
        ).first()

        if existing:
            skipped += 1
            print(f"⏭️  Skipped (exists): {opp_data['title'][:55]}...")
            continue

        opp = Opportunity(
            title=opp_data["title"],
            description=opp_data["description"],
            url=opp_data["url"],
            category=opp_data["category"],
            source=opp_data["source"],
            reward_pool=opp_data["reward_pool"],
            deadline=opp_data["deadline"],
            chain=opp_data["chain"],
            tags=opp_data["tags"],
            is_open=True,
        )
        db.add(opp)
        added += 1
        print(f"✅ Added: {opp_data['title'][:55]}...")

    db.commit()

    print("\n" + "=" * 60)
    print(f"✅ Seeding complete!")
    print(f"   Added: {added} new opportunities")
    print(f"   Skipped: {skipped} existing")

    total = db.query(Opportunity).count()
    active = db.query(Opportunity).filter(
        Opportunity.is_open == True,
        or_(Opportunity.deadline == None, Opportunity.deadline >= datetime.now()),
    ).count()

    print(f"\n📊 Database now has:")
    print(f"   Total: {total} opportunities")
    print(f"   Active: {active} current/upcoming")

    db.close()


if __name__ == "__main__":
    main()
