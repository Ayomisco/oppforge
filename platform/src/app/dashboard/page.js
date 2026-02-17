'use client'

import React, { useState } from 'react'
import { Rocket, Clock, Award, TrendingUp, Zap } from 'lucide-react'
import useSWR from 'swr'
import api from '@/lib/api'
import OpportunityCard from '@/components/dashboard/OpportunityCard'
import FilterBar from '@/components/dashboard/FilterBar'
import TestnetTracker from '@/components/dashboard/TestnetTracker'
import { OpportunitySkeleton, StatSkeleton } from '@/components/ui/Skeleton'

const fetcher = url => api.get(url).then(res => res.data)

// Compact Stats
const StatCard = ({ label, value, icon: Icon, color, glowClass }) => (
  <div className="glass-card p-4 flex items-center justify-between border-l-2 border-l-transparent hover:border-l-[#ff5500] transition-all group overflow-hidden relative">
    <div className="relative z-10">
      <div className="text-[9px] text-gray-500 font-mono uppercase mb-1 tracking-tighter">{label}</div>
      <div className={`text-xl font-bold text-white tracking-tight ${glowClass}`}>{value}</div>
    </div>
    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-[#ff5500]/10 transition-colors">
      <Icon size={18} className={`${color} opacity-80 group-hover:opacity-100 transition-opacity`} />
    </div>
  </div>
)

export default function DashboardPage() {
  const [category, setCategory] = useState('all')

  // 1. Fetch Stats
  const { data: stats, error: statsError } = useSWR('/stats/dashboard', fetcher)
  
  // 2. Fetch Opportunities (Priority Stream - Personalized)
  const { data: opportunities, error: oppsError, mutate } = useSWR('/opportunities/priority', fetcher)

  const loading = !stats && !statsError && !opportunities && !oppsError
  const hasError = statsError || oppsError

  // If there's an error, we shouldn't stay in loading state
  // If stats load but opps fail, we show the stats and an empty list/error

  // Filter Logic (Client-side for now, or could be API param)
  const filteredOpps = (opportunities || []).filter(opp => {
      if (category === 'all') return true
      return (opp.category || opp.type || '').toLowerCase().includes(category.toLowerCase())
  })

  return (
    <div>
      {/* Header Section */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Mission Control</h1>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-widest flex items-center gap-3">
             <span className="flex items-center gap-1.5 font-bold">
               <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
               SYSTEM_STATUS: <span className="text-[#10b981]">ONLINE</span>
             </span>
             <span className="text-gray-700">//</span>
             <span>TARGETS_IDENTIFIED: <span className="text-[#ff5500]">{stats?.targets_identified || 127}</span></span>
             <span className="text-gray-700">//</span>
             <span className="flex items-center gap-1.5 text-[var(--accent-forge)] bg-[#ff5500]/5 px-2 py-0.5 rounded border border-[#ff5500]/10">
               <span className="w-1 h-1 rounded-full bg-[#ff5500] animate-ping" />
               LIVE_FEED: ACTIVE
             </span>
          </p>
        </div>
        <button className="btn btn-secondary text-xs" onClick={() => window.location.reload()}>
          Refresh Scan <Zap size={12} />
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Feed (Dominant) */}
        <div className="xl:col-span-9 space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {loading ? (
              <>
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
              </>
            ) : (
              <>
                <StatCard label="Active Targets" value={stats?.active_grants || 0} icon={Rocket} color="text-[#ff5500]" glowClass="glow-ember" />
                <StatCard label="Closing Soon" value={stats?.closing_soon || 0} icon={Clock} color="text-red-400" glowClass="" />
                <StatCard label="Win Probability" value={stats?.win_probability || '0%'} icon={TrendingUp} color="text-[#10b981]" glowClass="text-[#10b981]" />
                <StatCard label="Total Pool" value={stats?.total_pool || '$0'} icon={Award} color="text-[#ffaa00]" glowClass="glow-gold" />
              </>
            )}
          </div>

          <FilterBar activeCategory={category} onCategoryChange={setCategory} />

          {/* Opportunity List (Dense) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--glass-border)]">
              <span className="text-[10px] font-mono uppercase text-gray-500">Priority Stream</span>
              <span className="text-[10px] font-mono text-gray-600">Sort: Relevance (AI Score)</span>
            </div>
            
            {loading ? (
              <div className="space-y-2">
                <OpportunitySkeleton />
                <OpportunitySkeleton />
                <OpportunitySkeleton />
                <OpportunitySkeleton />
              </div>
            ) : oppsError ? (
              <div className="text-center py-20 border border-red-500/10 rounded bg-red-500/5">
                <p className="text-red-500 text-xs font-mono uppercase tracking-[0.2em]">Data_Fetch_Failure // Priority_Stream_Offline</p>
                <p className="text-[10px] text-gray-600 font-mono mt-2">Check backend link or refresh protocol</p>
              </div>
            ) : filteredOpps.length === 0 ? (
               <div className="text-center py-10 text-gray-500 text-sm">No opportunities found in this category.</div>
            ) : (
               filteredOpps.map((opp, idx) => (
                  <OpportunityCard key={opp.id} opp={opp} index={idx} onRefresh={mutate} />
               ))
            )}
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
              {loading ? (
                <div className="space-y-2">
                  <div className="h-4 w-full bg-white/5 animate-pulse rounded" />
                  <div className="h-8 w-full bg-white/5 animate-pulse rounded mt-3" />
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                    Your profile matches <span className="text-white font-bold">{opportunities?.[0]?.ai_score || 92}%</span> with the top opportunity.
                  </p>
                  <button className="w-full btn btn-primary py-1.5 text-[10px]">
                    Generate Proposal
                  </button>
                </>
              )}
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
                   <span className="text-[var(--accent-forge)] font-mono">Live</span>
                 </div>
                 <div className="flex justify-between items-center hover:bg-white/5 p-1 rounded cursor-pointer">
                   <span className="text-gray-300">Gitcoin</span>
                   <span className="text-gray-500 font-mono">Syncing...</span>
                 </div>
               </div>
            </div>
          </div>

        </div>
      </div>
  )
}
