'use client'

import React from 'react'
import { Hash, Rocket, Zap, Target, Sparkles, Users, Activity, Building2, Lightbulb, TrendingUp, Medal, Code2 } from 'lucide-react'

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

export default function FilterBar({ activeCategory, onCategoryChange }) {

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
    </div>
  )
}
