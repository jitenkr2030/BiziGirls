import winston from 'winston'
import { config } from './config'

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}

// Tell winston about the colors
winston.addColors(colors)

// Define which level to log based on environment
const level = () => {
  const env = config.app.env || 'development'
  const isDevelopment = env === 'development'
  return isDevelopment ? 'debug' : config.monitoring.logLevel
}

// Define different formats for console and file
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
)

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
)

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat,
  }),
  
  // Error log file
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  
  // Combined log file
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
]

// Add HTTP transport for production
if (config.app.env === 'production') {
  transports.push(
    new winston.transports.Http({
      host: 'log-server.example.com',
      port: 8080,
      path: '/logs',
      ssl: true,
    }),
  )
}

// Create the logger
export const logger = winston.createLogger({
  level: level(),
  levels,
  format: fileFormat,
  transports,
  exitOnError: false,
})

// Add request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      timestamp: new Date().toISOString(),
    }
    
    if (res.statusCode >= 400) {
      logger.error('Request failed', logData)
    } else {
      logger.http('Request completed', logData)
    }
  })
  
  next()
}

// Add error logging utility
export const logError = (error, context = {}) => {
  logger.error('Application error', {
    error: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  })
}

// Add performance logging utility
export const logPerformance = (operation, duration, metadata = {}) => {
  logger.info('Performance metric', {
    operation,
    duration: `${duration}ms`,
    metadata,
    timestamp: new Date().toISOString(),
  })
}

// Add security event logging
export const logSecurityEvent = (event, details = {}) => {
  logger.warn('Security event', {
    event,
    details,
    timestamp: new Date().toISOString(),
  })
}

// Add business event logging
export const logBusinessEvent = (event, userId, details = {}) => {
  logger.info('Business event', {
    event,
    userId,
    details,
    timestamp: new Date().toISOString(),
  })
}

// Health check logger
export const healthLogger = {
  check: () => {
    logger.info('Health check performed', {
      timestamp: new Date().toISOString(),
      status: 'healthy',
    })
  },
}

// Export logger instance for direct use
export default logger