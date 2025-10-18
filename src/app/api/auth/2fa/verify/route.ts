import { NextRequest, NextResponse } from 'next/server'
import { verify2FAForLogin } from '@/lib/auth'
import { AuthenticationError } from '@/lib/errors'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, userId } = body

    if (!token || !userId) {
      return NextResponse.json(
        { error: 'Token and user ID are required' },
        { status: 400 }
      )
    }

    const result = await verify2FAForLogin(userId, token)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('2FA verify error:', error)
    
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to verify 2FA token' },
      { status: 500 }
    )
  }
}