import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'
import { AuthenticationError, ConflictError } from '@/lib/errors'
import { config } from '@/lib/config'
import { 
  exchangeCodeForToken, 
  getGoogleUserInfo, 
  getLinkedInUserInfo, 
  generateOAuthState,
  generateOAuthCodeVerifier,
  generateOAuthCodeChallenge,
  getOAuthAuthorizationUrl,
  OAuthUserInfo
} from '@/lib/oauth'
import { 
  generate2FASecret, 
  generateQRCodeDataURL, 
  verify2FAToken, 
  verifyBackupCode,
  validate2FAToken,
  generateBackupCodes,
  formatBackupCode
} from '@/lib/2fa'

export interface UserPayload {
  id: string
  email: string
  role: string
}

export interface ValidationError {
  field: string
  message: string
}

export function validatePassword(password: string): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters long' })
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one uppercase letter' })
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one lowercase letter' })
  }
  
  if (!/\d/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one number' })
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one special character' })
  }
  
  return errors
}

export function validateEmail(email: string): ValidationError[] {
  const errors: ValidationError[] = []
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' })
  }
  
  return errors
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, config.auth.bcryptRounds)
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

export function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, config.auth.jwtSecret, { expiresIn: config.auth.jwtExpiresIn })
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, config.auth.jwtSecret) as UserPayload
  } catch {
    return null
  }
}

export async function authenticateUser(email: string, password: string, userAgent?: string) {
  try {
    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user || !verifyPassword(password, user.password)) {
      return null
    }

    if (!user.isActive) {
      throw new AuthenticationError('Account is deactivated')
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      return {
        requiresTwoFactor: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          twoFactorEnabled: true
        }
      }
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    })

    // Create user session
    await createUserSession(user.id, token, userAgent)

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        bio: user.bio,
        location: user.location,
        businessStage: user.businessStage,
        industry: user.industry,
        twoFactorEnabled: false
      },
      token
    }
  } catch (error) {
    console.error('Authentication error:', error)
    throw error
  }
}

export async function registerUser(userData: {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: string
}) {
  try {
    // Validate email
    const emailErrors = validateEmail(userData.email)
    if (emailErrors.length > 0) {
      throw new Error(emailErrors[0].message)
    }

    // Validate password
    const passwordErrors = validatePassword(userData.password)
    if (passwordErrors.length > 0) {
      throw new Error(passwordErrors[0].message)
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: userData.email }
    })

    if (existingUser) {
      throw new ConflictError('User with this email already exists')
    }

    const hashedPassword = hashPassword(userData.password)

    const user = await db.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'ENTREPRENEUR'
      }
    })

    // Generate email verification token
    const verificationToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    })
    
    const verificationTokenExpiry = new Date(Date.now() + 86400000) // 24 hours from now

    // Save email verification token
    await db.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt: verificationTokenExpiry
      }
    })

    // Send verification email
    try {
      const { sendEmailVerificationEmail } = await import('@/lib/email')
      await sendEmailVerificationEmail(user.email, verificationToken)
    } catch (error) {
      console.error('Failed to send verification email:', error)
      // Don't fail the registration if email fails
    }

    const authToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified
      },
      token: authToken,
      requiresVerification: true
    }
  } catch (error) {
    console.error('Registration error:', error)
    throw error
  }
}

export async function verifyEmail(token: string) {
  try {
    const payload = verifyToken(token)
    if (!payload) {
      throw new AuthenticationError('Invalid verification token')
    }

    // Find the verification token in database
    const verificationToken = await db.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!verificationToken || verificationToken.expiresAt < new Date()) {
      throw new AuthenticationError('Invalid or expired verification token')
    }

    // Check if user is already verified
    if (verificationToken.user.isVerified) {
      throw new AuthenticationError('Email is already verified')
    }

    // Update user verification status
    await db.user.update({
      where: { id: verificationToken.userId },
      data: { 
        isVerified: true,
        emailVerifiedAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Delete the verification token
    await db.emailVerificationToken.delete({
      where: { token }
    })

    // Send welcome email
    try {
      const { sendWelcomeEmail } = await import('@/lib/email')
      await sendWelcomeEmail(
        verificationToken.user.email, 
        verificationToken.user.firstName
      )
    } catch (error) {
      console.error('Failed to send welcome email:', error)
      // Don't fail the verification if email fails
    }

    return {
      success: true,
      message: 'Email verified successfully'
    }
  } catch (error) {
    console.error('Email verification error:', error)
    throw error
  }
}

export async function resendVerificationEmail(email: string) {
  try {
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      throw new AuthenticationError('User not found')
    }

    if (user.isVerified) {
      throw new AuthenticationError('Email is already verified')
    }

    // Delete any existing verification tokens
    await db.emailVerificationToken.deleteMany({
      where: { userId: user.id }
    })

    // Generate new verification token
    const verificationToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    })
    
    const verificationTokenExpiry = new Date(Date.now() + 86400000) // 24 hours from now

    // Save new verification token
    await db.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt: verificationTokenExpiry
      }
    })

    // Send verification email
    try {
      const { sendEmailVerificationEmail } = await import('@/lib/email')
      await sendEmailVerificationEmail(user.email, verificationToken)
    } catch (error) {
      console.error('Failed to send verification email:', error)
      throw new Error('Failed to send verification email')
    }

    return {
      success: true,
      message: 'Verification email sent successfully'
    }
  } catch (error) {
    console.error('Resend verification email error:', error)
    throw error
  }
}

export async function getUserById(id: string) {
  try {
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        bio: true,
        location: true,
        businessStage: true,
        industry: true,
        isActive: true,
        createdAt: true
      }
    })

    return user
  } catch (error) {
    console.error('Get user error:', error)
    return null
  }
}

export async function updateUserProfile(id: string, updateData: {
  bio?: string
  location?: string
  businessStage?: string
  industry?: string
  phone?: string
  website?: string
  linkedin?: string
  twitter?: string
  instagram?: string
  dateOfBirth?: string
  gender?: string
  skills?: string
  interests?: string
}) {
  try {
    const user = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        bio: true,
        location: true,
        businessStage: true,
        industry: true,
        phone: true,
        website: true,
        linkedin: true,
        twitter: true,
        instagram: true,
        dateOfBirth: true,
        gender: true,
        skills: true,
        interests: true,
        updatedAt: true
      }
    })

    return user
  } catch (error) {
    console.error('Update user error:', error)
    throw error
  }
}

// OAuth Authentication Functions
export async function authenticateWithGoogle(code: string, state: string, storedState: string) {
  try {
    // Verify state to prevent CSRF
    if (state !== storedState) {
      throw new AuthenticationError('Invalid state parameter')
    }

    // Exchange code for access token
    const accessToken = await exchangeCodeForToken('google', code)
    
    // Get user info from Google
    const googleUserInfo = await getGoogleUserInfo(accessToken)

    // Check if user exists
    let user = await db.user.findUnique({
      where: { email: googleUserInfo.email }
    })

    if (user) {
      // User exists, update provider info if needed
      if (!user.provider || user.provider !== 'google') {
        user = await db.user.update({
          where: { id: user.id },
          data: {
            provider: 'google',
            providerId: googleUserInfo.id,
            avatar: googleUserInfo.picture || user.avatar,
            isVerified: googleUserInfo.verified || user.isVerified
          }
        })
      }
    } else {
      // Create new user
      user = await db.user.create({
        data: {
          email: googleUserInfo.email,
          firstName: googleUserInfo.firstName || '',
          lastName: googleUserInfo.lastName || '',
          provider: 'google',
          providerId: googleUserInfo.id,
          avatar: googleUserInfo.picture,
          isVerified: googleUserInfo.verified || false,
          isActive: true
        }
      })
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        bio: user.bio,
        location: user.location,
        businessStage: user.businessStage,
        industry: user.industry,
        avatar: user.avatar
      },
      token
    }
  } catch (error) {
    console.error('Google authentication error:', error)
    throw error
  }
}

export async function authenticateWithLinkedIn(code: string, state: string, storedState: string) {
  try {
    // Verify state to prevent CSRF
    if (state !== storedState) {
      throw new AuthenticationError('Invalid state parameter')
    }

    // Exchange code for access token
    const accessToken = await exchangeCodeForToken('linkedin', code)
    
    // Get user info from LinkedIn
    const linkedinUserInfo = await getLinkedInUserInfo(accessToken)

    // Check if user exists
    let user = await db.user.findUnique({
      where: { email: linkedinUserInfo.email }
    })

    if (user) {
      // User exists, update provider info if needed
      if (!user.provider || user.provider !== 'linkedin') {
        user = await db.user.update({
          where: { id: user.id },
          data: {
            provider: 'linkedin',
            providerId: linkedinUserInfo.id,
            avatar: linkedinUserInfo.picture || user.avatar,
            isVerified: linkedinUserInfo.verified || user.isVerified
          }
        })
      }
    } else {
      // Create new user
      user = await db.user.create({
        data: {
          email: linkedinUserInfo.email,
          firstName: linkedinUserInfo.firstName || '',
          lastName: linkedinUserInfo.lastName || '',
          provider: 'linkedin',
          providerId: linkedinUserInfo.id,
          avatar: linkedinUserInfo.picture,
          isVerified: linkedinUserInfo.verified || false,
          isActive: true
        }
      })
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        bio: user.bio,
        location: user.location,
        businessStage: user.businessStage,
        industry: user.industry,
        avatar: user.avatar
      },
      token
    }
  } catch (error) {
    console.error('LinkedIn authentication error:', error)
    throw error
  }
}

export function createOAuthAuthorizationData(provider: string) {
  const state = generateOAuthState()
  const codeVerifier = generateOAuthCodeVerifier()
  
  return {
    state,
    codeVerifier,
    authorizationUrl: getOAuthAuthorizationUrl(provider, state)
  }
}

export async function linkOAuthAccount(userId: string, provider: string, oauthUserInfo: OAuthUserInfo) {
  try {
    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new AuthenticationError('User not found')
    }

    // Check if OAuth account is already linked to another user
    const existingOAuthUser = await db.user.findFirst({
      where: {
        provider,
        providerId: oauthUserInfo.id,
        NOT: { id: userId }
      }
    })

    if (existingOAuthUser) {
      throw new AuthenticationError('This OAuth account is already linked to another user')
    }

    // Update user with OAuth info
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        provider,
        providerId: oauthUserInfo.id,
        avatar: oauthUserInfo.picture || user.avatar
      }
    })

    return updatedUser
  } catch (error) {
    console.error('Link OAuth account error:', error)
    throw error
  }
}

export async function unlinkOAuthAccount(userId: string, provider: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new AuthenticationError('User not found')
    }

    // Check if user has a password before unlinking OAuth
    if (!user.password && user.provider === provider) {
      throw new AuthenticationError('Cannot unlink OAuth account without a password set')
    }

    // Update user to remove OAuth info
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        provider: null,
        providerId: null
      }
    })

    return updatedUser
  } catch (error) {
    console.error('Unlink OAuth account error:', error)
    throw error
  }
}

// Two-Factor Authentication Functions
export async function setup2FA(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new AuthenticationError('User not found')
    }

    if (user.twoFactorEnabled) {
      throw new AuthenticationError('2FA is already enabled for this account')
    }

    // Generate 2FA secret
    const twoFactorSetup = generate2FASecret(user.email)
    
    // Generate QR code
    const qrCodeDataURL = await generateQRCodeDataURL(twoFactorSetup.qrCodeUrl)

    return {
      secret: twoFactorSetup.secret,
      qrCodeDataURL,
      backupCodes: twoFactorSetup.backupCodes.map(formatBackupCode)
    }
  } catch (error) {
    console.error('Setup 2FA error:', error)
    throw error
  }
}

export async function enable2FA(userId: string, token: string, secret: string, backupCodes: string[]) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new AuthenticationError('User not found')
    }

    if (user.twoFactorEnabled) {
      throw new AuthenticationError('2FA is already enabled for this account')
    }

    // Validate token format
    const tokenValidation = validate2FAToken(token)
    if (!tokenValidation.isValid) {
      throw new AuthenticationError(tokenValidation.error || 'Invalid token format')
    }

    // Verify the token
    if (!verify2FAToken(token, secret)) {
      throw new AuthenticationError('Invalid 2FA token')
    }

    // Enable 2FA for the user
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret,
        twoFactorEnabled: true,
        twoFactorBackupCodes: JSON.stringify(backupCodes),
        updatedAt: new Date()
      }
    })

    return {
      success: true,
      message: '2FA has been enabled successfully',
      backupCodes: backupCodes.map(formatBackupCode)
    }
  } catch (error) {
    console.error('Enable 2FA error:', error)
    throw error
  }
}

export async function disable2FA(userId: string, password: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new AuthenticationError('User not found')
    }

    if (!user.twoFactorEnabled) {
      throw new AuthenticationError('2FA is not enabled for this account')
    }

    // Verify password for security
    if (user.password && !verifyPassword(password, user.password)) {
      throw new AuthenticationError('Invalid password')
    }

    // Disable 2FA
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: null,
        twoFactorEnabled: false,
        twoFactorBackupCodes: null,
        updatedAt: new Date()
      }
    })

    return {
      success: true,
      message: '2FA has been disabled successfully'
    }
  } catch (error) {
    console.error('Disable 2FA error:', error)
    throw error
  }
}

export async function verify2FAForLogin(userId: string, token: string): Promise<{ success: boolean; isBackupCode?: boolean }> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user || !user.twoFactorEnabled) {
      throw new AuthenticationError('2FA is not enabled for this account')
    }

    // Validate token format
    const tokenValidation = validate2FAToken(token)
    if (!tokenValidation.isValid) {
      return { success: false }
    }

    // Try to verify as TOTP token
    if (user.twoFactorSecret && verify2FAToken(token, user.twoFactorSecret)) {
      return { success: true }
    }

    // Try to verify as backup code
    if (user.twoFactorBackupCodes) {
      const backupCodes = JSON.parse(user.twoFactorBackupCodes)
      if (verifyBackupCode(token, backupCodes)) {
        // Remove the used backup code
        const updatedBackupCodes = backupCodes.filter((code: string) => code !== token.toUpperCase())
        
        await db.user.update({
          where: { id: userId },
          data: {
            twoFactorBackupCodes: JSON.stringify(updatedBackupCodes),
            updatedAt: new Date()
          }
        })

        return { success: true, isBackupCode: true }
      }
    }

    return { success: false }
  } catch (error) {
    console.error('Verify 2FA error:', error)
    return { success: false }
  }
}

export async function regenerateBackupCodes(userId: string, password: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new AuthenticationError('User not found')
    }

    if (!user.twoFactorEnabled) {
      throw new AuthenticationError('2FA is not enabled for this account')
    }

    // Verify password for security
    if (user.password && !verifyPassword(password, user.password)) {
      throw new AuthenticationError('Invalid password')
    }

    // Generate new backup codes
    const newBackupCodes = generateBackupCodes()

    // Update user with new backup codes
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        twoFactorBackupCodes: JSON.stringify(newBackupCodes),
        updatedAt: new Date()
      }
    })

    return {
      success: true,
      backupCodes: newBackupCodes.map(formatBackupCode),
      message: 'Backup codes have been regenerated successfully'
    }
  } catch (error) {
    console.error('Regenerate backup codes error:', error)
    throw error
  }
}

export async function get2FAStatus(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        twoFactorEnabled: true,
        twoFactorSecret: true
      }
    })

    if (!user) {
      throw new AuthenticationError('User not found')
    }

    return {
      enabled: user.twoFactorEnabled,
      hasSecret: !!user.twoFactorSecret
    }
  } catch (error) {
    console.error('Get 2FA status error:', error)
    throw error
  }
}

export async function authenticateWith2FA(userId: string, token: string, userAgent?: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new AuthenticationError('User not found')
    }

    if (!user.twoFactorEnabled) {
      throw new AuthenticationError('2FA is not enabled for this account')
    }

    // Verify 2FA token
    const verificationResult = await verify2FAForLogin(userId, token)
    
    if (!verificationResult.success) {
      throw new AuthenticationError('Invalid 2FA token')
    }

    // Generate JWT token
    const authToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    })

    // Create user session
    await createUserSession(user.id, authToken, userAgent)

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        bio: user.bio,
        location: user.location,
        businessStage: user.businessStage,
        industry: user.industry,
        twoFactorEnabled: true,
        isBackupCode: verificationResult.isBackupCode
      },
      token: authToken
    }
  } catch (error) {
    console.error('2FA authentication error:', error)
    throw error
  }
}

// Session Management Functions
export async function createUserSession(userId: string, token: string, userAgent?: string, ipAddress?: string) {
  try {
    const session = await db.userSession.create({
      data: {
        userId,
        token,
        userAgent,
        ipAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        isActive: true
      }
    })

    return session
  } catch (error) {
    console.error('Create user session error:', error)
    throw error
  }
}

export async function getUserSessions(userId: string) {
  try {
    const sessions = await db.userSession.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return sessions
  } catch (error) {
    console.error('Get user sessions error:', error)
    throw error
  }
}

export async function terminateSession(sessionId: string, userId: string) {
  try {
    const session = await db.userSession.findFirst({
      where: {
        id: sessionId,
        userId
      }
    })

    if (!session) {
      throw new AuthenticationError('Session not found')
    }

    await db.userSession.update({
      where: { id: sessionId },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    return { success: true, message: 'Session terminated successfully' }
  } catch (error) {
    console.error('Terminate session error:', error)
    throw error
  }
}

export async function terminateAllOtherSessions(userId: string, currentToken: string) {
  try {
    const sessions = await db.userSession.findMany({
      where: {
        userId,
        isActive: true,
        token: {
          not: currentToken
        },
        expiresAt: {
          gt: new Date()
        }
      }
    })

    await db.userSession.updateMany({
      where: {
        id: {
          in: sessions.map(s => s.id)
        }
      },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    return { 
      success: true, 
      message: `Terminated ${sessions.length} other session(s)`,
      terminatedCount: sessions.length
    }
  } catch (error) {
    console.error('Terminate all other sessions error:', error)
    throw error
  }
}

export async function terminateAllSessions(userId: string) {
  try {
    const sessions = await db.userSession.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    await db.userSession.updateMany({
      where: {
        id: {
          in: sessions.map(s => s.id)
        }
      },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    return { 
      success: true, 
      message: `Terminated ${sessions.length} session(s)`,
      terminatedCount: sessions.length
    }
  } catch (error) {
    console.error('Terminate all sessions error:', error)
    throw error
  }
}

export async function cleanupExpiredSessions() {
  try {
    const result = await db.userSession.updateMany({
      where: {
        expiresAt: {
          lte: new Date()
        }
      },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    return { 
      success: true, 
      message: `Cleaned up ${result.count} expired sessions`,
      cleanedCount: result.count
    }
  } catch (error) {
    console.error('Cleanup expired sessions error:', error)
    throw error
  }
}

export async function validateSession(token: string) {
  try {
    const session = await db.userSession.findFirst({
      where: {
        token,
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    })

    if (!session) {
      return null
    }

    return {
      session,
      user: session.user
    }
  } catch (error) {
    console.error('Validate session error:', error)
    return null
  }
}

// NextAuth integration functions
export const authOptions = {
  providers: [],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
}

// Get authenticated user from request
export async function getAuthUser(request: Request) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    // Extract token
    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    
    if (!payload) {
      return null
    }

    // Get user from database
    const user = await getUserById(payload.id)
    return user
  } catch (error) {
    console.error('Get auth user error:', error)
    return null
  }
}