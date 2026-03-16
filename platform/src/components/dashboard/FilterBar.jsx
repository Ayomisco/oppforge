'use client'

import React, { useState } from 'react'
import { Hash, Rocket, Zap, Target, Sparkles, Users, Activity, Building2, Lightbulb, TrendingUp, Medal, Code2, ChevronDown } from 'lucide-react'

const categories = [
  { id: 'all', label: 'All', icon: Hash },
  { id: 'grant', label: 'Grants', icon: Rocket },
  { id: 'hackathon', label: 'Hackathons', icon: Zap },
  { id: 'bounty', label: 'Bounties', icon: Target },
  { id: 'airdrop', label: 'Airdrops', icon: Sparkles },
  { id: 'ambassador', label: 'Ambassadors', icon: Users },
  { id: 'testnet', label: 'Testnets', icon: Activity },
  { id: 'accelerator', label: 'Accelerators', icon: Building2 },
  { id: 'incubator', label: 'Incubators', icon: Lightbulb },
  { id: 'competition', label: 'Competitions', icon: Medal },
  { id: 'audit', label: 'Audits', icon: Code2 },
]

const chains = [
  { id: 'all', label: 'All Chains' },
  { id: 'ethereum', label: 'Ethereum' },
  { id: 'arbitrum', label: 'Arbitrum' },
  { id: 'optimism', label: 'Optimism' },
  { id: 'base', label: 'Base' },
  { id: 'polygon', label: 'Polygon' },
  { id: 'solana', label: 'Solana' },
  { id: 'near', label: 'NEAR' },
  { id: 'avalanche', label: 'Avalanche' },
  { id: 'fantom', label: 'Fantom' },
  { id: 'bsc', label: 'BSC' },
  { id: 'starknet', label: 'Starknet' },
  { id: 'zksync', label: 'zkSync' },
  { id: 'linea', label: 'Linea' },
  { id: 'scroll', label: 'Scroll' },
  { id: 'mantle', label: 'Mantle' },
  { id: 'manta', label: 'Manta' },
  { id: 'sei', label: 'Sei' },
  { id: 'aptos', label: 'Aptos' },
  { id: 'move', label: 'Move' },
  { id: 'sui', label: 'Sui' },
  { id: 'cosmos', label: 'Cosmos' },
  { id: 'polkadot', label: 'Polkadot' },
  { id: 'tezos', label: 'Tezos' },
  { id: 'cardano', label: 'Cardano' },
  { id: 'algorand', label: 'Algorand' },
  { id: 'ton', label: 'TON' },
  { id: 'bitcoin', label: 'Bitcoin L2' },
  { id: 'flow', label: 'Flow' },
  { id: 'hedera', label: 'Hedera' },
  { id: 'harmony', label: 'Harmony' },
  { id: 'celo', label: 'Celo' },
  { id: 'iotx', label: 'IoTeX' },
  { id: 'casper', label: 'Casper' },
]

export default function FilterBar({ 
  activeCategory, 
  onCategoryChange, 
  activeChain, 
  onChainChange,
  deadline,
  onDeadlineChange,
  reward,
  onRewardChange,
}) {
  const [showChainDropdown, setShowChainDropdown] = useState(false)

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`
              flex items-center gap-2 whitespace-nowrap px-3.5 py-2 rounded-md text-xs font-medium transition-all duration-150 border
              ${activeCategory === cat.id
                ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-[0_0_12px_rgba(255,85,0,0.2)]'
                : 'bg-[var(--bg-secondary)] border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-muted)]'}
            `}
          >
            <cat.icon size={14} className={activeCategory === cat.id ? 'text-white' : 'text-[var(--text-tertiary)]'} />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Filter Controls: Deadline, Reward, Chain */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Deadline Filter */}
        <select
          value={deadline || 'all'}
          onChange={(e) => onDeadlineChange(e.target.value)}
          className="text-xs px-3 py-2 rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <option value="all">Deadline: Any</option>
          <option value="soon">7 Days</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="none">No Deadline</option>
        </select>

        {/* Reward Filter */}
        <select
          value={reward || 'all'}
          onChange={(e) => onRewardChange(e.target.value)}
          className="text-xs px-3 py-2 rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <option value="all">Reward: Any</option>
          <option value="low">Low ($0 - $5K)</option>
          <option value="medium">Medium ($5K - $50K)</option>
          <option value="high">High ($50K - $500K)</option>
          <option value="veryhigh">Very High ($500K+)</option>
        </select>

        {/* Chain Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowChainDropdown(!showChainDropdown)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium transition-all duration-150 border bg-[var(--bg-secondary)] border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-muted)]"
          >
            🔗 {chains.find(c => c.id === activeChain)?.label || 'All Chains'}
            <ChevronDown size={14} className={`transition-transform ${showChainDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showChainDropdown && (
            <div className="absolute top-full mt-2 z-50 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg shadow-lg p-2 max-h-64 overflow-y-auto w-48">
              {chains.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => {
                    onChainChange(chain.id)
                    setShowChainDropdown(false)
                  }}
                  className={`
                    w-full text-left px-3 py-2 rounded text-xs transition-colors
                    ${activeChain === chain.id
                      ? 'bg-[var(--accent-primary)] text-white'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'}
                  `}
                >
                  {chain.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
