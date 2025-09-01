import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'Please sign in to check subscription'
      }, { status: 401 });
    }

    // Get user's subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    // Get user's excuses count for today
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

    const { count: excusesToday } = await supabase
      .from('excuses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString());

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      subscription: subscription || null,
      subscriptionError: subError || null,
      excusesToday: excusesToday || 0,
      limits: {
        isPro: !!subscription,
        remaining: subscription?.plan_type === 'monthly' ? Infinity : subscription?.generations_remaining || 3,
        used: excusesToday || 0,
        total: subscription?.plan_type === 'monthly' ? Infinity : 3
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Internal error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
