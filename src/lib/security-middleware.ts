import { NextRequest, NextResponse } from 'next/server'

export interface SecurityConfig {
  enableCORS?: boolean
  enableHelmet?: boolean
  enableCSRF?: boolean
  allowedOrigins?: string[]
  allowedMethods?: string[]
  allowedHeaders?: string[]
  maxAge?: number
}

export class SecurityMiddleware {
  private config: Required<SecurityConfig>

  constructor(config: SecurityConfig = {}) {
    this.config = {
      enableCORS: config.enableCORS ?? true,
      enableHelmet: config.enableHelmet ?? true,
      enableCSRF: config.enableCSRF ?? true,
      allowedOrigins: config.allowedOrigins ?? [
        'http://localhost:3000',
        'https://localhost:3000'
      ],
      allowedMethods: config.allowedMethods ?? [
        'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'
      ],
      allowedHeaders: config.allowedHeaders ?? [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers'
      ],
      maxAge: config.maxAge ?? 86400 // 24 hours
    }
  }

  // Apply security headers
  applyHeaders(response: NextResponse): NextResponse {
    if (this.config.enableHelmet) {
      // Security headers
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('X-Frame-Options', 'DENY')
      response.headers.set('X-XSS-Protection', '1; mode=block')
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
      response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    }

    return response
  }

  // Handle CORS
  handleCORS(request: NextRequest): NextResponse | null {
    if (!this.config.enableCORS) {
      return null
    }

    const origin = request.headers.get('origin')
    
    // Check if origin is allowed
    if (origin && !this.config.allowedOrigins.includes(origin)) {
      return new NextResponse('CORS policy violation', { status: 403 })
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 })
      
      response.headers.set('Access-Control-Allow-Origin', origin || '*')
      response.headers.set('Access-Control-Allow-Methods', this.config.allowedMethods.join(', '))
      response.headers.set('Access-Control-Allow-Headers', this.config.allowedHeaders.join(', '))
      response.headers.set('Access-Control-Max-Age', this.config.maxAge.toString())
      
      return response
    }

    return null
  }

  // Validate request method
  validateMethod(request: NextRequest): boolean {
    return this.config.allowedMethods.includes(request.method)
  }

  // Sanitize input data
  sanitizeInput(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data
    }

    const sanitized: any = {}
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        // Remove potential XSS threats
        sanitized[key] = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeInput(value)
      } else {
        sanitized[key] = value
      }
    }
    
    return sanitized
  }

  // Validate file upload
  validateFileUpload(file: File, options: {
    maxSize?: number // in bytes
    allowedTypes?: string[]
    allowedExtensions?: string[]
  }): { valid: boolean; error?: string } {
    const { maxSize = 10 * 1024 * 1024, allowedTypes = [], allowedExtensions = [] } = options

    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`
      }
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`
      }
    }

    // Check file extension
    if (allowedExtensions.length > 0) {
      const extension = file.name.split('.').pop()?.toLowerCase()
      if (!extension || !allowedExtensions.includes(extension)) {
        return {
          valid: false,
          error: `File extension .${extension} is not allowed`
        }
      }
    }

    return { valid: true }
  }

  // Generate CSRF token
  generateCSRFToken(): string {
    return crypto.randomUUID()
  }

  // Validate CSRF token
  validateCSRFToken(token: string, sessionToken: string): boolean {
    return token === sessionToken
  }

  // Rate limiting by IP
  async checkRateLimit(
    ip: string,
    endpoint: string,
    limit: number = 100,
    windowMs: number = 60000
  ): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
    // This would typically use Redis or a database
    // For now, we'll use a simple in-memory implementation
    const key = `${ip}:${endpoint}`
    const now = new Date()
    const windowStart = new Date(now.getTime() - windowMs)
    
    // This is a simplified version - in production, use Redis or database
    const count = 0 // Implement actual counting logic
    
    return {
      allowed: count < limit,
      remaining: Math.max(0, limit - count),
      resetTime: new Date(now.getTime() + windowMs)
    }
  }

  // Security validation for authentication
  validateAuthRequest(request: NextRequest): { valid: boolean; error?: string } {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return { valid: false, error: 'Authorization header required' }
    }

    if (!authHeader.startsWith('Bearer ')) {
      return { valid: false, error: 'Invalid authorization format' }
    }

    const token = authHeader.substring(7)
    
    if (!token || token.length < 10) {
      return { valid: false, error: 'Invalid token' }
    }

    return { valid: true }
  }

  // Input validation for common fields
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
  }

  validateURL(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // Security logging
  logSecurityEvent(event: {
    type: 'auth_attempt' | 'rate_limit_exceeded' | 'xss_attempt' | 'csrf_attempt' | 'file_upload'
    ip: string
    userAgent?: string
    userId?: string
    details?: any
  }): void {
    // In production, this would log to a security monitoring system
    console.log('Security Event:', {
      ...event,
      timestamp: new Date().toISOString()
    })
  }
}

// Pre-configured security middleware instances
export const securityMiddleware = new SecurityMiddleware()

// Re-export rate limiters for compatibility
export { rateLimiters } from './rate-limiter'

// Apply security middleware to API routes
export async function applySecurityMiddleware(
  request: NextRequest,
  config?: SecurityConfig
): Promise<{ response?: NextResponse; sanitizedData?: any }> {
  const security = new SecurityMiddleware(config)
  
  // Handle CORS
  const corsResponse = security.handleCORS(request)
  if (corsResponse) {
    return { response: corsResponse }
  }

  // Validate method
  if (!security.validateMethod(request)) {
    return {
      response: new NextResponse('Method not allowed', { status: 405 })
    }
  }

  // Validate auth for protected routes
  const authValidation = security.validateAuthRequest(request)
  if (!authValidation.valid) {
    return {
      response: new NextResponse(authValidation.error || 'Unauthorized', { status: 401 })
    }
  }

  // Sanitize request body if present
  let sanitizedData: any = undefined
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      const body = await request.clone().json()
      sanitizedData = security.sanitizeInput(body)
    } catch {
      // Invalid JSON, let the route handler deal with it
    }
  }

  return { sanitizedData }
}