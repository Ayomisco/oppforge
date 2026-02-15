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
  { id: 'airdrop', label: 'Alpha', icon: Sparkles },
  { id: 'ambassador', label: 'Ambassadors', icon: Users },
  { id: 'testnet', label: 'Testnets', icon: Activity },
]

export default function FilterBar({ activeCategory, onCategoryChange }) {
  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`
              flex items-center gap-2 whitespace-nowrap px-3 py-1.5 rounded-sm text-[10px] font-mono uppercase tracking-wider transition-all duration-200 border
              ${activeCategory === cat.id 
                ? 'bg-[#ff5500] text-black border-[#ff5500] shadow-[0_0_15px_rgba(255,85,0,0.3)]' 
                : 'bg-[#0a0806] border-[#1a1512] text-gray-400 hover:text-white hover:border-gray-700'}
            `}
          >
            <cat.icon size={12} className={activeCategory === cat.id ? 'text-black' : 'text-gray-500'} />
            {cat.label}
          </button>
        ))}
        
        {/* Spacer */}
        <div className="flex-1" />

        {/* Chain Filter (Mock) */}
        <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-sm bg-[#0a0806] border border-white/5 text-[9px] font-mono uppercase text-gray-400 hover:border-[#ff5500]/50 transition-all">
          <span>All Chains</span>
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>
    </div>
  )
}
