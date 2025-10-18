import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

export interface TwoFactorSetup {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}

export function generate2FASecret(userEmail: string): TwoFactorSetup {
  const secret = speakeasy.generateSecret({
    name: `GirlsPreneur (${userEmail})`,
    issuer: 'GirlsPreneur',
    length: 32
  })

  const backupCodes = generateBackupCodes()

  return {
    secret: secret.base32!,
    qrCodeUrl: secret.otpauth_url!,
    backupCodes
  }
}

export function generateBackupCodes(): string[] {
  const codes: string[] = []
  for (let i = 0; i < 10; i++) {
    codes.push(speakeasy.generateSecret({ length: 8 }).base32!.substring(0, 8).toUpperCase())
  }
  return codes
}

export async function generateQRCodeDataURL(otpauthUrl: string): Promise<string> {
  try {
    return await QRCode.toDataURL(otpauthUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
  } catch (error) {
    throw new Error('Failed to generate QR code')
  }
}

export function verify2FAToken(token: string, secret: string): boolean {
  try {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2,
      step: 30
    })
  } catch (error) {
    return false
  }
}

export function verifyBackupCode(code: string, backupCodes: string[]): boolean {
  return backupCodes.includes(code.toUpperCase())
}

export function formatBackupCode(code: string): string {
  return code.match(/.{1,4}/g)?.join('-') || code
}

export function validate2FAToken(token: string): { isValid: boolean; error?: string } {
  if (!token || token.length !== 6) {
    return { isValid: false, error: 'Token must be 6 digits' }
  }
  
  if (!/^\d+$/.test(token)) {
    return { isValid: false, error: 'Token must contain only numbers' }
  }
  
  return { isValid: true }
}