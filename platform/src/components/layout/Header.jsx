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
  const { data: notifs, mutate } = useSWR('/notifications', fetcher, { 
    refreshInterval: 300000,
    dedupingInterval: 60000,
    revalidateOnFocus: false,
    shouldRetryOnError: false
  })
  
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

  return (
    <div className="absolute right-0 top-14 w-80 max-h-96 bg-[#111] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400">Notifications</span>
        <div className="flex items-center gap-3">
          <button onClick={markAllRead} className="text-[10px] font-medium text-[#ff5500] hover:text-white transition-colors flex items-center gap-1">
            <CheckCheck size={12} /> Mark all read
          </button>
          <button onClick={onClose} className="text-gray-500 hover:text-white p-1"><X size={16} /></button>
        </div>
      </div>
      <div className="overflow-y-auto max-h-72">
        {(notifs || []).length === 0 && (
          <div className="p-8 text-center text-gray-500 text-sm">No notifications yet</div>
        )}
        {(notifs || []).map(n => (
          <div 
            key={n.id} 
            onClick={() => { markRead(n.id); if (n.link) window.location.href = n.link }}
            className={`px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/[0.02] transition-colors ${!n.is_read ? 'bg-[#ff5500]/[0.03]' : ''}`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.is_read ? 'bg-[#ff5500] shadow-[0_0_6px_#ff5500]' : 'bg-gray-700'}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white font-semibold truncate">{n.title}</div>
                {n.message && <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</div>}
                <div className="text-[11px] text-gray-600 mt-1">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
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
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const notifRef = useRef(null)
  const mobileSearchRef = useRef(null)
  
  const { data: unreadData } = useSWR(!isGuest ? '/notifications/unread-count' : null, fetcher, { 
    refreshInterval: 300000,
    dedupingInterval: 60000,
    revalidateOnFocus: false,
    shouldRetryOnError: false
  })
  const unreadCount = unreadData?.count || 0

  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Auto-focus mobile search input
  useEffect(() => {
    if (showMobileSearch && mobileSearchRef.current) {
      mobileSearchRef.current.focus()
    }
  }, [showMobileSearch])

  const handleSearch = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      router.push(`/dashboard?q=${encodeURIComponent(query)}`)
      setShowMobileSearch(false)
    }
  }

  return (
    <>
      <header className="h-14 border-b border-[var(--glass-border)] bg-[var(--bg-espresso)]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-3 sm:px-4">
        
        {/* Left: Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2.5 -ml-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          
          <span className="hidden md:block text-sm font-semibold text-gray-400">
            Dashboard
          </span>
        </div>

        {/* Middle: Search (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#ff5500] transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search opportunities..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full bg-[#1a1512] border border-[#2a1a12] rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500]/20 transition-all placeholder-gray-600"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <kbd className="inline-flex items-center bg-[#111] border border-[#222] rounded px-1.5 py-0.5 text-[10px] font-mono text-gray-500">⌘K</kbd>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mobile Search Toggle */}
          <button 
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden p-2.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          {isGuest ? (
            <button 
              onClick={openLoginModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#ff5500] hover:bg-[#ff6600] text-white text-sm font-semibold rounded-lg transition-all shadow-[0_0_15px_rgba(255,85,0,0.3)] hover:shadow-[0_0_25px_rgba(255,85,0,0.5)]"
            >
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Connect Wallet</span>
              <span className="sm:hidden">Connect</span>
            </button>
          ) : (
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotifs(!showNotifs)}
                className="p-2.5 relative text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                aria-label="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-[#ff5500] text-[9px] font-bold text-white px-1 shadow-[0_0_8px_#ff5500]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifs && <NotificationPanel onClose={() => setShowNotifs(false)} />}
            </div>
          )}
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="md:hidden fixed inset-x-0 top-14 z-40 bg-[var(--bg-espresso)] border-b border-[var(--glass-border)] px-3 py-3 shadow-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              ref={mobileSearchRef}
              type="text" 
              placeholder="Search opportunities..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full bg-[#1a1512] border border-[#2a1a12] rounded-lg py-3 pl-10 pr-10 text-sm text-white focus:outline-none focus:border-[#ff5500] placeholder-gray-600"
            />
            <button 
              onClick={() => { setShowMobileSearch(false); setQuery('') }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

