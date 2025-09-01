// Simple logger for webhook debugging
export const logger = {
  info: (message: string, requestId?: string, data?: any) => {
    console.log(`[INFO] ${requestId ? `[${requestId}] ` : ''}${message}`, data || '');
  },
  error: (message: string, error: any, requestId?: string) => {
    console.error(`[ERROR] ${requestId ? `[${requestId}] ` : ''}${message}`, error);
  },
  warn: (message: string, requestId?: string, data?: any) => {
    console.warn(`[WARN] ${requestId ? `[${requestId}] ` : ''}${message}`, data || '');
  }
};

export const getRequestId = (request: Request) => {
  return Math.random().toString(36).substring(2, 15);
};

export const createErrorResponse = (code: string, message: string, status: number, requestId?: string) => {
  return new Response(JSON.stringify({
    error: {
      code,
      message,
      requestId
    }
  }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  FREE_LIMIT_REACHED: 'FREE_LIMIT_REACHED',
  PACK_LIMIT_REACHED: 'PACK_LIMIT_REACHED',
  NOT_FOUND: 'NOT_FOUND'
};
