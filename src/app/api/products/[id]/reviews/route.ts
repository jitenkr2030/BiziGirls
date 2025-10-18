import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

// GET /api/products/[id]/reviews - Get reviews for a product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const skip = (page - 1) * limit

    const [reviews, total, averageRating] = await Promise.all([
      db.productReview.findMany({
        where: { productId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      db.productReview.count({ where: { productId } }),
      db.productReview.aggregate({
        where: { productId },
        _avg: {
          rating: true
        },
        _count: {
          rating: true
        }
      })
    ])

    const pages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        averageRating: averageRating._avg.rating || 0,
        totalReviews: averageRating._count.rating,
        pagination: {
          page,
          limit,
          total,
          pages
        }
      }
    })

  } catch (error) {
    console.error('Error fetching product reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST /api/products/[id]/reviews - Create a new review
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const productId = params.id
    const { rating, comment } = await request.json()

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = await db.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if user has already reviewed this product
    const existingReview = await db.productReview.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId
        }
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this product' },
        { status: 400 }
      )
    }

    // Check if user has purchased this product
    const hasPurchased = await db.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: user.id,
          status: 'delivered'
        }
      }
    })

    if (!hasPurchased) {
      return NextResponse.json(
        { success: false, error: 'You must purchase this product before reviewing' },
        { status: 403 }
      )
    }

    // Create review
    const review = await db.productReview.create({
      data: {
        userId: user.id,
        productId,
        rating,
        comment
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    })

    // Update product rating
    const ratingStats = await db.productReview.aggregate({
      where: { productId },
      _avg: {
        rating: true
      },
      _count: {
        rating: true
      }
    })

    await db.product.update({
      where: { id: productId },
      data: {
        rating: ratingStats._avg.rating || 0,
        reviewCount: ratingStats._count.rating
      }
    })

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Review created successfully'
    })

  } catch (error) {
    console.error('Error creating product review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    )
  }
}