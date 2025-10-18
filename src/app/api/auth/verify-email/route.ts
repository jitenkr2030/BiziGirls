import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling } from '@/lib/api-error-handler'
import { verifyEmail } from '@/lib/auth'

async function verifyEmailHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ 
      success: false, 
      message: 'Verification token is required' 
    }, { status: 400 })
  }

  const result = await verifyEmail(token)
  return NextResponse.json(result)
}

export const GET = withErrorHandling(verifyEmailHandler)