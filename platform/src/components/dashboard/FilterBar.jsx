'use client'

import React from 'react'

const categories = [
  { id: 'all', label: 'All Opportunities' },
  { id: 'grant', label: 'Grants' },
  { id: 'hackathon', label: 'Hackathons' },
  { id: 'bounty', label: 'Bounties' },
  { id: 'airdrop', label: 'Airdrop Alpha' },
  { id: 'testnet', label: 'Testnets' },
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
              whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
              ${activeCategory === cat.id 
                ? 'bg-[var(--accent-forge)] text-[var(--bg-espresso)] border-[var(--accent-forge)] shadow-[0_0_10px_rgba(255,107,26,0.3)]' 
                : 'bg-[var(--bg-walnut)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)]'}
            `}
          >
            {cat.label}
          </button>
        ))}
        
        {/* Spacer */}
        <div className="flex-1" />

        {/* Chain Filter (Mock) */}
        <button className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-[var(--bg-walnut)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:border-[var(--text-primary)]">
          <span>All Chains</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>
    </div>
  )
}
