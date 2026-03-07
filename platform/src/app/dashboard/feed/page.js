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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Live Feed</h1>
          <p className="text-sm text-gray-500">
            {opportunities ? opportunities.length : 0} opportunities available
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search e.g. 'Solana Grant'" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 bg-[#1a1512] border border-[#2a1a12] rounded-lg px-3 py-2.5 pl-10 text-sm text-white focus:outline-none focus:border-[#ff5500] transition-all placeholder-gray-600"
            />
          </div>
          <button className="btn btn-secondary px-4 py-2.5 border border-[#2a1a12] hover:bg-[#2a1a12] rounded-lg flex items-center gap-2 text-sm text-gray-400">
            <SlidersHorizontal size={16} /> Filter
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar activeCategory={category} onCategoryChange={setCategory} />

      {/* Feed Status */}
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-400">Opportunities</span>
          {!isActuallyLoading && !error && (
            <span className="flex items-center gap-1.5">
              <Wifi size={12} className="text-[#10b981]" />
              <span className="text-xs text-[#10b981]">Live</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isActuallyLoading && (
            <span className="text-xs text-gray-500 animate-pulse">Loading...</span>
          )}
          <button 
            onClick={() => mutate()} 
            className="p-2 text-gray-600 hover:text-[#ff5500] transition-colors rounded-lg hover:bg-white/5"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Loading Skeletons */}
      {isActuallyLoading && (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Error State */}
      {!isActuallyLoading && error && (
        <div className="glass-card p-10 text-center border border-red-500/10 bg-red-500/5">
          <AlertTriangle size={32} className="text-red-500/60 mx-auto mb-4" />
          <p className="text-red-400 text-base font-semibold">Connection Failed</p>
          <p className="text-gray-500 text-sm mt-2 mb-6">
            Could not load opportunities. {error?.message || ''}
          </p>
          <button 
            onClick={() => mutate()}
            className="btn btn-secondary text-sm"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isActuallyLoading && !error && opportunities?.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <p className="text-gray-400 text-base font-medium">No opportunities found</p>
          <p className="text-gray-600 text-sm">Try a different category or clear your search.</p>
          <button onClick={() => { setCategory('all'); setSearch('') }} className="text-[#ff5500] text-sm hover:underline font-medium">Reset Filters</button>
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

      {/* Load More */}
      {!isActuallyLoading && !error && opportunities?.length > 0 && (
        <div className="text-center py-8">
          <button 
            onClick={() => mutate()}
            className="text-sm text-gray-500 hover:text-[#ff5500] transition-colors flex items-center gap-2 mx-auto font-medium"
          >
            <RefreshCw size={14} /> Refresh Feed
          </button>
        </div>
      )}
    </div>
  )
}

