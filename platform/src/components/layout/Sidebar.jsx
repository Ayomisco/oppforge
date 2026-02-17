'use client'

import React, { useState } from 'react'
import Link from 'next/link'
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
  Crown
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../providers/AuthProvider'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Zap, label: 'Live Feed', href: '/dashboard/feed' },
  { icon: Target, label: 'Tracker', href: '/dashboard/tracker' },
  { icon: MessageSquare, label: 'Forge AI', href: '/dashboard/chat' },
  { icon: Crown, label: 'Upgrades', href: '/dashboard/subscription' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
]

const SidebarItem = ({ item, isActive, isCollapsed }) => {
  return (
    <Link 
      href={item.href}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-sm transition-all duration-200 group relative overflow-hidden text-xs font-mono tracking-wide
        ${isActive 
          ? 'bg-[#ff5500]/10 text-[#ff5500] border-l-2 border-[#ff5500]' 
          : 'text-gray-400 hover:text-white hover:bg-white/5'}
      `}
    >
      <item.icon size={16} strokeWidth={isActive ? 2 : 1.5} className={isActive ? 'text-[#ff5500]' : 'text-gray-400 group-hover:text-white transition-colors'} />
      
      {!isCollapsed && (
        <span className="uppercase">{item.label}</span>
      )}
    </Link>
  )
}

export default function Sidebar({ isMobile, isOpen, onClose }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  
  const content = (
    <div className="flex flex-col h-full bg-[#050403] border-r border-[#1a1512] w-[240px]">
      {/* Logo Area */}
      <div className="h-14 flex items-center px-4 border-b border-[#1a1512]">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-6 h-6 rounded-sm bg-[#ff5500] flex items-center justify-center text-black shadow-[0_0_10px_rgba(255,85,0,0.5)]">
            <Cpu size={14} />
          </div>
          <span className="font-bold text-sm tracking-widest uppercase text-white group-hover:text-[#ff5500] transition-colors">
            OppForge <span className="text-[9px] text-gray-800 align-top">v1.0</span>
          </span>
        </Link>
      </div>

      {/* Nav Items */}
      <div className="flex-1 py-6 px-2 space-y-0.5 overflow-y-auto">
        <div className="text-[9px] font-mono text-gray-700 uppercase mb-3 pl-3">Main Module</div>
        {menuItems.map((item) => (
          <SidebarItem 
            key={item.href} 
            item={item} 
            isActive={pathname === item.href} 
            isCollapsed={false}
          />
        ))}

        <div className="mt-8 text-[9px] font-mono text-gray-700 uppercase mb-3 pl-3">Database</div>
        <SidebarItem 
          item={{ icon: FolderKanban, label: 'Applications', href: '/dashboard/applications' }}
          isActive={pathname === '/dashboard/applications'}
          isCollapsed={false}
        />

        {(user?.role?.toLowerCase() === 'admin') && (
          <>
            <div className="mt-8 text-[9px] font-mono text-[#ffaa00] uppercase mb-3 pl-3">Intelligence HQ</div>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-mission-upload'))}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-sm text-gray-400 hover:text-[#ffaa00] hover:bg-[#ffaa00]/10 transition-all duration-200 text-xs font-mono tracking-wide uppercase group"
            >
              <PlusSquare size={16} className="group-hover:rotate-90 transition-transform" />
              <span>Deploy Mission</span>
            </button>
            <SidebarItem 
              item={{ icon: ShieldCheck, label: 'Audit Logs', href: '/dashboard/admin/audit' }}
              isActive={pathname === '/dashboard/admin/audit'}
            />
          </>
        )}
      </div>

      {/* User Profile / Footer */}
      <div className="p-3 border-t border-[#1a1512]">
        <div className="flex items-center gap-3 p-2 rounded-sm bg-[#0a0806] border border-white/5 group relative">
          <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-[#ff5500] to-[#ffaa00] flex items-center justify-center text-xs font-bold text-white shadow-lg">
             {user?.full_name ? user.full_name.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-[11px] font-bold text-white truncate">{user?.full_name || user?.username || 'User'}</div>
            <div className="text-[9px] text-[#ffaa00] truncate uppercase font-mono tracking-tighter">Pro Plan Active</div>
          </div>
          <button onClick={logout} className="p-1.5 hover:bg-white/5 rounded text-gray-500 hover:text-red-500 transition-colors">
            <LogOut size={14} />
          </button>
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
