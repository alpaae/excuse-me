import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase-server';
import { serverEnv } from '@/lib/env';

const stripe = new Stripe(serverEnv.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  if (process.env.ENV_MODE === 'ci') {
    // никакой сети в CI
    throw new Error('Network calls are disabled in CI');
  }
  
  try {
    const { success_url, cancel_url, plan } = await request.json();
    
    // Валидация плана
    if (!plan || !['monthly', 'pack100'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be "monthly" or "pack100"' },
        { status: 400 }
      );
    }
    
    // Получаем пользователя
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Получаем или создаем профиль пользователя
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      await supabase
        .from('profiles')
        .insert({
          id: user.id,
          display_name: user.user_metadata?.full_name || user.email,
        });
    }

    // Определяем параметры в зависимости от плана
    const isSubscription = plan === 'monthly';
    const priceId = isSubscription 
      ? serverEnv.STRIPE_PRICE_PRO_MONTHLY 
      : serverEnv.STRIPE_PRICE_PACK_100;
    
    if (!priceId) {
      return NextResponse.json(
        { error: `Price ID not configured for plan: ${plan}` },
        { status: 500 }
      );
    }

    // Создаем checkout сессию
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: isSubscription ? 'subscription' : 'payment',
      success_url: success_url || `${process.env.NEXT_PUBLIC_BASE_URL || 'https://excuse-mee.vercel.app'}/?payment=success&plan=${plan}`,
      cancel_url: cancel_url || `${process.env.NEXT_PUBLIC_BASE_URL || 'https://excuse-mee.vercel.app'}/?payment=canceled`,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        plan: plan,
      },
      ...(isSubscription && {
        subscription_data: {
          metadata: {
            user_id: user.id,
            plan: plan,
          },
        },
      }),
    });

    return NextResponse.json({
      success: true,
      url: session.url,
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
