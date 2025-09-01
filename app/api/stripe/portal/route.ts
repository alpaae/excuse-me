import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase-server';
import { serverEnv } from '@/lib/env';

const stripe = new Stripe(serverEnv.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    // Get user ID from request body (sent from client)
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Use Service Role client for database operations
    const supabase = await createServiceClient();

    // Get user's subscription to check if they have Stripe subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'stripe')
      .eq('status', 'active')
      .single();

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active Stripe subscription found' },
        { status: 404 }
      );
    }

    // Get or create Stripe customer
    let customerId = subscription.stripe_customer_id;
    
    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        metadata: {
          user_id: userId,
        },
      });
      
      customerId = customer.id;
      
      // Update subscription with customer ID
      await supabase
        .from('subscriptions')
        .update({ stripe_customer_id: customerId })
        .eq('id', subscription.id);
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://excuse-mee.vercel.app'}/account`,
    });

    return NextResponse.json({
      success: true,
      url: session.url,
    });

  } catch (error) {
    console.error('Stripe portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
}
