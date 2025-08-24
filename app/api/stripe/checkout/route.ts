import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase-server';
import { serverEnv } from '@/lib/env';

const stripe = new Stripe(serverEnv.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const { success_url, cancel_url } = await request.json();
    
    // Получаем пользователя
    const supabase = createClient();
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

    // Создаем checkout сессию
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: serverEnv.STRIPE_PRICE_PRO_MONTHLY || '',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: success_url || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/account?success=true`,
      cancel_url: cancel_url || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/account?canceled=true`,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
        },
      },
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
