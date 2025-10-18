import { NextRequest, NextResponse } from 'next/server'
import { get2FAStatus } from '@/lib/auth'
import { AuthenticationError } from '@/lib/errors'

export async function GET(request: NextRequest) {
  try {
    // Get user ID from token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header')
    }

    const authToken = authHeader.substring(7)
    // Verify token and get user ID
    const userId = 'user-id-from-token' // Replace with actual token verification

    const result = await get2FAStatus(userId)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('2FA status error:', error)
    
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get 2FA status' },
      { status: 500 }
    )
  }
}