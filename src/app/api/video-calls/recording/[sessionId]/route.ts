import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { videoCallService } from '@/lib/services/video-call'

// GET /api/video-calls/recording/[sessionId] - Get session recording
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const recordingUrl = await videoCallService.getSessionRecording(params.sessionId, user.id)

    if (!recordingUrl) {
      return NextResponse.json(
        { success: false, error: 'Recording not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        recordingUrl,
        sessionId: params.sessionId
      }
    })
  } catch (error) {
    console.error('Error getting session recording:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to get session recording' },
      { status: 500 }
    )
  }
}