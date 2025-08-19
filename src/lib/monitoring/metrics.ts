// ===== src/lib/monitoring/metrics.ts =====
interface Metric {
  name: string
  value: number
  timestamp: number
  tags?: Record<string, string>
}

class MetricsCollector {
  private metrics: Metric[] = []

  increment(name: string, tags?: Record<string, string>) {
    this.record(name, 1, tags)
  }

  gauge(name: string, value: number, tags?: Record<string, string>) {
    this.record(name, value, tags)
  }

  timing(name: string, duration: number, tags?: Record<string, string>) {
    this.record(`${name}.duration`, duration, tags)
  }

  private record(name: string, value: number, tags?: Record<string, string>) {
    const metric: Metric = {
      name,
      value,
      timestamp: Date.now(),
      tags,
    }
    
    this.metrics.push(metric)
    
    // Keep only last 1000 metrics in memory
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }
    
    // Log important metrics
    if (name.includes('error') || name.includes('latency')) {
      structuredLogger.info(`METRIC: ${name}`, { value, tags })
    }
  }

  getMetrics(since?: number): Metric[] {
    const threshold = since || Date.now() - 300000 // Last 5 minutes
    return this.metrics.filter(m => m.timestamp >= threshold)
  }

  // Health check data
  getHealthMetrics() {
    const now = Date.now()
    const last5Min = now - 300000
    const recentMetrics = this.metrics.filter(m => m.timestamp >= last5Min)
    
    const errorCount = recentMetrics.filter(m => m.name.includes('error')).length
    const requestCount = recentMetrics.filter(m => m.name.includes('request')).length
    
    return {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      errorRate: requestCount > 0 ? errorCount / requestCount : 0,
      requestCount,
      timestamp: now,
    }
  }
}

export const metrics = new MetricsCollector()