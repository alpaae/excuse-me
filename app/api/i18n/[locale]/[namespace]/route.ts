import { NextRequest, NextResponse } from 'next/server';
import { getTranslation, bulkTranslate } from '@/lib/i18n-fallback';

export async function GET(
  request: NextRequest,
  { params }: { params: { locale: string; namespace: string } }
) {
  try {
    const { locale, namespace } = params;
    const { searchParams } = new URL(request.url);
    const keys = searchParams.get('keys');

    if (keys) {
      // Bulk translation
      const keyArray = keys.split(',');
      const translations = await bulkTranslate(keyArray, locale, 'en', namespace);
      return NextResponse.json(translations);
    } else {
      // Single key translation
      const key = searchParams.get('key') || '';
      const translation = await getTranslation(key, locale, namespace);
      return NextResponse.json({ [key]: translation });
    }
  } catch (error) {
    console.error('i18n API error:', error);
    return NextResponse.json(
      { error: 'Failed to load translations' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { locale: string; namespace: string } }
) {
  try {
    const { locale, namespace } = params;
    const { key, value } = await request.json();

    if (!key || !value) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      );
    }

    // Здесь можно добавить авторизацию для админов
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user || !isAdmin(user)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { createServiceClient } = await import('@/lib/supabase-server');
    const supabase = createServiceClient();

    const { error } = await supabase
      .from('i18n_cache')
      .upsert({
        locale,
        namespace,
        key,
        value,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('i18n API error:', error);
    return NextResponse.json(
      { error: 'Failed to save translation' },
      { status: 500 }
    );
  }
}
