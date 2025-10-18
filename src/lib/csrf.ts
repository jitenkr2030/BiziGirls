import crypto from 'crypto'
import { config } from './config'

export class CSRFProtection {
  private static readonly TOKEN_LENGTH = 32
  private static readonly COOKIE_NAME = 'csrf_token'
  private static readonly HEADER_NAME = 'X-CSRF-Token'

  static generateToken(): string {
    return crypto.randomBytes(this.TOKEN_LENGTH).toString('hex')
  }

  static validateToken(token: string, storedToken: string): boolean {
    if (!token || !storedToken) {
      return false
    }
    
    return crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(storedToken, 'hex')
    )
  }

  static getTokenFromRequest(request: Request): string | null {
    return request.headers.get(this.HEADER_NAME)
  }

  static getTokenFromCookie(request: Request): string | null {
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) {
      return null
    }
    
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=')
      acc[name] = value
      return acc
    }, {} as Record<string, string>)
    
    return cookies[this.COOKIE_NAME] || null
  }

  static middleware(request: Request): Response | null {
    // Skip CSRF protection for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return null
    }
    
    // Skip CSRF protection if disabled in development
    if (!config.security.csrfEnabled) {
      return null
    }
    
    const token = this.getTokenFromRequest(request)
    const storedToken = this.getTokenFromCookie(request)
    
    if (!this.validateToken(token || '', storedToken || '')) {
      return new Response('Invalid CSRF token', { status: 403 })
    }
    
    return null
  }
}