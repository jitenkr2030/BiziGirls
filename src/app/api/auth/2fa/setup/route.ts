import { NextRequest, NextResponse } from 'next/server'
import { setup2FA } from '@/lib/auth'
import { AuthenticationError } from '@/lib/errors'

export async function POST(request: NextRequest) {
  try {
    // Get user ID from token (you'll need to implement token verification middleware)
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header')
    }

    const token = authHeader.substring(7)
    // Verify token and get user ID (implement this based on your token verification logic)
    const userId = 'user-id-from-token' // Replace with actual token verification

    const result = await setup2FA(userId)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('2FA setup error:', error)
    
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to setup 2FA' },
      { status: 500 }
    )
  }
}