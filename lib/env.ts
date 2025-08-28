import { z } from 'zod';

// === CLIENT ENVIRONMENT SCHEMA ===
// Переменные, доступные на клиенте (NEXT_PUBLIC_*)
const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_URL is required'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  NEXT_PUBLIC_BASE_URL: z.string().optional(),
  NEXT_PUBLIC_FEATURE_PAYMENTS: z.string().default('true'),
});

// === SERVER ENVIRONMENT SCHEMA ===
// Переменные, доступные только на сервере
const serverSchema = z.object({
  // Supabase
  SUPABASE_SERVICE_ROLE: z.string().min(1, 'SUPABASE_SERVICE_ROLE is required for server operations'), // server-only: для загрузки файлов в private bucket
  
  // OpenAI
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required for AI features'),
  
  // Telegram Bot
  TG_BOT_TOKEN: z.string().optional(),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PRICE_PRO_MONTHLY: z.string().optional(),
  STRIPE_PRICE_PACK_100: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // Upstash Redis (опционально для rate limiting)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // Node.js environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Vercel environment (автоматически)
  VERCEL: z.string().optional(),
  VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
  VERCEL_REGION: z.string().optional(),
});

// === COMBINED SCHEMA ===
const envSchema = clientSchema.merge(serverSchema);

// === VALIDATION FUNCTIONS ===

/**
 * Валидация клиентских переменных окружения
 * Безопасно для использования на клиенте
 */
export function validateClientEnv() {
  const clientEnv = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_FEATURE_PAYMENTS: process.env.NEXT_PUBLIC_FEATURE_PAYMENTS,
  };

  try {
    return clientSchema.parse(clientEnv);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`);
      throw new Error(
        `❌ Invalid client environment variables:\n${missingVars.join('\n')}\n\n` +
        `Please check your .env.local file or Vercel environment variables.`
      );
    }
    throw error;
  }
}

/**
 * Валидация серверных переменных окружения
 * Только для использования на сервере (API routes, middleware)
 */
export function validateServerEnv() {
  const serverEnv = {
    // Supabase
    SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE,
    
    // OpenAI
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    
    // Telegram
    TG_BOT_TOKEN: process.env.TG_BOT_TOKEN,
    
    // Stripe
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_PRICE_PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY,
    STRIPE_PRICE_PACK_100: process.env.STRIPE_PRICE_PACK_100,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    
    // Upstash Redis
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    
    // Node.js
    NODE_ENV: process.env.NODE_ENV,
    
    // Vercel
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_REGION: process.env.VERCEL_REGION,
  };

  try {
    return serverSchema.parse(serverEnv);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`);
      throw new Error(
        `❌ Invalid server environment variables:\n${missingVars.join('\n')}\n\n` +
        `Please check your .env.local file or Vercel environment variables.\n` +
        `Server-only variables should not be prefixed with NEXT_PUBLIC_.`
      );
    }
    throw error;
  }
}

/**
 * Валидация всех переменных окружения
 * Только для использования на сервере
 */
export function validateAllEnv() {
  const allEnv = {
    // Client vars
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_FEATURE_PAYMENTS: process.env.NEXT_PUBLIC_FEATURE_PAYMENTS,
    
    // Server vars
    SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    TG_BOT_TOKEN: process.env.TG_BOT_TOKEN,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_PRICE_PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_REGION: process.env.VERCEL_REGION,
  };

  try {
    return envSchema.parse(allEnv);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`);
      throw new Error(
        `❌ Invalid environment variables:\n${missingVars.join('\n')}\n\n` +
        `Please check your .env.local file or Vercel environment variables.`
      );
    }
    throw error;
  }
}

// === TYPED ENVIRONMENT EXPORTS ===

/**
 * Типизированные клиентские переменные окружения
 * Безопасно для использования на клиенте
 */
export const clientEnv = validateClientEnv();

/**
 * Типизированные серверные переменные окружения  
 * Только для использования на сервере
 * 
 * @example
 * ```ts
 * import { serverEnv } from '@/lib/env';
 * 
 * // В API route
 * export async function POST() {
 *   const openai = new OpenAI({ apiKey: serverEnv.OPENAI_API_KEY });
 *   // ...
 * }
 * ```
 */
export const serverEnv = validateServerEnv();

// === TYPE EXPORTS ===
export type ClientEnv = z.infer<typeof clientSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;
export type AllEnv = z.infer<typeof envSchema>;
