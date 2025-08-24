import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase-server';
import { logger, getRequestId, createErrorResponse, ErrorCodes } from '@/lib/logger';
import { serverEnv } from '@/lib/env';

// Node.js runtime для работы с Stripe и Supabase
export const runtime = 'nodejs';

const stripe = new Stripe(serverEnv.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const webhookSecret = serverEnv.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  logger.info('Stripe webhook started', requestId);
  
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      logger.error('Webhook signature verification failed', err instanceof Error ? err : new Error(String(err)), requestId);
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid signature',
        400,
        requestId
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
        logger.info(`Unhandled Stripe event type: ${event.type}`, requestId);
    }

    logger.info('Stripe webhook completed successfully', requestId, { eventType: event.type });
    return NextResponse.json({ received: true, requestId });

  } catch (error) {
    logger.error(
      'Stripe webhook failed',
      error instanceof Error ? error : new Error(String(error)),
      requestId
    );
    
    return createErrorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Webhook handler failed',
      500,
      requestId
    );
  }
}
