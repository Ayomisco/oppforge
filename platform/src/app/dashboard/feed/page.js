'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import useSWR from 'swr'
import api from '@/lib/api'
import OpportunityCard from '@/components/dashboard/OpportunityCard'
import FilterBar from '@/components/dashboard/FilterBar'
import { SlidersHorizontal, AlertTriangle, RefreshCw, Search, Wifi, Loader2, X, Calendar, DollarSign, Globe } from 'lucide-react'

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
  const [chain, setChain] = useState('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [allOpportunities, setAllOpportunities] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [deadline, setDeadline] = useState('all')
  const [reward, setReward] = useState('all')
  const observerTarget = useRef(null)

  // Get total count from dashboard stats
  const { data: stats } = useSWR('/stats/dashboard', fetcher, { dedupingInterval: 60000, revalidateOnFocus: false })

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(timer)
  }, [search])

  // Reset when filters change
  useEffect(() => {
    setPage(1)
    setAllOpportunities([])
    setHasMore(true)
  }, [category, chain, debouncedSearch, deadline, reward])

  const getQuery = () => {
    if (debouncedSearch) return `/opportunities/search?q=${encodeURIComponent(debouncedSearch)}&page=${page}&limit=20`
    let endpoint = '/opportunities'
    const params = [`page=${page}`, 'limit=20']
    if (category !== 'all') params.push(`category=${category}`)
    if (chain !== 'all') params.push(`chain=${chain}`)
    return params.length > 0 ? `${endpoint}?${params.join('&')}` : endpoint
  }

  const { data: opportunities, error, isLoading, mutate } = useSWR(
    hasMore ? getQuery() : null,
    fetcher,
    { dedupingInterval: 30000, revalidateOnFocus: false, shouldRetryOnError: true, errorRetryCount: 3, errorRetryInterval: 3000 }
  )

  // Append new opportunities when data loads
  useEffect(() => {
    if (opportunities && opportunities.length > 0) {
      setAllOpportunities(prev => {
        // Remove duplicates by ID
        const existing = new Set(prev.map(o => o.id))
        const newOpps = opportunities.filter(o => !existing.has(o.id))
        return [...prev, ...newOpps]
      })
      // If less than 20 items returned, we've reached the end
      if (opportunities.length < 20) {
        setHasMore(false)
      }
      setLoadingMore(false)
    } else if (opportunities && opportunities.length === 0 && page === 1) {
      setAllOpportunities([])
      setHasMore(false)
      setLoadingMore(false)
    }
  }, [opportunities, page])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !loadingMore) {
          setLoadingMore(true)
          setPage(prev => prev + 1)
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasMore, isLoading, loadingMore])

  const handleRefresh = () => {
    setPage(1)
    setAllOpportunities([])
    setHasMore(true)
    mutate()
  }

  // Apply client-side filters
  const filteredOpportunities = allOpportunities.filter(opp => {
    // Chain filter
    if (chain !== 'all' && opp.chain) {
      const oppChain = opp.chain.toLowerCase().replace(/\s+/g, '').replace('bsc', 'binance').replace('smartchain', 'bsc')
      const filterChain = chain.toLowerCase()
      if (!oppChain.includes(filterChain) && oppChain !== filterChain) return false
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

    // Reward filter (rough categorization based on reward_pool)
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

  const activeFiltersCount = (deadline !== 'all' ? 1 : 0) + (reward !== 'all' ? 1 : 0) + (chain !== 'all' ? 1 : 0)
  const isActuallyLoading = isLoading && page === 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Live Feed</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {stats?.active_grants || filteredOpportunities.length} opportunities available
            {filteredOpportunities.length > 0 && filteredOpportunities.length < (stats?.active_grants || 0) && <span className="text-[var(--text-tertiary)]"> · showing {filteredOpportunities.length}</span>}
            {activeFiltersCount > 0 && <span className="text-[var(--text-tertiary)]"> · {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active</span>}
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
          <div className="relative">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`btn btn-secondary px-3 py-2 flex items-center gap-2 text-sm relative ${activeFiltersCount > 0 ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]' : ''}`}
            >
              <SlidersHorizontal size={16} /> Filter
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--accent-primary)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            
            {/* Filter Dropdown */}
            {showFilters && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg shadow-2xl z-50 p-4 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-default)]">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Advanced Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                    <X size={16} />
                  </button>
                </div>

                {/* Deadline Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-2">
                    <Calendar size={14} /> Deadline
                  </label>
                  <select
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
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
                  <label className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-2">
                    <DollarSign size={14} /> Reward Amount
                  </label>
                  <select
                    value={reward}
                    onChange={(e) => setReward(e.target.value)}
                    className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                  >
                    <option value="all">All Rewards</option>
                    <option value="low">Low ($0 - $5K)</option>
                    <option value="medium">Medium ($5K - $50K)</option>
                    <option value="high">High ($50K - $500K)</option>
                    <option value="veryhigh">Very High ($500K+)</option>
                  </select>
                </div>

                {/* Chain Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-2">
                    <Globe size={14} /> Blockchain
                  </label>
                  <select
                    value={chain}
                    onChange={(e) => setChain(e.target.value)}
                    className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                  >
                    <option value="all">All Chains</option>
                    <option value="ethereum">Ethereum</option>
                    <option value="arbitrum">Arbitrum</option>
                    <option value="optimism">Optimism</option>
                    <option value="base">Base</option>
                    <option value="polygon">Polygon</option>
                    <option value="solana">Solana</option>
                    <option value="near">NEAR</option>
                    <option value="avalanche">Avalanche</option>
                    <option value="fantom">Fantom</option>
                    <option value="bsc">BSC</option>
                    <option value="starknet">Starknet</option>
                    <option value="zksync">zkSync</option>
                    <option value="linea">Linea</option>
                    <option value="scroll">Scroll</option>
                    <option value="mantle">Mantle</option>
                    <option value="manta">Manta</option>
                    <option value="sei">Sei</option>
                    <option value="aptos">Aptos</option>
                    <option value="move">Move</option>
                    <option value="sui">Sui</option>
                    <option value="cosmos">Cosmos</option>
                    <option value="polkadot">Polkadot</option>
                    <option value="tezos">Tezos</option>
                    <option value="cardano">Cardano</option>
                    <option value="algorand">Algorand</option>
                    <option value="ton">TON</option>
                    <option value="bitcoin">Bitcoin L2</option>
                    <option value="flow">Flow</option>
                    <option value="hedera">Hedera</option>
                    <option value="harmony">Harmony</option>
                    <option value="celo">Celo</option>
                    <option value="iotx">IoTeX</option>
                    <option value="casper">Casper</option>
                  </select>
                </div>

                {/* Reset Filters */}
                {activeFiltersCount > 0 && (
                  <button
                    onClick={() => { setDeadline('all'); setReward('all'); setChain('all'); }}
                    className="w-full text-xs text-[var(--accent-primary)] hover:underline font-medium"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <FilterBar activeCategory={category} onCategoryChange={setCategory} activeChain={chain} onChainChange={setChain} />

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
          <button onClick={handleRefresh} className="p-2 text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors rounded-md hover:bg-[var(--bg-tertiary)]" title="Refresh">
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
          <button onClick={handleRefresh} className="btn btn-secondary text-sm"><RefreshCw size={14} /> Retry</button>
        </div>
      )}

      {/* Empty */}
      {!isActuallyLoading && !error && filteredOpportunities.length === 0 && allOpportunities.length > 0 && (
        <div className="text-center py-16 space-y-3">
          <p className="text-[var(--text-secondary)] text-base font-medium">No opportunities match your filters</p>
          <p className="text-[var(--text-tertiary)] text-sm">Try adjusting or clearing your filters.</p>
          <button onClick={() => { setDeadline('all'); setReward('all'); }} className="text-[var(--accent-primary)] text-sm hover:underline font-medium">Clear Filters</button>
        </div>
      )}

      {!isActuallyLoading && !error && allOpportunities.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <p className="text-[var(--text-secondary)] text-base font-medium">No opportunities found</p>
          <p className="text-[var(--text-tertiary)] text-sm">Try a different category or clear your search.</p>
          <button onClick={() => { setCategory('all'); setSearch(''); setDeadline('all'); setReward('all'); }} className="text-[var(--accent-primary)] text-sm hover:underline font-medium">Reset All</button>
        </div>
      )}

      {/* Opportunities */}
      {!isActuallyLoading && !error && filteredOpportunities.length > 0 && (
        <div className="space-y-3">
          {filteredOpportunities.map((opp, idx) => (
            <OpportunityCard key={opp.id} opp={opp} index={idx} onRefresh={handleRefresh} />
          ))}
        </div>
      )}

      {/* Infinite Scroll Observer Target */}
      {!isActuallyLoading && !error && filteredOpportunities.length > 0 && hasMore && (
        <div ref={observerTarget} className="flex justify-center py-8">
          <div className="flex items-center gap-2 text-[var(--text-tertiary)] text-sm">
            <Loader2 size={16} className="animate-spin" />
            <span>Loading more...</span>
          </div>
        </div>
      )}

      {/* End of feed message */}
      {!isActuallyLoading && !error && filteredOpportunities.length > 0 && !hasMore && (
        <div className="text-center py-8">
          <p className="text-sm text-[var(--text-tertiary)]">You've reached the end of the feed</p>
          <button onClick={handleRefresh} className="text-sm text-[var(--accent-primary)] hover:underline font-medium mt-2">Refresh Feed</button>
        </div>
      )}
    </div>
  )
}
