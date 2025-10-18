import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling, validateRequestBody } from '@/lib/api-error-handler'
import { schemas } from '@/lib/validations'
import { resendVerificationEmail } from '@/lib/auth'

async function resendVerificationHandler(req: NextRequest) {
  const body = await validateRequestBody(req, schemas.user.forgotPassword)
  const { email } = body

  const result = await resendVerificationEmail(email)
  return NextResponse.json(result)
}

export const POST = withErrorHandling(resendVerificationHandler)