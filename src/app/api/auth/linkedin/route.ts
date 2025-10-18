import { NextRequest, NextResponse } from 'next/server'
import { createOAuthAuthorizationData } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { state, authorizationUrl } = createOAuthAuthorizationData('linkedin')
    
    // Store state in session or cookie for CSRF protection
    const response = NextResponse.json({ authorizationUrl })
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600 // 10 minutes
    })
    
    return response
  } catch (error) {
    console.error('LinkedIn OAuth init error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize LinkedIn OAuth' },
      { status: 500 }
    )
  }
}