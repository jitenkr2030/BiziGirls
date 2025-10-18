import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling, validateRequestBody } from '@/lib/api-error-handler'
import { schemas } from '@/lib/validations'
import { db } from '@/lib/db'
import { generateToken } from '@/lib/auth'
import { sendPasswordResetEmail } from '@/lib/email'

async function forgotPasswordHandler(req: NextRequest) {
  const body = await validateRequestBody(req, schemas.user.forgotPassword)
  const { email } = body

  // Find user by email
  const user = await db.user.findUnique({
    where: { email }
  })

  if (!user) {
    // Don't reveal that the user doesn't exist
    return NextResponse.json({ 
      message: 'If your email is registered, you will receive a password reset link' 
    })
  }

  // Generate password reset token
  const resetToken = generateToken({ id: user.id, email: user.email, role: user.role })
  const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

  // Save password reset token
  await db.passwordResetToken.create({
    data: {
      email,
      token: resetToken,
      expiresAt: resetTokenExpiry
    }
  })

  // Send password reset email
  try {
    await sendPasswordResetEmail(email, resetToken)
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    // Don't fail the request if email fails
  }

  return NextResponse.json({ 
    message: 'If your email is registered, you will receive a password reset link' 
  })
}

export const POST = withErrorHandling(forgotPasswordHandler)