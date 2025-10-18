'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  X,
  ArrowRight,
  CreditCard,
  Truck,
  Package,
  AlertCircle
} from 'lucide-react'
import Image from 'next/image'

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

interface ShoppingCartProps {
  isOpen: boolean
  onClose: () => void
  onCheckout?: () => void
}

export function ShoppingCart({ isOpen, onClose, onCheckout }: ShoppingCartProps) {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [summary, setSummary] = useState<CartSummary>({ totalItems: 0, totalAmount: 0, itemCount: 0 })
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchCart()
    }
  }, [isOpen])

  const fetchCart = async () => {
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
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    
    setUpdating(itemId)
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: newQuantity })
      })
      
      if (response.ok) {
        await fetchCart()
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
    } finally {
      setUpdating(null)
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchCart()
      }
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getShippingEstimate = () => {
    const hasPhysicalItems = cartItems.some(item => !item.product.isDigital)
    if (!hasPhysicalItems) return 0
    
    // Simple shipping calculation based on total
    if (summary.totalAmount >= 50) return 0
    if (summary.totalAmount >= 25) return 5.99
    return 9.99
  }

  const getTaxEstimate = () => {
    return summary.totalAmount * 0.08 // 8% tax
  }

  const shippingEstimate = getShippingEstimate()
  const taxEstimate = getTaxEstimate()
  const grandTotal = summary.totalAmount + shippingEstimate + taxEstimate

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Shopping Cart</h2>
            {summary.totalItems > 0 && (
              <Badge variant="secondary">{summary.totalItems}</Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex space-x-4">
                    <div className="w-20 h-20 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-500 mb-6">
                Add some products from women-owned businesses to get started!
              </p>
              <Button onClick={onClose}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex space-x-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 flex-shrink-0 relative">
                        {item.product.images[0] ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        
                        {/* Digital Badge */}
                        {item.product.isDigital && (
                          <Badge className="absolute top-1 left-1 text-xs bg-blue-500">
                            Digital
                          </Badge>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 space-y-2">
                        <div>
                          <h3 className="font-medium text-sm line-clamp-2">
                            {item.product.name}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-lg font-bold text-primary">
                              {formatCurrency(item.price)}
                            </span>
                            {item.quantity > 1 && (
                              <span className="text-sm text-gray-500">
                                × {item.quantity}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={updating === item.id || item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const newQuantity = parseInt(e.target.value)
                                if (newQuantity > 0) {
                                  updateQuantity(item.id, newQuantity)
                                }
                              }}
                              className="w-16 h-8 text-center"
                              min="1"
                              max={item.product.isDigital ? 999 : item.product.inventory}
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={updating === item.id || (!item.product.isDigital && item.quantity >= item.product.inventory)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {formatCurrency(item.subtotal)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-700"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Stock Warning */}
                        {!item.product.isDigital && item.product.inventory < 5 && (
                          <div className="flex items-center space-x-1 text-orange-600 text-xs">
                            <AlertCircle className="h-3 w-3" />
                            <span>Only {item.product.inventory} left in stock</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {cartItems.length > 0 && (
          <div className="border-t p-4 space-y-4">
            {/* Order Summary */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({summary.totalItems} items)</span>
                  <span>{formatCurrency(summary.totalAmount)}</span>
                </div>
                
                {shippingEstimate > 0 && (
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Truck className="h-4 w-4" />
                      <span>Shipping</span>
                    </div>
                    <span>{formatCurrency(shippingEstimate)}</span>
                  </div>
                )}
                
                {taxEstimate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>{formatCurrency(taxEstimate)}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span className="text-lg">{formatCurrency(grandTotal)}</span>
                </div>
                
                {shippingEstimate === 0 && summary.totalAmount > 0 && (
                  <div className="flex items-center space-x-1 text-green-600 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    <span>Free shipping on orders over $50</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => {
                  onClose()
                  router.push('/checkout')
                }}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Proceed to Checkout
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={onClose}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}