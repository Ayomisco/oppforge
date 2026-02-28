'use client'

import React, { useState, useEffect } from 'react'
import useSWR from 'swr'
import api from '@/lib/api'
import OpportunityCard from '@/components/dashboard/OpportunityCard'
import FilterBar from '@/components/dashboard/FilterBar'
import { SlidersHorizontal, AlertTriangle, RefreshCw, Search, Wifi } from 'lucide-react'

const fetcher = url => api.get(url).then(res => res.data)

// Skeleton card while loading
const SkeletonCard = () => (
  <div className="glass-card p-4 animate-pulse space-y-3">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-white/5 rounded" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-white/5 rounded w-3/4" />
        <div className="h-2 bg-white/5 rounded w-1/2" />
      </div>
      <div className="h-5 w-16 bg-white/5 rounded-full" />
    </div>
    <div className="h-2 bg-white/5 rounded w-full" />
    <div className="h-2 bg-white/5 rounded w-5/6" />
    <div className="flex gap-2">
      <div className="h-5 w-12 bg-white/5 rounded" />
      <div className="h-5 w-16 bg-white/5 rounded" />
    </div>
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
    {
      dedupingInterval: 30000,
      revalidateOnFocus: false,
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 3000,
    }
  )

  const isActuallyLoading = isLoading || (!opportunities && !error)

  return (
    <div className="space-y-6">
      {/* Feed Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Live Feed</h1>
          <p className="text-xs text-gray-500 font-mono">
            REAL_TIME_MONITORING // ACTIVE_SIGNALS:{' '}
            <span className="text-[#ff5500] font-bold">{opportunities ? opportunities.length : 0}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input 
              type="text" 
              placeholder="Filter stream... (e.g. 'Solana Grant')" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#1a1512] border border-[#2a1a12] rounded-lg px-3 py-1.5 pl-9 text-xs font-mono text-white focus:outline-none focus:border-[#ff5500] min-w-[200px] transition-all"
            />
          </div>
          <button className="btn btn-secondary px-3 py-1.5 border border-[#2a1a12] hover:bg-[#2a1a12] rounded-lg flex items-center gap-2 text-xs text-gray-400">
            <SlidersHorizontal size={14} /> View
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar activeCategory={category} onCategoryChange={setCategory} />

      {/* Signal Stream Label */}
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase text-gray-500">Signal Stream</span>
          {!isActuallyLoading && !error && (
            <span className="flex items-center gap-1">
              <Wifi size={9} className="text-[#10b981]" />
              <span className="text-[9px] font-mono text-[#10b981]">LIVE</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isActuallyLoading && (
            <span className="text-[10px] font-mono text-gray-600 animate-pulse">SYNCING...</span>
          )}
          <button 
            onClick={() => mutate()} 
            className="p-1 text-gray-700 hover:text-[#ff5500] transition-colors"
            title="Refresh"
          >
            <RefreshCw size={11} />
          </button>
        </div>
      </div>

      {/* Loading Skeletons */}
      {isActuallyLoading && (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Error State */}
      {!isActuallyLoading && error && (
        <div className="glass-card p-10 text-center border border-red-500/10 bg-red-500/5">
          <AlertTriangle size={32} className="text-red-500/60 mx-auto mb-4" />
          <p className="text-red-400 font-mono text-sm uppercase tracking-widest">Connection Failed</p>
          <p className="text-gray-600 text-xs mt-2 mb-6 font-mono">
            Could not reach the signal API. {error?.message || ''}
          </p>
          <button 
            onClick={() => mutate()}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-[#ff5500]/10 border border-[#ff5500]/30 text-[#ff5500] text-xs font-mono rounded hover:bg-[#ff5500]/20 transition-all"
          >
            <RefreshCw size={12} /> Retry Connection
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isActuallyLoading && !error && opportunities?.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <p className="text-gray-600 font-mono text-sm uppercase tracking-widest">No signals detected</p>
          <p className="text-gray-700 text-xs">Try a different category or clear your search filter.</p>
          <button onClick={() => { setCategory('all'); setSearch('') }} className="text-[#ff5500] text-xs hover:underline">Reset Filters</button>
        </div>
      )}

      {/* Opportunities */}
      {!isActuallyLoading && !error && opportunities?.length > 0 && (
        <div className="space-y-2">
          {opportunities.map((opp, idx) => (
            <OpportunityCard key={opp.id} opp={opp} index={idx} onRefresh={mutate} />
          ))}
        </div>
      )}

      {/* Load More */}
      {!isActuallyLoading && !error && opportunities?.length > 0 && (
        <div className="text-center py-8">
          <button 
            onClick={() => mutate()}
            className="text-xs font-mono text-[#ff5500]/50 hover:text-[#ff5500] transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={11} /> REFRESH_SIGNALS
          </button>
        </div>
      )}
    </div>
  )
}

