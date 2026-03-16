# OppForge Smart Contracts

Production-ready Solidity smart contracts for OppForge subscription payments and mission tracking on Arbitrum One.

## 🚀 Live Contracts (Arbitrum One Mainnet)

| Contract | Address | Arbiscan Link |
|----------|---------|---------------|
| **OppForgeProtocol** | `0x44cF9A17e5D976f3D63a497068E2eC2D0a36B9Ae` | [View Contract ↗](https://arbiscan.io/address/0x44cF9A17e5D976f3D63a497068E2eC2D0a36B9Ae#code) |
| **OppForgeMission** | `0x91F0106205D87EAB2e7541bb2a09d5b933f94937` | [View Contract ↗](https://arbiscan.io/address/0x91F0106205D87EAB2e7541bb2a09d5b933f94937#code) |

Both contracts verified on Arbiscan ✅

**Deployment Date:** March 16, 2026  
**Chain ID:** 42161 (Arbitrum One)  
**Status:** PRODUCTION READY ✅

---

## 📋 Contract Overview

### OppForgeProtocol.sol (CORE - REQUIRED)

**Purpose:** Subscription payment processor and mission reward vault

**Key Functions:**
- `upgradeTier(uint8 _tier)` - User pays 0.005 ETH → gets 30-day Hunter access
- `fundMission(bytes32 _missionId)` - Create bounty/reward pool
- `releaseReward(bytes32 _missionId, address _hunter)` - Distribute mission payouts
- `withdrawTreasury()` - Owner withdraws accumulated subscription revenue

**Pricing:** Hunter tier = **0.005 ETH/month** (~$10)

**Featured Security:**
- ✅ ReentrancyGuard on all ETH transfers
- ✅ Safe `.call{value:}()` pattern (no `.transfer()` vulnerability)
- ✅ Minimum funding enforcement (0.0001 ETH)
- ✅ Checks-effects-interactions pattern

**Read Contract:** [Arbiscan Read ↗](https://arbiscan.io/address/0x44cF9A17e5D976f3D63a497068E2eC2D0a36B9Ae#readContract)

---

### OppForgeMission.sol (OPTIONAL - PHASE 2)

**Purpose:** On-chain hunter mission tracking and reputation ledger

**Status:** Deployed but not actively used in v1. Fully integrated in Phase 2.

**Key Functions:**
- `startMission(bytes32 _missionId)` - Hunter claims opportunity
- `completeMission(bytes32, uint256 _reward)` - Admin marks done + awards reputation
- `getHunterStats(address)` - Fetch reputation/earnings immutably

**When Needed:** When OppForge implements on-chain mission completion workflow (Phase 2)

**Read Contract:** [Arbiscan Read ↗](https://arbiscan.io/address/0x91F0106205D87EAB2e7541bb2a09d5b933f94937#readContract)

---

## 💰 Payment Flow

```
1. Frontend: User clicks "Subscribe · 0.005 ETH"
   → MetaMask popup: upgradeTier(1) transaction

2. User confirms: 0.005 ETH leaves wallet  
   → ETH stored in OppForgeProtocol contract

3. Frontend: Gets TX hash (0x123abc...)
   → Sends to backend: POST /billing/verify-payment

4. Backend: Queries Arbitrum RPC
   → Verifies: TX successful + recipient = Protocol contract
   → Creates SubscriptionPayment record in DB
   → Sets user.tier = "hunter", subscription_expires_at = now + 30 days
   → Sends receipt email with invoice

5. Frontend: User unlocked → Workspace + AI features enabled
   → 30 days of access (auto-expires at deadline)

6. After 30 days: User prompted to subscribe again
```

---

## 🔐 Configuration

### Backend (FastAPI)

**File:** `backend/.env`

```env
PAYMENT_NETWORK=arbitrum
PROTOCOL_CONTRACT_ADDRESS=0x44cF9A17e5D976f3D63a497068E2eC2D0a36B9Ae
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
```

**Verify Payment Endpoint:**
```python
POST /billing/verify-payment
Body: {
  "tx_hash": "0x...",
  "network": "arbitrum",
  "amount": "0.005",
  "tier": "hunter"
}

Response: {
  "id": "uuid",
  "user_id": "uuid",
  "tx_hash": "0x...",
  "status": "COMPLETED",
  "created_at": "2026-03-16T..."
}
```

**Admin Endpoints:**
```
GET /billing/admin/payments     → All payments (requires admin role)
GET /billing/admin/invoices     → All invoices
GET /billing/admin/revenue      → Revenue analytics
```

### Frontend (Next.js)

**File:** `platform/.env.local`

```env
NEXT_PUBLIC_PAYMENT_NETWORK=arbitrum
NEXT_PUBLIC_PROTOCOL_CONTRACT_ADDRESS=0x44cF9A17e5D976f3D63a497068E2eC2D0a36B9Ae
NEXT_PUBLIC_MISSION_CONTRACT_ADDRESS=0x91F0106205D87EAB2e7541bb2a09d5b933f94937
```

**Reference:** `platform/src/lib/contracts.js`

---

## 👨‍💻 Development

### Install Dependencies

```bash
cd contracts
npm install
```

### Compile

```bash
npm run compile
```

### Test

```bash
npm test
# Expected: 3 passing
```

### Deploy to Arbitrum Sepolia (Testnet)

```bash
npm run deploy:arbitrum-sepolia
# Outputs deployed-addresses.json
```

### Deploy to Arbitrum One (MAINNET - PRODUCTION)

```bash
npm run deploy:arbitrum
# ⚠️ Costs real money. Verify setup first.
```

---

## 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| "Insufficient payment" on subscribe | Send exactly 0.005 ETH or more |
| TX fails but appears on Arbiscan | Verify transaction status is "1" (success) |
| Contract won't deploy | Check PRIVATE_KEY in .env, ensure wallet has ETH for gas |
| Verification fails on Arbiscan | Wait 30 seconds, contracts auto-verify after deploy |

---

## 📞 Useful Links

- **Protocol Contract:** https://arbiscan.io/address/0x44cF9A17e5D976f3D63a497068E2eC2D0a36B9Ae
- **Mission Contract:** https://arbiscan.io/address/0x91F0106205D87EAB2e7541bb2a09d5b933f94937
- **Admin Dashboard:** https://app.oppforge.xyz/admin/billing
- **Arbitrum Docs:** https://docs.arbitrum.io/

---

**Last Updated:** March 16, 2026  
**Solidity:** 0.8.20  
**License:** MIT
| `OppForgeMission`  | Mission/opportunity tracking on-chain                                   |

---

## Deployed — Ethereum Sepolia (Testnet)


| Contract            | Address                                      | Etherscan                                                                                  |
| ------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------ |
| OppForgeProtocol    | `0x502973c5413167834d49078f214ee777a8C0A8Cf` | [View ↗](https://sepolia.etherscan.io/address/0x502973c5413167834d49078f214ee777a8C0A8Cf) |
| OppForgeFounder NFT | `0xa0928440186C28062c964aeE496b38275e94aA8c` | [View ↗](https://sepolia.etherscan.io/address/0xa0928440186C28062c964aeE496b38275e94aA8c) |
| OppForgeMission     | `0x654b689f316c5E2D1c6860d2446A73538B146722` | [View ↗](https://sepolia.etherscan.io/address/0x654b689f316c5E2D1c6860d2446A73538B146722) |

- **Network**: Ethereum Sepolia (Chain ID: `11155111`)
- **Treasury / Owner**: `0xE5978059D18c0B840A3F33389dc4425465442E69`
- **Deployed**: March 2026

---

## Upcoming — Arbitrum One (Mainnet)

Deployment pending grant funding via [Questbook Arbitrum grants](https://questbook.app/). Switching to Arbitrum One requires only env var changes — no code changes needed.

---

## Development

### Prerequisites

```bash
cd contracts
npm install
```

Copy `.env.example` to `.env` and fill in:

```
PRIVATE_KEY=your_deployer_private_key
ALCHEMY_KEY=your_alchemy_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
ARBISCAN_API_KEY=your_arbiscan_api_key
```

### Deploy

```bash
# Sepolia testnet
npm run deploy:sepolia

# Arbitrum One mainnet
npm run deploy:arbitrum

# Patch contract addresses into backend + frontend after deploy
npm run patch
```

### Test

```bash
npx hardhat test
```

---

## Architecture

Payment flow:

1. User selects a plan on the subscription page
2. Frontend prompts wallet to send ETH to the protocol contract
3. Backend listens for transaction confirmation on-chain
4. On confirmation, tier is upgraded in the database

See [`docs/BLOCKCHAIN_GUIDE.md`](../docs/BLOCKCHAIN_GUIDE.md) for full integration details.

Solidity contracts powering OppForge's on-chain payment and membership system.

## Contracts


| Contract           | Description                                                             |
| ------------------ | ----------------------------------------------------------------------- |
| `OppForgeProtocol` | Core payment processor — handles tier subscriptions (Pro, Elite, Team) |
| `OppForgeFounder`  | Founder lifetime membership NFT (ERC-721)                               |
| `OppForgeMission`  | Mission/opportunity tracking on-chain                                   |

---

## Deployed — Ethereum Sepolia (Testnet)


| Contract            | Address                                      | Etherscan                                                                                  |
| ------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------ |
| OppForgeProtocol    | `0x502973c5413167834d49078f214ee777a8C0A8Cf` | [View ↗](https://sepolia.etherscan.io/address/0x502973c5413167834d49078f214ee777a8C0A8Cf) |
| OppForgeFounder NFT | `0xa0928440186C28062c964aeE496b38275e94aA8c` | [View ↗](https://sepolia.etherscan.io/address/0xa0928440186C28062c964aeE496b38275e94aA8c) |
| OppForgeMission     | `0x654b689f316c5E2D1c6860d2446A73538B146722` | [View ↗](https://sepolia.etherscan.io/address/0x654b689f316c5E2D1c6860d2446A73538B146722) |

- **Network**: Ethereum Sepolia (Chain ID: `11155111`)
- **Treasury / Owner**: `0xE5978059D18c0B840A3F33389dc4425465442E69`
- **Deployed**: March 2026

---

## Upcoming — Arbitrum One (Mainnet)

Deployment pending grant funding via [Questbook Arbitrum grants](https://questbook.app/). Switching to Arbitrum One requires only env var changes — no code changes needed.

---

## Development

### Prerequisites

```bash
cd contracts
npm install
```

Copy `.env.example` to `.env` and fill in:

```
PRIVATE_KEY=your_deployer_private_key
ALCHEMY_KEY=your_alchemy_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
ARBISCAN_API_KEY=your_arbiscan_api_key
```

### Deploy

```bash
# Sepolia testnet
npm run deploy:sepolia

# Arbitrum One mainnet
npm run deploy:arbitrum

# Patch contract addresses into backend + frontend after deploy
npm run patch
```

### Test

```bash
npx hardhat test
```

---

## Architecture

Payment flow:

1. User selects a plan on the subscription page
2. Frontend prompts wallet to send ETH to the protocol contract
3. Backend listens for transaction confirmation on-chain
4. On confirmation, tier is upgraded in the database

See [`docs/BLOCKCHAIN_GUIDE.md`](../docs/BLOCKCHAIN_GUIDE.md) for full integration details.
