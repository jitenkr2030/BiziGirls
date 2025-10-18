import { NextRequest, NextResponse } from 'next/server'
import { registerUser } from '@/lib/auth'
import { withErrorHandling, validateRequestBody } from '@/lib/api-error-handler'
import { schemas } from '@/lib/validations'

async function registerHandler(req: NextRequest) {
  const body = await validateRequestBody(req, schemas.user.register)
  const { firstName, lastName, email, password, role } = body

  const result = await registerUser({
    firstName,
    lastName,
    email,
    password,
    role
  })

  return NextResponse.json(result)
}

export const POST = withErrorHandling(registerHandler)