import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling, validateRequestBody } from '@/lib/api-error-handler'
import { schemas } from '@/lib/validations'
import { db } from '@/lib/db'
import { verifyToken, hashPassword, validatePassword } from '@/lib/auth'
import { AuthenticationError } from '@/lib/errors'

async function resetPasswordHandler(req: NextRequest) {
  const body = await validateRequestBody(req, schemas.user.resetPassword)
  const { token, password } = body

  // Verify the reset token
  const payload = verifyToken(token)
  if (!payload) {
    throw new AuthenticationError('Invalid or expired reset token')
  }

  // Find the reset token in database
  const resetToken = await db.passwordResetToken.findUnique({
    where: { token }
  })

  if (!resetToken || resetToken.expiresAt < new Date()) {
    throw new AuthenticationError('Invalid or expired reset token')
  }

  // Validate new password
  const passwordErrors = validatePassword(password)
  if (passwordErrors.length > 0) {
    throw new Error(passwordErrors[0].message)
  }

  // Hash the new password
  const hashedPassword = hashPassword(password)

  // Update user password
  await db.user.update({
    where: { email: resetToken.email },
    data: { 
      password: hashedPassword,
      updatedAt: new Date()
    }
  })

  // Delete the reset token
  await db.passwordResetToken.delete({
    where: { token }
  })

  return NextResponse.json({ 
    message: 'Password reset successfully' 
  })
}

export const POST = withErrorHandling(resetPasswordHandler)