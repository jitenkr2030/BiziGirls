import { NextResponse } from 'next/server'
import { monitoringService } from './monitoring'
import { logger } from './logger'
import { config } from './config'
import os from 'os'

export interface PerformanceMetrics {
  requestStart: number
  requestEnd: number
  duration: number
  memoryUsage: NodeJS.MemoryUsage
  cpuUsage: NodeJS.CpuUsage
  responseSize: number
  cacheHit: boolean
  databaseQueries: number
  externalApiCalls: number
}

export class PerformanceOptimizationMiddleware {
  private metrics: Map<string, PerformanceMetrics[]> = new Map()
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private slowQueryThreshold = 1000 // 1 second
  private memoryThreshold = 0.8 // 80% memory usage

  constructor() {
    this.initializeMetrics()
    this.startPeriodicCleanup()
  }

  private initializeMetrics() {
    this.metrics.set('requests', [])
    this.metrics.set('database', [])
    this.metrics.set('cache', [])
    this.metrics.set('external', [])
  }

  // Middleware function
  middleware() {
    return async (request: Request, context: any) => {
      const startTime = Date.now()
      const startMemory = process.memoryUsage()
      const startCpu = process.cpuUsage()
      
      const url = new URL(request.url)
      const path = url.pathname
      const method = request.method

      // Check cache for GET requests
      let cacheHit = false
      let responseData: any = null
      
      if (method === 'GET' && this.shouldCache(path)) {
        const cacheKey = this.getCacheKey(request)
        const cached = this.cache.get(cacheKey)
        
        if (cached && Date.now() - cached.timestamp < cached.ttl) {
          cacheHit = true
          responseData = cached.data
          monitoringService.monitorCacheHit()
        }
      }

      try {
        let response: NextResponse

        if (cacheHit && responseData) {
          response = NextResponse.json(responseData)
        } else {
          // Process request normally
          response = await this.processRequest(request, context)
          
          // Cache successful GET responses
          if (method === 'GET' && response.status === 200 && this.shouldCache(path)) {
            const cacheKey = this.getCacheKey(request)
            const data = await response.json()
            this.cache.set(cacheKey, {
              data,
              timestamp: Date.now(),
              ttl: this.getCacheTTL(path),
            })
          }
        }

        const endTime = Date.now()
        const endMemory = process.memoryUsage()
        const endCpu = process.cpuUsage()
        const duration = endTime - startTime

        // Calculate performance metrics
        const metrics: PerformanceMetrics = {
          requestStart: startTime,
          requestEnd: endTime,
          duration,
          memoryUsage: {
            rss: endMemory.rss - startMemory.rss,
            heapTotal: endMemory.heapTotal - startMemory.heapTotal,
            heapUsed: endMemory.heapUsed - startMemory.heapUsed,
            external: endMemory.external - startMemory.external,
            arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers,
          },
          cpuUsage: {
            user: endCpu.user - startCpu.user,
            system: endCpu.system - startCpu.system,
          },
          responseSize: JSON.stringify(response).length,
          cacheHit,
          databaseQueries: 0, // Will be updated by database monitoring
          externalApiCalls: 0, // Will be updated by external API monitoring
        }

        // Record metrics
        this.recordMetrics(path, method, metrics)

        // Check for performance issues
        this.checkPerformanceIssues(metrics, path, method)

        // Add performance headers
        response.headers.set('X-Response-Time', `${duration}ms`)
        response.headers.set('X-Cache-Hit', cacheHit.toString())
        response.headers.set('X-Memory-Usage', `${Math.round(endMemory.heapUsed / 1024 / 1024)}MB`)

        return response
      } catch (error) {
        const endTime = Date.now()
        const duration = endTime - startTime

        logger.error('Request processing failed', {
          path,
          method,
          duration,
          error: error.message,
        })

        monitoringService.recordMetric('http.errors', 1, { path, method, status: 500 })

        return NextResponse.json(
          { error: 'Internal Server Error' },
          { status: 500 }
        )
      }
    }
  }

  private async processRequest(request: Request, context: any): Promise<NextResponse> {
    // This is where the actual request processing happens
    // In a real implementation, this would call the Next.js handler
    
    // For now, we'll just return a mock response
    return NextResponse.json({ message: 'Request processed' })
  }

  private shouldCache(path: string): boolean {
    // Define which paths should be cached
    const cacheablePaths = [
      '/api/courses',
      '/api/mentors',
      '/api/products',
      '/api/events',
      '/api/funding-opportunities',
    ]

    return cacheablePaths.some(cachePath => path.startsWith(cachePath))
  }

  private getCacheKey(request: Request): string {
    const url = new URL(request.url)
    return `${request.method}:${url.pathname}:${url.search}`
  }

  private getCacheTTL(path: string): number {
    // Different TTL for different paths
    if (path.includes('/api/courses')) {
      return 3600000 // 1 hour
    } else if (path.includes('/api/mentors')) {
      return 1800000 // 30 minutes
    } else if (path.includes('/api/products')) {
      return 900000 // 15 minutes
    } else {
      return 300000 // 5 minutes
    }
  }

  private recordMetrics(path: string, method: string, metrics: PerformanceMetrics) {
    // Record request metrics
    monitoringService.recordMetric('http.requests', metrics.duration, { path, method })
    monitoringService.monitorRequest(method, path, 200, metrics.duration)

    // Record memory usage
    const memoryUsageMB = metrics.memoryUsage.heapUsed / 1024 / 1024
    monitoringService.recordMetric('memory.usage', memoryUsageMB, { path })

    // Record cache metrics
    if (metrics.cacheHit) {
      monitoringService.monitorCacheHit()
    } else {
      monitoringService.monitorCacheMiss()
    }

    // Store detailed metrics
    const key = `${method}:${path}`
    if (!this.metrics.has(key)) {
      this.metrics.set(key, [])
    }

    this.metrics.get(key)!.push(metrics)

    // Keep only last 100 metrics per endpoint
    const endpointMetrics = this.metrics.get(key)!
    if (endpointMetrics.length > 100) {
      this.metrics.set(key, endpointMetrics.slice(-100))
    }
  }

  private checkPerformanceIssues(metrics: PerformanceMetrics, path: string, method: string) {
    // Check for slow requests
    if (metrics.duration > 1000) {
      logger.warn('Slow request detected', {
        path,
        method,
        duration: metrics.duration,
        memoryUsage: Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024),
      })
    }

    // Check for high memory usage
    const totalMemory = os.totalmem()
    const memoryUsagePercent = metrics.memoryUsage.heapUsed / totalMemory
    
    if (memoryUsagePercent > this.memoryThreshold) {
      logger.warn('High memory usage detected', {
        path,
        method,
        memoryUsagePercent: Math.round(memoryUsagePercent * 100),
        memoryUsageMB: Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024),
      })
    }

    // Check for excessive database queries
    if (metrics.databaseQueries > 10) {
      logger.warn('Excessive database queries detected', {
        path,
        method,
        queryCount: metrics.databaseQueries,
      })
    }

    // Check for excessive external API calls
    if (metrics.externalApiCalls > 5) {
      logger.warn('Excessive external API calls detected', {
        path,
        method,
        apiCallCount: metrics.externalApiCalls,
      })
    }
  }

  // Update database query count for current request
  incrementDatabaseQueries() {
    // This would be called by database monitoring middleware
    // Implementation depends on request context management
  }

  // Update external API call count for current request
  incrementExternalApiCalls() {
    // This would be called by external API monitoring middleware
    // Implementation depends on request context management
  }

  // Get performance statistics
  getPerformanceStats(path?: string, method?: string) {
    const stats: any = {}

    if (path && method) {
      const key = `${method}:${path}`
      const metrics = this.metrics.get(key) || []
      
      if (metrics.length > 0) {
        stats[key] = this.calculateStats(metrics)
      }
    } else {
      // Calculate stats for all endpoints
      for (const [key, metrics] of this.metrics) {
        if (metrics.length > 0) {
          stats[key] = this.calculateStats(metrics)
        }
      }
    }

    return stats
  }

  private calculateStats(metrics: PerformanceMetrics[]) {
    const durations = metrics.map(m => m.duration)
    const memoryUsages = metrics.map(m => m.memoryUsage.heapUsed / 1024 / 1024)
    const cacheHits = metrics.filter(m => m.cacheHit).length

    return {
      requestCount: metrics.length,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      averageMemoryUsage: memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length,
      cacheHitRate: (cacheHits / metrics.length) * 100,
      latestMetrics: metrics[metrics.length - 1],
    }
  }

  // Clear cache
  clearCache(pattern?: string) {
    if (pattern) {
      const regex = new RegExp(pattern)
      for (const [key] of this.cache) {
        if (regex.test(key)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }
  }

  // Get cache statistics
  getCacheStats() {
    const stats = {
      totalEntries: this.cache.size,
      hitRate: 0,
      entries: [] as Array<{ key: string; timestamp: number; ttl: number }>,
    }

    let totalHits = 0
    let totalRequests = 0

    for (const [key, entry] of this.cache) {
      stats.entries.push({
        key,
        timestamp: entry.timestamp,
        ttl: entry.ttl,
      })
    }

    // Calculate hit rate from metrics
    for (const metrics of this.metrics.values()) {
      totalRequests += metrics.length
      totalHits += metrics.filter(m => m.cacheHit).length
    }

    stats.hitRate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0

    return stats
  }

  // Start periodic cleanup
  private startPeriodicCleanup() {
    setInterval(() => {
      this.cleanupExpiredCache()
      this.cleanupOldMetrics()
    }, 300000) // Every 5 minutes
  }

  private cleanupExpiredCache() {
    const now = Date.now()
    let cleanedCount = 0

    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      logger.info('Cache cleanup completed', { cleanedCount })
    }
  }

  private cleanupOldMetrics() {
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000 // 24 hours
    let cleanedCount = 0

    for (const [key, metrics] of this.metrics) {
      const filteredMetrics = metrics.filter(m => m.requestStart > cutoffTime)
      
      if (filteredMetrics.length !== metrics.length) {
        this.metrics.set(key, filteredMetrics)
        cleanedCount += metrics.length - filteredMetrics.length
      }
    }

    if (cleanedCount > 0) {
      logger.info('Metrics cleanup completed', { cleanedCount })
    }
  }

  // Get optimization recommendations
  getOptimizationRecommendations() {
    const recommendations: string[] = []
    const stats = this.getPerformanceStats()

    // Analyze all endpoints
    for (const [endpoint, endpointStats] of Object.entries(stats)) {
      const statsData = endpointStats as any

      // Check for slow endpoints
      if (statsData.averageDuration > 1000) {
        recommendations.push(`Endpoint ${endpoint} is slow (${Math.round(statsData.averageDuration)}ms average). Consider optimization.`)
      }

      // Check for high memory usage
      if (statsData.averageMemoryUsage > 100) {
        recommendations.push(`Endpoint ${endpoint} uses high memory (${Math.round(statsData.averageMemoryUsage)}MB average). Consider memory optimization.`)
      }

      // Check for low cache hit rate
      if (statsData.cacheHitRate < 50 && statsData.requestCount > 10) {
        recommendations.push(`Endpoint ${endpoint} has low cache hit rate (${Math.round(statsData.cacheHitRate)}%). Consider adjusting cache strategy.`)
      }
    }

    return recommendations
  }
}

// Create singleton instance
export const performanceOptimizationMiddleware = new PerformanceOptimizationMiddleware()

// Export middleware function
export const performanceMiddleware = () => performanceOptimizationMiddleware.middleware()

// Export utility functions
export const getPerformanceStats = (path?: string, method?: string) => 
  performanceOptimizationMiddleware.getPerformanceStats(path, method)

export const clearCache = (pattern?: string) => 
  performanceOptimizationMiddleware.clearCache(pattern)

export const getCacheStats = () => 
  performanceOptimizationMiddleware.getCacheStats()

export const getOptimizationRecommendations = () => 
  performanceOptimizationMiddleware.getOptimizationRecommendations()