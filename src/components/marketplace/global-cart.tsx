'use client'

import { useCart } from '@/contexts/cart-context'
import { ShoppingCart } from './shopping-cart'
import { useEffect } from 'react'

export function GlobalCart() {
  const { isOpen, setIsOpen } = useCart()

  // Ensure cart context is properly initialized
  useEffect(() => {
    // This effect ensures the component is properly mounted
    // before trying to access cart context
  }, [])

  try {
    return (
      <ShoppingCart 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    )
  } catch (error) {
    // If there's an error with the cart context, don't render the cart
    console.error('Error rendering GlobalCart:', error)
    return null
  }
}