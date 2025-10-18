'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  LayoutDashboard, 
  User,
  Rocket, 
  Users, 
  DollarSign, 
  GraduationCap, 
  MessageSquare, 
  ShoppingCart, 
  FileText, 
  Star, 
  Bot, 
  Languages, 
  TrendingUp, 
  Calculator, 
  Heart, 
  Gift,
  Menu,
  X
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Profile Settings', href: '/profile', icon: Users },
  { name: 'Business Launch', href: '/business-launch', icon: Rocket },
  { name: 'Mentorship', href: '/mentorship', icon: Users },
  { name: 'Funding & Grants', href: '/funding', icon: DollarSign },
  { name: 'Skill Development', href: '/courses', icon: GraduationCap },
  { name: 'Networking', href: '/networking', icon: MessageSquare },
  { name: 'Marketplace', href: '/marketplace', icon: ShoppingCart },
  { name: 'Legal & Compliance', href: '/legal', icon: FileText },
  { name: 'Success Stories', href: '/success-stories', icon: Star },
  { name: 'AI Assistant', href: '/ai-assistant', icon: Bot },
  { name: 'English & Personality', href: '/english-development', icon: Languages },
  { name: 'Marketing Tools', href: '/marketing', icon: TrendingUp },
  { name: 'Financial Analytics', href: '/analytics', icon: Calculator },
  { name: 'Women Resources', href: '/women-resources', icon: Heart },
  { name: 'Affiliate Program', href: '/affiliate', icon: Gift },
]

interface SidebarProps {
  className?: string
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ className, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">GP</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">GirlsPreneur</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden" 
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-4 py-6">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                    onClick={() => onClose()}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Empowering Women Entrepreneurs Worldwide
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

interface MobileMenuButtonProps {
  onClick: () => void
}

export function MobileMenuButton({ onClick }: MobileMenuButtonProps) {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="lg:hidden"
      onClick={onClick}
    >
      <Menu className="h-5 w-5" />
    </Button>
  )
}