'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider'

interface CartItem {
  id: string
  productId: string
  quantity: number
  price: number
  subtotal: number
  product: {
    id: string
    name: string
    images: string[]
    isDigital: boolean
    inventory: number
    userId: string
  }
}

interface CartSummary {
  totalItems: number
  totalAmount: number
  itemCount: number
}

interface CartContextType {
  cartItems: CartItem[]
  summary: CartSummary
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  addToCart: (productId: string, quantity?: number) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
  loading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [summary, setSummary] = useState<CartSummary>({ totalItems: 0, totalAmount: 0, itemCount: 0 })
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const refreshCart = async () => {
    // Don't fetch cart if user is not authenticated or auth is still loading
    if (!user || authLoading) return
    
    try {
      setLoading(true)
      const response = await fetch('/api/cart')
      if (response.ok) {
        const data = await response.json()
        setCartItems(data.items)
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
      // Reset cart on error
      setCartItems([])
      setSummary({ totalItems: 0, totalAmount: 0, itemCount: 0 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && !authLoading) {
      refreshCart()
    } else {
      // Reset cart when user is not authenticated
      setCartItems([])
      setSummary({ totalItems: 0, totalAmount: 0, itemCount: 0 })
    }
  }, [user, authLoading])

  const addToCart = async (productId: string, quantity = 1) => {
    // Don't allow adding to cart if user is not authenticated
    if (!user) return
    
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId, quantity })
      })
      
      if (response.ok) {
        await refreshCart()
        // Optionally show success message or open cart
        setIsOpen(true)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return
    
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity })
      })
      
      if (response.ok) {
        await refreshCart()
      }
    } catch (error) {
      console.error('Error updating cart item:', error)
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await refreshCart()
      }
    } catch (error) {
      console.error('Error removing cart item:', error)
    }
  }

  const clearCart = async () => {
    try {
      // Remove all items from cart
      await Promise.all(cartItems.map(item => removeItem(item.id)))
    } catch (error) {
      console.error('Error clearing cart:', error)
    }
  }

  const value: CartContextType = {
    cartItems,
    summary,
    isOpen,
    setIsOpen,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
    loading
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

// Cart icon component for use in navigation
export function CartIcon() {
  const { user, isLoading: authLoading } = useAuth()
  const { summary, setIsOpen } = useCart()
  
  // Don't show cart icon if user is not authenticated
  if (!user || authLoading) return null
  
  return (
    <button
      onClick={() => setIsOpen(true)}
      className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
    >
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      {summary.totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {summary.totalItems > 99 ? '99+' : summary.totalItems}
        </span>
      )}
    </button>
  )
}