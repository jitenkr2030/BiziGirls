import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

// GET /api/mentors/[mentorId] - Get mentor profile details
export async function GET(
  request: NextRequest,
  { params }: { params: { mentorId: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const mentor = await db.mentorProfile.findUnique({
      where: { id: params.mentorId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            bio: true,
            industry: true,
            businessStage: true,
            location: true,
            website: true,
            linkedin: true,
            twitter: true
          }
        },
        mentorshipsAsMentor: {
          include: {
            mentee: {
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
        },
        _count: {
          select: {
            mentorshipsAsMentor: {
              where: {
                status: {
                  in: ['accepted', 'completed']
                }
              }
            }
          }
        }
      }
    })

    if (!mentor) {
      return NextResponse.json(
        { success: false, error: 'Mentor not found' },
        { status: 404 }
      )
    }

    // Calculate mentor statistics
    const allMentorships = await db.mentorship.findMany({
      where: {
        mentorId: params.mentorId,
        status: {
          in: ['accepted', 'completed']
        }
      }
    })

    const activeMentorships = allMentorships.filter(m => m.status === 'accepted').length
    const completedMentorships = allMentorships.filter(m => m.status === 'completed').length

    // Get mentor reviews/ratings
    const mentorReviews = await db.mentorship.findMany({
      where: {
        mentorId: params.mentorId,
        status: 'completed'
      },
      select: {
        id: true,
        completedAt: true,
        mentee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    })

    // Check if current user has requested mentorship with this mentor
    const existingRequest = await db.mentorship.findFirst({
      where: {
        mentorId: params.mentorId,
        menteeId: user.id,
        status: {
          in: ['pending', 'accepted']
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...mentor,
        stats: {
          activeMentorships,
          completedMentorships,
          totalMentorships: allMentorships.length,
          completionRate: allMentorships.length > 0 ? (completedMentorships / allMentorships.length) * 100 : 0
        },
        expertise: mentor.expertise ? JSON.parse(mentor.expertise) : [],
        certifications: mentor.certifications ? JSON.parse(mentor.certifications) : [],
        mentorshipTypes: mentor.mentorshipType ? JSON.parse(mentor.mentorshipType) : [],
        recentMentorships: mentor.mentorshipsAsMentor,
        hasExistingRequest: !!existingRequest,
        existingRequestStatus: existingRequest?.status || null
      }
    })
  } catch (error) {
    console.error('Error fetching mentor profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch mentor profile' },
      { status: 500 }
    )
  }
}