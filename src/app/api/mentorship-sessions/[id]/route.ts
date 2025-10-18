import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { validateBody, handleValidationError } from '@/lib/validation-middleware'

// GET /api/mentorship-sessions/[id] - Get session details
export async function GET(
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

    const session = await db.mentorshipSession.findUnique({
      where: { id: params.id },
      include: {
        mentorship: {
          include: {
            mentor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                email: true,
                industry: true,
                location: true
              }
            },
            mentee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                email: true,
                industry: true,
                location: true
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
          },
          orderBy: { createdAt: 'desc' }
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

    // Add user role context
    const sessionWithContext = {
      ...session,
      userRole: session.mentorship.mentorId === user.id ? 'mentor' : 'mentee'
    }

    return NextResponse.json({
      success: true,
      data: sessionWithContext
    })
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}

// PUT /api/mentorship-sessions/[id] - Update session
export async function PUT(
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

    const data = await request.json()

    // Check if session exists and user has permission
    const session = await db.mentorshipSession.findUnique({
      where: { id: params.id },
      include: {
        mentorship: true
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

    // Validate status transitions
    const validStatusTransitions: { [key: string]: string[] } = {
      'scheduled': ['in-progress', 'cancelled'],
      'in-progress': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': [],
      'no-show': []
    }

    if (data.status && !validStatusTransitions[session.status].includes(data.status)) {
      return NextResponse.json(
        { success: false, error: `Cannot transition from ${session.status} to ${data.status}` },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: any = {}

    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.startTime !== undefined) updateData.startTime = new Date(data.startTime)
    if (data.endTime !== undefined) updateData.endTime = new Date(data.endTime)
    if (data.sessionType !== undefined) updateData.sessionType = data.sessionType
    if (data.location !== undefined) updateData.location = data.location
    if (data.isOnline !== undefined) updateData.isOnline = data.isOnline
    if (data.meetingUrl !== undefined) updateData.meetingUrl = data.meetingUrl
    if (data.meetingId !== undefined) updateData.meetingId = data.meetingId
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.recordingUrl !== undefined) updateData.recordingUrl = data.recordingUrl
    if (data.status !== undefined) updateData.status = data.status

    // Update session
    const updatedSession = await db.mentorshipSession.update({
      where: { id: params.id },
      data: updateData,
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

    // TODO: Send notifications about session updates

    return NextResponse.json({
      success: true,
      data: updatedSession,
      message: 'Session updated successfully'
    })
  } catch (error) {
    console.error('Error updating session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update session' },
      { status: 500 }
    )
  }
}

// DELETE /api/mentorship-sessions/[id] - Delete session
export async function DELETE(
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

    // Check if session exists and user has permission
    const session = await db.mentorshipSession.findUnique({
      where: { id: params.id },
      include: {
        mentorship: true
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

    // Check if session can be cancelled (only scheduled sessions can be deleted)
    if (session.status !== 'scheduled') {
      return NextResponse.json(
        { success: false, error: 'Only scheduled sessions can be cancelled' },
        { status: 400 }
      )
    }

    await db.mentorshipSession.delete({
      where: { id: params.id }
    })

    // TODO: Send cancellation notifications

    return NextResponse.json({
      success: true,
      message: 'Session cancelled successfully'
    })
  } catch (error) {
    console.error('Error deleting session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to cancel session' },
      { status: 500 }
    )
  }
}