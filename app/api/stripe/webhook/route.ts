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
  if (process.env.ENV_MODE === 'ci') {
    // никакой сети в CI
    throw new Error('Network calls are disabled in CI');
  }
  
  const requestId = getRequestId(request);
  logger.info('Stripe webhook started', requestId);
  
  // Логируем заголовки для диагностики
  const headers = Object.fromEntries(request.headers.entries());
  logger.info('Webhook headers', requestId, { 
    'stripe-signature': headers['stripe-signature'] ? 'PRESENT' : 'MISSING',
    'content-type': headers['content-type'],
    'user-agent': headers['user-agent']
  });
  
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logger.info('Webhook signature verified successfully', requestId, { 
        eventType: event.type,
        eventId: event.id 
      });
    } catch (err) {
      logger.error('Webhook signature verification failed', err instanceof Error ? err : new Error(String(err)), requestId);
      logger.info('Webhook body preview', requestId, { 
        bodyLength: body.length,
        bodyStart: body.substring(0, 100),
        signature: signature ? 'PRESENT' : 'MISSING',
        webhookSecretLength: webhookSecret.length
      });
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid signature',
        400,
        requestId
      );
    }

    const supabase = await createClient();
    logger.info('Supabase client created successfully', requestId);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const plan = session.metadata?.plan;
        
        logger.info('Processing checkout.session.completed', requestId, { userId, plan, sessionId: session.id });
        logger.info('Session metadata:', requestId, { metadata: session.metadata });
        
        if (userId) {
          logger.info('User ID found, processing plan:', requestId, { userId, plan });
          
          if (plan === 'monthly') {
            // Месячная подписка
            const { error } = await supabase
              .from('subscriptions')
              .upsert({
                user_id: userId,
                provider: 'stripe',
                status: 'active',
                plan_type: 'monthly',
                generations_remaining: null, // Unlimited for monthly
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            
            if (error) {
              logger.error('Failed to update subscription for monthly plan', error, requestId);
            } else {
              logger.info('Successfully updated subscription for monthly plan', requestId, { userId });
            }
          } else if (plan === 'pack100') {
            logger.info('Processing pack100 subscription', requestId);
            // Пакет 100 генераций
            const { error } = await supabase
              .from('subscriptions')
              .upsert({
                user_id: userId,
                provider: 'stripe',
                status: 'active',
                plan_type: 'pack100',
                generations_remaining: 100,
                current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // +1 year (no expiration)
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            
            if (error) {
              logger.error('Failed to update subscription for pack100 plan', error, requestId);
            } else {
              logger.info('Successfully updated subscription for pack100 plan', requestId, { userId });
            }
          }
        } else {
          logger.warn('No user_id found in session metadata', requestId, { sessionId: session.id });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const userId = subscription.metadata?.user_id;
        
        if (userId) {
          const { error } = await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              provider: 'stripe',
              status: 'active',
              plan_type: 'monthly',
              generations_remaining: null, // Unlimited for monthly
              current_period_end: new Date(subscription.current_period_end * 1000),
              updated_at: new Date().toISOString()
            });
          
          if (error) {
            logger.error('Failed to update subscription on invoice payment', error, requestId);
          } else {
            logger.info('Successfully updated subscription on invoice payment', requestId, { userId });
          }
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
