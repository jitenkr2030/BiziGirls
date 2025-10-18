import { NextRequest, NextResponse } from 'next/server'
import { regenerateBackupCodes } from '@/lib/auth'
import { AuthenticationError } from '@/lib/errors'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    // Get user ID from token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header')
    }

    const authToken = authHeader.substring(7)
    // Verify token and get user ID
    const userId = 'user-id-from-token' // Replace with actual token verification

    const result = await regenerateBackupCodes(userId, password)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('2FA backup codes regeneration error:', error)
    
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to regenerate backup codes' },
      { status: 500 }
    )
  }
}