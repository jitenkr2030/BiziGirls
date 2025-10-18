import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { validateBody, handleValidationError } from '@/lib/validation-middleware'

// GET /api/sessions - Get user's sessions
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
    const status = searchParams.get('status') || 'all' // all, scheduled, in-progress, completed, cancelled
    const role = searchParams.get('role') || 'all' // all, mentor, mentee
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      mentorship: {
        OR: [
          { mentorId: user.id },
          { menteeId: user.id }
        ]
      }
    }

    if (status !== 'all') {
      where.status = status
    }

    if (role === 'mentor') {
      where.mentorship = {
        mentorId: user.id
      }
    } else if (role === 'mentee') {
      where.mentorship = {
        menteeId: user.id
      }
    }

    if (startDate && endDate) {
      where.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const [sessions, total] = await Promise.all([
      db.mentorshipSession.findMany({
        where,
        include: {
          mentorship: {
            include: {
              mentor: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                  email: true
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
          },
          reviews: {
            include: {
              reviewer: {
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
        skip,
        take: limit,
        orderBy: { startTime: 'asc' }
      }),
      db.mentorshipSession.count({ where })
    ])

    // Add user role context to each session
    const sessionsWithContext = sessions.map(session => ({
      ...session,
      userRole: session.mentorship.mentorId === user.id ? 'mentor' : 'mentee'
    }))

    return NextResponse.json({
      success: true,
      data: sessionsWithContext,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

// POST /api/sessions - Create a new session
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
      data = await validateBody('session', 'create')(request)
    } catch (error) {
      const validationError = handleValidationError(error)
      return NextResponse.json(validationError, { status: 400 })
    }

    // Check if mentorship exists and user has permission
    const mentorship = await db.mentorship.findUnique({
      where: { id: data.mentorshipId },
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
    })

    if (!mentorship) {
      return NextResponse.json(
        { success: false, error: 'Mentorship not found' },
        { status: 404 }
      )
    }

    // Check if user is part of this mentorship
    if (mentorship.mentorId !== user.id && mentorship.menteeId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Check if mentorship is active
    if (mentorship.status !== 'accepted') {
      return NextResponse.json(
        { success: false, error: 'Mentorship must be accepted to create sessions' },
        { status: 400 }
      )
    }

    // Validate session time
    const startTime = new Date(data.startTime)
    const endTime = new Date(data.endTime)

    if (endTime <= startTime) {
      return NextResponse.json(
        { success: false, error: 'End time must be after start time' },
        { status: 400 }
      )
    }

    // Check for time conflicts with mentor's other sessions
    const conflictingSessions = await db.mentorshipSession.findMany({
      where: {
        mentorship: {
          mentorId: mentorship.mentorId
        },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } }
            ]
          }
        ],
        status: {
          in: ['scheduled', 'in-progress']
        }
      }
    })

    if (conflictingSessions.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Mentor has a conflicting session at this time' },
        { status: 400 }
      )
    }

    // Create session
    const session = await db.mentorshipSession.create({
      data: {
        mentorshipId: data.mentorshipId,
        title: data.title,
        description: data.description,
        startTime,
        endTime,
        sessionType: data.sessionType || 'one-on-one',
        location: data.location,
        isOnline: data.isOnline ?? true,
        notes: data.notes
      },
      include: {
        mentorship: {
          include: {
            mentor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                email: true
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
        }
      }
    })

    // TODO: Send calendar invites and notifications

    return NextResponse.json({
      success: true,
      data: session,
      message: 'Session created successfully'
    })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create session' },
      { status: 500 }
    )
  }
}