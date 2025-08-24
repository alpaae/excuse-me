import { NextRequest } from 'next/server';

// Edge Runtime для быстрого ответа
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  return Response.json({ 
    ok: true,
    time: new Date().toISOString(),
    env: {
      vercel: !!process.env.VERCEL,
      region: process.env.VERCEL_REGION || null
    },
    // Добавляем информацию о запросе для отладки
    request: {
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent'),
    }
  });
}
