import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { videoCallService } from '@/lib/services/video-call'

// POST /api/video-calls/join - Join a video call session
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Join the session
    const meetingUrl = await videoCallService.joinSession(sessionId, user.id)

    return NextResponse.json({
      success: true,
      data: {
        meetingUrl,
        sessionId
      },
      message: 'Joined video call successfully'
    })
  } catch (error) {
    console.error('Error joining video call:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to join video call' },
      { status: 500 }
    )
  }
}