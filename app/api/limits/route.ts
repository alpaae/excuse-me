import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { getWarsawDateString, nextMidnightZonedISO } from '@/lib/time-warsaw';

const DAILY_FREE_LIMIT = 3;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has Pro subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    const isPro = !!subscription;

    if (isPro) {
      // Pro users have unlimited excuses
      return NextResponse.json({
        remaining: Infinity,
        daily: DAILY_FREE_LIMIT,
        isPro: true,
        nextResetAt: nextMidnightZonedISO()
      });
    }

    // For free users, count excuses created today
    const today = getWarsawDateString();
    const todayStart = new Date(today + 'T00:00:00.000Z');
    const todayEnd = new Date(today + 'T23:59:59.999Z');

    const { count, error: countError } = await supabase
      .from('excuses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', todayStart.toISOString())
      .lte('created_at', todayEnd.toISOString());

    if (countError) {
      console.error('Error counting excuses:', countError);
      return NextResponse.json({ error: 'Failed to count excuses' }, { status: 500 });
    }

    const used = count || 0;
    const remaining = Math.max(0, DAILY_FREE_LIMIT - used);

    return NextResponse.json({
      remaining,
      daily: DAILY_FREE_LIMIT,
      isPro: false,
      nextResetAt: nextMidnightZonedISO()
    });

  } catch (error) {
    console.error('Limits API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
