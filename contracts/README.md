# OppForge Smart Contracts

Current live deployment is on Ethereum Sepolia.

## Sepolia Deployments

| Contract | Address | Explorer |
|---|---|---|
| OppForgeProtocol | `0x502973c5413167834d49078f214ee777a8C0A8Cf` | [Etherscan](https://sepolia.etherscan.io/address/0x502973c5413167834d49078f214ee777a8C0A8Cf#code) |
| OppForgeFounder | `0xa0928440186C28062c964aeE496b38275e94aA8c` | [Etherscan](https://sepolia.etherscan.io/address/0xa0928440186C28062c964aeE496b38275e94aA8c#code) |
| OppForgeMission | `0x654b689f316c5E2D1c6860d2446A73538B146722` | [Etherscan](https://sepolia.etherscan.io/address/0x654b689f316c5E2D1c6860d2446A73538B146722#code) |

All three contracts are already deployed and verified on Sepolia.

## Env Vars

### Backend

```env
PAYMENT_NETWORK=sepolia
OPPFORGE_MASTER_WALLET=
PROTOCOL_CONTRACT_ADDRESS=0x502973c5413167834d49078f214ee777a8C0A8Cf
FOUNDER_NFT_CONTRACT_ADDRESS=0xa0928440186C28062c964aeE496b38275e94aA8c
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
ETHEREUM_RPC_URL=https://eth.llamarpc.com
```

### Frontend

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
