import { arbitrum, sepolia, celo } from 'wagmi/chains'

// Contract addresses — same deployer nonce resulted in identical addresses on both chains
const PROTOCOL_ADDR = '0x44cF9A17e5D976f3D63a497068E2eC2D0a36B9Ae'
const MISSION_ADDR  = '0x91F0106205D87EAB2e7541bb2a09d5b933f94937'

export const NETWORK_CONFIG = {
  arbitrum: {
    chain: arbitrum,
    label: 'ARBITRUM ONE',
    currency: 'ETH',
    hunterPrice: '0.005',     // 0.005 ETH ≈ $10/month
    hunterDisplay: '0.005 ETH',
    protocol: PROTOCOL_ADDR,
    mission: MISSION_ADDR,
    explorer: 'https://arbiscan.io/tx/',
  },
  celo: {
    chain: celo,
    label: 'CELO',
    currency: 'CELO',
    hunterPrice: '17',        // 17 CELO ≈ $10/month
    hunterDisplay: '17 CELO',
    protocol: PROTOCOL_ADDR,
    mission: MISSION_ADDR,
    explorer: 'https://celoscan.io/tx/',
  },
  sepolia: {
    chain: sepolia,
    label: 'ETH SEPOLIA',
    currency: 'ETH',
    hunterPrice: '0.005',
    hunterDisplay: '0.005 ETH',
    protocol: '0x502973c5413167834d49078f214ee777a8C0A8Cf',
    mission: '0x654b689f316c5E2D1c6860d2446A73538B146722',
    explorer: 'https://sepolia.etherscan.io/tx/',
  },
}

// Default network from env (used for non-interactive contexts like billing page)
export const PAYMENT_NETWORK = process.env.NEXT_PUBLIC_PAYMENT_NETWORK || 'arbitrum'
const _defaultNet = NETWORK_CONFIG[PAYMENT_NETWORK] || NETWORK_CONFIG.arbitrum

export const PAYMENT_CHAIN         = _defaultNet.chain
export const PAYMENT_NETWORK_LABEL = _defaultNet.label
export const PAYMENT_CURRENCY      = _defaultNet.currency

export const CONTRACTS = {
  PROTOCOL: { address: _defaultNet.protocol, chainId: _defaultNet.chain.id },
  MISSION:  { address: _defaultNet.mission,  chainId: _defaultNet.chain.id },
}

// Minimal ABIs — only the functions we call from the frontend
export const PROTOCOL_ABI = [
  {
    inputs: [{ internalType: 'uint8', name: '_tier', type: 'uint8' }],
    name: 'upgradeTier',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    name: 'tierPrices',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'userTiers',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
]

export const MISSION_ABI = [
  {
    inputs: [{ internalType: 'bytes32', name: '_missionId', type: 'bytes32' }],
    name: 'fundMission',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '_missionId', type: 'bytes32' }],
    name: 'startMission',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_hunter', type: 'address' }],
    name: 'getHunterStats',
    outputs: [
      { internalType: 'uint256', name: 'reputation', type: 'uint256' },
      { internalType: 'uint256', name: 'earnings', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
]

// Tier enum mapping (matches Solidity: enum Tier { SCOUT, HUNTER })
export const TIER_ENUM = {
  SCOUT: 0,
  HUNTER: 1,
}
