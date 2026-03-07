'use client'

import React, { useState } from 'react'
import { Rocket, Clock, Award, TrendingUp, RefreshCw } from 'lucide-react'
import useSWR from 'swr'
import api from '@/lib/api'
import OpportunityCard from '@/components/dashboard/OpportunityCard'
import FilterBar from '@/components/dashboard/FilterBar'
import TestnetTracker from '@/components/dashboard/TestnetTracker'
import { OpportunitySkeleton, StatSkeleton } from '@/components/ui/Skeleton'

const fetcher = url => api.get(url).then(res => res.data)

// Compact Stats
const StatCard = ({ label, value, icon: Icon, color, glowClass }) => (
  <div className="glass-card p-4 sm:p-5 flex items-center justify-between border-l-2 border-l-transparent hover:border-l-[#ff5500] transition-all group overflow-hidden relative">
    <div className="relative z-10">
      <div className="text-xs text-gray-500 font-medium mb-1">{label}</div>
      <div className={`text-xl font-bold text-white tracking-tight ${glowClass}`}>{value}</div>
    </div>
    <div className="p-2.5 rounded-lg bg-white/5 group-hover:bg-[#ff5500]/10 transition-colors">
      <Icon size={20} className={`${color} opacity-80 group-hover:opacity-100 transition-opacity`} />
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 flex items-center gap-2">
             <span className="flex items-center gap-1.5">
               <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
               Live
             </span>
             <span className="text-gray-700">·</span>
             <span><span className="text-[#ff5500] font-semibold">{stats?.targets_identified || 0}</span> opportunities found</span>
          </p>
        </div>
        <button className="btn btn-secondary text-sm self-start sm:self-auto" onClick={() => window.location.reload()}>
          <RefreshCw size={14} /> Refresh
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
                <StatCard label="Active Opportunities" value={stats?.active_grants || 0} icon={Rocket} color="text-[#ff5500]" glowClass="glow-ember" />
                <StatCard label="Closing Soon" value={stats?.closing_soon || 0} icon={Clock} color="text-red-400" glowClass="" />
                <StatCard label="Win Rate" value={stats?.win_probability || '0%'} icon={TrendingUp} color="text-[#10b981]" glowClass="text-[#10b981]" />
                <StatCard label="Total Pool" value={stats?.total_pool || '$0'} icon={Award} color="text-[#ffaa00]" glowClass="glow-gold" />
              </>
            )}
          </div>

          <FilterBar activeCategory={category} onCategoryChange={setCategory} />

          {/* Opportunity List (Dense) */}
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--glass-border)]">
              <span className="text-sm font-medium text-gray-400">Top Opportunities</span>
              <span className="text-xs text-gray-600">Sorted by relevance</span>
            </div>
            
            {loading ? (
              <div className="space-y-3">
                <OpportunitySkeleton />
                <OpportunitySkeleton />
                <OpportunitySkeleton />
                <OpportunitySkeleton />
              </div>
            ) : oppsError ? (
              <div className="text-center py-20 border border-red-500/10 rounded-lg bg-red-500/5">
                <p className="text-red-400 text-sm font-medium">Failed to load opportunities</p>
                <p className="text-xs text-gray-500 mt-2">Check your connection and try refreshing.</p>
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

            {/* Sources — Compact */}
            <div className="glass-card p-4">
               <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                  <span className="text-xs font-medium text-gray-400">Sources</span>
                  <Clock size={12} className="text-gray-600" />
               </div>
               <div className="space-y-2 text-sm">
                 <div className="flex justify-between items-center hover:bg-white/5 p-2 rounded-lg cursor-pointer transition-colors">
                   <span className="text-gray-300">Twitter/X</span>
                   <span className="text-[#10b981] text-xs font-medium">Live</span>
                 </div>
                 <div className="flex justify-between items-center hover:bg-white/5 p-2 rounded-lg cursor-pointer transition-colors">
                   <span className="text-gray-300">Gitcoin</span>
                   <span className="text-gray-500 text-xs">Syncing...</span>
                 </div>
               </div>
            </div>
          </div>

        </div>
      </div>
  )
}
