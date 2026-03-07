'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Zap, 
  Target, 
  MessageSquare, 
  FolderKanban, 
  Settings, 
  LogOut, 
  Menu,
  Terminal,
  Cpu,
  ShieldCheck,
  PlusSquare,
  Crown,
  Lock
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../providers/AuthProvider'

// Helper to compute trial/plan status
function usePlanStatus(user) {
  return useMemo(() => {
    if (!user) return { label: 'SCOUT', color: 'text-gray-500', bgColor: 'bg-gray-500/10', borderColor: 'border-gray-500/20', glow: '', isTrial: false, trialDaysLeft: 0, isActive: false }
    
    const isAdmin = user.role === 'admin' || user.role === 'ADMIN'
    const isSubAdmin = user.role === 'sub_admin' || user.role === 'SUB_ADMIN'
    const isStaff = isAdmin || isSubAdmin
    
    if (isAdmin) {
      return { label: 'ADMIN_UNLOCKED', color: 'text-[#ffaa00]', bgColor: 'bg-[#ffaa00]/10', borderColor: 'border-[#ffaa00]/20', glow: 'shadow-[0_0_12px_rgba(255,170,0,0.3)]', isTrial: false, trialDaysLeft: 0, isActive: true, isExpired: false, isStaff: true, isAdmin: true }
    }
    if (isSubAdmin) {
      return { label: 'SUB_ADMIN', color: 'text-[#3b82f6]', bgColor: 'bg-[#3b82f6]/10', borderColor: 'border-[#3b82f6]/20', glow: 'shadow-[0_0_12px_rgba(59,130,246,0.3)]', isTrial: false, trialDaysLeft: 0, isActive: true, isExpired: false, isStaff: true, isAdmin: false }
    }

    const tier = user.tier || 'scout'
    const status = user.subscription_status || 'trialing'
    
    // Trial logic
    const trialStart = user.trial_started_at ? new Date(user.trial_started_at) : (user.created_at ? new Date(user.created_at) : new Date())
    const now = new Date()
    const daysSinceStart = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24))
    const trialDaysLeft = Math.max(0, 7 - daysSinceStart)
    const isTrial = status === 'trialing' && trialDaysLeft > 0
    const isExpired = status === 'trialing' && trialDaysLeft <= 0
    const isActive = status === 'active' || user.is_pro
    
    if (tier === 'founder' && isActive) {
      return { label: 'FOUNDER', color: 'text-[#D4AF37]', bgColor: 'bg-[#D4AF37]/10', borderColor: 'border-[#D4AF37]/20', glow: 'shadow-[0_0_12px_rgba(212,175,55,0.3)]', isTrial: false, trialDaysLeft: 0, isActive: true, isExpired: false }
    }
    if (tier === 'hunter' && isActive) {
      return { label: 'HUNTER', color: 'text-[#ff5500]', bgColor: 'bg-[#ff5500]/10', borderColor: 'border-[#ff5500]/20', glow: 'shadow-[0_0_12px_rgba(255,85,0,0.3)]', isTrial: false, trialDaysLeft: 0, isActive: true, isExpired: false }
    }
    if (isTrial) {
      return { label: 'ALPHA TRIAL', color: 'text-[#10b981]', bgColor: 'bg-[#10b981]/10', borderColor: 'border-[#10b981]/20', glow: '', isTrial: true, trialDaysLeft, isActive: true, isExpired: false }
    }
    if (isExpired) {
      return { label: 'EXPIRED', color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20', glow: '', isTrial: false, trialDaysLeft: 0, isActive: false, isExpired: true }
    }
    return { label: 'SCOUT', color: 'text-gray-500', bgColor: 'bg-gray-500/10', borderColor: 'border-gray-500/20', glow: '', isTrial: false, trialDaysLeft: 0, isActive: false, isExpired: false }
  }, [user])
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Zap, label: 'Live Feed', href: '/dashboard/feed' },
  { icon: Target, label: 'Tracker', href: '/dashboard/tracker' },
  { icon: MessageSquare, label: 'Forge AI', href: '/dashboard/chat' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
]

const SidebarItem = ({ item, isActive, isCollapsed, locked }) => {
  return (
    <Link 
      href={locked ? '#' : item.href}
      onClick={locked ? (e) => e.preventDefault() : undefined}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative text-sm
        ${locked 
          ? 'text-gray-700 cursor-not-allowed opacity-50'
          : isActive 
          ? 'bg-[#ff5500]/10 text-[#ff5500] border-l-2 border-[#ff5500]' 
          : 'text-gray-400 hover:text-white hover:bg-white/5'}
      `}
    >
      <item.icon size={18} strokeWidth={isActive ? 2 : 1.5} className={isActive ? 'text-[#ff5500]' : locked ? 'text-gray-700' : 'text-gray-400 group-hover:text-white transition-colors'} />
      
      {!isCollapsed && (
        <span className="flex-1 font-medium">{item.label}</span>
      )}
      {locked && !isCollapsed && (
        <Lock size={12} className="text-gray-700" />
      )}
    </Link>
  )
}

export default function Sidebar({ isMobile, isOpen, onClose }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const plan = usePlanStatus(user)
  
  const content = (
    <div className="flex flex-col h-full bg-[#050403] border-r border-[#1a1512] w-[240px]">
      {/* Logo Area */}
      <div className="h-14 flex items-center px-4 border-b border-[#1a1512]">
        <Link href="/" className="flex items-center gap-3 group">
          <Image src="/oppforge_logo.png" alt="OppForge" width={26} height={26} className="object-contain filter drop-shadow-[0_0_8px_rgba(255,85,0,0.5)] group-hover:scale-110 transition-transform" priority />
          <span className="font-bold text-base tracking-tight text-white group-hover:text-[#ff5500] transition-colors">
            OppForge
          </span>
        </Link>
      </div>

      {/* Nav Items */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        <div className="text-[11px] font-semibold text-gray-600 uppercase mb-3 pl-3 tracking-wide">Menu</div>
        {menuItems.map((item) => (
          <SidebarItem 
            key={item.href} 
            item={item} 
            isActive={pathname === item.href} 
            isCollapsed={false}
            locked={plan.isExpired && item.href === '/dashboard/chat'}
          />
        ))}



        {(user?.role === 'admin' || user?.role === 'ADMIN' || user?.role === 'sub_admin' || user?.role === 'SUB_ADMIN' || user?.role?.toLowerCase?.() === 'admin' || user?.role?.toLowerCase?.() === 'sub_admin') && (
          <>
            <div className="mt-8 text-[11px] font-semibold text-[#ffaa00] uppercase mb-3 pl-3 tracking-wide">Admin</div>
            <SidebarItem 
              item={{ icon: ShieldCheck, label: 'Admin Dashboard', href: '/dashboard/admin' }}
              isActive={pathname === '/dashboard/admin'}
            />
            {(user?.role === 'admin' || user?.role === 'ADMIN' || user?.role?.toLowerCase?.() === 'admin') && (
              <>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('open-mission-upload'))}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-[#ffaa00] hover:bg-[#ffaa00]/10 transition-all duration-200 text-sm group"
                >
                  <PlusSquare size={18} className="group-hover:rotate-90 transition-transform" />
                  <span className="font-medium">Add Opportunity</span>
                </button>
              </>
            )}
            <SidebarItem 
              item={{ icon: ShieldCheck, label: 'Audit Logs', href: '/dashboard/admin/audit' }}
              isActive={pathname === '/dashboard/admin/audit'}
            />
          </>
        )}
      </div>

      {/* User Profile / Footer */}
      <div className="p-3 border-t border-[#1a1512]">
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0a0806] border border-white/5 group relative overflow-hidden">
          {/* Avatar */}
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-lg shrink-0 ${
            plan.isActive && !plan.isTrial 
              ? 'bg-gradient-to-br from-[#ff5500] to-[#ffaa00]' 
              : 'bg-gradient-to-br from-gray-600 to-gray-700'
          }`}>
             {user?.full_name ? user.full_name.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="text-sm font-semibold text-white truncate">
              {user?.full_name || user?.username || 'User'}
            </div>
            
            <div className="flex items-center gap-1.5 mt-0.5">
               <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${plan.bgColor} ${plan.color} border ${plan.borderColor}`}>
                 {plan.label}
               </span>
               {plan.isTrial && (
                 <span className="text-[10px] text-gray-500">
                   {plan.trialDaysLeft}d left
                 </span>
               )}
            </div>
          </div>

          <button onClick={logout} className="p-2 hover:bg-white/5 rounded-lg text-gray-600 hover:text-red-500 transition-colors" aria-label="Log out">
            <LogOut size={16} />
          </button>

          {/* Trial Progress Line */}
          {plan.isTrial && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5 overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${((7 - plan.trialDaysLeft) / 7) * 100}%` }}
                 className="h-full bg-[#10b981]"
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
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 20 }}
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
    <div className="hidden md:block h-screen sticky top-0">
      {content}
    </div>
  )
}
