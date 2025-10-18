'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { 
  Navbar, 
  HeroSection, 
  FeaturesSection, 
  TestimonialsSection, 
  CTASection, 
  Footer 
} from '@/components/landing'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  useEffect(() => {
    // Wait for auth to finish loading
    if (!authLoading) {
      if (user) {
        // If user is authenticated, redirect to dashboard
        router.push('/dashboard')
      } else {
        // No user, show landing page
        setIsLoading(false)
      }
    }
  }, [user, authLoading, router])

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <div id="features">
        <FeaturesSection />
      </div>
      <div id="testimonials">
        <TestimonialsSection />
      </div>
      <div id="pricing">
        <CTASection />
      </div>
      <Footer />
    </div>
  )
}