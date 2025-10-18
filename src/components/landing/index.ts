import React from 'react'

export { HeroSection } from './hero-section'
export { FeaturesSection } from './features-section'
export { TestimonialsSection } from './testimonials-section'
export { CTASection } from './cta-section'
export { Footer } from '../layout/footer'
export { Navbar } from './navbar'

export function LandingPage() {
  return React.createElement('div', { className: 'min-h-screen' },
    React.createElement(Navbar),
    React.createElement(HeroSection),
    React.createElement('div', { id: 'features' },
      React.createElement(FeaturesSection)
    ),
    React.createElement('div', { id: 'testimonials' },
      React.createElement(TestimonialsSection)
    ),
    React.createElement('div', { id: 'pricing' },
      React.createElement(CTASection)
    ),
    React.createElement(Footer)
  )
}