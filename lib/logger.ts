import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private formatLog(entry: LogEntry): string {
    const { timestamp, level, message, requestId, metadata, error } = entry;
    
    const logData = {
      timestamp,
      level: level.toUpperCase(),
      requestId,
      message,
      ...(metadata && { metadata }),
      ...(error && { error })
    };

    return JSON.stringify(logData);
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    requestId?: string,
    metadata?: Record<string, any>,
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      requestId,
      metadata,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        }
      })
    };
  }

  debug(message: string, requestId?: string, metadata?: Record<string, any>) {
    if (process.env.NODE_ENV === 'development') {
      const entry = this.createLogEntry(LogLevel.DEBUG, message, requestId, metadata);
      console.debug(this.formatLog(entry));
    }
  }

  info(message: string, requestId?: string, metadata?: Record<string, any>) {
    const entry = this.createLogEntry(LogLevel.INFO, message, requestId, metadata);
    console.info(this.formatLog(entry));
  }

  warn(message: string, requestId?: string, metadata?: Record<string, any>) {
    const entry = this.createLogEntry(LogLevel.WARN, message, requestId, metadata);
    console.warn(this.formatLog(entry));
  }

  error(message: string, error?: Error, requestId?: string, metadata?: Record<string, any>) {
    const entry = this.createLogEntry(LogLevel.ERROR, message, requestId, metadata, error);
    console.error(this.formatLog(entry));
  }
}

export const logger = new Logger();

// Утилита для генерации requestId
export function generateRequestId(): string {
  return randomUUID();
}

// Утилита для извлечения requestId из заголовков или генерации нового
export function getRequestId(request: NextRequest): string {
  return request.headers.get('x-request-id') || generateRequestId();
}

// Wrapper для API handlers с автоматическим логированием
export function withLogging<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  handlerName: string
) {
  return async (...args: T): Promise<R> => {
    const requestId = generateRequestId();
    const startTime = Date.now();
    
    logger.info(`API ${handlerName} started`, requestId);
    
    try {
      const result = await handler(...args);
      const duration = Date.now() - startTime;
      
      logger.info(`API ${handlerName} completed`, requestId, { 
        duration: `${duration}ms`,
        success: true 
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error(
        `API ${handlerName} failed`,
        error instanceof Error ? error : new Error(String(error)),
        requestId,
        { duration: `${duration}ms`, success: false }
      );
      
      throw error;
    }
  };
}

// Стандартизированные коды ошибок
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  RATE_LIMIT: 'RATE_LIMIT',
  FREE_LIMIT_REACHED: 'FREE_LIMIT_REACHED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  NOT_FOUND: 'NOT_FOUND',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

// Утилита для создания стандартизированных ответов с ошибками
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  status: number,
  requestId?: string
) {
  const errorResponse = {
    error: code,
    message,
    ...(requestId && { requestId })
  };

  logger.error(`Error response: ${code}`, new Error(message), requestId, { status });
  
  return new Response(JSON.stringify(errorResponse), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...(requestId && { 'x-request-id': requestId })
    }
  });
}
