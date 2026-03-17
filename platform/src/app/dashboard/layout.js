'use client'

import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { LoginModal } from '@/components/auth/LoginModal'
import { useAuth } from '@/components/providers/AuthProvider'

function DashboardContent({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { loginModalOpen, closeLoginModal } = useAuth()
  const pathname = usePathname()
  const isChatPage = pathname === '/dashboard/chat'

  return (
    <div className="flex h-screen bg-[var(--bg-canvas)] overflow-hidden">
      {/* Desktop Sidebar */}
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        {isChatPage ? (
          /* Chat: no padding, fills remaining space */
          <main className="flex-1 overflow-hidden relative bg-[var(--bg-canvas)]">
            {children}
          </main>
        ) : (
          /* Regular pages: scrollable with padding */
          <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-[var(--bg-canvas)]">
            <div className="w-full max-w-[1400px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 pb-24">
              {children}
            </div>
          </main>
        )}
      </div>

      {/* Global Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={closeLoginModal}
      />
    </div>
  )
}

export default function DashboardLayout({ children }) {
  return <DashboardContent>{children}</DashboardContent>
}
