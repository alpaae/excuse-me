import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase-server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        
        if (userId) {
          // Создаем или обновляем подписку
          await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              provider: 'stripe',
              status: 'active',
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
            });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const userId = subscription.metadata?.user_id;
        
        if (userId) {
          await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              provider: 'stripe',
              status: 'active',
              current_period_end: new Date(subscription.current_period_end * 1000),
            });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const userId = subscription.metadata?.user_id;
        
        if (userId) {
          await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              provider: 'stripe',
              status: 'past_due',
              current_period_end: new Date(subscription.current_period_end * 1000),
            });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;
        
        if (userId) {
          await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              provider: 'stripe',
              status: 'canceled',
              current_period_end: new Date(subscription.current_period_end * 1000),
            });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
