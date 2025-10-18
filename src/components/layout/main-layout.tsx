'use client'

import { useState } from 'react'
import { Header } from './header'
import { Sidebar, MobileMenuButton } from './sidebar'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between px-4 py-3">
            <MobileMenuButton onClick={() => setSidebarOpen(true)} />
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">GP</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">GirlsPreneur</span>
            </div>
            <div className="w-8" /> {/* Spacer for alignment */}
          </div>
        </div>

        {/* Desktop header */}
        <Header />

        {/* Main content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}