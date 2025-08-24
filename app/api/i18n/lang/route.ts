import { NextResponse } from 'next/server';
import { normalizeLocale } from '@/lib/i18n-detect';

export async function POST(req: Request) {
  const { lang } = await req.json().catch(() => ({ lang: '' }));
  const val = normalizeLocale(lang || 'en');
  const res = new NextResponse(null, { status: 204 });
  res.cookies.set('excuseme_lang', val, { path:'/', maxAge:60*60*24*180, sameSite:'lax', secure:process.env.NODE_ENV==='production' });
  return res;
}
