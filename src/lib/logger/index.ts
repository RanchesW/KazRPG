// ===== src/lib/logger/index.ts =====
import winston from 'winston'
import { env } from '@/lib/env'

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

const level = () => {
  const isDevelopment = env.NODE_ENV === 'development'
  return isDevelopment ? 'debug' : 'warn'
}

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}

winston.addColors(colors)

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
)

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  new winston.transports.File({ filename: 'logs/all.log' }),
]

export const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
})

// Structured logging helpers
interface LogContext {
  userId?: string
  requestId?: string
  gameId?: string
  action?: string
  ip?: string
  userAgent?: string
  [key: string]: any
}

export const structuredLogger = {
  info: (message: string, context?: LogContext) => {
    logger.info(message, context)
  },
  
  error: (message: string, error?: Error, context?: LogContext) => {
    logger.error(message, {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    })
  },
  
  warn: (message: string, context?: LogContext) => {
    logger.warn(message, context)
  },
  
  debug: (message: string, context?: LogContext) => {
    logger.debug(message, context)
  },
  
  // Security events
  security: (event: string, context?: LogContext) => {
    logger.warn(`SECURITY: ${event}`, {
      ...context,
      severity: 'HIGH',
      category: 'security',
    })
  },
  
  // Performance monitoring
  performance: (operation: string, duration: number, context?: LogContext) => {
    const level = duration > 1000 ? 'warn' : 'info'
    logger[level](`PERFORMANCE: ${operation} took ${duration}ms`, {
      ...context,
      category: 'performance',
      duration,
    })
  },
  
  // User actions
  userAction: (action: string, userId: string, context?: LogContext) => {
    logger.info(`USER_ACTION: ${action}`, {
      ...context,
      userId,
      category: 'user_action',
    })
  },
}