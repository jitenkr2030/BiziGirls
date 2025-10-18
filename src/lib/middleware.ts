import { NextRequest, NextResponse } from 'next/server'
import { config, securityConfig } from './config'
import { CSRFProtection } from './csrf'
import { SQLInjectionPrevention } from './sql-injection-prevention'
import { XSSPrevention } from './xss-prevention'
import { applyRateLimit, rateLimiters } from './rate-limiter'
import { applyPerformanceOptimization } from './performance-optimization'

export function cors(request: NextRequest) {
  const origin = request.headers.get('origin')
  
  // Check if the origin is allowed
  const isAllowedOrigin = config.security.corsOrigins.includes(origin || '') || !origin
  
  if (isAllowedOrigin) {
    const response = NextResponse.next()
    
    response.headers.set('Access-Control-Allow-Origin', origin || '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    
    return response
  }
  
  return NextResponse.json({ error: 'Origin not allowed' }, { status: 403 })
}

export function securityHeaders(request: NextRequest) {
  const response = NextResponse.next()
  
  // Enhanced security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
  response.headers.set('X-Download-Options', 'noopen')
  response.headers.set('X-Content-Security-Policy', "default-src 'self'")
  
  // HSTS in production
  if (config.app.env === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }
  
  // Remove server info
  response.headers.set('Server', '')
  response.headers.set('X-Powered-By', '')
  
  return response
}

export async function csrfProtection(request: NextRequest) {
  if (!securityConfig.csrf.enabled) {
    return null
  }

  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return null
  }

  // Validate CSRF token
  const csrfResult = CSRFProtection.middleware(request)
  if (csrfResult) {
    return csrfResult
  }

  return null
}

export async function sqlInjectionProtection(request: NextRequest) {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return null
  }

  try {
    const body = await request.clone().json()
    const validation = SQLInjectionPrevention.validateObject(body)
    
    if (!validation.valid) {
      console.error('SQL injection attempt detected:', validation.errors)
      return NextResponse.json(
        { error: 'Invalid request data detected' },
        { status: 400 }
      )
    }
  } catch {
    // Invalid JSON, let the route handler deal with it
  }

  return null
}

export async function xssProtection(request: NextRequest) {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return null
  }

  try {
    const body = await request.clone().json()
    const { sanitized, warnings } = XSSPrevention.validateAndSanitizeObject(body)
    
    if (warnings.length > 0) {
      console.warn('XSS warnings:', warnings)
    }
    
    // Create a new request with sanitized data
    if (warnings.length > 0) {
      const sanitizedBody = JSON.stringify(sanitized)
      const newRequest = new Request(request.url, {
        method: request.method,
        headers: request.headers,
        body: sanitizedBody,
        duplex: 'half'
      })
      
      // Store sanitized data for route handlers
      ;(newRequest as any).sanitizedData = sanitized
      return newRequest
    }
  } catch {
    // Invalid JSON, let the route handler deal with it
  }

  return null
}

export async function rateLimiting(request: NextRequest) {
  // Apply different rate limits based on endpoint
  const path = request.nextUrl.pathname
  
  let limiter = rateLimiters.api
  
  if (path.startsWith('/api/auth')) {
    limiter = rateLimiters.auth
  } else if (path.startsWith('/api/upload')) {
    limiter = rateLimiters.upload
  } else if (path.startsWith('/api/email')) {
    limiter = rateLimiters.email
  } else if (path.startsWith('/api/admin')) {
    limiter = rateLimiters.admin
  }
  
  const rateLimitResult = await applyRateLimit(request, limiter)
  
  if (!rateLimitResult.success && rateLimitResult.response) {
    return rateLimitResult.response
  }
  
  return null
}

export function contentSecurityPolicy(request: NextRequest) {
  const response = NextResponse.next()
  
  // Build CSP based on configuration
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net`,
    `style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net`,
    `img-src 'self' data: https: blob:`,
    `font-src 'self' https://cdn.jsdelivr.net`,
    `connect-src 'self' https://api.stripe.com wss: https://*.cloudinary.com`,
    `frame-src 'self' https://js.stripe.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `block-all-mixed-content`,
    `upgrade-insecure-requests`
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)
  
  return response
}

export function requestValidation(request: NextRequest) {
  // Validate request size
  const contentLength = request.headers.get('content-length')
  if (contentLength) {
    const size = parseInt(contentLength)
    if (size > securityConfig.maxRequestBodySize) {
      return NextResponse.json(
        { error: 'Request body too large' },
        { status: 413 }
      )
    }
  }
  
  // Validate content type
  const contentType = request.headers.get('content-type')
  if (request.method !== 'GET' && request.method !== 'HEAD' && request.method !== 'OPTIONS') {
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 415 }
      )
    }
  }
  
  return null
}

export function securityLogging(request: NextRequest) {
  // Log security-relevant information
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const path = request.nextUrl.pathname
  const method = request.method
  
  // Log suspicious requests
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /union.*select/i,
    /drop.*table/i,
    /exec\(/i,
    /system\(/i
  ]
  
  const url = request.url.toLowerCase()
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(url))
  
  if (isSuspicious) {
    console.warn('Suspicious request detected:', {
      ip,
      userAgent,
      path,
      method,
      url,
      timestamp: new Date().toISOString()
    })
  }
  
  return null
}

export async function middleware(request: NextRequest) {
  // Apply CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const corsResponse = cors(request)
    if (corsResponse.status !== 200) {
      return corsResponse
    }
  }
  
  // Apply security headers to all requests
  const securityResponse = securityHeaders(request)
  if (securityResponse.status !== 200) {
    return securityResponse
  }
  
  // Apply content security policy
  const cspResponse = contentSecurityPolicy(request)
  if (cspResponse.status !== 200) {
    return cspResponse
  }
  
  // Apply security logging
  const logResponse = securityLogging(request)
  if (logResponse && logResponse.status !== 200) {
    return logResponse
  }
  
  // Apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const rateLimitResponse = await rateLimiting(request)
    if (rateLimitResponse && rateLimitResponse.status !== 200) {
      return rateLimitResponse
    }
  }
  
  // Apply request validation
  if (request.nextUrl.pathname.startsWith('/api')) {
    const validationResponse = requestValidation(request)
    if (validationResponse && validationResponse.status !== 200) {
      return validationResponse
    }
  }
  
  // Apply CSRF protection to state-changing requests
  if (request.nextUrl.pathname.startsWith('/api') && 
      ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const csrfResponse = await csrfProtection(request)
    if (csrfResponse && csrfResponse.status !== 200) {
      return csrfResponse
    }
  }
  
  // Apply SQL injection protection
  if (request.nextUrl.pathname.startsWith('/api') && 
      ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const sqlResponse = await sqlInjectionProtection(request)
    if (sqlResponse && sqlResponse.status !== 200) {
      return sqlResponse
    }
  }
  
  // Apply XSS protection
  if (request.nextUrl.pathname.startsWith('/api') && 
      ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const xssResponse = await xssProtection(request)
    if (xssResponse instanceof Response) {
      return xssResponse
    }
  }
  
  // Apply performance optimization
  let response = NextResponse.next()
  response = await applyPerformanceOptimization(request, response)
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}