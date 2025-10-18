import { NextRequest, NextResponse } from 'next/server'
import { getCacheConfig } from './config'

export interface PerformanceConfig {
  enableCompression: boolean
  enableCaching: boolean
  enableImageOptimization: boolean
  enableCodeSplitting: boolean
  enableLazyLoading: boolean
  enablePrefetching: boolean
  cacheTTL: number
  compressionLevel: number
  imageQuality: number
  imageFormats: string[]
}

export interface CacheOptions {
  key: string
  data: any
  ttl?: number
  tags?: string[]
}

export interface PerformanceMetrics {
  responseTime: number
  memoryUsage: NodeJS.MemoryUsage
  cpuUsage?: NodeJS.CpuUsage
  cacheHitRate: number
  requestCount: number
  errorRate: number
}

export class PerformanceOptimizer {
  private config: PerformanceConfig
  private cache: Map<string, { data: any; expires: number; tags: string[] }>
  private metrics: PerformanceMetrics

  constructor(config?: Partial<PerformanceConfig>) {
    this.config = {
      enableCompression: config?.enableCompression ?? true,
      enableCaching: config?.enableCaching ?? true,
      enableImageOptimization: config?.enableImageOptimization ?? true,
      enableCodeSplitting: config?.enableCodeSplitting ?? true,
      enableLazyLoading: config?.enableLazyLoading ?? true,
      enablePrefetching: config?.enablePrefetching ?? true,
      cacheTTL: config?.cacheTTL ?? getCacheConfig().defaultTtl * 1000,
      compressionLevel: config?.compressionLevel ?? 6,
      imageQuality: config?.imageQuality ?? 80,
      imageFormats: config?.imageFormats ?? ['webp', 'avif', 'jpeg']
    }

    this.cache = new Map()
    this.metrics = {
      responseTime: 0,
      memoryUsage: process.memoryUsage(),
      cacheHitRate: 0,
      requestCount: 0,
      errorRate: 0
    }

    // Start performance monitoring
    this.startMonitoring()
  }

  /**
   * Start performance monitoring
   */
  private startMonitoring(): void {
    setInterval(() => {
      this.updateMetrics()
    }, 60000) // Update every minute
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(): void {
    this.metrics.memoryUsage = process.memoryUsage()
    
    // Calculate cache hit rate
    const totalRequests = this.metrics.requestCount
    const cacheHits = this.metrics.cacheHitRate * totalRequests
    this.metrics.cacheHitRate = totalRequests > 0 ? cacheHits / totalRequests : 0
  }

  /**
   * Cache data with TTL
   */
  async setCache(options: CacheOptions): Promise<void> {
    if (!this.config.enableCaching) return

    const { key, data, ttl = this.config.cacheTTL, tags = [] } = options
    const expires = Date.now() + ttl

    this.cache.set(key, { data, expires, tags })
  }

  /**
   * Get cached data
   */
  async getCache(key: string): Promise<any | null> {
    if (!this.config.enableCaching) return null

    const cached = this.cache.get(key)
    if (!cached) return null

    if (Date.now() > cached.expires) {
      this.cache.delete(key)
      return null
    }

    this.metrics.cacheHitRate++
    return cached.data
  }

  /**
   * Clear cache by key
   */
  async clearCache(key: string): Promise<void> {
    this.cache.delete(key)
  }

  /**
   * Clear cache by tags
   */
  async clearCacheByTags(tags: string[]): Promise<void> {
    for (const [key, cached] of this.cache.entries()) {
      if (tags.some(tag => cached.tags.includes(tag))) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Clear all cache
   */
  async clearAllCache(): Promise<void> {
    this.cache.clear()
  }

  /**
   * Optimize image URL
   */
  optimizeImageUrl(url: string, options?: {
    width?: number
    height?: number
    quality?: number
    format?: string
  }): string {
    if (!this.config.enableImageOptimization) return url

    const { width, height, quality = this.config.imageQuality, format } = options || {}
    
    // If using a CDN like Cloudinary, you can transform the URL
    if (url.includes('cloudinary.com')) {
      const transformations = []
      if (width) transformations.push(`w_${width}`)
      if (height) transformations.push(`h_${height}`)
      if (quality) transformations.push(`q_${quality}`)
      if (format) transformations.push(`f_${format}`)
      
      if (transformations.length > 0) {
        const [baseUrl, query] = url.split('?')
        const transformString = transformations.join(',')
        return `${baseUrl.replace('/upload/', `/upload/${transformString}/`)}${query ? `?${query}` : ''}`
      }
    }

    // For local images, return as-is (Next.js Image component will handle optimization)
    return url
  }

  /**
   * Generate critical CSS for above-the-fold content
   */
  generateCriticalCSS(html: string): string {
    // This is a simplified version - in production, you'd use a proper critical CSS generator
    const criticalStyles = [
      'body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }',
      '.container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }',
      '.btn { display: inline-block; padding: 0.5rem 1rem; background: #007bff; color: white; text-decoration: none; border-radius: 0.25rem; }'
    ]
    
    return criticalStyles.join('\n')
  }

  /**
   * Create lazy loading attributes
   */
  createLazyLoadingAttributes(options?: {
    threshold?: number
    rootMargin?: string
  }): string {
    const { threshold = 0.1, rootMargin = '0px' } = options || {}
    return `loading="lazy" data-threshold="${threshold}" data-root-margin="${rootMargin}"`
  }

  /**
   * Generate prefetch links for critical resources
   */
  generatePrefetchLinks(resources: string[]): string {
    if (!this.config.enablePrefetching) return ''

    return resources
      .map(resource => {
        if (resource.endsWith('.js')) {
          return `<link rel="prefetch" href="${resource}" as="script">`
        } else if (resource.endsWith('.css')) {
          return `<link rel="prefetch" href="${resource}" as="style">`
        } else if (resource.match(/\.(jpg|jpeg|png|webp|avif)$/)) {
          return `<link rel="prefetch" href="${resource}" as="image">`
        }
        return ''
      })
      .join('\n')
  }

  /**
   * Create response with performance headers
   */
  createPerformanceResponse(data: any, options?: {
    contentType?: string
    cacheControl?: string
    etag?: string
  }): NextResponse {
    const { contentType = 'application/json', cacheControl, etag } = options || {}
    
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'X-Response-Time': `${this.metrics.responseTime}ms`,
      'X-Cache-Hit-Rate': `${(this.metrics.cacheHitRate * 100).toFixed(2)}%`,
      'X-Memory-Usage': `${Math.round(this.metrics.memoryUsage.heapUsed / 1024 / 1024)}MB`,
    }

    if (cacheControl) {
      headers['Cache-Control'] = cacheControl
    }

    if (etag) {
      headers['ETag'] = etag
    }

    return NextResponse.json(data, { headers })
  }

  /**
   * Measure execution time of a function
   */
  async measureExecutionTime<T>(fn: () => Promise<T>): Promise<{ result: T; executionTime: number }> {
    const startTime = process.hrtime.bigint()
    const result = await fn()
    const endTime = process.hrtime.bigint()
    const executionTime = Number(endTime - startTime) / 1000000 // Convert to milliseconds

    this.metrics.responseTime = executionTime
    this.metrics.requestCount++

    return { result, executionTime }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport(): string {
    const metrics = this.getMetrics()
    const report = [
      '=== Performance Report ===',
      `Response Time: ${metrics.responseTime.toFixed(2)}ms`,
      `Memory Usage: ${Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024)}MB`,
      `Cache Hit Rate: ${(metrics.cacheHitRate * 100).toFixed(2)}%`,
      `Request Count: ${metrics.requestCount}`,
      `Error Rate: ${(metrics.errorRate * 100).toFixed(2)}%`,
      '========================'
    ]

    return report.join('\n')
  }

  /**
   * Optimize database query with caching
   */
  async cachedQuery<T>(
    key: string,
    queryFn: () => Promise<T>,
    options?: {
      ttl?: number
      tags?: string[]
    }
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.getCache(key)
    if (cached) {
      return cached as T
    }

    // Execute query
    const result = await queryFn()

    // Cache the result
    await this.setCache({
      key,
      data: result,
      ttl: options?.ttl,
      tags: options?.tags
    })

    return result
  }

  /**
   * Create optimized bundle configuration
   */
  createOptimizedBundleConfig(): any {
    return {
      optimization: {
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
            },
          },
        },
      },
      performance: {
        hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
      },
    }
  }

  /**
   * Create service worker for caching strategies
   */
  createServiceWorker(): string {
    return `
      const CACHE_NAME = 'girlspreneur-v1';
      const urlsToCache = [
        '/',
        '/static/js/bundle.js',
        '/static/css/main.css',
        '/favicon.ico'
      ];

      self.addEventListener('install', event => {
        event.waitUntil(
          caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
        );
      });

      self.addEventListener('fetch', event => {
        event.respondWith(
          caches.match(event.request)
            .then(response => {
              return response || fetch(event.request);
            })
        );
      });
    `
  }

  /**
   * Generate resource hints
   */
  generateResourceHints(): string {
    return `
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link rel="dns-prefetch" href="https://api.stripe.com">
      <link rel="preconnect" href="https://api.stripe.com">
    `
  }
}

// Default performance optimizer instance
export const performanceOptimizer = new PerformanceOptimizer()

/**
 * Middleware for performance optimization
 */
export async function applyPerformanceOptimization(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  // Add performance headers
  response.headers.set('X-Performance-Optimized', 'true')
  response.headers.set('X-Cache-Control', 'public, max-age=3600')
  
  // Add compression header if enabled
  if (performanceOptimizer['config'].enableCompression) {
    response.headers.set('Content-Encoding', 'gzip')
  }

  return response
}

/**
 * Higher-order function for performance monitoring
 */
export function withPerformanceMonitoring<T extends (...args: any[]) => any>(
  fn: T
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>) => {
    const { result, executionTime } = await performanceOptimizer.measureExecutionTime(
      () => fn(...args)
    )
    
    console.log(`Function ${fn.name} executed in ${executionTime.toFixed(2)}ms`)
    return result
  }
}

/**
 * Create optimized image component props
 */
export function createOptimizedImageProps(src: string, options?: {
  width?: number
  height?: number
  priority?: boolean
  loading?: 'lazy' | 'eager'
  placeholder?: 'blur' | 'empty'
}): any {
  const {
    width,
    height,
    priority = false,
    loading = 'lazy',
    placeholder = 'blur'
  } = options || {}

  return {
    src: performanceOptimizer.optimizeImageUrl(src, { width, height }),
    width,
    height,
    priority,
    loading,
    placeholder,
    sizes: width ? `${width}px` : undefined,
    style: { objectFit: 'cover' }
  }
}