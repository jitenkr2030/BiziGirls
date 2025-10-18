import { logger } from './logger'
import { config } from './config'

interface MetricData {
  name: string
  value: number
  tags?: Record<string, string>
  timestamp?: Date
}

interface PerformanceMetric {
  operation: string
  duration: number
  success: boolean
  metadata?: Record<string, any>
}

interface HealthCheck {
  name: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  responseTime: number
  details?: Record<string, any>
}

export class MonitoringService {
  private metrics: Map<string, MetricData[]> = new Map()
  private performanceMetrics: Map<string, PerformanceMetric[]> = new Map()
  private healthChecks: Map<string, HealthCheck> = new Map()

  constructor() {
    this.initializeMetrics()
  }

  private initializeMetrics() {
    // Initialize common metrics
    this.metrics.set('http.requests', [])
    this.metrics.set('http.errors', [])
    this.metrics.set('database.queries', [])
    this.metrics.set('cache.hits', [])
    this.metrics.set('cache.misses', [])
    this.metrics.set('user.sessions', [])
    this.metrics.set('payments.processed', [])
    this.metrics.set('emails.sent', [])
  }

  // Record a metric
  recordMetric(name: string, value: number, tags?: Record<string, string>) {
    const metric: MetricData = {
      name,
      value,
      tags: tags || {},
      timestamp: new Date(),
    }

    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    this.metrics.get(name)!.push(metric)
    
    // Keep only last 1000 metrics to prevent memory issues
    const metrics = this.metrics.get(name)!
    if (metrics.length > 1000) {
      this.metrics.set(name, metrics.slice(-1000))
    }

    // Log metric if it's significant
    if (value > 1000 || name.includes('error')) {
      logger.info('Metric recorded', { name, value, tags })
    }
  }

  // Record performance metric
  recordPerformance(operation: string, duration: number, success: boolean, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      operation,
      duration,
      success,
      metadata,
    }

    if (!this.performanceMetrics.has(operation)) {
      this.performanceMetrics.set(operation, [])
    }

    this.performanceMetrics.get(operation)!.push(metric)
    
    // Keep only last 500 performance metrics
    const metrics = this.performanceMetrics.get(operation)!
    if (metrics.length > 500) {
      this.performanceMetrics.set(operation, metrics.slice(-500))
    }

    // Log slow operations
    if (duration > 5000) {
      logger.warn('Slow operation detected', { operation, duration, metadata })
    }

    // Log failed operations
    if (!success) {
      logger.error('Operation failed', { operation, duration, metadata })
    }
  }

  // Record health check
  recordHealthCheck(name: string, status: HealthCheck['status'], responseTime: number, details?: Record<string, any>) {
    const healthCheck: HealthCheck = {
      name,
      status,
      responseTime,
      details,
    }

    this.healthChecks.set(name, healthCheck)

    // Log unhealthy checks
    if (status !== 'healthy') {
      logger.error('Health check failed', { name, status, responseTime, details })
    }
  }

  // Get metrics summary
  getMetricsSummary(name: string) {
    const metrics = this.metrics.get(name) || []
    
    if (metrics.length === 0) {
      return null
    }

    const values = metrics.map(m => m.value)
    const sum = values.reduce((a, b) => a + b, 0)
    const avg = sum / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)

    return {
      count: metrics.length,
      sum,
      average: avg,
      min,
      max,
      latest: metrics[metrics.length - 1],
    }
  }

  // Get performance metrics summary
  getPerformanceSummary(operation: string) {
    const metrics = this.performanceMetrics.get(operation) || []
    
    if (metrics.length === 0) {
      return null
    }

    const durations = metrics.map(m => m.duration)
    const successRate = metrics.filter(m => m.success).length / metrics.length
    
    return {
      count: metrics.length,
      successRate: successRate * 100,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      latest: metrics[metrics.length - 1],
    }
  }

  // Get all health checks
  getHealthChecks() {
    return Array.from(this.healthChecks.values())
  }

  // Get system health status
  getSystemHealth() {
    const healthChecks = this.getHealthChecks()
    const unhealthyCount = healthChecks.filter(h => h.status === 'unhealthy').length
    const degradedCount = healthChecks.filter(h => h.status === 'degraded').length

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    
    if (unhealthyCount > 0) {
      overallStatus = 'unhealthy'
    } else if (degradedCount > 0) {
      overallStatus = 'degraded'
    }

    return {
      status: overallStatus,
      checks: healthChecks,
      timestamp: new Date(),
    }
  }

  // Performance monitoring wrapper
  async monitorPerformance<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const start = Date.now()
    
    try {
      const result = await fn()
      const duration = Date.now() - start
      this.recordPerformance(operation, duration, true, metadata)
      return result
    } catch (error) {
      const duration = Date.now() - start
      this.recordPerformance(operation, duration, false, { ...metadata, error: error.message })
      throw error
    }
  }

  // Database query monitoring
  monitorQuery(query: string, duration: number, success: boolean) {
    this.recordMetric('database.queries', duration, { query: query.substring(0, 50) })
    this.recordPerformance('database.query', duration, success, { query })
  }

  // HTTP request monitoring
  monitorRequest(method: string, path: string, statusCode: number, duration: number) {
    const isSuccess = statusCode < 400
    
    this.recordMetric('http.requests', duration, { method, path, statusCode })
    this.recordPerformance('http.request', duration, isSuccess, { method, path, statusCode })
    
    if (!isSuccess) {
      this.recordMetric('http.errors', 1, { method, path, statusCode })
    }
  }

  // Cache monitoring
  monitorCacheHit() {
    this.recordMetric('cache.hits', 1)
  }

  monitorCacheMiss() {
    this.recordMetric('cache.misses', 1)
  }

  // User activity monitoring
  monitorUserActivity(event: string, userId?: string) {
    this.recordMetric('user.activity', 1, { event, userId })
  }

  // Payment monitoring
  monitorPayment(amount: number, success: boolean, paymentMethod?: string) {
    this.recordMetric('payments.processed', amount, { success, paymentMethod })
  }

  // Email monitoring
  monitorEmailSent(type: string, success: boolean) {
    this.recordMetric('emails.sent', 1, { type, success })
  }

  // Generate monitoring report
  generateReport() {
    const report = {
      timestamp: new Date(),
      systemHealth: this.getSystemHealth(),
      metrics: {},
      performance: {},
    }

    // Add metrics summaries
    for (const [name] of this.metrics) {
      const summary = this.getMetricsSummary(name)
      if (summary) {
        (report.metrics as any)[name] = summary
      }
    }

    // Add performance summaries
    for (const [operation] of this.performanceMetrics) {
      const summary = this.getPerformanceSummary(operation)
      if (summary) {
        (report.performance as any)[operation] = summary
      }
    }

    return report
  }

  // Export metrics for external monitoring
  exportMetrics() {
    const metrics: any[] = []
    
    for (const [name, data] of this.metrics) {
      for (const metric of data) {
        metrics.push({
          name,
          value: metric.value,
          tags: metric.tags,
          timestamp: metric.timestamp,
        })
      }
    }

    return metrics
  }
}

// Create singleton instance
export const monitoringService = new MonitoringService()

// Export convenience functions
export const recordMetric = (name: string, value: number, tags?: Record<string, string>) => 
  monitoringService.recordMetric(name, value, tags)

export const monitorPerformance = <T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
) => monitoringService.monitorPerformance(operation, fn, metadata)

export const getSystemHealth = () => monitoringService.getSystemHealth()

export const generateMonitoringReport = () => monitoringService.generateReport()