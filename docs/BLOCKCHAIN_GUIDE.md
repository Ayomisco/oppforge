# OppForge Blockchain Strategy & Deployment Guide

## 1. Getting Your Deployment Keys
To deploy the smart contracts, you need the following keys in your `contracts/.env` file:

### `PRIVATE_KEY`
- **What it is:** The private key of the wallet address you want to use for deployment.
- **How to get it:** 
  1. Open MetaMask.
  2. Click the three dots (Account Options) -> Account Details.
  3. Click "Show private key".
  4. **WARNING:** Never share this key or commit it to GitHub. Ensure it has some ETH on the network you are deploying to (Arbitrum Sepolia or Arbitrum One).

### `ARBISCAN_API_KEY`
- **What it is:** Used to verify your contract code so users can read it on Arbiscan.
- **How to get it:**
  1. Go to [arbiscan.io](https://arbiscan.io) and create an account.
  2. Go to "API Keys" in your profile dashboard.
  3. Click "Add" to generate a new key.

### `ALCHEMY_API_KEY`
- **What it is:** Your gateway to the blockchain (RPC).
- **How to get it:**
  1. Go to [alchemy.com](https://www.alchemy.com).
  2. Create a new App -> Choose Arbitrum.
  3. Copy the "API Key" or the full HTTPS URL.

---

## 2. Deployment Strategy (Testnet First)
It is **highly recommended** to deploy on **Arbitrum Sepolia (Testnet)** first.
- **Why?** It costs zero real money. You use "Faucet ETH" to test the logic.
- **Funding:** Use an [Arbitrum Sepolia Faucet](https://sepolia-faucet.pk910.de/) to get free test ETH.
- **Mainnet:** Save this for when you have a finalized product and some initial funding/traction.

---

## 3. Current "Win-Win" Blockchain Features
These are the features that will attract users and investors (VCs/Grants):

1. **Reputation-Linked Identity:** Your "Hunter Level" and "XP" on OppForge are backed by on-chain completion status (via `OppForgeMission.sol`). This makes your profile "trustless."
2. **Protocol Tier Access:** Users pay for premium AI access via the protocol. This creates immediate revenue flow through smart contracts.
3. **Mission Reward Vaults:** Project owners can lock rewards (bounties) directly in our vault, ensuring hunters get paid immediately upon completion without "ghosting."
4. **Founder NFTs:** Early adopters get a unique "Forge Mascot" NFT which could grant lifetime governance or lower fees.

---

## 4. Funding Opportunities (Target within 10 Days)

Here are 10 ecosystems where OppForge is a perfect fit for grants:

| Ecosystem | Chance | Why OppForge? | Next Steps |
| :--- | :--- | :--- | :--- |
| **Arbitrum** | High | We are native to them. They love "Builder Tools." | Apply for an "Arbitrum Foundation Grant." |
| **Optimism** | High | They focus on "Retroactive Public Goods." | Tag @OptimismGov on X; focus on "Public Good discovery." |
| **Base** | Medium | High volume of builders/hackathons. | Connect with @OnchainKit team; Base loves "Consumer Apps." |
| **Polygon** | Medium | AggLayer support. They need more dev-focused tools. | Apply to the "Polygon Village" program. |
| **Solana** | High | Huge bounty culture (Superteam). | Pitch to @SuperteamDAO; focus on their bounty aggregator. |
| **Berachain** | High | (New Mainnet) They need identity/reputation tools. | Join their Discord; pitch as an "Onboarding Agent." |
| **The Graph** | Medium | We index data. We are a heavy consumer of subgraphs. | Apply for a "Data Tooling Grant." |
| **Sui** | Medium | They have huge rewards for Move builders. | Target Sui ecosystem developers specifically with AI help. |
| **Mantle** | High | They have a massive treasury for eco-growth. | Reach out to @MantleEco on X. |
| **Aptos** | Medium | Fast-growing DeFi/Bounty eco. | Apply for the "Aptos Ecosystem Grant." |

### Steps to Achieve Funding:
1. **Polish the Demo:** Ensure the "Forge AI" generates a meaningful technical draft.
2. **Submit to Gitcoin:** List OppForge on Gitcoin for the next GG round.
3. **Apply Directly:** Use the "Grants" section of each ecosystem's website. Provide a 3-minute video demo.

---

## 5. Saturday Launch Strategy (X/Twitter)
Launching on Saturday is a **Great Idea**. Web3/Crypto Twitter is very active on weekends for "builders."

**Launch Post Structure:**
1. **The Hook:** "Scouting Web3 opportunities is a full-time job. I built an AI Agent to do it for you while you sleep. Fast. Data-driven. On-chain."
2. **Video Demo (1-min):** Show:
   - AI scouting a real grant.
   - AI generating a technical proposal.
   - The on-chain mission status.
3. **The Call to Action:** "Launch the Forge: app.oppforge.xyz 🚀 (First 50 Hunters get Early-Beta status)"
4. **Tag Key People:** Tag @arbitrum, @gitcoin, @superteamDAO, and relevant VCs like @A16zCrypto.

---

## 6. Technical Setup After Deployment
Once you run `npm run deploy:sepolia`, you will get three addresses. Paste them into your `platform/.env`:
```bash
NEXT_PUBLIC_FOUNDER_CONTRACT=0x...
NEXT_PUBLIC_MISSION_CONTRACT=0x...
NEXT_PUBLIC_PROTOCOL_CONTRACT=0x...
```
This will allow the "Forge Workspace" to talk to the real contracts you just launched.
