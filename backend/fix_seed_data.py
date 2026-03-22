#!/usr/bin/env python3
"""
Fix seeded opportunities: add mission_requirements and validate deadlines.
Run once against the production database to patch existing records.
"""
from datetime import datetime, timezone
from app.models.opportunity import Opportunity
from app.database import SessionLocal
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))


# Requirements and deadlines keyed by opportunity title prefix
PATCHES = {
    "ETHGlobal London": {
        "mission_requirements": [
            "Build a working prototype during the hackathon weekend",
            "Deploy smart contracts to a supported testnet or mainnet",
            "Submit a demo video (max 3 min) and GitHub repo link",
            "Team size: 1-5 members",
        ],
        "deadline": datetime(2026, 4, 12, tzinfo=timezone.utc),
    },
    "ETHGlobal Scaling": {
        "mission_requirements": [
            "Project must focus on L2 scaling, rollups, or data availability",
            "Use at least one sponsor technology (Arbitrum, Optimism, zkSync, or Starknet)",
            "Submit working demo with source code",
            "Present a 3-minute pitch to judges",
        ],
        "deadline": datetime(2026, 5, 3, tzinfo=timezone.utc),
    },
    "Solana Grizzlython": {
        "mission_requirements": [
            "Build on Solana mainnet-beta or devnet",
            "Submit via official Devpost portal",
            "Include README with setup instructions",
            "Project must be open-source",
        ],
        "deadline": datetime(2026, 5, 15, tzinfo=timezone.utc),
    },
    "Solana DeFi Hackathon": {
        "mission_requirements": [
            "Protocol must handle real token swaps, lending, or derivatives on Solana",
            "Smart contracts audited or documented with known limitations",
            "Provide a live demo link and walkthrough video",
        ],
        "deadline": datetime(2026, 4, 20, tzinfo=timezone.utc),
    },
    "Gitcoin Grants Round": {
        "mission_requirements": [
            "Project must be a public good with open-source code",
            "Active GitHub repository with recent commits",
            "Complete Gitcoin project profile with description and team info",
            "Comply with Gitcoin's grant eligibility policy",
        ],
        "deadline": datetime(2026, 4, 5, tzinfo=timezone.utc),
    },
    "Uniswap Foundation Grants": {
        "mission_requirements": [
            "Proposal must target Uniswap v4 hooks or governance tooling",
            "Submit a detailed technical spec and milestone plan",
            "Team must have prior Solidity/DeFi experience",
            "Budget breakdown required",
        ],
        "deadline": None,  # Rolling
    },
    "Aave Grants DAO": {
        "mission_requirements": [
            "Focus on GHO integrations, risk management, or frontend improvements",
            "Submit proposal via Aave governance forum",
            "Include technical architecture and timeline",
            "Prior DeFi development experience required",
        ],
        "deadline": datetime(2026, 4, 15, tzinfo=timezone.utc),
    },
    "Arbitrum Stylus": {
        "mission_requirements": [
            "Smart contracts must be written in Rust, C, or C++ using Stylus SDK",
            "Deploy to Arbitrum Sepolia testnet",
            "Project README with build and deploy instructions",
            "Submit demo video and source code",
        ],
        "deadline": datetime(2026, 5, 10, tzinfo=timezone.utc),
    },
    "Optimism RetroPGF": {
        "mission_requirements": [
            "Project must already be live with demonstrable Optimism ecosystem impact",
            "Complete RetroPGF application with impact metrics",
            "Provide on-chain usage data or attestations",
            "Open-source code preferred",
        ],
        "deadline": datetime(2026, 5, 30, tzinfo=timezone.utc),
    },
    "Base Onchain Summer": {
        "mission_requirements": [
            "Build and deploy a consumer app on Base",
            "Must target mainstream users (social, gaming, or commerce)",
            "Submit via official hackathon portal with demo link",
            "Team registration required before kickoff",
        ],
        "deadline": datetime(2026, 5, 20, tzinfo=timezone.utc),
    },
    "zkSync Builder": {
        "mission_requirements": [
            "Project must use zkSync Era or ZK Stack",
            "Focus on account abstraction, paymasters, or ZK applications",
            "Submit grant proposal with technical plan and milestones",
            "Quarterly progress reports required if funded",
        ],
        "deadline": datetime(2026, 4, 25, tzinfo=timezone.utc),
    },
    "Polygon Village Accelerator": {
        "mission_requirements": [
            "Early-stage Web3 startup building on Polygon",
            "Submit pitch deck and team background",
            "Commit to 12-week accelerator program",
            "Must be available for weekly mentorship sessions",
        ],
        "deadline": datetime(2026, 4, 10, tzinfo=timezone.utc),
    },
    "Avalanche Multiverse": {
        "mission_requirements": [
            "Build a Subnet on Avalanche with a clear use case",
            "Technical documentation and deployment plan required",
            "Apply for gas subsidies with usage projections",
        ],
        "deadline": None,  # Ongoing
    },
    "Superteam Earn": {
        "mission_requirements": [
            "Build a multi-chain DeFi analytics dashboard",
            "Support at least 3 chains with real-time data",
            "Clean, responsive UI with mobile support",
            "Submit working deployment link and source code",
        ],
        "deadline": datetime(2026, 4, 8, tzinfo=timezone.utc),
    },
    "Farcaster Frames": {
        "mission_requirements": [
            "Build an innovative Frame for Farcaster",
            "Categories: social, gaming, or commerce",
            "Submit Frame URL and source code",
            "Include user testing results or metrics",
        ],
        "deadline": datetime(2026, 4, 18, tzinfo=timezone.utc),
    },
    "Immunefi Security": {
        "mission_requirements": [
            "Original security research on MEV, bridges, or smart contract vulnerabilities",
            "Written report with proof-of-concept",
            "Responsible disclosure required for any live vulnerabilities found",
            "Prior security research or audit experience preferred",
        ],
        "deadline": datetime(2026, 5, 25, tzinfo=timezone.utc),
    },
    "Monad Testnet": {
        "mission_requirements": [
            "Deploy and test applications on Monad testnet",
            "Submit bug reports and performance benchmarks",
            "Provide feedback on developer experience",
            "Active participation in testnet community",
        ],
        "deadline": datetime(2026, 6, 30, tzinfo=timezone.utc),
    },
    "Berachain Build-a-Bera": {
        "mission_requirements": [
            "Build on Berachain with Proof of Liquidity mechanics",
            "Categories: DeFi, NFTs, or Gaming",
            "Deploy to Berachain testnet",
            "Submit demo and source code via hackathon portal",
        ],
        "deadline": datetime(2026, 5, 5, tzinfo=timezone.utc),
    },
    "Blast Big Bang": {
        "mission_requirements": [
            "Build apps leveraging Blast native yield and gas revenue sharing",
            "Deploy to Blast mainnet or testnet",
            "Submit project with documentation and demo",
            "Team registration on Blast portal required",
        ],
        "deadline": datetime(2026, 6, 10, tzinfo=timezone.utc),
    },
    "DoraHacks Web3 For Good": {
        "mission_requirements": [
            "Project must address climate, health, education, or financial inclusion",
            "Working prototype required",
            "Submit via DoraHacks BUIDL platform",
            "Impact assessment and sustainability plan",
        ],
        "deadline": datetime(2026, 4, 22, tzinfo=timezone.utc),
    },
    "MakerDAO Endgame": {
        "mission_requirements": [
            "Focus on SubDAO development or Endgame transition",
            "Submit proposal to MakerDAO governance forum",
            "Detailed technical spec with milestones",
            "Prior experience with MakerDAO ecosystem preferred",
        ],
        "deadline": datetime(2026, 6, 15, tzinfo=timezone.utc),
    },
    "Compound Grants": {
        "mission_requirements": [
            "Build V3 integrations, governance tools, or analytics for Compound",
            "Submit grant proposal with budget and timeline",
            "Open-source deliverables required",
            "Quarterly progress updates",
        ],
        "deadline": None,  # Rolling
    },
}


def main():
    db = SessionLocal()
    updated = 0
    not_found = 0

    for title_prefix, patch in PATCHES.items():
        opp = db.query(Opportunity).filter(
            Opportunity.title.ilike(f"{title_prefix}%")
        ).first()

        if not opp:
            print(f"  ⚠ Not found: {title_prefix}*")
            not_found += 1
            continue

        if "mission_requirements" in patch:
            opp.mission_requirements = patch["mission_requirements"]
        if "deadline" in patch:
            opp.deadline = patch["deadline"]

        updated += 1
        print(f"  ✅ Patched: {opp.title[:60]}")

    db.commit()
    db.close()
    print(f"\nDone: {updated} updated, {not_found} not found in DB")


if __name__ == "__main__":
    main()
