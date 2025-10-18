import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/mentor-stats/[mentorId] - Get comprehensive mentor statistics
export async function GET(
  request: NextRequest,
  { params }: { params: { mentorId: string } }
) {
  try {
    const mentorId = params.mentorId

    // Get mentor profile
    const mentorProfile = await db.mentorProfile.findUnique({
      where: { userId: mentorId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
            email: true
          }
        }
      }
    })

    if (!mentorProfile) {
      return NextResponse.json(
        { success: false, error: 'Mentor profile not found' },
        { status: 404 }
      )
    }

    // Get mentorship statistics
    const [totalMentorships, activeMentorships, completedMentorships, cancelledMentorships] = await Promise.all([
      db.mentorship.count({
        where: { mentorId }
      }),
      db.mentorship.count({
        where: { 
          mentorId,
          status: 'accepted'
        }
      }),
      db.mentorship.count({
        where: { 
          mentorId,
          status: 'completed'
        }
      }),
      db.mentorship.count({
        where: { 
          mentorId,
          status: 'cancelled'
        }
      })
    ])

    // Get session statistics
    const [totalSessions, completedSessions, upcomingSessions] = await Promise.all([
      db.mentorshipSession.count({
        where: {
          mentorship: {
            mentorId
          }
        }
      }),
      db.mentorshipSession.count({
        where: {
          mentorship: {
            mentorId
          },
          status: 'completed'
        }
      }),
      db.mentorshipSession.count({
        where: {
          mentorship: {
            mentorId
          },
          status: 'scheduled'
        }
      })
    ])

    // Get review statistics
    const reviews = await db.sessionReview.findMany({
      where: {
        revieweeId: mentorId,
        session: {
          mentorship: {
            mentorId
          }
        }
      },
      select: {
        rating: true,
        comment: true,
        createdAt: true
      }
    })

    const totalReviews = reviews.length
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0

    // Calculate rating distribution
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: reviews.filter(r => r.rating === rating).length,
      percentage: totalReviews > 0 ? (reviews.filter(r => r.rating === rating).length / totalReviews) * 100 : 0
    }))

    // Calculate completion rate
    const completionRate = totalMentorships > 0 
      ? (completedMentorships / totalMentorships) * 100 
      : 0

    // Calculate average session duration (mock data)
    const avgSessionDuration = '60 minutes'

    // Get recent activity
    const recentSessions = await db.mentorshipSession.findMany({
      where: {
        mentorship: {
          mentorId
        }
      },
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
      },
      orderBy: { startTime: 'desc' },
      take: 5
    })

    const recentReviews = await db.sessionReview.findMany({
      where: {
        revieweeId: mentorId,
        session: {
          mentorship: {
            mentorId
          }
        }
      },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // Calculate monthly stats for the last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyStats = await db.mentorshipSession.groupBy({
      by: ['status'],
      where: {
        mentorship: {
          mentorId
        },
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      _count: {
        status: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        mentor: {
          id: mentorId,
          firstName: mentorProfile.user.firstName,
          lastName: mentorProfile.user.lastName,
          avatar: mentorProfile.user.avatar,
          email: mentorProfile.user.email,
          expertise: mentorProfile.expertise ? JSON.parse(mentorProfile.expertise) : [],
          experience: mentorProfile.experience,
          company: mentorProfile.company,
          position: mentorProfile.position,
          availability: mentorProfile.availability,
          hourlyRate: mentorProfile.hourlyRate
        },
        overview: {
          overallRating: mentorProfile.rating,
          totalReviews: mentorProfile.reviewCount,
          completionRate: Math.round(completionRate * 100) / 100,
          avgSessionDuration,
          totalMentorships,
          activeMentorships,
          totalSessions
        },
        reviews: {
          averageRating: Math.round(averageRating * 100) / 100,
          totalReviews,
          ratingDistribution,
          recentReviews
        },
        sessions: {
          totalSessions,
          completedSessions,
          upcomingSessions,
          recentSessions
        },
        monthlyActivity: monthlyStats
      }
    })
  } catch (error) {
    console.error('Error fetching mentor statistics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch mentor statistics' },
      { status: 500 }
    )
  }
}