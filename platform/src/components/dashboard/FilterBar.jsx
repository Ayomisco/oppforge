'use client'

import React from 'react'

import { 
  Hash, 
  Rocket, 
  Zap, 
  Target, 
  Sparkles, 
  Users, 
  Activity 
} from 'lucide-react'

const categories = [
  { id: 'all', label: 'All', icon: Hash },
  { id: 'grant', label: 'Grants', icon: Rocket },
  { id: 'hackathon', label: 'Hackathons', icon: Zap },
  { id: 'bounty', label: 'Bounties', icon: Target },
  { id: 'airdrop', label: 'Airdrops', icon: Sparkles },
  { id: 'ambassador', label: 'Ambassadors', icon: Users },
  { id: 'testnet', label: 'Testnets', icon: Activity },
]

export default function FilterBar({ activeCategory, onCategoryChange }) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`
              flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 border
              ${activeCategory === cat.id 
                ? 'bg-[#ff5500] text-white border-[#ff5500] shadow-[0_0_15px_rgba(255,85,0,0.3)]' 
                : 'bg-[#0a0806] border-[#1a1512] text-gray-400 hover:text-white hover:border-gray-600'}
            `}
          >
            <cat.icon size={14} className={activeCategory === cat.id ? 'text-white' : 'text-gray-500'} />
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  )
}
