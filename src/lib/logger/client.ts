// ===== src/lib/logger/client.ts =====
// Client-safe logger that doesn't use Node.js specific modules

interface LogLevel {
  error: 0
  warn: 1
  info: 2
  debug: 3
}

const logLevels: LogLevel = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
}

class ClientLogger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private currentLevel = this.isDevelopment ? logLevels.debug : logLevels.warn

  private shouldLog(level: keyof LogLevel): boolean {
    return logLevels[level] <= this.currentLevel
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString()
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : ''
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`
  }

  error(message: string, meta?: any) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, meta))
    }
  }

  warn(message: string, meta?: any) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, meta))
    }
  }

  info(message: string, meta?: any) {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, meta))
    }
  }

  debug(message: string, meta?: any) {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, meta))
    }
  }
}

export const clientLogger = new ClientLogger()
