# Arbitrum Grant Strategy — OppForge

## Which Grants to Apply For

Based on the Arbitrum DDA 3.0 program ($6.75M total budget), there are **two open programs** that fit OppForge:

### 1. ✅ Arbitrum New Protocols and Ideas 3.0 (PRIMARY — apply here first)
- **Budget:** Part of $1.5M allocation
- **Status:** Open | 486 proposals | 31 accepted | $281K paid out
- **Domain Allocator:** CastleCapital
- **Why OppForge fits:** You ARE a new protocol on Arbitrum. Smart contracts deployed, payment system on ARB, real product with AI + blockchain integration.
- **Angle:** OppForge is an AI-powered Web3 opportunity protocol deployed on Arbitrum that drives users, transactions, and ecosystem engagement to the Arbitrum chain.

### 2. ✅ Arbitrum Education, Community Growth and Events 3.0 (SECONDARY — apply simultaneously)
- **Budget:** Part of $1.5M allocation
- **Status:** Open | 315 proposals | 44 accepted | $626K paid out
- **Domain Allocator:** SeedGOV
- **Why OppForge fits:** OppForge surfaces Arbitrum ecosystem opportunities, onboards users to Arbitrum (payments), builds community, runs bounties.
- **Angle:** OppForge is a community growth platform that onboards every Web3 participant to Arbitrum through its payment infrastructure, while surfacing Arbitrum ecosystem opportunities globally.

### 3. ❌ Developer Tooling 3.0 — CLOSED
### 4. ❌ Gaming 3.0 — Doesn't fit
### 5. ❌ Orbit domain — Doesn't fit (this is for Arbitrum L3 chains)

---

## CRITICAL: Deploy to Arbitrum Sepolia BEFORE Submitting

Your contracts are currently on **Ethereum Sepolia** (sepolia.etherscan.io), NOT Arbitrum Sepolia. 

**Action items before submitting:**
1. Run: `npx hardhat run scripts/deploy.js --network arbitrumSepolia`
2. Get Arbiscan links: `https://sepolia.arbiscan.io/address/0x...`
3. Include these links in your application
4. This proves you're actually building on Arbitrum

**Current Ethereum Sepolia deployments (for reference only — don't include these in the Arbitrum grant):**
- OppForgeProtocol: `0x502973c5413167834d49078f214ee777a8C0A8Cf`
- OppForgeFounder NFT: `0xa0928440186C28062c964aeE496b38275e94aA8c`
- OppForgeMission: `0x654b689f316c5E2D1c6860d2446A73538B146722`

---

## Budget Strategy

- **Under $25K** = only 1 evaluator reviews (faster, higher approval chance)
- **$25K-$50K** = 2 evaluators required (slower, more scrutiny)
- **Recommendation:** Request **$24,500** for New Protocols (stays under 1-eval threshold) and **$15,000** for Education/Community (more modest, easier approve)
- **Total across both:** $39,500

---

## What Gets Proposals Rejected (from reviewing submissions)

1. **Vague deliverables** — "we'll build something cool" → rejected
2. **No existing product** — ideation stage without proof of work → rejected
3. **No Arbitrum alignment** — can't explain WHY Arbitrum specifically → rejected
4. **Copy-paste proposals** — generic, not tailored to the domain → rejected
5. **Unrealistic KPIs** — promising millions of users with $10K → rejected
6. **No sustainability plan** — "we'll figure it out after the grant" → rejected

## What Gets Proposals Accepted (from ETH Greece success — 27/30 score)

1. **Detailed milestones** with specific dates and $ amounts
2. **Measurable KPIs** — numbers, not adjectives
3. **Clear Arbitrum benefit** — how does this grow Arbitrum specifically?
4. **Existing work/traction** — not vaporware
5. **Team credibility** — verifiable links (GitHub, LinkedIn, Twitter)
6. **Responsive to feedback** — reviewers ask questions, good applicants answer thoroughly
7. **Sustainability plan** — what happens after the grant money runs out?

---

## OppForge's Unfair Advantages for This Application

1. **Real, deployed product** — not ideation, not MVP — production-ready full-stack platform
2. **Smart contracts already written** for Arbitrum — just need mainnet deployment funding
3. **ARB as native payment** — every premium subscription = ARB transaction
4. **Multi-ecosystem but Arbitrum-first** — surfaces ALL opportunities but processes payments on Arbitrum
5. **AI architecture is genuinely impressive** — 4 specialized agents, risk engine, RAG pipeline
6. **Solo founder narrative** — compelling, grantable, fits the "bootstrap → grant → scale" story
7. **Serves the ENTIRE Web3 community** — not niche, massive TAM
8. **Directly benefits Arbitrum** — more users → more ARB transactions → more ecosystem engagement
