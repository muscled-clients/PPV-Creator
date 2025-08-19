import { logger } from './error-logger'

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: number
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map()
  private timers: Map<string, number> = new Map()

  // Start timing an operation
  startTimer(name: string): void {
    this.timers.set(name, performance.now())
  }

  // End timing and record the metric
  endTimer(name: string, metadata?: Record<string, any>): number | null {
    const startTime = this.timers.get(name)
    if (!startTime) {
      logger.warn(`Timer '${name}' was not started`)
      return null
    }

    const duration = performance.now() - startTime
    this.timers.delete(name)

    this.recordMetric(name, duration, 'ms')

    if (metadata) {
      logger.debug(`Performance: ${name} took ${duration.toFixed(2)}ms`, metadata)
    }

    return duration
  }

  // Record a custom metric
  recordMetric(name: string, value: number, unit: string = 'ms'): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
    }

    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    this.metrics.get(name)!.push(metric)

    // Keep only last 100 metrics per name to prevent memory issues
    const metrics = this.metrics.get(name)!
    if (metrics.length > 100) {
      metrics.shift()
    }

    // Log slow operations
    if (unit === 'ms' && value > 1000) {
      logger.warn(`Slow operation detected: ${name} took ${value.toFixed(2)}ms`)
    }
  }

  // Get metrics for a specific operation
  getMetrics(name: string): PerformanceMetric[] {
    return this.metrics.get(name) || []
  }

  // Get average duration for an operation
  getAverageDuration(name: string): number | null {
    const metrics = this.getMetrics(name)
    if (metrics.length === 0) return null

    const sum = metrics.reduce((acc, m) => acc + m.value, 0)
    return sum / metrics.length
  }

  // Clear all metrics
  clearMetrics(): void {
    this.metrics.clear()
    this.timers.clear()
  }

  // Report metrics (for monitoring services)
  reportMetrics(): Record<string, any> {
    const report: Record<string, any> = {}

    this.metrics.forEach((metrics, name) => {
      if (metrics.length > 0) {
        const values = metrics.map(m => m.value)
        report[name] = {
          count: metrics.length,
          average: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          latest: values[values.length - 1],
        }
      }
    })

    return report
  }
}

export const performanceMonitor = new PerformanceMonitor()

// Web Vitals tracking
export function trackWebVitals(metric: any) {
  const { name, value, rating } = metric
  
  performanceMonitor.recordMetric(`web-vital-${name}`, value, 'ms')
  
  // Log poor performance
  if (rating === 'poor') {
    logger.warn(`Poor Web Vital: ${name} = ${value}`)
  }
  
  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to analytics service
    console.log('Web Vital:', { name, value, rating })
  }
}

// Helper for measuring async operations
export async function measureAsync<T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  performanceMonitor.startTimer(name)
  try {
    const result = await operation()
    performanceMonitor.endTimer(name)
    return result
  } catch (error) {
    performanceMonitor.endTimer(name)
    throw error
  }
}

// Helper for measuring sync operations
export function measureSync<T>(
  name: string,
  operation: () => T
): T {
  performanceMonitor.startTimer(name)
  try {
    const result = operation()
    performanceMonitor.endTimer(name)
    return result
  } catch (error) {
    performanceMonitor.endTimer(name)
    throw error
  }
}