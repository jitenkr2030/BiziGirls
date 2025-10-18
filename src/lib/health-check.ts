import { monitoringService } from './monitoring'
import { logger } from './logger'
import { db } from './db'
import { config } from './config'
import Stripe from 'stripe'
import os from 'os'
import { createClient } from 'redis'

export interface HealthCheckResult {
  name: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  responseTime: number
  details?: Record<string, any>
  timestamp: Date
}

export class HealthCheckService {
  private checks: Map<string, () => Promise<HealthCheckResult>> = new Map()

  constructor() {
    this.initializeChecks()
  }

  private initializeChecks() {
    // Database health check
    this.addCheck('database', this.checkDatabase.bind(this))
    
    // Redis health check
    this.addCheck('redis', this.checkRedis.bind(this))
    
    // External API health checks
    this.addCheck('stripe', this.checkStripe.bind(this))
    this.addCheck('zoom', this.checkZoom.bind(this))
    this.addCheck('email', this.checkEmail.bind(this))
    
    // Storage health check
    this.addCheck('storage', this.checkStorage.bind(this))
    
    // System health check
    this.addCheck('system', this.checkSystem.bind(this))
  }

  addCheck(name: string, checkFn: () => Promise<HealthCheckResult>) {
    this.checks.set(name, checkFn)
  }

  async runCheck(name: string): Promise<HealthCheckResult> {
    const checkFn = this.checks.get(name)
    if (!checkFn) {
      throw new Error(`Health check '${name}' not found`)
    }

    try {
      const result = await checkFn()
      monitoringService.recordHealthCheck(result.name, result.status, result.responseTime, result.details)
      return result
    } catch (error) {
      const errorResult: HealthCheckResult = {
        name,
        status: 'unhealthy',
        responseTime: 0,
        details: { error: error.message },
        timestamp: new Date(),
      }
      monitoringService.recordHealthCheck(name, 'unhealthy', 0, { error: error.message })
      return errorResult
    }
  }

  async runAllChecks(): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = []
    
    for (const [name] of this.checks) {
      try {
        const result = await this.runCheck(name)
        results.push(result)
      } catch (error) {
        logger.error(`Health check failed for ${name}:`, error)
        results.push({
          name,
          status: 'unhealthy',
          responseTime: 0,
          details: { error: error.message },
          timestamp: new Date(),
        })
      }
    }

    return results
  }

  private async checkDatabase(): Promise<HealthCheckResult> {
    const start = Date.now()
    
    try {
      // Simple database query to test connection
      await db.$queryRaw`SELECT 1`
      
      const responseTime = Date.now() - start
      const status = responseTime < 1000 ? 'healthy' : responseTime < 3000 ? 'degraded' : 'unhealthy'
      
      return {
        name: 'database',
        status,
        responseTime,
        details: {
          connection: 'established',
          responseTime,
          query: 'SELECT 1',
        },
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        name: 'database',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        details: { error: error.message },
        timestamp: new Date(),
      }
    }
  }

  private async checkRedis(): Promise<HealthCheckResult> {
    const start = Date.now()
    
    try {
      // Test Redis connection
      const client = createClient({ url: config.redis.url })
      
      await client.connect()
      await client.ping()
      await client.disconnect()
      
      const responseTime = Date.now() - start
      const status = responseTime < 100 ? 'healthy' : responseTime < 500 ? 'degraded' : 'unhealthy'
      
      return {
        name: 'redis',
        status,
        responseTime,
        details: {
          connection: 'established',
          responseTime,
        },
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        name: 'redis',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        details: { error: error.message },
        timestamp: new Date(),
      }
    }
  }

  private async checkStripe(): Promise<HealthCheckResult> {
    const start = Date.now()
    
    try {
      // Test Stripe API connection
      const stripe = new Stripe(config.payments.stripe.secretKey)
      await stripe.balance.retrieve()
      
      const responseTime = Date.now() - start
      const status = responseTime < 1000 ? 'healthy' : responseTime < 3000 ? 'degraded' : 'unhealthy'
      
      return {
        name: 'stripe',
        status,
        responseTime,
        details: {
          api: 'accessible',
          responseTime,
        },
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        name: 'stripe',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        details: { error: error.message },
        timestamp: new Date(),
      }
    }
  }

  private async checkZoom(): Promise<HealthCheckResult> {
    const start = Date.now()
    
    try {
      // Test Zoom API connection
      const { ZoomService } = await import('./video-conferencing')
      const zoomService = new ZoomService()
      await zoomService.testConnection()
      
      const responseTime = Date.now() - start
      const status = responseTime < 1000 ? 'healthy' : responseTime < 3000 ? 'degraded' : 'unhealthy'
      
      return {
        name: 'zoom',
        status,
        responseTime,
        details: {
          api: 'accessible',
          responseTime,
        },
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        name: 'zoom',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        details: { error: error.message },
        timestamp: new Date(),
      }
    }
  }

  private async checkEmail(): Promise<HealthCheckResult> {
    const start = Date.now()
    
    try {
      // Test email service connection
      const { EmailService } = await import('./email-service')
      const emailService = new EmailService()
      await emailService.testConnection()
      
      const responseTime = Date.now() - start
      const status = responseTime < 1000 ? 'healthy' : responseTime < 3000 ? 'degraded' : 'unhealthy'
      
      return {
        name: 'email',
        status,
        responseTime,
        details: {
          service: 'accessible',
          responseTime,
        },
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        name: 'email',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        details: { error: error.message },
        timestamp: new Date(),
      }
    }
  }

  private async checkStorage(): Promise<HealthCheckResult> {
    const start = Date.now()
    
    try {
      // Test cloud storage connection
      const { CloudStorageService } = await import('./cloud-storage')
      const storageService = new CloudStorageService()
      await storageService.testConnection()
      
      const responseTime = Date.now() - start
      const status = responseTime < 1000 ? 'healthy' : responseTime < 3000 ? 'degraded' : 'unhealthy'
      
      return {
        name: 'storage',
        status,
        responseTime,
        details: {
          provider: config.cloud.provider,
          responseTime,
        },
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        name: 'storage',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        details: { error: error.message },
        timestamp: new Date(),
      }
    }
  }

  private async checkSystem(): Promise<HealthCheckResult> {
    const start = Date.now()
    
    try {
      // Check system resources
      const usedMemory = process.memoryUsage()
      const totalMemory = os.totalmem()
      const freeMemory = os.freemem()
      const cpuUsage = process.cpuUsage()
      
      const memoryUsagePercent = (usedMemory.heapUsed / totalMemory) * 100
      const freeMemoryPercent = (freeMemory / totalMemory) * 100
      
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
      
      if (memoryUsagePercent > 90 || freeMemoryPercent < 10) {
        status = 'unhealthy'
      } else if (memoryUsagePercent > 70 || freeMemoryPercent < 20) {
        status = 'degraded'
      }
      
      const responseTime = Date.now() - start
      
      return {
        name: 'system',
        status,
        responseTime,
        details: {
          memoryUsage: `${memoryUsagePercent.toFixed(2)}%`,
          freeMemory: `${freeMemoryPercent.toFixed(2)}%`,
          cpuUsage: `${(cpuUsage.user / 1000000).toFixed(2)}ms`,
          uptime: process.uptime(),
        },
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        name: 'system',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        details: { error: error.message },
        timestamp: new Date(),
      }
    }
  }

  // Get overall system health
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    checks: HealthCheckResult[]
    timestamp: Date
  }> {
    const checks = await this.runAllChecks()
    
    const unhealthyCount = checks.filter(c => c.status === 'unhealthy').length
    const degradedCount = checks.filter(c => c.status === 'degraded').length
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    
    if (unhealthyCount > 0) {
      status = 'unhealthy'
    } else if (degradedCount > 0) {
      status = 'degraded'
    }
    
    return {
      status,
      checks,
      timestamp: new Date(),
    }
  }

  // Run health checks periodically
  startPeriodicChecks(intervalMs: number = 30000) {
    setInterval(async () => {
      try {
        await this.runAllChecks()
        logger.info('Periodic health checks completed')
      } catch (error) {
        logger.error('Periodic health checks failed:', error)
      }
    }, intervalMs)
  }
}

// Create singleton instance
export const healthCheckService = new HealthCheckService()

// Export convenience functions
export const runHealthCheck = (name: string) => healthCheckService.runCheck(name)
export const runAllHealthChecks = () => healthCheckService.runAllChecks()
export const getSystemHealth = () => healthCheckService.getSystemHealth()