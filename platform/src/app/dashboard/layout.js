'use client'

import React, { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { LoginModal } from '@/components/auth/LoginModal'
import { useAuth } from '@/components/providers/AuthProvider'

function DashboardContent({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { loginModalOpen, closeLoginModal } = useAuth()

  return (
    <div className="flex h-screen bg-[var(--bg-espresso)] overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        isMobile={false} 
        isOpen={true} 
      />
      
      {/* Mobile Sidebar */}
      <Sidebar 
        isMobile={true} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-[var(--bg-espresso)] scroll-smooth px-3 py-4 sm:px-5 sm:py-5 md:px-8 md:py-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#1A1410] via-transparent to-transparent opacity-50 pointer-events-none" />
          <div className="w-full max-w-[1920px] mx-auto relative z-10 pb-24">
            {children}
          </div>
        </main>
      </div>

      {/* Global Login Modal — controlled by AuthContext */}
      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={closeLoginModal}
        triggerText="Access The Forge"
      />
    </div>
  )
}

export default function DashboardLayout({ children }) {
  return <DashboardContent>{children}</DashboardContent>
}
