'use client'

import React, { useState } from 'react'
import OpportunityCard from '@/components/dashboard/OpportunityCard'
import FilterBar from '@/components/dashboard/FilterBar'
import { Rocket, Filter, SlidersHorizontal } from 'lucide-react'

// Reuse mock data for now (will lift to context later)
const MOCK_OPPS = [
  {
    id: '1', title: 'Solana Foundation Renaissance Hackathon', type: 'Hackathon', chain: 'Solana', reward: '$1,000,000+', score: 98, deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), source: 'Twitter', summary: 'Build the next generation of dApps on Solana. Special tracks for DePIN, DeFi, and Consumer Apps.'
  },
  {
    id: '2', title: 'Arbitrum Stylus Grant Program', type: 'Grant', chain: 'Arbitrum', reward: '$50,000 max', score: 92, deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), source: 'Gitcoin', summary: 'Grants for developers building with Rust, C, or C++ on Stylus.'
  },
  {
    id: '3', title: 'Superteam Earn: DePIN Dashboard', type: 'Bounty', chain: 'Solana', reward: '$3,500', score: 88, deadline: new Date(Date.now() + 40 * 60 * 60 * 1000).toISOString(), source: 'Superteam', summary: 'Design and build a comprehensive analytics dashboard for a new DePIN protocol.'
  },
  {
    id: '4', title: 'Optimism RetroPGF Round 4', type: 'Grant', chain: 'Optimism', reward: 'Varies', score: 85, deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), source: 'Mirror', summary: 'Retroactive public goods funding for contributions to the Optimism ecosystem.'
  },
  {
    id: '5', title: 'Scroll Mainnet Airdrop Strategy', type: 'Airdrop', chain: 'Scroll', reward: 'Alpha', score: 95, deadline: null, source: 'Alpha Feed', summary: 'Potential airdrop criteria detected based on recent mainnet activity.'
  },
  {
    id: '6', title: 'Base Onchain Summer II', type: 'Hackathon', chain: 'Base', reward: '$500,000', score: 78, deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), source: 'Warpcast', summary: 'Join the second Onchain Summer hackathon. Build on Base and get funded.'
  },
  {
    id: '7', title: 'ZkSync Native Paymaster Bounty', type: 'Bounty', chain: 'ZkSync', reward: '$2,000', score: 75, deadline: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), source: 'Bountycaster', summary: 'Implement a native paymaster for gasless transactions on ZkSync Era.'
  },
  {
    id: '8', title: 'Farcaster Frame Grant', type: 'Grant', chain: 'Base', reward: '$5,000', score: 91, deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), source: 'Farcaster', summary: 'Build an innovative Frame that drives user engagement.'
  }
]

export default function FeedPage() {
  const [category, setCategory] = useState('all')

  const filteredOpps = category === 'all' 
    ? MOCK_OPPS 
    : MOCK_OPPS.filter(o => o.type.toLowerCase().includes(category))

  return (
    <div className="space-y-6">
      {/* Feed Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Live Feed</h1>
          <p className="text-xs text-gray-500 font-mono">
             REAL_TIME_MONITORING // ACTIVE_SIGNALS: <span className="text-[var(--accent-forge)]">{filteredOpps.length}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative">
             <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
             <input 
               type="text" 
               placeholder="Filter stream..." 
               className="bg-[var(--bg-walnut)] border border-[var(--glass-border)] rounded px-3 py-1.5 pl-9 text-xs font-mono text-white focus:outline-none focus:border-[var(--accent-forge)]"
             />
           </div>
           <button className="btn btn-secondary px-3 py-1.5">
             <SlidersHorizontal size={14} /> View
           </button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar activeCategory={category} onCategoryChange={setCategory} />

      {/* Infinite List */}
      <div className="space-y-2">
        <div className="flex justify-between items-center pb-2 border-b border-[var(--glass-border)]">
              <span className="text-[10px] font-mono uppercase text-gray-500">Signal Stream</span>
              <span className="text-[10px] font-mono text-gray-600">Sync: 12ms ago</span>
        </div>
        {filteredOpps.map((opp, idx) => (
          <OpportunityCard key={opp.id} opp={opp} index={idx} />
        ))}
      </div>
      
      {/* End of Feed */}
      <div className="text-center py-8">
        <button className="text-xs font-mono text-[var(--accent-forge)] hover:text-white transition-colors animate-pulse">
           LOAD_MORE_SIGNALS...
        </button>
      </div>
    </div>
  )
}

const SearchIcon = ({ className, size }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
)
