'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  Clock,
  User,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import Image from 'next/image'

interface ProductReview {
  id: string
  rating: number
  comment: string
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    avatar: string
  }
}

interface ProductReviewsProps {
  productId: string
  canReview?: boolean
  onReviewSubmitted?: () => void
}

export function ProductReviews({ productId, canReview = false, onReviewSubmitted }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [userComment, setUserComment] = useState('')
  const [hoveredRating, setHoveredRating] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchReviews()
  }, [currentPage])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '5'
      })

      const response = await fetch(`/api/products/${productId}/reviews?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.data.reviews)
        setAverageRating(data.data.averageRating)
        setTotalReviews(data.data.totalReviews)
        setTotalPages(data.data.pagination.pages)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (userRating === 0) return

    try {
      setSubmitting(true)
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating: userRating,
          comment: userComment
        })
      })

      if (response.ok) {
        setShowReviewForm(false)
        setUserRating(0)
        setUserComment('')
        fetchReviews()
        onReviewSubmitted?.()
      }
    } catch (error) {
      console.error('Error submitting review:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating: number, size = 'normal') => {
    const sizeClass = size === 'small' ? 'h-4 w-4' : 'h-5 w-5'
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const renderRatingInput = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setUserRating(star)}
            className="p-1"
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                star <= (hoveredRating || userRating)
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              }`}
              fill={star <= (hoveredRating || userRating) ? 'currentColor' : 'none'}
            />
          </button>
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]
    reviews.forEach(review => {
      distribution[5 - review.rating]++
    })
    return distribution
  }

  const ratingDistribution = getRatingDistribution()

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
              <div>
                {renderStars(Math.round(averageRating))}
                <div className="text-sm text-gray-600">{totalReviews} reviews</div>
              </div>
            </div>
          </div>
        </div>
        {canReview && (
          <Button onClick={() => setShowReviewForm(true)}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Write a Review
          </Button>
        )}
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating, index) => {
              const count = ratingDistribution[index]
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
              
              return (
                <div key={rating} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-16">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 w-12 text-right">
                    {count}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      {showReviewForm && (
        <Card>
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Rating <span className="text-red-500">*</span>
                </label>
                {renderRatingInput()}
                {userRating === 0 && (
                  <p className="text-sm text-red-500 mt-1">Please select a rating</p>
                )}
              </div>

              <div>
                <label htmlFor="comment" className="block text-sm font-medium mb-2">
                  Comment
                </label>
                <Textarea
                  id="comment"
                  placeholder="Share your experience with this product..."
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={submitting || userRating === 0}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowReviewForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="space-y-1">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No reviews yet
              </h3>
              <p className="text-gray-500 mb-6">
                Be the first to review this product!
              </p>
              {canReview && (
                <Button onClick={() => setShowReviewForm(true)}>
                  Write a Review
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Review Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {review.user.avatar ? (
                        <Image
                          src={review.user.avatar}
                          alt={review.user.firstName}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium">
                          {review.user.firstName} {review.user.lastName}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          {renderStars(review.rating, 'small')}
                          <span>•</span>
                          <span>{formatDate(review.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Verified Purchase</span>
                    </div>
                  </div>

                  {/* Review Content */}
                  {review.comment && (
                    <div className="text-gray-700 leading-relaxed">
                      {review.comment}
                    </div>
                  )}

                  {/* Review Actions */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <button className="flex items-center space-x-1 hover:text-gray-700 transition-colors">
                      <ThumbsUp className="h-4 w-4" />
                      <span>Helpful</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}