import { getCacheConfig } from './config'

export interface CacheEntry<T = any> {
  data: T
  expires: number
  tags: string[]
  metadata?: Record<string, any>
}

export interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  tags?: string[]
  metadata?: Record<string, any>
  strategy?: 'memory' | 'redis' | 'hybrid'
}

export interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  size: number
  hitRate: number
}

export class CacheService {
  private memoryCache: Map<string, CacheEntry>
  private stats: CacheStats
  private config: typeof getCacheConfig.return

  constructor() {
    this.memoryCache = new Map()
    this.config = getCacheConfig()
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      size: 0,
      hitRate: 0
    }

    // Start cleanup interval
    this.startCleanupInterval()
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanup()
    }, 60000) // Clean up every minute
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.expires) {
        this.memoryCache.delete(key)
        this.stats.deletes++
        this.stats.size--
      }
    }
    this.updateHitRate()
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0
  }

  /**
   * Get data from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // Try memory cache first
      const entry = this.memoryCache.get(key)
      if (entry && Date.now() <= entry.expires) {
        this.stats.hits++
        this.updateHitRate()
        return entry.data as T
      }

      // If not found in memory, try Redis if configured
      if (this.config.provider === 'redis' || this.config.provider === 'hybrid') {
        const redisData = await this.getFromRedis<T>(key)
        if (redisData) {
          // Store in memory cache as well
          this.memoryCache.set(key, redisData)
          this.stats.hits++
          this.updateHitRate()
          return redisData.data
        }
      }

      this.stats.misses++
      this.updateHitRate()
      return null
    } catch (error) {
      console.error('Cache get error:', error)
      this.stats.misses++
      this.updateHitRate()
      return null
    }
  }

  /**
   * Set data in cache
   */
  async set<T>(
    key: string,
    data: T,
    options: CacheOptions = {}
  ): Promise<void> {
    try {
      const {
        ttl = this.config.defaultTtl * 1000,
        tags = [],
        metadata,
        strategy = this.config.provider
      } = options

      const entry: CacheEntry<T> = {
        data,
        expires: Date.now() + ttl,
        tags,
        metadata
      }

      // Always store in memory cache
      this.memoryCache.set(key, entry)
      this.stats.sets++
      this.stats.size++

      // Store in Redis if configured
      if (strategy === 'redis' || strategy === 'hybrid') {
        await this.setToRedis(key, entry, ttl)
      }
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  /**
   * Delete data from cache
   */
  async delete(key: string): Promise<void> {
    try {
      // Delete from memory cache
      if (this.memoryCache.delete(key)) {
        this.stats.deletes++
        this.stats.size--
      }

      // Delete from Redis if configured
      if (this.config.provider === 'redis' || this.config.provider === 'hybrid') {
        await this.deleteFromRedis(key)
      }
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }

  /**
   * Clear cache by tags
   */
  async clearByTags(tags: string[]): Promise<void> {
    try {
      // Clear from memory cache
      for (const [key, entry] of this.memoryCache.entries()) {
        if (tags.some(tag => entry.tags.includes(tag))) {
          this.memoryCache.delete(key)
          this.stats.deletes++
          this.stats.size--
        }
      }

      // Clear from Redis if configured
      if (this.config.provider === 'redis' || this.config.provider === 'hybrid') {
        await this.clearRedisByTags(tags)
      }
    } catch (error) {
      console.error('Cache clear by tags error:', error)
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      // Clear memory cache
      this.memoryCache.clear()
      this.stats.size = 0

      // Clear Redis if configured
      if (this.config.provider === 'redis' || this.config.provider === 'hybrid') {
        await this.clearRedis()
      }
    } catch (error) {
      console.error('Cache clear error:', error)
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * Get cache keys
   */
  getKeys(): string[] {
    return Array.from(this.memoryCache.keys())
  }

  /**
   * Check if key exists in cache
   */
  async has(key: string): Promise<boolean> {
    const entry = this.memoryCache.get(key)
    if (entry && Date.now() <= entry.expires) {
      return true
    }

    // Check Redis if configured
    if (this.config.provider === 'redis' || this.config.provider === 'hybrid') {
      return await this.hasInRedis(key)
    }

    return false
  }

  /**
   * Get TTL for a key
   */
  async getTTL(key: string): Promise<number | null> {
    const entry = this.memoryCache.get(key)
    if (entry) {
      return Math.max(0, entry.expires - Date.now())
    }

    // Get from Redis if configured
    if (this.config.provider === 'redis' || this.config.provider === 'hybrid') {
      return await this.getRedisTTL(key)
    }

    return null
  }

  /**
   * Redis operations (simplified - in production, use a proper Redis client)
   */
  private async getFromRedis<T>(key: string): Promise<CacheEntry<T> | null> {
    // This is a simplified implementation
    // In production, use a proper Redis client like ioredis
    return null
  }

  private async setToRedis<T>(key: string, entry: CacheEntry<T>, ttl: number): Promise<void> {
    // This is a simplified implementation
    // In production, use a proper Redis client
  }

  private async deleteFromRedis(key: string): Promise<void> {
    // This is a simplified implementation
    // In production, use a proper Redis client
  }

  private async clearRedisByTags(tags: string[]): Promise<void> {
    // This is a simplified implementation
    // In production, use a proper Redis client with tag support
  }

  private async clearRedis(): Promise<void> {
    // This is a simplified implementation
    // In production, use a proper Redis client
  }

  private async hasInRedis(key: string): Promise<boolean> {
    // This is a simplified implementation
    // In production, use a proper Redis client
    return false
  }

  private async getRedisTTL(key: string): Promise<number | null> {
    // This is a simplified implementation
    // In production, use a proper Redis client
    return null
  }
}

// Cache utility functions
export class CacheUtils {
  /**
   * Generate cache key from parameters
   */
  static generateKey(prefix: string, ...params: any[]): string {
    const paramString = params
      .map(param => {
        if (typeof param === 'object') {
          return JSON.stringify(param)
        }
        return String(param)
      })
      .join(':')
    
    return `${prefix}:${paramString}`
  }

  /**
   * Generate cache key for API requests
   */
  static generateAPIKey(url: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : ''
    return `api:${url}:${paramString}`
  }

  /**
   * Generate cache key for database queries
   */
  static generateQueryKey(table: string, query: Record<string, any>): string {
    return `db:${table}:${JSON.stringify(query)}`
  }

  /**
   * Generate cache key for user-specific data
   */
  static generateUserKey(userId: string, resource: string): string {
    return `user:${userId}:${resource}`
  }

  /**
   * Create memoized function with caching
   */
  static memoize<T extends (...args: any[]) => any>(
    fn: T,
    options: {
      ttl?: number
      keyGenerator?: (...args: Parameters<T>) => string
    } = {}
  ): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    const cache = new Map<string, { data: ReturnType<T>; expires: number }>()
    const { ttl = 60000, keyGenerator } = options

    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
      const now = Date.now()

      const cached = cache.get(key)
      if (cached && now <= cached.expires) {
        return cached.data
      }

      const result = await fn(...args)
      cache.set(key, { data: result, expires: now + ttl })
      return result
    }
  }
}

// Default cache service instance
export const cacheService = new CacheService()

// Pre-configured cache instances for different use cases
export const cacheInstances = {
  // API response cache (5 minutes TTL)
  api: new CacheService(),

  // Database query cache (10 minutes TTL)
  database: new CacheService(),

  // User session cache (1 hour TTL)
  session: new CacheService(),

  // Static asset cache (1 day TTL)
  static: new CacheService(),

  // Analytics cache (15 minutes TTL)
  analytics: new CacheService(),

  // Email template cache (1 hour TTL)
  email: new CacheService(),

  // Configuration cache (5 minutes TTL)
  config: new CacheService()
}

/**
 * Higher-order function for caching function results
 */
export function withCache<T extends (...args: any[]) => any>(
  fn: T,
  options: {
    keyPrefix?: string
    ttl?: number
    tags?: string[]
    cacheInstance?: CacheService
  } = {}
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  const {
    keyPrefix = fn.name,
    ttl,
    tags = [],
    cacheInstance = cacheService
  } = options

  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const key = CacheUtils.generateKey(keyPrefix, ...args)
    
    // Try to get from cache
    const cached = await cacheInstance.get<ReturnType<T>>(key)
    if (cached) {
      return cached
    }

    // Execute function and cache result
    const result = await fn(...args)
    await cacheInstance.set(key, result, { ttl, tags })
    
    return result
  }
}

/**
 * Cache middleware for API routes
 */
export async function cacheMiddleware(
  request: Request,
  options: {
    ttl?: number
    tags?: string[]
    keyGenerator?: (req: Request) => string
    cacheInstance?: CacheService
  } = {}
): Promise<{ cached: boolean; data?: any; response?: Response }> {
  const {
    ttl = 300000, // 5 minutes
    tags = [],
    keyGenerator,
    cacheInstance = cacheService
  } = options

  const key = keyGenerator ? keyGenerator(request) : CacheUtils.generateAPIKey(request.url)

  // Try to get from cache
  const cached = await cacheInstance.get(key)
  if (cached) {
    return {
      cached: true,
      data: cached,
      response: new Response(JSON.stringify(cached), {
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'HIT',
          'Cache-Control': `public, max-age=${Math.floor(ttl / 1000)}`
        }
      })
    }
  }

  return { cached: false }
}

/**
 * Cache helper for database queries
 */
export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  options: {
    ttl?: number
    tags?: string[]
    cacheInstance?: CacheService
  } = {}
): Promise<T> {
  const {
    ttl = 600000, // 10 minutes
    tags = [],
    cacheInstance = cacheInstances.database
  } = options

  // Try to get from cache
  const cached = await cacheInstance.get<T>(key)
  if (cached) {
    return cached
  }

  // Execute query and cache result
  const result = await queryFn()
  await cacheInstance.set(key, result, { ttl, tags })
  
  return result
}