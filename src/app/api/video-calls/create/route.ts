import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { videoCallService } from '@/lib/services/video-call'

// POST /api/video-calls/create - Create a video call for a session
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { sessionId, options } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Check if session exists and user has permission
    const session = await db.mentorshipSession.findUnique({
      where: { id: sessionId },
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

    // Check if session already has a video call
    if (session.meetingUrl && session.meetingId) {
      return NextResponse.json(
        { success: false, error: 'Video call already exists for this session' },
        { status: 400 }
      )
    }

    // Create video call
    const meetingResult = await videoCallService.createMentorshipSession(sessionId, options || {})

    return NextResponse.json({
      success: true,
      data: meetingResult,
      message: 'Video call created successfully'
    })
  } catch (error) {
    console.error('Error creating video call:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create video call' },
      { status: 500 }
    )
  }
}