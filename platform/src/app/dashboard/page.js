'use client'

import React, { useState } from 'react'
import { Rocket, Clock, Award, TrendingUp, SlidersHorizontal, X, Calendar, DollarSign } from 'lucide-react'
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
  const [showFilters, setShowFilters] = useState(false)
  const [deadline, setDeadline] = useState('all')
  const [reward, setReward] = useState('all')
  const { data: stats, error: statsError } = useSWR('/stats/dashboard', fetcher)
  const { data: opportunities, error: oppsError, mutate } = useSWR('/opportunities/priority', fetcher)

  const loading = !stats && !statsError && !opportunities && !oppsError

  const filteredOpps = (opportunities || []).filter(opp => {
    // Category filter
    if (category !== 'all') {
      if (!(opp.category || opp.type || '').toLowerCase().includes(category.toLowerCase())) {
        return false
      }
    }

    // Deadline filter
    if (deadline !== 'all' && opp.deadline) {
      const deadlineDate = new Date(opp.deadline)
      const now = new Date()
      const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24))
      
      if (deadline === 'soon' && diffDays > 7) return false
      if (deadline === 'week' && (diffDays > 7 || diffDays < 0)) return false
      if (deadline === 'month' && (diffDays > 30 || diffDays < 0)) return false
      if (deadline === 'none' && opp.deadline) return false
    }

    // Reward filter
    if (reward !== 'all' && opp.reward_pool) {
      const rewardStr = opp.reward_pool.toLowerCase()
      const hasK = rewardStr.includes('k')
      const hasM = rewardStr.includes('m')
      const nums = rewardStr.match(/\d+/g)
      const amount = nums ? parseFloat(nums[0]) : 0

      const estimatedValue = hasM ? amount * 1000000 : hasK ? amount * 1000 : amount

      if (reward === 'low' && estimatedValue > 5000) return false
      if (reward === 'medium' && (estimatedValue < 5000 || estimatedValue > 50000)) return false
      if (reward === 'high' && (estimatedValue < 50000 || estimatedValue > 500000)) return false
      if (reward === 'veryhigh' && estimatedValue < 500000) return false
    }

    return true
  })

  const activeFiltersCount = (deadline !== 'all' ? 1 : 0) + (reward !== 'all' ? 1 : 0)

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
            <span><span className="text-[var(--accent-primary)] font-semibold">{opportunities?.length || 0}</span> opportunities available</span>
          </p>
        </div>
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
              <div className="relative">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`btn btn-secondary px-2.5 py-1.5 flex items-center gap-2 text-xs relative ${activeFiltersCount > 0 ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]' : ''}`}
                >
                  <SlidersHorizontal size={14} /> 
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--accent-primary)] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
                
                {/* Filter Dropdown */}
                {showFilters && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg shadow-2xl z-50 p-4 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--border-default)]">
                      <h3 className="text-xs font-bold text-[var(--text-primary)]">Filters</h3>
                      <button onClick={() => setShowFilters(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                        <X size={14} />
                      </button>
                    </div>

                    {/* Deadline Filter */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium text-[var(--text-secondary)] flex items-center gap-2">
                        <Calendar size={12} /> Deadline
                      </label>
                      <select
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                      >
                        <option value="all">All Deadlines</option>
                        <option value="soon">Closing Soon (7 days)</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="none">No Deadline</option>
                      </select>
                    </div>

                    {/* Reward Filter */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium text-[var(--text-secondary)] flex items-center gap-2">
                        <DollarSign size={12} /> Reward Amount
                      </label>
                      <select
                        value={reward}
                        onChange={(e) => setReward(e.target.value)}
                        className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                      >
                        <option value="all">All Rewards</option>
                        <option value="low">Low ($0 - $5K)</option>
                        <option value="medium">Medium ($5K - $50K)</option>
                        <option value="high">High ($50K - $500K)</option>
                        <option value="veryhigh">Very High ($500K+)</option>
                      </select>
                    </div>

                    {/* Reset Filters */}
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={() => { setDeadline('all'); setReward('all'); }}
                        className="w-full text-[10px] text-[var(--accent-primary)] hover:underline font-medium"
                      >
                        Clear All Filters
                      </button>
                    )}
                  </div>
                )}
              </div>
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
