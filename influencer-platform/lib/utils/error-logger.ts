type ErrorLevel = 'error' | 'warn' | 'info' | 'debug'

interface ErrorLogContext {
  userId?: string
  path?: string
  method?: string
  userAgent?: string
  [key: string]: any
}

class ErrorLogger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return `${error.name}: ${error.message}\n${error.stack}`
    }
    return String(error)
  }

  private shouldLog(level: ErrorLevel): boolean {
    const logLevel = process.env.LOG_LEVEL || (this.isDevelopment ? 'debug' : 'info')
    const levels: Record<ErrorLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    }
    return levels[level] >= levels[logLevel as ErrorLevel]
  }

  private async sendToExternalService(
    level: ErrorLevel,
    message: string,
    context?: ErrorLogContext
  ) {
    // TODO: Integrate with external error tracking service (e.g., Sentry)
    if (this.isProduction && process.env.SENTRY_DSN) {
      // Sentry integration would go here
      console.log('[Sentry]', level, message, context)
    }
  }

  public log(
    level: ErrorLevel,
    message: string,
    error?: unknown,
    context?: ErrorLogContext
  ) {
    if (!this.shouldLog(level)) return

    const timestamp = new Date().toISOString()
    const formattedError = error ? this.formatError(error) : undefined

    const logData = {
      timestamp,
      level,
      message,
      ...(formattedError && { error: formattedError }),
      ...(context && { context }),
      environment: process.env.NODE_ENV,
    }

    // Console logging
    switch (level) {
      case 'error':
        console.error(JSON.stringify(logData))
        break
      case 'warn':
        console.warn(JSON.stringify(logData))
        break
      case 'info':
        console.info(JSON.stringify(logData))
        break
      case 'debug':
        if (this.isDevelopment) {
          console.debug(JSON.stringify(logData))
        }
        break
    }

    // Send to external service in production
    if (this.isProduction && (level === 'error' || level === 'warn')) {
      this.sendToExternalService(level, message, context)
    }
  }

  public error(message: string, error?: unknown, context?: ErrorLogContext) {
    this.log('error', message, error, context)
  }

  public warn(message: string, context?: ErrorLogContext) {
    this.log('warn', message, undefined, context)
  }

  public info(message: string, context?: ErrorLogContext) {
    this.log('info', message, undefined, context)
  }

  public debug(message: string, context?: ErrorLogContext) {
    this.log('debug', message, undefined, context)
  }
}

export const logger = new ErrorLogger()

// Helper function for API route error handling
export function handleApiError(error: unknown, context?: ErrorLogContext) {
  logger.error('API Route Error', error, context)
  
  if (error instanceof Error) {
    return {
      error: process.env.NODE_ENV === 'production' 
        ? 'An error occurred processing your request'
        : error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    }
  }
  
  return {
    error: 'An unexpected error occurred',
  }
}