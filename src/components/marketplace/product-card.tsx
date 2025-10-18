'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Eye,
  MapPin,
  Package,
  ExternalLink
} from 'lucide-react'
import Image from 'next/image'

interface ProductCardProps {
  product: {
    id: string
    name: string
    description: string
    price: number
    images: string[]
    category: string
    tags: string[]
    inventory: number
    isDigital: boolean
    isFeatured: boolean
    viewCount: number
    salesCount: number
    rating: number
    reviewCount: number
    vendorName: string
    vendorId: string
  }
  onAddToCart?: (productId: string) => void
  onViewDetails?: (productId: string) => void
  onToggleWishlist?: (productId: string) => void
  isInWishlist?: boolean
  showVendor?: boolean
}

export function ProductCard({
  product,
  onAddToCart,
  onViewDetails,
  onToggleWishlist,
  isInWishlist = false,
  showVendor = true
}: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleAddToCart = async () => {
    if (!onAddToCart) return
    
    setIsAddingToCart(true)
    try {
      await onAddToCart(product.id)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const getStockStatus = () => {
    if (product.isDigital) return { text: 'Digital Product', color: 'bg-blue-100 text-blue-800' }
    if (product.inventory === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' }
    if (product.inventory < 5) return { text: `Only ${product.inventory} left`, color: 'bg-orange-100 text-orange-800' }
    return { text: 'In Stock', color: 'bg-green-100 text-green-800' }
  }

  const stockStatus = getStockStatus()
  const mainImage = product.images[0] || '/api/placeholder/300/200'

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 relative">
      {/* Featured Badge */}
      {product.isFeatured && (
        <Badge className="absolute top-2 left-2 z-10 bg-yellow-500 text-white">
          Featured
        </Badge>
      )}
      
      {/* Wishlist Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white"
        onClick={() => onToggleWishlist?.(product.id)}
      >
        <Heart 
          className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
        />
      </Button>

      {/* Product Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
        ) : (
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        )}
        
        {/* Stock Status Overlay */}
        <div className="absolute bottom-2 left-2">
          <Badge className={stockStatus.color} variant="secondary">
            {stockStatus.text}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Product Info */}
        <div className="space-y-2">
          <div>
            <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            {showVendor && (
              <p className="text-xs text-gray-500 flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {product.vendorName}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.isDigital && (
              <Badge variant="outline" className="text-xs">
                Digital
              </Badge>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium ml-1">
                {product.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              ({product.reviewCount} reviews)
            </span>
          </div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {product.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{product.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{product.viewCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Package className="h-3 w-3" />
              <span>{product.salesCount} sold</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 space-y-2">
          <Button 
            className="w-full" 
            size="sm"
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.inventory === 0}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full" 
            size="sm"
            onClick={() => onViewDetails?.(product.id)}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}