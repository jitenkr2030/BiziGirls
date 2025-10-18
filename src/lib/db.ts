import { PrismaClient } from '@prisma/client'
import { config } from './config'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Database connection configuration
const connectionConfig = {
  // Connection pooling settings
  connectionLimit: process.env.NODE_ENV === 'production' ? 20 : 10,
  poolTimeout: 30000, // 30 seconds
  acquireTimeout: 60000, // 60 seconds
  
  // Query optimization
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  
  // Cache settings
  cacheStrategy: 'swr', // stale-while-revalidate
  cacheTtl: 3600, // 1 hour cache TTL
  
  // Retry configuration
  maxRetries: 3,
  retryDelay: 1000, // 1 second between retries
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: connectionConfig.log,
    datasources: {
      db: {
        url: config.database.url || 'file:./dev.db',
      }
    },
  })

// Health check function
export async function checkDatabaseHealth() {
  try {
    await db.$executeRaw`SELECT 1`
    return { status: 'healthy', timestamp: new Date().toISOString() }
  } catch (error) {
    console.error('Database health check failed:', error)
    return { 
      status: 'unhealthy', 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString() 
    }
  }
}

// Connection pool monitoring
export function getConnectionPoolStats() {
  return {
    config: connectionConfig,
    environment: process.env.NODE_ENV,
    databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing',
  }
}

// Graceful shutdown handler
export async function gracefulShutdown() {
  try {
    await db.$disconnect()
    console.log('Database connections closed gracefully')
  } catch (error) {
    console.error('Error during database shutdown:', error)
  }
}

// Register graceful shutdown handlers
if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    await gracefulShutdown()
    process.exit(0)
  })
  
  process.on('SIGINT', async () => {
    await gracefulShutdown()
    process.exit(0)
  })
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db