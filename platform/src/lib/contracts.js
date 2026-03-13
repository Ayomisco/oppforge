import { arbitrum, sepolia } from 'wagmi/chains'

const PAYMENT_NETWORK = (process.env.NEXT_PUBLIC_PAYMENT_NETWORK || 'sepolia').toLowerCase()
const ACTIVE_CHAIN = PAYMENT_NETWORK === 'arbitrum' ? arbitrum : sepolia

const DEFAULT_ADDRESSES = {
  sepolia: {
    PROTOCOL: '0x502973c5413167834d49078f214ee777a8C0A8Cf',
    FOUNDER_NFT: '0xa0928440186C28062c964aeE496b38275e94aA8c',
    MISSION: '0x654b689f316c5E2D1c6860d2446A73538B146722',
  },
  arbitrum: {
    PROTOCOL: process.env.NEXT_PUBLIC_PROTOCOL_CONTRACT || '',
    FOUNDER_NFT: process.env.NEXT_PUBLIC_FOUNDER_NFT_CONTRACT || '',
    MISSION: process.env.NEXT_PUBLIC_MISSION_CONTRACT || '',
  },
}

const selected = DEFAULT_ADDRESSES[PAYMENT_NETWORK] || DEFAULT_ADDRESSES.sepolia

export const CONTRACTS = {
  PROTOCOL: {
    address: process.env.NEXT_PUBLIC_PROTOCOL_CONTRACT || selected.PROTOCOL,
    chainId: ACTIVE_CHAIN.id,
  },
  FOUNDER_NFT: {
    address: process.env.NEXT_PUBLIC_FOUNDER_NFT_CONTRACT || selected.FOUNDER_NFT,
    chainId: ACTIVE_CHAIN.id,
  },
  MISSION: {
    address: process.env.NEXT_PUBLIC_MISSION_CONTRACT || selected.MISSION,
    chainId: ACTIVE_CHAIN.id,
  },
}

export const PAYMENT_SETTINGS = {
  network: PAYMENT_NETWORK,
  chainId: ACTIVE_CHAIN.id,
  chainLabel: PAYMENT_NETWORK === 'arbitrum' ? 'ARBITRUM ONE' : 'ETH SEPOLIA',
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

export const FOUNDER_NFT_ABI = [
  {
    inputs: [],
    name: 'mint',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MINT_PRICE',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
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
]

// Tier enum mapping (matches Solidity: enum Tier { NONE, HUNTER, FOUNDER })
export const TIER_ENUM = {
  NONE: 0,
  HUNTER: 1,
  FOUNDER: 2,
}
