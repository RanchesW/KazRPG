// ===== src/lib/monitoring/performance.ts =====
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  async measureAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: LogContext
  ): Promise<T> {
    const start = Date.now()
    
    try {
      const result = await fn()
      const duration = Date.now() - start
      
      metrics.timing(`operation.${operation}`, duration)
      structuredLogger.performance(operation, duration, context)
      
      return result
    } catch (error) {
      const duration = Date.now() - start
      
      metrics.increment(`operation.${operation}.error`)
      structuredLogger.error(`Operation ${operation} failed`, error as Error, {
        ...context,
        duration,
      })
      
      throw error
    }
  }

  measure<T>(operation: string, fn: () => T, context?: LogContext): T {
    const start = Date.now()
    
    try {
      const result = fn()
      const duration = Date.now() - start
      
      metrics.timing(`operation.${operation}`, duration)
      structuredLogger.performance(operation, duration, context)
      
      return result
    } catch (error) {
      const duration = Date.now() - start
      
      metrics.increment(`operation.${operation}.error`)
      structuredLogger.error(`Operation ${operation} failed`, error as Error, {
        ...context,
        duration,
      })
      
      throw error
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance()