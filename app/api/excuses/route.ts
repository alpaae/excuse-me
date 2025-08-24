import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const favoritesOnly = searchParams.get('favorites') === 'true';
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Получаем пользователя
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Строим запрос
    let query = supabase
      .from('excuses')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    // Фильтр по избранному
    if (favoritesOnly) {
      query = query.eq('is_favorite', true);
    }

    // Поиск
    if (search) {
      query = query.or(`result_text.ilike.%${search}%,input->scenario.ilike.%${search}%`);
    }

    // Сортировка
    if (sortBy === 'created_at') {
      query = query.order('created_at', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'updated_at') {
      query = query.order('updated_at', { ascending: sortOrder === 'asc' });
    }

    // Пагинация
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: excuses, error, count } = await query;

    if (error) {
      console.error('Error fetching excuses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch excuses' },
        { status: 500 }
      );
    }

    const totalPages = count ? Math.ceil(count / limit) : 0;

    return NextResponse.json({
      excuses: excuses || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });

  } catch (error) {
    console.error('Excuses API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
