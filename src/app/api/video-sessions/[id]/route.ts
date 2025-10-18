import { NextRequest, NextResponse } from 'next/server'
import { terminateSession } from '@/lib/auth'
import { AuthenticationError } from '@/lib/errors'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header')
    }

    const token = authHeader.substring(7)
    // Verify token and get user ID
    const userId = 'user-id-from-token' // Replace with actual token verification

    const result = await terminateSession(sessionId, userId)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Terminate session error:', error)
    
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to terminate session' },
      { status: 500 }
    )
  }
}