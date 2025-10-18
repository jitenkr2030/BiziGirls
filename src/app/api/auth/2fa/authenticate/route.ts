import { NextRequest, NextResponse } from 'next/server'
import { authenticateWith2FA } from '@/lib/auth'
import { AuthenticationError } from '@/lib/errors'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, token } = body

    if (!userId || !token) {
      return NextResponse.json(
        { error: 'User ID and token are required' },
        { status: 400 }
      )
    }

    const userAgent = request.headers.get('user-agent') || ''
    
    // Import the function dynamically to avoid circular dependencies
    const { authenticateWith2FA } = await import('@/lib/auth')
    const result = await authenticateWith2FA(userId, token, userAgent)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('2FA authentication error:', error)
    
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to authenticate with 2FA' },
      { status: 500 }
    )
  }
}