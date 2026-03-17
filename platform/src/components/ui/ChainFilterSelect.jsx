'use client'

import React, { useState, useRef, useEffect } from 'react'
import { FILTER_CHAINS } from '@/lib/chains'
import { Network, Search, X, ChevronDown } from 'lucide-react'

/**
 * Searchable chain filter dropdown.
 * Props:
 *   value       - current chain id (e.g. 'all', 'ethereum', 'others')
 *   onChange     - (chainId: string) => void
 *   size         - 'sm' | 'md' (default 'md')
 *   className    - additional wrapper classes
 */
export default function ChainFilterSelect({ value, onChange, size = 'md', className = '' }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)
  const searchRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus()
  }, [open])

  const filtered = search
    ? FILTER_CHAINS.filter(c =>
        c.id === 'all' || c.id === 'others'
          ? c.label.toLowerCase().includes(search.toLowerCase())
          : c.label.toLowerCase().includes(search.toLowerCase()) || c.id.includes(search.toLowerCase())
      )
    : FILTER_CHAINS

  const selected = FILTER_CHAINS.find(c => c.id === value) || FILTER_CHAINS[0]

  const sm = size === 'sm'

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-2 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] ${
          sm ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm'
        }`}
      >
        <span className="truncate">{selected.label}</span>
        <ChevronDown size={sm ? 12 : 14} className="text-[var(--text-tertiary)] shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg shadow-xl max-h-64 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 px-2.5 py-2 border-b border-[var(--border-default)]">
            <Search size={12} className="text-[var(--text-tertiary)] shrink-0" />
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search chains..."
              className={`flex-1 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none ${sm ? 'text-[10px]' : 'text-xs'}`}
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                <X size={10} />
              </button>
            )}
          </div>

          {/* Options */}
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 && (
              <div className={`px-3 py-3 text-center text-[var(--text-tertiary)] ${sm ? 'text-[10px]' : 'text-xs'}`}>
                No chains found
              </div>
            )}
            {filtered.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => { onChange(c.id); setOpen(false); setSearch('') }}
                className={`w-full text-left px-3 py-1.5 transition-colors ${
                  c.id === value
                    ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                } ${sm ? 'text-[10px]' : 'text-xs'}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
