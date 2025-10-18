import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { validateBody, handleValidationError } from '@/lib/validation-middleware'

// GET /api/mentorships - Get user's mentorships (as mentor or mentee)
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
    const role = searchParams.get('role') || 'all' // all, mentor, mentee
    const status = searchParams.get('status') || 'all' // all, pending, accepted, completed, cancelled

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (role === 'mentor') {
      where.mentorId = user.id
    } else if (role === 'mentee') {
      where.menteeId = user.id
    } else {
      where.OR = [
        { mentorId: user.id },
        { menteeId: user.id }
      ]
    }

    if (status !== 'all') {
      where.status = status
    }

    const [mentorships, total] = await Promise.all([
      db.mentorship.findMany({
        where,
        include: {
          mentor: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                  industry: true
                }
              }
            }
          },
          mentee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              industry: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.mentorship.count({ where })
    ])

    // Add user role context to each mentorship
    const mentorshipsWithContext = mentorships.map(mentorship => ({
      ...mentorship,
      userRole: mentorship.mentorId === user.id ? 'mentor' : 'mentee',
      focusAreas: mentorship.focusAreas ? JSON.parse(mentorship.focusAreas) : []
    }))

    return NextResponse.json({
      success: true,
      data: mentorshipsWithContext,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching mentorships:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch mentorships' },
      { status: 500 }
    )
  }
}

// POST /api/mentorships - Create mentorship request
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
      data = await validateBody('mentorship', 'request')(request)
    } catch (error) {
      const validationError = handleValidationError(error)
      return NextResponse.json(validationError, { status: 400 })
    }

    // Check if mentor exists and is available
    const mentor = await db.mentorProfile.findUnique({
      where: { id: data.mentorId },
      include: {
        user: {
          select: {
            isActive: true,
            role: true
          }
        }
      }
    })

    if (!mentor || !mentor.user.isActive || mentor.user.role !== 'mentor') {
      return NextResponse.json(
        { success: false, error: 'Mentor not found or unavailable' },
        { status: 404 }
      )
    }

    // Check if user already has a pending/accepted request with this mentor
    const existingRequest = await db.mentorship.findFirst({
      where: {
        mentorId: data.mentorId,
        menteeId: user.id,
        status: {
          in: ['pending', 'accepted']
        }
      }
    })

    if (existingRequest) {
      return NextResponse.json(
        { success: false, error: 'You already have a pending or active mentorship with this mentor' },
        { status: 400 }
      )
    }

    // Create mentorship request
    const mentorship = await db.mentorship.create({
      data: {
        mentorId: data.mentorId,
        menteeId: user.id,
        type: data.type,
        focusAreas: data.focusAreas ? JSON.stringify(data.focusAreas) : null,
        goals: data.goals,
        duration: data.duration,
        price: data.price,
        scheduledAt: data.scheduledAt,
        status: 'pending'
      },
      include: {
        mentor: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                email: true
              }
            }
          }
        },
        mentee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true
          }
        }
      }
    })

    // TODO: Send notification to mentor about new request

    return NextResponse.json({
      success: true,
      data: mentorship,
      message: 'Mentorship request sent successfully'
    })
  } catch (error) {
    console.error('Error creating mentorship request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create mentorship request' },
      { status: 500 }
    )
  }
}