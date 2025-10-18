import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { videoCallService } from '@/lib/services/video-call'

// POST /api/video-calls/end - End a video call session
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

    // End the session
    const success = await videoCallService.endSession(sessionId, user.id)

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to end video call' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Video call ended successfully'
    })
  } catch (error) {
    console.error('Error ending video call:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to end video call' },
      { status: 500 }
    )
  }
}