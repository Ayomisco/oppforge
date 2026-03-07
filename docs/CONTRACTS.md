# OppForge — Smart Contracts

> **Last Updated**: March 7, 2026  
> **Stack**: Solidity 0.8.20 · Hardhat · OpenZeppelin · Etherscan V2

---

## 1. Overview

OppForge runs three on-chain contracts that power the reputation layer, access tiers, and founder identity for the protocol. All contracts are built with OpenZeppelin primitives and deployed via Hardhat.

| Contract | Purpose |
|---|---|
| `OppForgeFounder.sol` | ERC-721 NFT — Founder Pass for early adopters |
| `OppForgeMission.sol` | On-chain mission tracker — reputation + XP system |
| `OppForgeProtocol.sol` | Main protocol — tier access, rewards, funding vaults |

---

## 2. Contract Descriptions

### OppForgeFounder (ERC-721)
`contracts/contracts/OppForgeFounder.sol`

- Mint price: **0.01 ETH**
- Mints to caller; no whitelist needed in V1
- Grants "Founding Hunter" status — early adopter recognition and potential future governance weight
- Owner can withdraw ETH from mint proceeds
- Inherits OpenZeppelin `ERC721` + `Ownable`

### OppForgeMission
`contracts/contracts/OppForgeMission.sol`

- Tracks missions per wallet (`missionId → Mission struct`)
- Statuses: `Started`, `Submitted`, `Completed`, `Disputed`
- Accumulates `hunterReputation` and `hunterEarnings` per address
- Events: `MissionStarted`, `MissionCompleted`, `ReputationUpdated`
- Owner controls completion + reward payouts
- Makes on-chain profile data trustless and portable

### OppForgeProtocol
`contracts/contracts/OppForgeProtocol.sol`

- Main protocol entry point
- Handles tier access (Scout / Hunter / Founder) and reward vaults
- Project owners can lock bounty rewards; hunters claim on completion

### OppForgePayment (standalone)
`contracts/OppForgePayment.sol`

- Clearance tier upgrade payments
- Emits `ClearanceUpgraded(address pilot, Tier tier, uint256 amount, string emailHash)`
- Can be used as a standalone payment gateway independent of the Protocol contract

---

## 3. Deployments

### Ethereum Sepolia (Testnet) — Deployed March 7, 2026

| Contract | Address | Etherscan |
|---|---|---|
| OppForgeFounder | `0xa0928440186C28062c964aeE496b38275e94aA8c` | [View](https://sepolia.etherscan.io/address/0xa0928440186C28062c964aeE496b38275e94aA8c#code) |
| OppForgeMission | `0x654b689f316c5E2D1c6860d2446A73538B146722` | [View](https://sepolia.etherscan.io/address/0x654b689f316c5E2D1c6860d2446A73538B146722#code) |
| OppForgeProtocol | `0x502973c5413167834d49078f214ee777a8C0A8Cf` | [View](https://sepolia.etherscan.io/address/0x502973c5413167834d49078f214ee777a8C0A8Cf#code) |

All contracts are **source-verified** on Etherscan.

### Ethereum Mainnet
⏳ Pending — deploy when product has traction and initial funding secured.

### Other Chains (Planned)
See Section 6 for multi-chain rollout plan.

---

## 4. Environment Setup

### Required keys — `contracts/.env`

```env
PRIVATE_KEY=your_deployer_wallet_private_key
ALCHEMY_API_KEY=your_alchemy_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key      # get at etherscan.io/myapikey
ARBISCAN_API_KEY=your_arbiscan_api_key        # get at arbiscan.io (same as Etherscan API key works for V2)
REPORT_GAS=false                              # set true to print gas costs during tests
```

**Alchemy — enable required networks** at dashboard.alchemy.com → your app → Networks:
- Ethereum Mainnet ✅
- Ethereum Sepolia ✅
- Arbitrum Mainnet (when needed)
- Arbitrum Sepolia (when needed)

**Etherscan V2**: A single `ETHERSCAN_API_KEY` covers all chains (Ethereum mainnet, Sepolia, Arbitrum, etc.) — no separate keys needed per network.

---

## 5. Deploying to a Network

### Compile
```bash
cd contracts
npx hardhat compile
```

### Deploy — Ethereum Sepolia (testnet)
```bash
npx hardhat run scripts/deploy-ethereum.js --network sepolia
```

### Deploy — Ethereum Mainnet
```bash
npx hardhat run scripts/deploy-ethereum.js --network mainnet
```

### Deploy — Arbitrum Sepolia (testnet)
```bash
npx hardhat run scripts/deploy.js --network arbitrumSepolia
```

### Deploy — Arbitrum One (mainnet)
```bash
npx hardhat run scripts/deploy.js --network arbitrumOne
```

### Verify manually (if auto-verify fails)
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
npx hardhat verify --network mainnet <CONTRACT_ADDRESS>
npx hardhat verify --network arbitrumSepolia <CONTRACT_ADDRESS>
```

### After deployment — add to backend `.env`
```env
FOUNDER_CONTRACT_ADDRESS=0x...
MISSION_CONTRACT_ADDRESS=0x...
PROTOCOL_CONTRACT_ADDRESS=0x...
```

### After deployment — add to platform `.env`
```env
NEXT_PUBLIC_FOUNDER_CONTRACT=0x...
NEXT_PUBLIC_MISSION_CONTRACT=0x...
NEXT_PUBLIC_PROTOCOL_CONTRACT=0x...
```

---

## 6. Multi-Chain Rollout Plan

The Hardhat config (`contracts/hardhat.config.js`) already has Ethereum mainnet + Sepolia configured. Adding new chains is a 2-step process: add the network to the config, then run the deploy script.

### Template for adding a new chain to `hardhat.config.js`
```js
newChain: {
  url: `https://new-chain.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  chainId: 12345,
  accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
}
```

And add to `etherscan.apiKey` if the chain has a block explorer:
```js
// Etherscan V2 api key covers most EVM chains automatically
// For non-etherscan explorers, add chain-specific key
```

### Chains in Queue (Priority Order)

| Chain | Explorer | Notes |
|---|---|---|
| **Arbitrum One** | arbiscan.io | Already in config. Deploy same contracts. |
| **Base** | basescan.org | High builder activity. Add `BASESCAN_API_KEY`. |
| **Optimism** | optimistic.etherscan.io | RetroPGF alignment. Use Alchemy OP Mainnet URL. |
| **Polygon** | polygonscan.com | AggLayer. Add `POLYGONSCAN_API_KEY`. |
| **Avalanche** | snowtrace.io | Large grant programs. RPC: `https://api.avax.network/ext/bc/C/rpc` |
| **BNB Chain** | bscscan.com | High volume. RPC: `https://bsc-dataseed.binance.org/` |
| **Solana** | — | Separate stack (Anchor/Rust) — not Hardhat. Plan separately. |

### Steps to deploy to any new EVM chain
1. Add the network block to `hardhat.config.js`
2. Enable the network in your Alchemy app dashboard
3. Fund deployer wallet on the target chain (testnet faucet or bridge)
4. `npx hardhat run scripts/deploy-ethereum.js --network <networkName>`
5. Verify: `npx hardhat verify --network <networkName> <ADDRESS>`
6. Update `.env` files with new addresses

---

## 7. WalletConnect / Frontend Integration (Planned)

When connecting contracts to the platform UI, the stack will be:

| Library | Role |
|---|---|
| **WalletConnect v3** | Multi-wallet connection (MetaMask, Rainbow, Coinbase, etc.) |
| **RainbowKit** | Wallet connect UI component |
| **Wagmi v2** | React hooks for reading/writing contracts |
| **viem** | Underlying Ethereum client (replaces ethers.js) |

### Planned frontend interactions
- `useContractRead` → Read mission status, hunter reputation, tier level
- `useContractWrite` → Mint Founder NFT, start mission, upgrade clearance tier
- Wallet-gated routes → Certain Forge features require wallet connection
- On-chain badge display → Show verified on-chain reputation on user profile

---

## 8. Security Notes

- **Private key**: Never commit `contracts/.env` — it's in `.gitignore`
- **Ownership**: All contracts use OpenZeppelin `Ownable` — only deployer wallet is owner
- **Withdrawals**: `OppForgeFounder` and `OppForgePayment` have `withdraw()` — owner only
- **Audits**: Pre-mainnet, run through Slither static analysis: `pip install slither-analyzer && slither .`
- **Multi-sig**: Before mainnet launch, consider transferring ownership to a Gnosis Safe multisig
