import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string // Custom key generator
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean // Don't count failed requests
  message?: string // Custom error message
}

interface RateLimitInfo {
  remaining: number
  reset: Date
  total: number
}

export class RateLimiter {
  private config: Required<RateLimitConfig>
  private store: Map<string, { count: number; resetTime: Date }> = new Map()

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: config.windowMs,
      maxRequests: config.maxRequests,
      keyGenerator: config.keyGenerator || this.defaultKeyGenerator,
      skipSuccessfulRequests: config.skipSuccessfulRequests || false,
      skipFailedRequests: config.skipFailedRequests || false,
      message: config.message || 'Too many requests, please try again later.'
    }
  }

  private defaultKeyGenerator(req: NextRequest): string {
    // Get client IP
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown'
    
    // Get user ID if authenticated
    const authHeader = req.headers.get('authorization')
    const userId = authHeader ? 'auth' : 'anonymous'
    
    return `${ip}:${userId}`
  }

  private cleanup(): void {
    const now = new Date()
    for (const [key, data] of this.store.entries()) {
      if (data.resetTime <= now) {
        this.store.delete(key)
      }
    }
  }

  async check(req: NextRequest): Promise<{
    success: boolean
    info: RateLimitInfo
    response?: NextResponse
  }> {
    this.cleanup()
    
    const key = this.config.keyGenerator(req)
    const now = new Date()
    const windowStart = new Date(now.getTime() - this.config.windowMs)
    
    let data = this.store.get(key)
    
    if (!data || data.resetTime <= windowStart) {
      data = {
        count: 0,
        resetTime: new Date(now.getTime() + this.config.windowMs)
      }
      this.store.set(key, data)
    }
    
    const info: RateLimitInfo = {
      remaining: Math.max(0, this.config.maxRequests - data.count),
      reset: data.resetTime,
      total: this.config.maxRequests
    }
    
    if (data.count >= this.config.maxRequests) {
      return {
        success: false,
        info,
        response: NextResponse.json(
          {
            success: false,
            error: this.config.message,
            retryAfter: Math.ceil((data.resetTime.getTime() - now.getTime()) / 1000)
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': this.config.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': data.resetTime.toISOString(),
              'Retry-After': Math.ceil((data.resetTime.getTime() - now.getTime()) / 1000).toString()
            }
          }
        )
      }
    }
    
    return {
      success: true,
      info
    }
  }

  async increment(req: NextRequest, success?: boolean): Promise<void> {
    if (success !== undefined) {
      if (success && this.config.skipSuccessfulRequests) return
      if (!success && this.config.skipFailedRequests) return
    }
    
    const key = this.config.keyGenerator(req)
    const data = this.store.get(key)
    
    if (data) {
      data.count++
    }
  }
}

// Pre-configured rate limiters for different endpoints
export const rateLimiters = {
  // General API rate limiting (100 requests per minute)
  general: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100
  }),

  // Auth endpoints (5 requests per minute)
  auth: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    message: 'Too many authentication attempts, please try again later.'
  }),

  // File upload endpoints (10 requests per minute)
  upload: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: 'Too many upload attempts, please try again later.'
  }),

  // Payment endpoints (20 requests per minute)
  payment: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
    message: 'Too many payment attempts, please try again later.'
  }),

  // Email/SMS endpoints (5 requests per minute)
  messaging: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    message: 'Too many messages sent, please try again later.'
  })
}

// Middleware function for rate limiting
export async function applyRateLimit(
  req: NextRequest,
  limiter: RateLimiter = rateLimiters.general
): Promise<{ success: boolean; response?: NextResponse }> {
  const result = await limiter.check(req)
  
  if (!result.success && result.response) {
    return { success: false, response: result.response }
  }
  
  return { success: true }
}

// Database-backed rate limiter for production use
export class DatabaseRateLimiter {
  private config: Required<RateLimitConfig>

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: config.windowMs,
      maxRequests: config.maxRequests,
      keyGenerator: config.keyGenerator || this.defaultKeyGenerator,
      skipSuccessfulRequests: config.skipSuccessfulRequests || false,
      skipFailedRequests: config.skipFailedRequests || false,
      message: config.message || 'Too many requests, please try again later.'
    }
  }

  private defaultKeyGenerator(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown'
    const authHeader = req.headers.get('authorization')
    const userId = authHeader ? 'auth' : 'anonymous'
    return `${ip}:${userId}`
  }

  async check(req: NextRequest): Promise<{
    success: boolean
    info: RateLimitInfo
    response?: NextResponse
  }> {
    const key = this.config.keyGenerator(req)
    const now = new Date()
    const windowStart = new Date(now.getTime() - this.config.windowMs)
    
    // Clean up old entries
    await db.rateLimit.deleteMany({
      where: {
        resetTime: { lt: windowStart }
      }
    })
    
    // Get or create rate limit record
    let rateLimitRecord = await db.rateLimit.findUnique({
      where: { key }
    })
    
    if (!rateLimitRecord || rateLimitRecord.resetTime <= windowStart) {
      rateLimitRecord = await db.rateLimit.create({
        data: {
          key,
          count: 0,
          resetTime: new Date(now.getTime() + this.config.windowMs)
        }
      })
    }
    
    const info: RateLimitInfo = {
      remaining: Math.max(0, this.config.maxRequests - rateLimitRecord.count),
      reset: rateLimitRecord.resetTime,
      total: this.config.maxRequests
    }
    
    if (rateLimitRecord.count >= this.config.maxRequests) {
      return {
        success: false,
        info,
        response: NextResponse.json(
          {
            success: false,
            error: this.config.message,
            retryAfter: Math.ceil((rateLimitRecord.resetTime.getTime() - now.getTime()) / 1000)
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': this.config.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': rateLimitRecord.resetTime.toISOString(),
              'Retry-After': Math.ceil((rateLimitRecord.resetTime.getTime() - now.getTime()) / 1000).toString()
            }
          }
        )
      }
    }
    
    return {
      success: true,
      info
    }
  }

  async increment(req: NextRequest, success?: boolean): Promise<void> {
    if (success !== undefined) {
      if (success && this.config.skipSuccessfulRequests) return
      if (!success && this.config.skipFailedRequests) return
    }
    
    const key = this.config.keyGenerator(req)
    
    await db.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } }
    })
  }
}