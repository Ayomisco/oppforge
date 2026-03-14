'use client'

import React, { useState, useEffect } from 'react'
import useSWR from 'swr'
import api from '@/lib/api'
import OpportunityCard from '@/components/dashboard/OpportunityCard'
import FilterBar from '@/components/dashboard/FilterBar'
import { SlidersHorizontal, AlertTriangle, RefreshCw, Search, Wifi } from 'lucide-react'

const fetcher = url => api.get(url).then(res => res.data)

const SkeletonCard = () => (
  <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg p-4 animate-pulse space-y-3">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-[var(--bg-tertiary)] rounded" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-[var(--bg-tertiary)] rounded w-3/4" />
        <div className="h-2 bg-[var(--bg-tertiary)] rounded w-1/2" />
      </div>
      <div className="h-5 w-16 bg-[var(--bg-tertiary)] rounded-full" />
    </div>
    <div className="h-2 bg-[var(--bg-tertiary)] rounded w-full" />
    <div className="h-2 bg-[var(--bg-tertiary)] rounded w-5/6" />
  </div>
)

export default function FeedPage() {
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(timer)
  }, [search])

  const getQuery = () => {
    if (debouncedSearch) return `/opportunities/search?q=${encodeURIComponent(debouncedSearch)}`
    let endpoint = '/opportunities'
    const params = []
    if (category !== 'all') params.push(`category=${category}`)
    return params.length > 0 ? `${endpoint}?${params.join('&')}` : endpoint
  }

  const { data: opportunities, error, isLoading, mutate } = useSWR(
    getQuery(),
    fetcher,
    { dedupingInterval: 30000, revalidateOnFocus: false, shouldRetryOnError: true, errorRetryCount: 3, errorRetryInterval: 3000 }
  )

  const isActuallyLoading = isLoading || (!opportunities && !error)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Live Feed</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {opportunities ? opportunities.length : 0} opportunities available
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={16} />
            <input
              type="text"
              placeholder="Search e.g. 'Solana Grant'"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg px-3 py-2 pl-10 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-all placeholder-[var(--text-placeholder)]"
            />
          </div>
          <button className="btn btn-secondary px-3 py-2 flex items-center gap-2 text-sm">
            <SlidersHorizontal size={16} /> Filter
          </button>
        </div>
      </div>

      <FilterBar activeCategory={category} onCategoryChange={setCategory} />

      {/* Status */}
      <div className="flex justify-between items-center pb-3 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--text-secondary)]">Opportunities</span>
          {!isActuallyLoading && !error && (
            <span className="flex items-center gap-1.5">
              <Wifi size={12} className="text-[var(--status-success)]" />
              <span className="text-xs text-[var(--status-success)]">Live</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isActuallyLoading && <span className="text-xs text-[var(--text-tertiary)] animate-pulse">Loading...</span>}
          <button onClick={() => mutate()} className="p-2 text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors rounded-md hover:bg-[var(--bg-tertiary)]" title="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Loading */}
      {isActuallyLoading && (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Error */}
      {!isActuallyLoading && error && (
        <div className="bg-[var(--bg-secondary)] border border-[var(--status-danger)]/20 rounded-lg p-10 text-center">
          <AlertTriangle size={28} className="text-[var(--status-danger)]/60 mx-auto mb-4" />
          <p className="text-[var(--status-danger)] text-base font-semibold">Connection Failed</p>
          <p className="text-[var(--text-tertiary)] text-sm mt-2 mb-6">{error?.message || 'Could not load opportunities.'}</p>
          <button onClick={() => mutate()} className="btn btn-secondary text-sm"><RefreshCw size={14} /> Retry</button>
        </div>
      )}

      {/* Empty */}
      {!isActuallyLoading && !error && opportunities?.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <p className="text-[var(--text-secondary)] text-base font-medium">No opportunities found</p>
          <p className="text-[var(--text-tertiary)] text-sm">Try a different category or clear your search.</p>
          <button onClick={() => { setCategory('all'); setSearch('') }} className="text-[var(--accent-primary)] text-sm hover:underline font-medium">Reset Filters</button>
        </div>
      )}

      {/* Opportunities */}
      {!isActuallyLoading && !error && opportunities?.length > 0 && (
        <div className="space-y-3">
          {opportunities.map((opp, idx) => (
            <OpportunityCard key={opp.id} opp={opp} index={idx} onRefresh={mutate} />
          ))}
        </div>
      )}

      {/* Refresh Footer */}
      {!isActuallyLoading && !error && opportunities?.length > 0 && (
        <div className="text-center py-8">
          <button onClick={() => mutate()} className="text-sm text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors flex items-center gap-2 mx-auto font-medium">
            <RefreshCw size={14} /> Refresh Feed
          </button>
        </div>
      )}
    </div>
  )
}
