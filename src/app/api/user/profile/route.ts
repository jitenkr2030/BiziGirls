import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling, validateRequestBody } from '@/lib/api-error-handler'
import { schemas } from '@/lib/validations'
import { updateUserProfile } from '@/lib/auth'
import { verifyToken } from '@/lib/auth'
import { AuthenticationError } from '@/lib/errors'

async function getProfileHandler(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Missing or invalid authorization header')
  }

  const token = authHeader.substring(7)
  const payload = verifyToken(token)
  
  if (!payload) {
    throw new AuthenticationError('Invalid token')
  }

  const user = await updateUserProfile(payload.id, {})
  
  if (!user) {
    throw new AuthenticationError('User not found')
  }

  return NextResponse.json({ user })
}

async function updateProfileHandler(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Missing or invalid authorization header')
  }

  const token = authHeader.substring(7)
  const payload = verifyToken(token)
  
  if (!payload) {
    throw new AuthenticationError('Invalid token')
  }

  const body = await validateRequestBody(req, schemas.user.updateProfile)
  
  const user = await updateUserProfile(payload.id, body)
  
  if (!user) {
    throw new AuthenticationError('User not found')
  }

  return NextResponse.json({ 
    message: 'Profile updated successfully',
    user 
  })
}

export const GET = withErrorHandling(getProfileHandler)
export const PUT = withErrorHandling(updateProfileHandler)