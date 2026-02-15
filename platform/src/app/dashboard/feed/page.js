'use client'

import React, { useState, useEffect } from 'react'
import useSWR from 'swr'
import api from '@/lib/api'
import OpportunityCard from '@/components/dashboard/OpportunityCard'
import FilterBar from '@/components/dashboard/FilterBar'
import { Rocket, Filter, SlidersHorizontal, Loader2 } from 'lucide-react'

const fetcher = url => api.get(url).then(res => res.data)

export default function FeedPage() {
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(timer)
  }, [search])

  // Construct API Query
  const getQuery = () => {
    const params = []
    if (debouncedSearch) return `/opportunities/search?q=${encodeURIComponent(debouncedSearch)}`
    
    // Standard Feed
    let endpoint = '/opportunities'
    if (category !== 'all') params.push(`category=${category}`)
    
    return params.length > 0 ? `${endpoint}?${params.join('&')}` : endpoint
  }

  const { data: opportunities, error, isLoading } = useSWR(getQuery(), fetcher)

  return (
    <div className="space-y-6">
      {/* Feed Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Live Feed</h1>
          <p className="text-xs text-gray-500 font-mono">
             REAL_TIME_MONITORING // ACTIVE_SIGNALS: <span className="text-[#ff5500] font-bold">{opportunities ? opportunities.length : 0}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative">
             <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
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

      {/* List */}
      <div className="space-y-2">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800/50">
              <span className="text-[10px] font-mono uppercase text-slate-500">Signal Stream</span>
              <span className="text-[10px] font-mono text-slate-600">
                  {isLoading ? 'Syncing...' : 'Live'}
              </span>
        </div>
        
        {isLoading && (
            <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-blue-500" size={24} />
            </div>
        )}
        
        {!isLoading && opportunities?.length === 0 && (
            <div className="text-center py-10 text-slate-500">
                No signals detected matching parameters.
            </div>
        )}

        {opportunities?.map((opp, idx) => (
          <OpportunityCard key={opp.id} opp={opp} index={idx} />
        ))}
      </div>
      
      {/* End of Feed */}
      <div className="text-center py-8">
        <button className="text-xs font-mono text-blue-400 hover:text-white transition-colors animate-pulse">
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
