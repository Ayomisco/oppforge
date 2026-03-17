'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Search, Bell, Wallet, CheckCheck, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import useSWR from 'swr'
import api from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'

const fetcher = url => api.get(url).then(res => res.data)

/* ── Modern Animated Hamburger ── */
const AnimatedMenuIcon = ({ isOpen, ...props }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="transition-transform duration-200" {...props}>
    <rect
      x="2" y={isOpen ? "9" : "4"} width="16" height="2" rx="1" fill="currentColor"
      className="transition-all duration-300 origin-center"
      style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
    />
    <rect
      x="2" y="9" width="16" height="2" rx="1" fill="currentColor"
      className="transition-opacity duration-200"
      style={{ opacity: isOpen ? 0 : 1 }}
    />
    <rect
      x="2" y={isOpen ? "9" : "14"} width="16" height="2" rx="1" fill="currentColor"
      className="transition-all duration-300 origin-center"
      style={{ transform: isOpen ? 'rotate(-45deg)' : 'rotate(0deg)' }}
    />
  </svg>
)

function NotificationPanel({ onClose }) {
  const { data: notifs, mutate } = useSWR('/notifications', fetcher, {
    refreshInterval: 300000,
    dedupingInterval: 60000,
    revalidateOnFocus: false,
    shouldRetryOnError: false
  })

  const markRead = async (id) => {
    try { await api.put(`/notifications/${id}/read`); mutate() } catch {}
  }
  const markAllRead = async () => {
    try { await api.put('/notifications/read-all'); mutate() } catch {}
  }

  return (
    <div className="absolute right-0 top-14 w-80 max-h-96 bg-[var(--bg-overlay)] border border-[var(--border-default)] rounded-xl shadow-[var(--shadow-xl)] z-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border-default)] flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--text-secondary)]">Notifications</span>
        <div className="flex items-center gap-3">
          <button onClick={markAllRead} className="text-[10px] font-medium text-[var(--accent-primary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1">
            <CheckCheck size={12} /> Mark all read
          </button>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1"><X size={16} /></button>
        </div>
      </div>
      <div className="overflow-y-auto max-h-72">
        {(notifs || []).length === 0 && (
          <div className="p-8 text-center text-[var(--text-tertiary)] text-sm">No notifications yet</div>
        )}
        {(notifs || []).map(n => (
          <div
            key={n.id}
            onClick={() => { markRead(n.id); if (n.link) window.location.href = n.link }}
            className={`px-4 py-3 border-b border-[var(--border-muted)] cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors ${!n.is_read ? 'bg-[var(--accent-primary-muted)]' : ''}`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.is_read ? 'bg-[var(--accent-primary)] shadow-[0_0_6px_var(--accent-primary)]' : 'bg-[var(--border-default)]'}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-[var(--text-primary)] font-medium truncate">{n.title}</div>
                {n.message && <div className="text-xs text-[var(--text-tertiary)] mt-0.5 line-clamp-2">{n.message}</div>}
                <div className="text-[11px] text-[var(--text-tertiary)] mt-1">
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
  const { isGuest } = useAuth()
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

  useEffect(() => {
    if (showMobileSearch && mobileSearchRef.current) mobileSearchRef.current.focus()
  }, [showMobileSearch])

  const handleSearch = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      router.push(`/dashboard?q=${encodeURIComponent(query)}`)
      setShowMobileSearch(false)
    }
  }

  return (
    <>
      <header className="h-14 border-b border-[var(--border-default)] bg-[var(--bg-primary)] sticky top-0 z-30 flex items-center justify-between px-4">

        {/* Left: Mobile Toggle + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-md hover:bg-[var(--bg-tertiary)] transition-colors"
            aria-label="Open menu"
          >
            <AnimatedMenuIcon isOpen={false} />
          </button>
          <span className="hidden md:block text-sm font-medium text-[var(--text-secondary)]">
            Dashboard
          </span>
        </div>

        {/* Center: Search (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-6 relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-[var(--accent-primary)] transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search opportunities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg py-2 pl-10 pr-12 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/20 transition-all placeholder-[var(--text-placeholder)]"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <kbd className="inline-flex items-center bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-tertiary)]">⌘K</kbd>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* Mobile Search */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-md hover:bg-[var(--bg-tertiary)] transition-colors"
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          {isGuest ? (
            <button
              onClick={() => router.push('/login')}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-sm font-semibold rounded-md transition-all shadow-[0_0_12px_rgba(255,85,0,0.2)]"
            >
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Connect Wallet</span>
              <span className="sm:hidden">Connect</span>
            </button>
          ) : (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="p-2 relative text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-md transition-all"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-[var(--accent-primary)] text-[9px] font-bold text-white px-1 shadow-[0_0_6px_var(--accent-primary)]">
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
        <div className="md:hidden fixed inset-x-0 top-14 z-40 bg-[var(--bg-primary)] border-b border-[var(--border-default)] px-4 py-3 shadow-[var(--shadow-lg)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={16} />
            <input
              ref={mobileSearchRef}
              type="text"
              placeholder="Search opportunities..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg py-2.5 pl-10 pr-10 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] placeholder-[var(--text-placeholder)]"
            />
            <button
              onClick={() => { setShowMobileSearch(false); setQuery('') }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
