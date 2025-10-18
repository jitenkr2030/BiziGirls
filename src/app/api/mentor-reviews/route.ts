import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/mentor-reviews - Get mentor reviews and statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mentorId = searchParams.get('mentorId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const rating = searchParams.get('rating') // 1, 2, 3, 4, 5

    if (!mentorId) {
      return NextResponse.json(
        { success: false, error: 'Mentor ID is required' },
        { status: 400 }
      )
    }

    const skip = (page - 1) * limit

    // Build where clause for reviews
    const where: any = {
      revieweeId: mentorId,
      session: {
        mentorship: {
          mentorId: mentorId
        }
      }
    }

    if (rating) {
      where.rating = parseInt(rating)
    }

    // Get reviews and total count
    const [reviews, total] = await Promise.all([
      db.sessionReview.findMany({
        where,
        include: {
          session: {
            include: {
              mentorship: {
                include: {
                  mentee: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      avatar: true
                    }
                  }
                }
              }
            }
          },
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.sessionReview.count({ where })
    ])

    // Get mentor statistics
    const mentorProfile = await db.mentorProfile.findUnique({
      where: { userId: mentorId },
      select: {
        rating: true,
        reviewCount: true
      }
    })

    // Calculate rating distribution
    const ratingDistribution = await db.sessionReview.groupBy({
      by: ['rating'],
      where: {
        revieweeId: mentorId,
        session: {
          mentorship: {
            mentorId: mentorId
          }
        }
      },
      _count: {
        rating: true
      },
      orderBy: {
        rating: 'asc'
      }
    })

    // Calculate average response time (mock data for now)
    const avgResponseTime = '2 hours' // This could be calculated from message response times

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        stats: {
          overallRating: mentorProfile?.rating || 0,
          totalReviews: mentorProfile?.reviewCount || 0,
          ratingDistribution: ratingDistribution.map(item => ({
            rating: item.rating,
            count: item._count.rating
          })),
          avgResponseTime
        },
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching mentor reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch mentor reviews' },
      { status: 500 }
    )
  }
}