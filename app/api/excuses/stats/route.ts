import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    // Получаем пользователя
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Получаем общее количество отмазок
    const { count: totalExcuses } = await supabase
      .from('excuses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Получаем количество избранных отмазок
    const { count: favoriteExcuses } = await supabase
      .from('excuses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_favorite', true);

    // Получаем отмазки за текущий месяц
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const { count: thisMonthExcuses } = await supabase
      .from('excuses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', thisMonthStart.toISOString());

    // Получаем отмазки за прошлый месяц
    const lastMonthStart = new Date(thisMonthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    const lastMonthEnd = new Date(thisMonthStart);
    lastMonthEnd.setDate(0);

    const { count: lastMonthExcuses } = await supabase
      .from('excuses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', lastMonthStart.toISOString())
      .lt('created_at', lastMonthEnd.toISOString());

    // Получаем статистику по каналам
    const { data: channelStats } = await supabase
      .from('excuses')
      .select('sent_via')
      .eq('user_id', user.id);

    const channelCounts = channelStats?.reduce((acc: Record<string, number>, excuse: { sent_via: string }) => {
      acc[excuse.sent_via] = (acc[excuse.sent_via] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Получаем статистику по тонам
    const { data: toneStats } = await supabase
      .from('excuses')
      .select('input')
      .eq('user_id', user.id);

    const toneCounts = toneStats?.reduce((acc: Record<string, number>, excuse: { input?: { tone?: string } }) => {
      const tone = excuse.input?.tone;
      if (tone) {
        acc[tone] = (acc[tone] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>) || {};

    return NextResponse.json({
      totalExcuses: totalExcuses || 0,
      favoriteExcuses: favoriteExcuses || 0,
      thisMonthExcuses: thisMonthExcuses || 0,
      lastMonthExcuses: lastMonthExcuses || 0,
      channelStats: channelCounts,
      toneStats: toneCounts,
    });

  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
