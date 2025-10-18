import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { validateBody, handleValidationError } from '@/lib/validation-middleware'

// GET /api/mentorships/[mentorshipId] - Get mentorship details
export async function GET(
  request: NextRequest,
  { params }: { params: { mentorshipId: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const mentorship = await db.mentorship.findUnique({
      where: { id: params.mentorshipId },
      include: {
        mentor: {
          include: {
            user: {
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

    // Add user role context
    const mentorshipWithContext = {
      ...mentorship,
      userRole: mentorship.mentorId === user.id ? 'mentor' : 'mentee',
      focusAreas: mentorship.focusAreas ? JSON.parse(mentorship.focusAreas) : []
    }

    return NextResponse.json({
      success: true,
      data: mentorshipWithContext
    })
  } catch (error) {
    console.error('Error fetching mentorship:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch mentorship' },
      { status: 500 }
    )
  }
}

// PUT /api/mentorships/[mentorshipId] - Update mentorship status
export async function PUT(
  request: NextRequest,
  { params }: { params: { mentorshipId: string } }
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

    // Check if mentorship exists and user has permission
    const mentorship = await db.mentorship.findUnique({
      where: { id: params.mentorshipId }
    })

    if (!mentorship) {
      return NextResponse.json(
        { success: false, error: 'Mentorship not found' },
        { status: 404 }
      )
    }

    // Validate permissions based on action
    const isMentor = mentorship.mentorId === user.id
    const isMentee = mentorship.menteeId === user.id

    if (data.status === 'accepted' && !isMentor) {
      return NextResponse.json(
        { success: false, error: 'Only mentor can accept mentorship requests' },
        { status: 403 }
      )
    }

    if (data.status === 'cancelled' && !isMentee) {
      return NextResponse.json(
        { success: false, error: 'Only mentee can cancel mentorship requests' },
        { status: 403 }
      )
    }

    if (!isMentor && !isMentee) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Update mentorship
    const updateData: any = { status: data.status }

    if (data.status === 'accepted') {
      updateData.scheduledAt = data.scheduledAt || new Date()
    } else if (data.status === 'completed') {
      updateData.completedAt = new Date()
    }

    const updatedMentorship = await db.mentorship.update({
      where: { id: params.mentorshipId },
      data: updateData,
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

    // TODO: Send notifications about status changes

    return NextResponse.json({
      success: true,
      data: {
        ...updatedMentorship,
        userRole: isMentor ? 'mentor' : 'mentee',
        focusAreas: updatedMentorship.focusAreas ? JSON.parse(updatedMentorship.focusAreas) : []
      },
      message: `Mentorship ${data.status} successfully`
    })
  } catch (error) {
    console.error('Error updating mentorship:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update mentorship' },
      { status: 500 }
    )
  }
}

// DELETE /api/mentorships/[mentorshipId] - Delete mentorship
export async function DELETE(
  request: NextRequest,
  { params }: { params: { mentorshipId: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if mentorship exists and user has permission
    const mentorship = await db.mentorship.findUnique({
      where: { id: params.mentorshipId }
    })

    if (!mentorship) {
      return NextResponse.json(
        { success: false, error: 'Mentorship not found' },
        { status: 404 }
      )
    }

    if (mentorship.mentorId !== user.id && mentorship.menteeId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    await db.mentorship.delete({
      where: { id: params.mentorshipId }
    })

    return NextResponse.json({
      success: true,
      message: 'Mentorship deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting mentorship:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete mentorship' },
      { status: 500 }
    )
  }
}