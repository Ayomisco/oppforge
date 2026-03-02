'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Search, Bell, Wallet, CheckCheck, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import useSWR from 'swr'
import api from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'

const fetcher = url => api.get(url).then(res => res.data)

function NotificationPanel({ onClose }) {
  const { data: notifs, mutate } = useSWR('/notifications', fetcher, { refreshInterval: 30000 })
  
  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      mutate()
    } catch {}
  }
  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all')
      mutate()
    } catch {}
  }

  const typeColors = {
    info: 'bg-blue-500', success: 'bg-green-500', warning: 'bg-yellow-500', alert: 'bg-red-500',
  }

  return (
    <div className="absolute right-0 top-12 w-80 max-h-96 bg-[#111] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Notifications</span>
        <div className="flex items-center gap-2">
          <button onClick={markAllRead} className="text-[9px] font-mono text-[#ff5500] hover:text-white transition-colors flex items-center gap-1">
            <CheckCheck size={10} /> Read All
          </button>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={14} /></button>
        </div>
      </div>
      <div className="overflow-y-auto max-h-72">
        {(notifs || []).length === 0 && (
          <div className="p-8 text-center text-gray-600 font-mono text-[10px]">NO SIGNALS DETECTED</div>
        )}
        {(notifs || []).map(n => (
          <div 
            key={n.id} 
            onClick={() => { markRead(n.id); if (n.link) window.location.href = n.link }}
            className={`px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/[0.02] transition-colors ${!n.is_read ? 'bg-[#ff5500]/[0.03]' : ''}`}
          >
            <div className="flex items-start gap-2">
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${!n.is_read ? 'bg-[#ff5500] shadow-[0_0_6px_#ff5500]' : 'bg-gray-700'}`} />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white font-bold truncate">{n.title}</div>
                {n.message && <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{n.message}</div>}
                <div className="text-[9px] text-gray-600 font-mono mt-1">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true }).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Header({ onMenuClick }) {
  const router = useRouter()
  const { isGuest, openLoginModal } = useAuth()
  const [query, setQuery] = useState('')
  const [showNotifs, setShowNotifs] = useState(false)
  const notifRef = useRef(null)
  
  const { data: unreadData } = useSWR(!isGuest ? '/notifications/unread-count' : null, fetcher, { refreshInterval: 30000 })
  const unreadCount = unreadData?.count || 0

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotifs(!showNotifs)}
                className="p-2 relative text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all group"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[14px] h-3.5 flex items-center justify-center rounded-full bg-[#ff5500] text-[8px] font-bold text-white px-1 shadow-[0_0_8px_#ff5500]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifs && <NotificationPanel onClose={() => setShowNotifs(false)} />}
            </div>
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

