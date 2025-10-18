import { NextRequest, NextResponse } from 'next/server'
import { authenticateWithLinkedIn } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(error)}`, request.url)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/auth/login?error=missing_params', request.url)
      )
    }

    // Get stored state from cookie
    const storedState = request.cookies.get('oauth_state')?.value

    if (!storedState) {
      return NextResponse.redirect(
        new URL('/auth/login?error=invalid_state', request.url)
      )
    }

    // Authenticate with LinkedIn
    const result = await authenticateWithLinkedIn(code, state, storedState)

    // Create response with authentication data
    const response = NextResponse.redirect(new URL('/', request.url))
    
    // Set authentication cookies
    response.cookies.set('authToken', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })
    
    response.cookies.set('user', JSON.stringify(result.user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    // Clear OAuth state cookie
    response.cookies.delete('oauth_state')

    return response
  } catch (error) {
    console.error('LinkedIn OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/auth/login?error=oauth_failed', request.url)
    )
  }
}