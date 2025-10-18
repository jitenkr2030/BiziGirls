'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CreditCard, 
  Lock, 
  Truck, 
  Package, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Smartphone,
  Building,
  MapPin,
  Mail,
  Phone,
  User
} from 'lucide-react'
import Image from 'next/image'
import { useCart } from '@/contexts/cart-context'

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

interface PaymentMethod {
  type: 'card' | 'bank_transfer' | 'wallet'
  card?: {
    number: string
    expiry: string
    cvv: string
    name: string
  }
  bankAccount?: {
    accountNumber: string
    routingNumber: string
    accountHolder: string
  }
}

interface ShippingAddress {
  fullName: string
  address1: string
  address2: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
}

interface BillingAddress {
  fullName: string
  address1: string
  address2: string
  city: string
  state: string
  zipCode: string
  country: string
}

export default function Checkout() {
  const router = useRouter()
  const { cartItems, summary, refreshCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [step, setStep] = useState<'shipping' | 'payment' | 'review' | 'confirmation'>('shipping')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: ''
  })
  
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    fullName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  })
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    type: 'card',
    card: {
      number: '',
      expiry: '',
      cvv: '',
      name: ''
    }
  })
  
  const [sameAsShipping, setSameAsShipping] = useState(true)

  useEffect(() => {
    refreshCart()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getShippingEstimate = () => {
    const hasPhysicalItems = cartItems.some(item => !item.product.isDigital)
    if (!hasPhysicalItems) return 0
    
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

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (sameAsShipping) {
      setBillingAddress({
        fullName: shippingAddress.fullName,
        address1: shippingAddress.address1,
        address2: shippingAddress.address2,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country
      })
    }
    setStep('payment')
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep('review')
  }

  const handlePlaceOrder = async () => {
    try {
      setProcessing(true)
      setError(null)

      // Create payment
      const paymentResponse = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: grandTotal,
          currency: 'USD',
          description: `Marketplace order with ${summary.totalItems} items`,
          metadata: {
            cartItems: cartItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            })),
            shippingAddress,
            billingAddress,
            type: 'marketplace'
          }
        })
      })

      if (!paymentResponse.ok) {
        throw new Error('Failed to create payment')
      }

      const paymentData = await paymentResponse.json()

      // Process payment
      const processResponse = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentId: paymentData.paymentId,
          paymentMethod
        })
      })

      if (!processResponse.ok) {
        throw new Error('Failed to process payment')
      }

      const processData = await processResponse.json()

      if (processData.success) {
        // Create order
        const orderResponse = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            paymentId: paymentData.paymentId,
            items: cartItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            })),
            shippingAddress,
            billingAddress,
            subtotal: summary.totalAmount,
            shipping: shippingEstimate,
            tax: taxEstimate,
            total: grandTotal
          })
        })

        if (orderResponse.ok) {
          setSuccess(true)
          setStep('confirmation')
          // Clear cart
          await fetch('/api/cart', { method: 'DELETE' })
          await refreshCart()
        }
      } else {
        throw new Error(processData.error || 'Payment failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setProcessing(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto py-8">
          <div className="text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">Add some products to continue with checkout.</p>
            <Button onClick={() => router.push('/marketplace')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (success) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
              <p className="text-gray-600 mb-6">
                Thank you for your purchase. You will receive a confirmation email shortly.
              </p>
              <div className="space-y-2">
                <Button onClick={() => router.push('/dashboard')}>
                  View Dashboard
                </Button>
                <Button variant="outline" onClick={() => router.push('/marketplace')}>
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-gray-600">Complete your purchase from women-owned businesses</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[
            { key: 'shipping', label: 'Shipping' },
            { key: 'payment', label: 'Payment' },
            { key: 'review', label: 'Review' }
          ].map((stepItem, index) => (
            <div key={stepItem.key} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                step === stepItem.key 
                  ? 'bg-pink-600 border-pink-600 text-white' 
                  : 'border-gray-300 text-gray-500'
              }`}>
                {step === stepItem.key ? (
                  index + 1
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                step === stepItem.key ? 'text-pink-600' : 'text-gray-500'
              }`}>
                {stepItem.label}
              </span>
              {index < 2 && (
                <div className="w-16 h-0.5 bg-gray-300 ml-4"></div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === 'shipping' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleShippingSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={shippingAddress.fullName}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, fullName: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={shippingAddress.phone}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address1">Address Line 1</Label>
                      <Input
                        id="address1"
                        value={shippingAddress.address1}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, address1: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                      <Input
                        id="address2"
                        value={shippingAddress.address2}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, address2: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          value={shippingAddress.zipCode}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit">
                        Continue to Payment
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {step === 'payment' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Payment Type</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          type="button"
                          variant={paymentMethod.type === 'card' ? 'default' : 'outline'}
                          onClick={() => setPaymentMethod(prev => ({ ...prev, type: 'card' }))}
                          className="flex flex-col items-center py-4"
                        >
                          <CreditCard className="h-6 w-6 mb-1" />
                          <span className="text-xs">Credit Card</span>
                        </Button>
                        <Button
                          type="button"
                          variant={paymentMethod.type === 'bank_transfer' ? 'default' : 'outline'}
                          onClick={() => setPaymentMethod(prev => ({ ...prev, type: 'bank_transfer' }))}
                          className="flex flex-col items-center py-4"
                        >
                          <Building className="h-6 w-6 mb-1" />
                          <span className="text-xs">Bank Transfer</span>
                        </Button>
                        <Button
                          type="button"
                          variant={paymentMethod.type === 'wallet' ? 'default' : 'outline'}
                          onClick={() => setPaymentMethod(prev => ({ ...prev, type: 'wallet' }))}
                          className="flex flex-col items-center py-4"
                        >
                          <Smartphone className="h-6 w-6 mb-1" />
                          <span className="text-xs">Digital Wallet</span>
                        </Button>
                      </div>
                    </div>

                    {paymentMethod.type === 'card' && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="cardName">Cardholder Name</Label>
                          <Input
                            id="cardName"
                            value={paymentMethod.card?.name || ''}
                            onChange={(e) => setPaymentMethod(prev => ({
                              ...prev,
                              card: { ...prev.card!, name: e.target.value }
                            }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={paymentMethod.card?.number || ''}
                            onChange={(e) => setPaymentMethod(prev => ({
                              ...prev,
                              card: { ...prev.card!, number: e.target.value }
                            }))}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <Input
                              id="expiry"
                              placeholder="MM/YY"
                              value={paymentMethod.card?.expiry || ''}
                              onChange={(e) => setPaymentMethod(prev => ({
                                ...prev,
                                card: { ...prev.card!, expiry: e.target.value }
                              }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="cvv">CVV</Label>
                            <Input
                              id="cvv"
                              placeholder="123"
                              value={paymentMethod.card?.cvv || ''}
                              onChange={(e) => setPaymentMethod(prev => ({
                                ...prev,
                                card: { ...prev.card!, cvv: e.target.value }
                              }))}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setStep('shipping')}
                      >
                        Back to Shipping
                      </Button>
                      <Button type="submit">
                        Review Order
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {step === 'review' && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Order Items */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Order Items</h3>
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <div className="w-16 h-16 relative flex-shrink-0">
                          {item.product.images[0] ? (
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              fill
                              className="object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product.name}</h4>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h3 className="font-medium mb-2">Shipping Address</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium">{shippingAddress.fullName}</p>
                      <p className="text-sm">{shippingAddress.address1}</p>
                      {shippingAddress.address2 && <p className="text-sm">{shippingAddress.address2}</p>}
                      <p className="text-sm">{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                      <p className="text-sm">{shippingAddress.phone}</p>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h3 className="font-medium mb-2">Payment Method</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {paymentMethod.type === 'card' && (
                        <p className="text-sm">
                          Credit Card ending in {paymentMethod.card?.number?.slice(-4) || '****'}
                        </p>
                      )}
                      {paymentMethod.type === 'bank_transfer' && (
                        <p className="text-sm">Bank Transfer</p>
                      )}
                      {paymentMethod.type === 'wallet' && (
                        <p className="text-sm">Digital Wallet</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setStep('payment')}
                    >
                      Back to Payment
                    </Button>
                    <Button 
                      onClick={handlePlaceOrder}
                      disabled={processing}
                    >
                      {processing ? 'Processing...' : 'Place Order'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="flex-1 mr-2">
                        {item.product.name} × {item.quantity}
                      </span>
                      <span>{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(summary.totalAmount)}</span>
                  </div>
                  
                  {shippingEstimate > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>{formatCurrency(shippingEstimate)}</span>
                    </div>
                  )}
                  
                  {taxEstimate > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>{formatCurrency(taxEstimate)}</span>
                    </div>
                  )}
                </div>

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

                <div className="flex items-center space-x-1 text-gray-500 text-xs">
                  <Lock className="h-3 w-3" />
                  <span>Secure checkout powered by GirlsPreneur</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}