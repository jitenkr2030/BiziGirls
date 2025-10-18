import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { validateBody, handleValidationError } from '@/lib/validation-middleware'

// GET /api/session-reviews - Get session reviews
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sessionId = searchParams.get('sessionId')
    const reviewerId = searchParams.get('reviewerId')
    const revieweeId = searchParams.get('revieweeId')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (sessionId) where.sessionId = sessionId
    if (reviewerId) where.reviewerId = reviewerId
    if (revieweeId) where.revieweeId = revieweeId

    // If no specific filters, only show reviews where user is involved
    if (!sessionId && !reviewerId && !revieweeId) {
      where.OR = [
        { reviewerId: user.id },
        { revieweeId: user.id }
      ]
    }

    const [reviews, total] = await Promise.all([
      db.sessionReview.findMany({
        where,
        include: {
          session: {
            include: {
              mentorship: {
                include: {
                  mentor: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      avatar: true
                    }
                  },
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
          },
          reviewee: {
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

    return NextResponse.json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching session reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch session reviews' },
      { status: 500 }
    )
  }
}

// POST /api/session-reviews - Create a session review
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let data
    try {
      data = await validateBody('session-review', 'create')(request)
    } catch (error) {
      const validationError = handleValidationError(error)
      return NextResponse.json(validationError, { status: 400 })
    }

    // Check if session exists and user has permission
    const session = await db.mentorshipSession.findUnique({
      where: { id: data.sessionId },
      include: {
        mentorship: {
          include: {
            mentor: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            },
            mentee: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    })

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      )
    }

    // Check if user is part of this mentorship
    if (session.mentorship.mentorId !== user.id && session.mentorship.menteeId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Check if session is completed
    if (session.status !== 'completed') {
      return NextResponse.json(
        { success: false, error: 'Only completed sessions can be reviewed' },
        { status: 400 }
      )
    }

    // Determine reviewee (the other person in the mentorship)
    const revieweeId = session.mentorship.mentorId === user.id 
      ? session.mentorship.menteeId 
      : session.mentorship.mentorId

    // Check if user already reviewed this session
    const existingReview = await db.sessionReview.findUnique({
      where: {
        sessionId_reviewerId: {
          sessionId: data.sessionId,
          reviewerId: user.id
        }
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this session' },
        { status: 400 }
      )
    }

    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Create review
    const review = await db.sessionReview.create({
      data: {
        sessionId: data.sessionId,
        reviewerId: user.id,
        revieweeId,
        rating: data.rating,
        comment: data.comment,
        anonymous: data.anonymous ?? false
      },
      include: {
        session: {
          include: {
            mentorship: {
              include: {
                mentor: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true
                  }
                },
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
        },
        reviewee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    })

    // Update mentor profile rating
    if (revieweeId === session.mentorship.mentorId) {
      const mentorProfile = await db.mentorProfile.findUnique({
        where: { userId: revieweeId }
      })

      if (mentorProfile) {
        const allReviews = await db.sessionReview.findMany({
          where: {
            revieweeId,
            session: {
              mentorship: {
                mentorId: revieweeId
              }
            }
          }
        })

        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0)
        const averageRating = totalRating / allReviews.length

        await db.mentorProfile.update({
          where: { userId: revieweeId },
          data: {
            rating: averageRating,
            reviewCount: allReviews.length
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Review submitted successfully'
    })
  } catch (error) {
    console.error('Error creating session review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}