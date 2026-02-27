'use client'

import React from 'react'
import { Search, Bell, Wallet } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { useState } from 'react'

export default function Header({ onMenuClick }) {
  const router = useRouter()
  const { isGuest, openLoginModal } = useAuth()
  const [query, setQuery] = useState('')

  const handleSearch = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      router.push(`/dashboard?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <header className="h-14 border-b border-[var(--glass-border)] bg-[var(--bg-espresso)]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4">
      
      {/* Left: Mobile Toggle + Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-1.5 text-[var(--text-secondary)] hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        
        <div className="hidden md:flex items-center text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-gray-400">
           DASHBOARD <span className="text-[#ff5500] mx-2">//</span> OVERVIEW
        </div>
      </div>

      {/* Middle: Universal Search (Desktop) */}
      <div className="hidden md:flex flex-1 max-w-md mx-8 relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff5500] transition-colors" size={14} />
        <input 
          type="text" 
          placeholder="SEARCH_PROTOCOL..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
          className="w-full bg-[#1a1512] border border-[#2a1a12] rounded-lg py-1.5 pl-9 pr-4 text-xs font-mono text-white focus:outline-none focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500]/20 transition-all placeholder-gray-800"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <kbd className="inline-flex items-center bg-[#111] border border-[#222] rounded px-1.5 py-0.5 text-[8px] font-mono text-gray-400">⌘K</kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {isGuest ? (
          <button 
            onClick={openLoginModal}
            className="flex flex-row items-center gap-2 px-4 py-2 bg-[#ff5500] hover:bg-[#ff6600] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-[0_0_15px_rgba(255,85,0,0.4)] hover:shadow-[0_0_25px_rgba(255,85,0,0.6)] hover:scale-105"
          >
            <Wallet className="w-4 h-4" />
            Connect_Wallet
          </button>
        ) : (
          <>
            {/* Notifications */}
            <button className="p-2 relative text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all group">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#ff5500] shadow-[0_0_8px_#ff5500]" />
            </button>
          </>
        )}

        {/* Mobile Search Toggle */}
        <button className="md:hidden p-2 text-[var(--text-secondary)]">
          <Search size={20} />
        </button>
      </div>
    </header>
  )
}

