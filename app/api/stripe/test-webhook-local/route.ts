import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { userId, plan } = await request.json();
    
    if (!userId || !plan) {
      return NextResponse.json({ 
        error: 'Missing userId or plan',
        received: { userId, plan }
      }, { status: 400 });
    }

    // Тестируем подключение к Supabase
    const supabase = await createClient();
    
    // Тестируем вставку в таблицу subscriptions
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        provider: 'test',
        status: 'active',
        plan_type: plan,
        generations_remaining: plan === 'monthly' ? null : 100,
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ 
        error: 'Supabase error',
        details: error,
        received: { userId, plan }
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Test subscription created successfully',
      data: data,
      received: { userId, plan }
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
