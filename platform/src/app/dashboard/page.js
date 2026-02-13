'use client'

import React, { useState } from 'react'
import { Rocket, Clock, Award, TrendingUp, Zap, ChevronRight } from 'lucide-react'
import OpportunityCard from '@/components/dashboard/OpportunityCard'
import FilterBar from '@/components/dashboard/FilterBar'
import TestnetTracker from '@/components/dashboard/TestnetTracker'

// --- Mock Data ---
const MOCK_OPPS = [
  {
    id: '1',
    title: 'Solana Foundation Renaissance Hackathon',
    type: 'Hackathon',
    chain: 'Solana',
    reward: '$1,000,000+',
    score: 98,
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    source: 'Twitter',
    summary: 'Build the next generation of dApps on Solana. Special tracks for DePIN, DeFi, and Consumer Apps.'
  },
  {
    id: '2',
    title: 'Arbitrum Stylus Grant Program',
    type: 'Grant',
    chain: 'Arbitrum',
    reward: '$50,000 max',
    score: 92,
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'Gitcoin',
    summary: 'Grants for developers building with Rust, C, or C++ on Stylus.'
  },
  {
    id: '3',
    title: 'Superteam Earn: DePIN Dashboard',
    type: 'Bounty',
    chain: 'Solana',
    reward: '$3,500',
    score: 88,
    deadline: new Date(Date.now() + 40 * 60 * 60 * 1000).toISOString(),
    source: 'Superteam',
    summary: 'Design and build a comprehensive analytics dashboard for a new DePIN protocol.'
  },
  {
    id: '4',
    title: 'Optimism RetroPGF Round 4',
    type: 'Grant',
    chain: 'Optimism',
    reward: 'Varies',
    score: 85,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'Mirror',
    summary: 'Retroactive public goods funding for contributions to the Optimism ecosystem.'
  },
  {
    id: '5',
    title: 'Scroll Mainnet Airdrop Strategy',
    type: 'Airdrop',
    chain: 'Scroll',
    reward: 'Alpha',
    score: 95,
    deadline: null,
    source: 'Alpha Feed',
    summary: 'Potential airdrop criteria detected based on recent mainnet activity.'
  },
  {
    id: '6',
    title: 'Base Onchain Summer II',
    type: 'Hackathon',
    chain: 'Base',
    reward: '$500,000',
    score: 78,
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'Warpcast',
    summary: 'Join the second Onchain Summer hackathon. Build on Base and get funded.'
  }
]

// Compact Stats
const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="glass-card p-3 flex items-center justify-between border-l-2 border-l-[var(--glass-border)] hover:border-l-[var(--accent-forge)]">
    <div>
      <div className="text-[10px] text-gray-500 font-mono uppercase mb-0.5">{label}</div>
      <div className="text-xl font-bold text-white tracking-tight">{value}</div>
    </div>
    <Icon size={18} className={`${color} opacity-80`} />
  </div>
)

export default function DashboardPage() {
  const [category, setCategory] = useState('all')

  const filteredOpps = category === 'all' 
    ? MOCK_OPPS 
    : MOCK_OPPS.filter(o => o.type.toLowerCase().includes(category))

  return (
    <div>
      {/* Header Section */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Mission Control</h1>
          <p className="text-xs text-gray-500 font-mono">
             SYSTEM_STATUS: <span className="text-green-500">ONLINE</span> // TARGETS_IDENTIFIED: <span className="text-[var(--accent-forge)]">{filteredOpps.length}</span>
          </p>
        </div>
        <button className="btn btn-secondary text-xs">
          Refresh Scan <Zap size={12} />
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Feed (Dominant) */}
        <div className="xl:col-span-9 space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Active Grants" value="48" icon={Rocket} color="text-orange-500" />
            <StatCard label="Closing Soon" value="12" icon={Clock} color="text-red-500" />
            <StatCard label="Win Probability" value="76%" icon={TrendingUp} color="text-green-500" />
            <StatCard label="Total Pool" value="$4.2M" icon={Award} color="text-yellow-500" />
          </div>

          <FilterBar activeCategory={category} onCategoryChange={setCategory} />

          {/* Opportunity List (Dense) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--glass-border)]">
              <span className="text-[10px] font-mono uppercase text-gray-500">Priority Stream</span>
              <span className="text-[10px] font-mono text-gray-600">Sort: Relevance</span>
            </div>
            {filteredOpps.map((opp, idx) => (
              <OpportunityCard key={opp.id} opp={opp} index={idx} />
            ))}
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div className="hidden xl:block xl:col-span-3 space-y-4 sticky top-6">
          <TestnetTracker />
          
          {/* Forge AI Teaser - Compact */}
          <div className="glass-card p-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 bg-[var(--accent-forge)]/10 blur-xl rounded-full pointer-events-none" />
            <div className="flex items-center gap-2 mb-2 text-[var(--accent-forge)] font-bold text-xs uppercase tracking-wider">
              <Zap size={12} /> AI Insight
            </div>
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
              Your profile matches <span className="text-white font-bold">92%</span> with the Arbitrum Stylus grant.
            </p>
            <button className="w-full btn btn-primary py-1.5 text-[10px]">
              Generate Proposal
            </button>
          </div>

          {/* Trending - Compact */}
          <div className="glass-card p-4">
             <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                <span className="text-[10px] font-mono uppercase text-gray-500">Signal Source</span>
                <Clock size={10} className="text-gray-600" />
             </div>
             <div className="space-y-2 text-xs">
               <div className="flex justify-between items-center hover:bg-white/5 p-1 rounded cursor-pointer">
                 <span className="text-gray-300">Twitter/X</span>
                 <span className="text-[var(--accent-forge)] font-mono">14+</span>
               </div>
               <div className="flex justify-between items-center hover:bg-white/5 p-1 rounded cursor-pointer">
                 <span className="text-gray-300">Gitcoin</span>
                 <span className="text-gray-500 font-mono">5</span>
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}
