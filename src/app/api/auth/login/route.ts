import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'
import { withErrorHandling, validateRequestBody } from '@/lib/api-error-handler'
import { schemas } from '@/lib/validations'

async function loginHandler(req: NextRequest) {
  const body = await validateRequestBody(req, schemas.user.login)
  const { email, password } = body

  const userAgent = req.headers.get('user-agent') || ''
  
  const result = await authenticateUser(email, password, userAgent)

  if (!result) {
    throw new Error('Invalid email or password')
  }

  return NextResponse.json(result)
}

export const POST = withErrorHandling(loginHandler)