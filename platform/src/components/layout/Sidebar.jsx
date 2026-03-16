'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Zap,
  Target,
  MessageSquare,
  Settings,
  LogOut,
  ShieldCheck,
  PlusSquare,
  Lock,
  Crown
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../providers/AuthProvider'

function usePlanStatus(user) {
  return useMemo(() => {
    if (!user) return { label: 'SCOUT', color: 'text-[var(--text-tertiary)]', bgColor: 'bg-[var(--bg-tertiary)]', borderColor: 'border-[var(--border-default)]', isTrial: false, trialDaysLeft: 0, isActive: false }

    const isAdmin = user.role === 'admin' || user.role === 'ADMIN'
    const isSubAdmin = user.role === 'sub_admin' || user.role === 'SUB_ADMIN'

    if (isAdmin) {
      return { label: 'ADMIN', color: 'text-[var(--accent-secondary)]', bgColor: 'bg-[var(--accent-secondary-muted)]', borderColor: 'border-[var(--accent-secondary)]/20', isTrial: false, trialDaysLeft: 0, isActive: true, isExpired: false, isStaff: true, isAdmin: true }
    }
    if (isSubAdmin) {
      return { label: 'SUB_ADMIN', color: 'text-[var(--status-info)]', bgColor: 'bg-[var(--status-info)]/10', borderColor: 'border-[var(--status-info)]/20', isTrial: false, trialDaysLeft: 0, isActive: true, isExpired: false, isStaff: true, isAdmin: false }
    }

    const tier = user.tier === 'founder' ? 'hunter' : (user.tier || 'scout')
    const status = user.subscription_status || 'trialing'
    const trialStart = user.trial_started_at ? new Date(user.trial_started_at) : (user.created_at ? new Date(user.created_at) : new Date())
    const now = new Date()
    const daysSinceStart = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24))
    const trialDaysLeft = Math.max(0, 7 - daysSinceStart)
    const isTrial = status === 'trialing' && trialDaysLeft > 0
    const isExpired = status === 'trialing' && trialDaysLeft <= 0
    const isActive = status === 'active' || user.is_pro

    if (tier === 'hunter' && isActive) {
      return { label: 'HUNTER', color: 'text-[var(--accent-primary)]', bgColor: 'bg-[var(--accent-primary-muted)]', borderColor: 'border-[var(--accent-primary)]/20', isTrial: false, trialDaysLeft: 0, isActive: true, isExpired: false }
    }
    if (isTrial) {
      return { label: 'TRIAL', color: 'text-[var(--status-success)]', bgColor: 'bg-[var(--status-success)]/10', borderColor: 'border-[var(--status-success)]/20', isTrial: true, trialDaysLeft, isActive: true, isExpired: false }
    }
    if (isExpired) {
      return { label: 'EXPIRED', color: 'text-[var(--status-danger)]', bgColor: 'bg-[var(--status-danger)]/10', borderColor: 'border-[var(--status-danger)]/20', isTrial: false, trialDaysLeft: 0, isActive: false, isExpired: true }
    }
    return { label: 'SCOUT', color: 'text-[var(--text-tertiary)]', bgColor: 'bg-[var(--bg-tertiary)]', borderColor: 'border-[var(--border-default)]', isTrial: false, trialDaysLeft: 0, isActive: false, isExpired: false }
  }, [user])
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Zap, label: 'Live Feed', href: '/dashboard/feed' },
  { icon: Target, label: 'Tracker', href: '/dashboard/tracker' },
  { icon: MessageSquare, label: 'Forge AI', href: '/dashboard/chat' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
]

const SidebarItem = ({ item, isActive, locked }) => (
  <Link
    href={locked ? '#' : item.href}
    onClick={locked ? (e) => e.preventDefault() : undefined}
    className={`
      flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-150 group relative text-sm
      ${locked
        ? 'text-[var(--text-tertiary)] cursor-not-allowed opacity-40'
        : isActive
          ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-medium'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'}
    `}
  >
    {isActive && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--accent-primary)] rounded-r" />
    )}
    <item.icon size={18} strokeWidth={isActive ? 2 : 1.5} className={isActive ? 'text-[var(--accent-primary)]' : ''} />
    <span className="flex-1">{item.label}</span>
    {locked && <Lock size={12} className="text-[var(--text-tertiary)]" />}
  </Link>
)

export default function Sidebar({ isMobile, isOpen, onClose }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const plan = usePlanStatus(user)

  const content = (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] border-r border-[var(--border-default)] w-[var(--sidebar-width)]">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-[var(--border-default)]">
        <Link href="/" className="flex items-center gap-3 group">
          <Image src="/oppforge_logo.png" alt="OppForge" width={28} height={28} className="object-contain drop-shadow-[0_0_8px_rgba(255,85,0,0.4)] group-hover:scale-110 transition-transform" priority />
          <span className="font-bold text-base tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
            OppForge
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
        <div className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase mb-2 px-3 tracking-wider">
          Navigation
        </div>
        {menuItems.map((item) => (
          <SidebarItem
            key={item.href}
            item={item}
            isActive={pathname === item.href}
            locked={plan.isExpired && item.href === '/dashboard/chat'}
          />
        ))}

        {/* Admin Section */}
        {(user?.role === 'admin' || user?.role === 'ADMIN' || user?.role === 'sub_admin' || user?.role === 'SUB_ADMIN' || user?.role?.toLowerCase?.() === 'admin' || user?.role?.toLowerCase?.() === 'sub_admin') && (
          <>
            <div className="mt-6 text-[11px] font-medium text-[var(--accent-secondary)] uppercase mb-2 px-3 tracking-wider">
              Admin
            </div>
            <SidebarItem
              item={{ icon: ShieldCheck, label: 'Admin Panel', href: '/dashboard/admin' }}
              isActive={pathname === '/dashboard/admin'}
            />
            {(user?.role === 'admin' || user?.role === 'ADMIN' || user?.role?.toLowerCase?.() === 'admin') && (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-mission-upload'))}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[var(--text-secondary)] hover:text-[var(--accent-secondary)] hover:bg-[var(--accent-secondary-muted)] transition-all duration-150 text-sm group"
              >
                <PlusSquare size={18} className="group-hover:rotate-90 transition-transform" />
                <span>Add Opportunity</span>
              </button>
            )}
            <SidebarItem
              item={{ icon: ShieldCheck, label: 'Audit Logs', href: '/dashboard/admin/audit' }}
              isActive={pathname === '/dashboard/admin/audit'}
            />
          </>
        )}
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-[var(--border-default)]">
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-muted)] relative overflow-hidden">
          {/* Avatar */}
          <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold text-white shrink-0 ${
            plan.isActive && !plan.isTrial
              ? 'bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)]'
              : 'bg-[var(--bg-tertiary)]'
          }`}>
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[var(--text-primary)] truncate">
              {user?.full_name || user?.username || 'User'}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${plan.bgColor} ${plan.color} border ${plan.borderColor}`}>
                {plan.label}
              </span>
              {plan.isTrial && (
                <span className="text-[10px] text-[var(--text-tertiary)]">
                  {plan.trialDaysLeft}d left
                </span>
              )}
            </div>
          </div>

          <button onClick={logout} className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--status-danger)] hover:bg-[var(--status-danger)]/10 transition-colors" aria-label="Log out">
            <LogOut size={16} />
          </button>

          {/* Trial progress bar */}
          {plan.isTrial && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--border-muted)] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((7 - plan.trialDaysLeft) / 7) * 100}%` }}
                className="h-full bg-[var(--status-success)]"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 z-50 shadow-2xl"
            >
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )
  }

  return (
    <div className="hidden md:block h-screen sticky top-0 shrink-0">
      {content}
    </div>
  )
}
