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

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg p-4 flex items-center justify-between group hover:border-[var(--accent-primary)]/20 transition-colors">
    <div>
      <div className="text-xs text-[var(--text-tertiary)] font-medium mb-1">{label}</div>
      <div className="text-xl font-bold text-[var(--text-primary)] tracking-tight">{value}</div>
    </div>
    <div className="p-2.5 rounded-md bg-[var(--bg-tertiary)] group-hover:bg-[var(--accent-primary-muted)] transition-colors">
      <Icon size={18} className={`${color} opacity-80`} />
    </div>
  </div>
)

export default function DashboardPage() {
  const [category, setCategory] = useState('all')
  const { data: stats, error: statsError } = useSWR('/stats/dashboard', fetcher)
  const { data: opportunities, error: oppsError, mutate } = useSWR('/opportunities/priority', fetcher)

  const loading = !stats && !statsError && !opportunities && !oppsError

  const filteredOpps = (opportunities || []).filter(opp => {
    if (category === 'all') return true
    return (opp.category || opp.type || '').toLowerCase().includes(category.toLowerCase())
  })

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)] flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--status-success)] animate-pulse" />
              Live
            </span>
            <span className="text-[var(--text-tertiary)]">·</span>
            <span><span className="text-[var(--accent-primary)] font-semibold">{stats?.targets_identified || 0}</span> opportunities found</span>
          </p>
        </div>
        <button className="btn btn-secondary text-sm self-start sm:self-auto" onClick={() => window.location.reload()}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

        {/* Left: Feed */}
        <div className="xl:col-span-9 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {loading ? (
              <><StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton /></>
            ) : (
              <>
                <StatCard label="Active" value={stats?.active_grants || 0} icon={Rocket} color="text-[var(--accent-primary)]" />
                <StatCard label="Closing Soon" value={stats?.closing_soon || 0} icon={Clock} color="text-[var(--status-danger)]" />
                <StatCard label="Win Rate" value={stats?.win_probability || '0%'} icon={TrendingUp} color="text-[var(--status-success)]" />
                <StatCard label="Total Pool" value={stats?.total_pool || '$0'} icon={Award} color="text-[var(--accent-secondary)]" />
              </>
            )}
          </div>

          <FilterBar activeCategory={category} onCategoryChange={setCategory} />

          {/* Opportunity List */}
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--border-default)]">
              <span className="text-sm font-medium text-[var(--text-secondary)]">Top Opportunities</span>
              <span className="text-xs text-[var(--text-tertiary)]">Sorted by relevance</span>
            </div>

            {loading ? (
              <div className="space-y-3">
                <OpportunitySkeleton /><OpportunitySkeleton /><OpportunitySkeleton /><OpportunitySkeleton />
              </div>
            ) : oppsError ? (
              <div className="text-center py-16 border border-[var(--status-danger)]/10 rounded-lg bg-[var(--status-danger)]/5">
                <p className="text-[var(--status-danger)] text-sm font-medium">Failed to load opportunities</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-2">Check your connection and try refreshing.</p>
              </div>
            ) : filteredOpps.length === 0 ? (
              <div className="text-center py-10 text-[var(--text-tertiary)] text-sm">No opportunities found in this category.</div>
            ) : (
              filteredOpps.map((opp, idx) => (
                <OpportunityCard key={opp.id} opp={opp} index={idx} onRefresh={mutate} />
              ))
            )}
          </div>
        </div>

        {/* Right: Widgets */}
        <div className="hidden xl:block xl:col-span-3 space-y-4 sticky top-6">
          <TestnetTracker />

          <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg p-4">
            <div className="flex items-center justify-between mb-3 border-b border-[var(--border-default)] pb-2">
              <span className="text-xs font-medium text-[var(--text-secondary)]">Sources</span>
              <Clock size={12} className="text-[var(--text-tertiary)]" />
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between items-center hover:bg-[var(--bg-tertiary)] p-2 rounded-md cursor-pointer transition-colors">
                <span className="text-[var(--text-secondary)]">Twitter/X</span>
                <span className="text-[var(--status-success)] text-xs font-medium">Live</span>
              </div>
              <div className="flex justify-between items-center hover:bg-[var(--bg-tertiary)] p-2 rounded-md cursor-pointer transition-colors">
                <span className="text-[var(--text-secondary)]">Gitcoin</span>
                <span className="text-[var(--text-tertiary)] text-xs">Syncing...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
