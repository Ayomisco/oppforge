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
  Cpu
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Zap, label: 'Live Feed', href: '/dashboard/feed' },
  { icon: Target, label: 'Tracker', href: '/dashboard/tracker' },
  { icon: MessageSquare, label: 'Forge AI', href: '/dashboard/chat' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
]

const SidebarItem = ({ item, isActive, isCollapsed }) => {
  return (
    <Link 
      href={item.href}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-sm transition-all duration-200 group relative overflow-hidden text-xs font-mono tracking-wide
        ${isActive 
          ? 'bg-[var(--accent-forge)]/10 text-[var(--accent-forge)] border-l-2 border-[var(--accent-forge)]' 
          : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'}
      `}
    >
      <item.icon size={16} strokeWidth={isActive ? 2 : 1.5} />
      
      {!isCollapsed && (
        <span className="uppercase">{item.label}</span>
      )}
    </Link>
  )
}

export default function Sidebar({ isMobile, isOpen, onClose }) {
  const pathname = usePathname()
  
  const content = (
    <div className="flex flex-col h-full bg-[#080605] border-r border-[var(--glass-border)] w-[240px]">
      {/* Logo Area */}
      <div className="h-14 flex items-center px-4 border-b border-[var(--glass-border)]">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-6 h-6 rounded-sm bg-[var(--accent-forge)] flex items-center justify-center text-black shadow-[0_0_10px_rgba(255,85,0,0.5)]">
            <Cpu size={14} />
          </div>
          <span className="font-bold text-sm tracking-widest uppercase text-white group-hover:text-[var(--accent-forge)] transition-colors">
            OppForge <span className="text-[9px] text-gray-600 align-top">v1.0</span>
          </span>
        </Link>
      </div>

      {/* Nav Items */}
      <div className="flex-1 py-6 px-2 space-y-0.5 overflow-y-auto">
        <div className="text-[9px] font-mono text-gray-600 uppercase mb-2 pl-3">Main Module</div>
        {menuItems.map((item) => (
          <SidebarItem 
            key={item.href} 
            item={item} 
            isActive={pathname === item.href} 
            isCollapsed={false}
          />
        ))}

        <div className="mt-6 text-[9px] font-mono text-gray-600 uppercase mb-2 pl-3">Database</div>
        <SidebarItem 
          item={{ icon: FolderKanban, label: 'Applications', href: '/dashboard/tracker' }}
          isActive={pathname === '/dashboard/tracker'}
        />
      </div>

      {/* User Profile / Footer */}
      <div className="p-3 border-t border-[var(--glass-border)]">
        <div className="flex items-center gap-3 p-2 rounded-sm bg-[#111] border border-white/5">
          <div className="w-8 h-8 rounded-sm bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400">
             JD
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-xs font-bold text-white truncate">John Doe</div>
            <div className="text-[10px] text-[var(--accent-forge)] truncate">Pro Plan Active</div>
          </div>
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
