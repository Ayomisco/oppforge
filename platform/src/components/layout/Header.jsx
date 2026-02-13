'use client'

import React from 'react'
import { Search, Bell, Sparkles } from 'lucide-react'

export default function Header({ onMenuClick }) {
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
        
        <div className="hidden md:flex items-center text-sm font-bold tracking-widest uppercase text-gray-500">
           Dashboard <span className="text-[var(--accent-forge)] mx-2">//</span> Overview
        </div>
      </div>

      {/* Middle: Universal Search (Desktop) */}
      <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
        <input 
          type="text" 
          placeholder="SEARCH_PROTOCOL..." 
          className="w-full bg-[var(--bg-walnut)] border border-[var(--glass-border)] rounded-sm py-1.5 pl-9 pr-4 text-xs font-mono text-white focus:outline-none focus:border-[var(--accent-forge)] focus:ring-1 focus:ring-[var(--accent-forge)]/50 transition-all placeholder-gray-700"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <kbd className="inline-flex items-center bg-[#222] border border-[#333] rounded px-1 text-[9px] font-mono text-gray-500">⌘K</kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Token Balance / Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-walnut)] border border-[var(--border-subtle)]">
          <Sparkles size={14} className="text-[var(--accent-amber)]" />
          <span className="text-xs font-mono font-medium text-[var(--accent-amber)]">PRO: Active</span>
        </div>

        {/* Notifications */}
        <button className="p-2 relative text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-walnut)] rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--status-error)] animate-pulse" />
        </button>

        {/* Mobile Search Toggle */}
        <button className="md:hidden p-2 text-[var(--text-secondary)]">
          <Search size={20} />
        </button>
      </div>
    </header>
  )
}
