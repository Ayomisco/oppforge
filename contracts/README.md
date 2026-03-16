# OppForge Smart Contracts

Production deployment is now on **Arbitrum One mainnet** (chainId: 42161).

## 🚀 Arbitrum One Mainnet Deployments (PROD)

| Contract | Address | Arbiscan | Status |
|---|---|---|---|
| **OppForgeProtocol** | `0x44cF9A17e5D976f3D63a497068E2eC2D0a36B9Ae` | [View Contract ↗](https://arbiscan.io/address/0x44cF9A17e5D976f3D63a497068E2eC2D0a36B9Ae#code) | ✅ Live |
| **OppForgeMission** | `0x91F0106205D87EAB2e7541bb2a09d5b933f94937` | [View Contract ↗](https://arbiscan.io/address/0x91F0106205D87EAB2e7541bb2a09d5b933f94937#code) | ✅ Live |
| OppForgeFounder (ERC-721) | ❌ Not Deployed | N/A | Removed (2-tier model) |

**Deployment Date:** March 16, 2026  
**Deployer:** `0xE5978059D18c0B840A3F33389dc4425465442E69`  
**All contracts verified on Arbiscan ✅**

### Network Details
- **Chain:** Arbitrum One
- **Chain ID:** 42161
- **RPC Endpoint:** `https://arb1.arbitrum.io/rpc`
- **Gas Token:** ETH
- **Block Time:** ~0.25 seconds

---

## Legacy Deployments (Sepolia Testnet)

Maintained for development/testing only. **DO NOT USE FOR PRODUCTION.**

| Contract | Address | Etherscan |
|---|---|---|
| OppForgeProtocol | `0x502973c5413167834d49078f214ee777a8C0A8Cf` | [View ↗](https://sepolia.etherscan.io/address/0x502973c5413167834d49078f214ee777a8C0A8Cf#code) |
| OppForgeMission | `0x654b689f316c5E2D1c6860d2446A73538B146722` | [View ↗](https://sepolia.etherscan.io/address/0x654b689f316c5E2D1c6860d2446A73538B146722#code) |

---

## Contract Overview

### OppForgeProtocol (Core Revenue Contract)

**Purpose:** Subscription tier management and mission reward vault

**Key Functions:**
- `upgradeTier(uint8 _tier)` — User pays 0.005 ETH (≈$10/month) for Hunter tier
- `fundMission(bytes32 _missionId)` — Fund bounties (min 0.0001 ETH)
- `releaseReward(bytes32 _missionId, address payable _hunter)` — Distribute rewards to hunters
- `withdrawTreasury()` — Admin withdraw accumulated revenue
- `getMissionFunding(bytes32 _missionId)` — View mission vault balance

**Tier Pricing:**
- SCOUT (0): Free, 7-day trial
- HUNTER (1): 0.005 ETH/month (~$10)

**Security Measures:**
- ✅ Reentrancy guard on all ETH transfers
- ✅ Safe `.call{value:}()` pattern (no silent failures)
- ✅ Minimum funding check (0.0001 ETH)
- ✅ Owner-only treasury withdrawal
- ✅ Solidity 0.8.20 with optimizations

---

### OppForgeMission (On-Chain Hunter Tracking)

**Purpose:** Immutable mission lifecycle and hunter reputation ledger

**Key Functions:**
- `startMission(bytes32 _missionId)` — Hunter claims mission (on-chain lock)
- `completeMission(bytes32 _missionId, uint256 _reward, uint256 _repBonus)` — Admin marks complete + awards rep
- `getHunterStats(address _hunter)` → `(reputation, earnings)` — View hunter profile

**Status:** Deployed but not actively used in MVP. Ready for future implementation.

---

## Environment Configuration

### Backend (.env)

```env
# Production (Arbitrum One)
PAYMENT_NETWORK=arbitrum
PROTOCOL_CONTRACT_ADDRESS=0x44cF9A17e5D976f3D63a497068E2eC2D0a36B9Ae
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
ETHEREUM_RPC_URL=https://eth.llamarpc.com
OPPFORGE_MASTER_WALLET=<optional-treasury-wallet>
```

### Frontend (.env.local)

```env
# Production (Arbitrum One)
NEXT_PUBLIC_PAYMENT_NETWORK=arbitrum
NEXT_PUBLIC_PROTOCOL_CONTRACT_ADDRESS=0x44cF9A17e5D976f3D63a497068E2eC2D0a36B9Ae
NEXT_PUBLIC_MISSION_CONTRACT_ADDRESS=0x91F0106205D87EAB2e7541bb2a09d5b933f94937
```

---

## Subscription Flow (User Perspective)

```
1. User creates account → 7-day free trial (Scout tier)
2. Trial expires → prompted to subscribe
3. User clicks "Subscribe · 0.005 ETH"
4. MetaMask popup → User confirms transaction
5. Frontend sends tx_hash to backend
6. Backend verifies on-chain (Arbitrum RPC):
   - Transaction succeeded (status=1)
   - Recipient is Protocol contract
7. Backend updates user:
   - tier = "hunter"
   - subscription_expires_at = now + 30 days
8. Frontend shows "HUNTER" badge
9. User unlocked: workspace, AI features, advanced tools
10. At expiry: subscription_status set to "expired", prompt to renew
```

---

## Payment Verification (Backend Logic)

```python
# Backend: POST /billing/verify-payment
1. Receive: { tx_hash, amount, network, tier }
2. Check: No duplicate tx_hash
3. Fetch: tx = RPC.get_transaction(tx_hash)
4. Verify:
   - receipt.status == 1 (success)
   - tx.to.lower() == PROTOCOL_CONTRACT (correct recipient)
   - amount >= tierPrices[tier]
5. Create: Payment record + Invoice
6. Update: User tier + subscription_expires_at
7. Email: Receipt to user
```

---

## Admin Dashboard Metrics

Admin users can view:
- **Payment Ledger:** All transactions, amounts, networks, tx hashes
- **Revenue Dashboard:** Total ETH, monthly revenue, payment count
- **Payment Status:** Completed, pending, failed transactions
- **Direct Explorer Links:** Click to Arbiscan for tx verification

Path: `/admin/billing`

---

## Testing Locally

### Deploy to Sepolia Testnet

```bash
cd contracts
npm install
npx hardhat run scripts/deploy.js --network sepolia
```

### Run Contract Tests

```bash
npm test
```

All 3 tests passing:
- ✅ Should set correct tier prices (0.005 ETH for HUNTER)
- ✅ Should allow upgrading tier
- ✅ Should allow funding missions

---

## Security Audit Notes

✅ **Fixes Applied in Production:**
- Changed `releaseReward()` from unsafe `.transfer()` to safe `.call{value:}()`
- Added minimum funding requirement (0.0001 ETH)
- Added `getMissionFunding()` getter for transparency
- Protected `withdrawTreasury()` with reentrancy guard

❌ **Removed from Production:**
- OppForgeFounder (ERC-721 NFT) — Redundant in 2-tier model

🔄 **Future Iterations:**
- On-chain mission completion flow (Mission contract integration)
- Dispute/appeal mechanism for hunter-admin conflicts
- Automated reward distribution via Chainlink

---

## Deployment Checklist

- ✅ Contracts compiled (Solidity 0.8.20, 0 warnings)
- ✅ Unit tests passing (3/3)
- ✅ Verified on Arbiscan
- ✅ Frontend env vars updated
- ✅ Backend env vars updated
- ✅ Admin dashboard integrated
- ✅ Payment verification endpoint live
- ✅ Trial → subscription flow tested

---

## Links

- **Arbitrum Docs:** https://docs.arbitrum.io/
- **Arbiscan:** https://arbiscan.io/
- **Contract Source (GitHub):** https://github.com/oppforge/smart-contracts
- **Deployed Addresses JSON:** `./deployed-addresses.json`



```env
NEXT_PUBLIC_PAYMENT_NETWORK=sepolia
NEXT_PUBLIC_PROTOCOL_CONTRACT_ADDRESS=0x502973c5413167834d49078f214ee777a8C0A8Cf
NEXT_PUBLIC_FOUNDER_NFT_CONTRACT_ADDRESS=0xa0928440186C28062c964aeE496b38275e94aA8c
NEXT_PUBLIC_MISSION_CONTRACT_ADDRESS=0x654b689f316c5E2D1c6860d2446A73538B146722
```

When Arbitrum One is deployed later, change only the env vars and redeploy.# OppForge Smart Contracts

# OppForge Smart Contracts

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
