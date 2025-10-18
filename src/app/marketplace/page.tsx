'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductList } from '@/components/marketplace/product-list'
import { useCart } from '@/contexts/cart-context'
import { 
  ShoppingCart, 
  Search, 
  Star, 
  Heart, 
  Filter, 
  TrendingUp,
  Package,
  DollarSign,
  Users,
  Calendar,
  MapPin,
  MessageCircle,
  Eye,
  Plus,
  Store,
  Grid3X3,
  List
} from 'lucide-react'

interface MarketplaceStats {
  activeBusinesses: number
  productsListed: number
  monthlyRevenue: number
  successRate: number
}

interface FeaturedBusiness {
  id: string
  name: string
  category: string
  description: string
  rating: number
  reviewCount: number
  location: string
  isFeatured: boolean
  isNew: boolean
  tags: string[]
}

export default function Marketplace() {
  const [stats, setStats] = useState<MarketplaceStats>({
    activeBusinesses: 1247,
    productsListed: 8934,
    monthlyRevenue: 284000,
    successRate: 94
  })
  
  const [featuredBusinesses, setFeaturedBusinesses] = useState<FeaturedBusiness[]>([])
  const [wishlistItems, setWishlistItems] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  useEffect(() => {
    fetchFeaturedBusinesses()
    fetchWishlistItems()
  }, [])

  const fetchFeaturedBusinesses = async () => {
    try {
      setLoading(true)
      // For now, using mock data. In a real app, this would fetch from API
      setFeaturedBusinesses([
        {
          id: '1',
          name: 'EcoChic Boutique',
          category: 'Fashion & Apparel',
          description: 'Handcrafted sustainable clothing made from organic materials. Empowering local women artisans.',
          rating: 4.9,
          reviewCount: 234,
          location: 'San Francisco, CA',
          isFeatured: true,
          isNew: false,
          tags: ['Eco-Friendly', 'Handmade', 'Sustainable']
        },
        {
          id: '2',
          name: 'TechHer Solutions',
          category: 'Technology',
          description: 'Custom web development and digital solutions for women-led businesses.',
          rating: 5.0,
          reviewCount: 89,
          location: 'Austin, TX',
          isFeatured: true,
          isNew: false,
          tags: ['B2B', 'Web Development', 'Digital Solutions']
        },
        {
          id: '3',
          name: 'Bloom & Co.',
          category: 'Organic Skincare',
          description: 'Natural skincare products handmade with love. Cruelty-free and sustainable.',
          rating: 4.8,
          reviewCount: 156,
          location: 'Portland, OR',
          isFeatured: true,
          isNew: true,
          tags: ['Organic', 'Skincare', 'Cruelty-Free']
        }
      ])
    } catch (error) {
      console.error('Error fetching featured businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWishlistItems = async () => {
    try {
      // In a real app, this would fetch from user's wishlist
      setWishlistItems([])
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    }
  }

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId)
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  const handleViewDetails = (productId: string) => {
    // Navigate to product details page
    console.log('Viewing product details:', productId)
  }

  const handleToggleWishlist = async (productId: string) => {
    try {
      if (wishlistItems.includes(productId)) {
        setWishlistItems(wishlistItems.filter(id => id !== productId))
      } else {
        setWishlistItems([...wishlistItems, productId])
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Women's Business Marketplace
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Discover and support products and services from women-owned businesses
            </p>
          </div>
          <div className="flex space-x-2">
            <Button className="bg-pink-600 hover:bg-pink-700">
              <Store className="mr-2 h-4 w-4" />
              Sell Your Products
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Businesses</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeBusinesses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products Listed</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.productsListed.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across 25 categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                Generated for women-owned businesses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate}%</div>
              <p className="text-xs text-muted-foreground">
                Customer satisfaction
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Marketplace Tabs */}
        <Tabs defaultValue="featured" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="featured">Featured Businesses</TabsTrigger>
            <TabsTrigger value="products">All Products</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="new">New Arrivals</TabsTrigger>
          </TabsList>

          <TabsContent value="featured" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBusinesses.map((business) => (
                <Card key={business.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gradient-to-r from-pink-400 to-purple-500 relative">
                    <Badge className="absolute top-4 left-4 bg-white text-pink-600">
                      {business.isFeatured ? 'Featured' : 'New'}
                    </Badge>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg">{business.name}</h3>
                      <p className="text-white/80 text-sm">{business.category}</p>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{business.rating}</span>
                        <span className="text-sm text-gray-500">({business.reviewCount})</span>
                      </div>
                      <Badge variant="secondary">{business.tags[0]}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {business.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <MapPin className="h-4 w-4" />
                        <span>{business.location}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button size="sm">View Shop</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <ProductList
              onAddToCart={handleAddToCart}
              onViewDetails={handleViewDetails}
              onToggleWishlist={handleToggleWishlist}
              wishlistItems={wishlistItems}
            />
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Service Cards */}
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Card key={item} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center">
                        <MessageCircle className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">Professional Service {item}</h3>
                        <p className="text-sm text-gray-500">Service Provider</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      High-quality professional services tailored for women entrepreneurs and businesses.
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold">$75<span className="text-sm font-normal text-gray-500">/hr</span></span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">4.8</span>
                        <span className="text-sm text-gray-500">(45)</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" className="flex-1">
                        Learn More
                      </Button>
                      <Button className="flex-1">
                        Book Service
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="new" className="space-y-6">
            <ProductList
              onAddToCart={handleAddToCart}
              onViewDetails={handleViewDetails}
              onToggleWishlist={handleToggleWishlist}
              wishlistItems={wishlistItems}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}