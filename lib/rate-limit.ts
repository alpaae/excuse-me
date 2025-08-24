import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

import { ipAddress } from "@vercel/functions";

// In-memory store для development
class MemoryStore {
  private store = new Map<string, { count: number; resetTime: number }>();

  async get(key: string) {
    const item = this.store.get(key);
    if (!item) return { count: 0, resetTime: Date.now() + 60000 };
    
    if (Date.now() > item.resetTime) {
      this.store.delete(key);
      return { count: 0, resetTime: Date.now() + 60000 };
    }
    
    return item;
  }

  async set(key: string, value: { count: number; resetTime: number }) {
    this.store.set(key, value);
  }
}

// Создаем rate limiter
let rateLimiter: Ratelimit;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  // Production: используем Upstash Redis
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  rateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 запросов в минуту
    analytics: true,
  });
} else {
  // Development: используем in-memory fallback
  rateLimiter = new Ratelimit({
    redis: new Map() as any, // Используем Map как fallback для development
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: false,
  });
}

export async function rateLimit(request: NextRequest, identifier?: string) {
  const ip = ipAddress(request) ?? '127.0.0.1';
  const key = identifier ? `${identifier}:${ip}` : ip;
  
  const { success, limit, reset, remaining } = await rateLimiter.limit(key);
  
  if (!success) {
    return {
      success: false,
      limit,
      reset,
      remaining,
    };
  }
  
  return {
    success: true,
    limit,
    reset,
    remaining,
  };
}

export function createRateLimitMiddleware(identifier?: string) {
  return async function rateLimitMiddleware(request: NextRequest) {
    const result = await rateLimit(request, identifier);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'RATE_LIMIT' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.reset.toString(),
          }
        }
      );
    }
    
    return null; // Продолжаем обработку
  };
}
