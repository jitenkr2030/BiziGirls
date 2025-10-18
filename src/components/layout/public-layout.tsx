'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/auth-provider'
import { useRouter } from 'next/navigation'
import { 
  Menu, 
  X, 
  Home, 
  User, 
  LogIn,
  ArrowRight
} from 'lucide-react'

interface PublicLayoutProps {
  children: React.ReactNode
  showAuthPrompt?: boolean
}

export function PublicLayout({ children, showAuthPrompt = false }: PublicLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'About', href: '/about', icon: User },
    { name: 'Courses', href: '/courses', icon: Home },
    { name: 'Mentorship', href: '/mentorship', icon: User },
    { name: 'Funding', href: '/funding', icon: Home },
    { name: 'Business Launch', href: '/business-launch', icon: User },
    { name: 'Networking', href: '/networking', icon: Home },
    { name: 'AI Assistant', href: '/ai-assistant', icon: User },
    { name: 'Contact', href: '/contact', icon: Home },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">GP</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">GirlsPreneur</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="p-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
              {!user && !authLoading && (
                <div className="pt-4 border-t">
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    onClick={() => router.push('/auth/login')}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Header */}
      <header className="sticky top-0 z-30 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">GP</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">GirlsPreneur</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigation.slice(0, 6).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {!authLoading && (
              <>
                {user ? (
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/dashboard')}
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" onClick={() => router.push('/auth/login')}>
                      Sign In
                    </Button>
                    <Button 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      onClick={() => router.push('/auth/register')}
                    >
                      Get Started
                    </Button>
                  </div>
                )}
              </>
            )}
            
            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="min-h-screen">
        {children}
        
        {/* Auth prompt for unauthenticated users */}
        {showAuthPrompt && !user && !authLoading && (
          <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div>
                <p className="font-medium">Want to access all features?</p>
                <p className="text-sm opacity-90">Sign up to unlock the full GirlsPreneur experience</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="secondary" 
                  onClick={() => router.push('/auth/login')}
                  className="bg-white text-purple-600 hover:bg-gray-100"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => router.push('/auth/register')}
                  className="bg-white text-purple-600 hover:bg-gray-100"
                >
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}