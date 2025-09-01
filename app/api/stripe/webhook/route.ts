import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase-server';
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

    const supabase = await createServiceClient();
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
          
          // Check if subscription already exists to prevent duplicates
          const { data: existingSubscription } = await supabase
            .from('subscriptions')
            .select('id, plan_type, status')
            .eq('user_id', userId)
            .eq('provider', 'stripe')
            .eq('status', 'active')
            .single();
          
          if (existingSubscription) {
            logger.info('Subscription already exists, updating instead of creating', requestId, { 
              userId, 
              existingId: existingSubscription.id,
              existingPlan: existingSubscription.plan_type 
            });
            
            // Update existing subscription instead of creating new one
            const { error } = await supabase
              .from('subscriptions')
              .update({
                plan_type: plan,
                generations_remaining: plan === 'monthly' ? null : 100,
                current_period_end: plan === 'monthly' 
                  ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days
                  : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // +1 year
                updated_at: new Date().toISOString()
              })
              .eq('id', existingSubscription.id);
            
            if (error) {
              logger.error('Failed to update existing subscription', error, requestId);
            } else {
              logger.info('Successfully updated existing subscription', requestId, { userId, plan });
            }
          } else {
            // Create new subscription only if none exists
            if (plan === 'monthly') {
              logger.info('Creating new monthly subscription', requestId);
              
              // Get or create Stripe customer
              let customerId = session.customer as string;
              if (!customerId && session.customer_email) {
                // Create customer if not exists
                const customer = await stripe.customers.create({
                  email: session.customer_email,
                  metadata: { user_id: userId },
                });
                customerId = customer.id;
              }
              
              const { error } = await supabase
                .from('subscriptions')
                .insert({
                  user_id: userId,
                  provider: 'stripe',
                  status: 'active',
                  plan_type: 'monthly',
                  generations_remaining: null, // Unlimited for monthly
                  current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
                  stripe_customer_id: customerId
                });
              
              if (error) {
                logger.error('Failed to create monthly subscription', error, requestId);
              } else {
                logger.info('Successfully created monthly subscription', requestId, { userId, customerId });
              }
            } else if (plan === 'pack100') {
              logger.info('Creating new pack100 subscription', requestId);
              
              // Get or create Stripe customer
              let customerId = session.customer as string;
              if (!customerId && session.customer_email) {
                // Create customer if not exists
                const customer = await stripe.customers.create({
                  email: session.customer_email,
                  metadata: { user_id: userId },
                });
                customerId = customer.id;
              }
              
              const { error } = await supabase
                .from('subscriptions')
                .insert({
                  user_id: userId,
                  provider: 'stripe',
                  status: 'active',
                  plan_type: 'pack100',
                  generations_remaining: 100,
                  current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // +1 year (no expiration)
                  stripe_customer_id: customerId
                });
              
              if (error) {
                logger.error('Failed to create pack100 subscription', error, requestId);
              } else {
                logger.info('Successfully created pack100 subscription', requestId, { userId, customerId });
              }
            }
          }
        } else {
          logger.warn('No user_id found in session metadata', requestId, { sessionId: session.id });
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;
        const plan = subscription.metadata?.plan;
        
        logger.info('Processing customer.subscription.created', requestId, { userId, plan, subscriptionId: subscription.id });
        
        if (userId && plan === 'monthly') {
          logger.info('Creating monthly subscription from subscription event', requestId);
          
          // Check if subscription already exists
          const { data: existingSubscription } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('user_id', userId)
            .eq('provider', 'stripe')
            .eq('status', 'active')
            .single();
          
          if (!existingSubscription) {
            const { error } = await supabase
              .from('subscriptions')
              .insert({
                user_id: userId,
                provider: 'stripe',
                status: 'active',
                plan_type: 'monthly',
                generations_remaining: null, // Unlimited for monthly
                current_period_end: new Date(subscription.current_period_end * 1000),
                stripe_customer_id: subscription.customer as string
              });
            
            if (error) {
              logger.error('Failed to create monthly subscription from subscription event', error, requestId);
            } else {
              logger.info('Successfully created monthly subscription from subscription event', requestId, { userId, customerId: subscription.customer });
            }
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;
        const plan = subscription.metadata?.plan;
        
        logger.info('Processing customer.subscription.updated', requestId, { userId, plan, subscriptionId: subscription.id });
        
        if (userId && plan === 'monthly') {
          logger.info('Updating monthly subscription from subscription event', requestId);
          
          const { error } = await supabase
            .from('subscriptions')
            .update({
              current_period_end: new Date(subscription.current_period_end * 1000),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('provider', 'stripe')
            .eq('status', 'active');
          
          if (error) {
            logger.error('Failed to update monthly subscription from subscription event', error, requestId);
          } else {
            logger.info('Successfully updated monthly subscription from subscription event', requestId, { userId });
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const userId = subscription.metadata?.user_id;
        
        if (userId) {
          // Check if subscription already exists to prevent duplicates
          const { data: existingSubscription } = await supabase
            .from('subscriptions')
            .select('id, plan_type, status')
            .eq('user_id', userId)
            .eq('provider', 'stripe')
            .eq('status', 'active')
            .single();
          
          if (existingSubscription) {
            logger.info('Subscription exists, updating current_period_end only', requestId, { 
              userId, 
              existingId: existingSubscription.id 
            });
            
            // Only update the current_period_end for existing subscription
            const { error } = await supabase
              .from('subscriptions')
              .update({
                current_period_end: new Date(subscription.current_period_end * 1000),
                updated_at: new Date().toISOString()
              })
              .eq('id', existingSubscription.id);
            
            if (error) {
              logger.error('Failed to update subscription period', error, requestId);
            } else {
              logger.info('Successfully updated subscription period', requestId, { userId });
            }
          } else {
            logger.warn('No existing subscription found for invoice payment', requestId, { userId });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const userId = subscription.metadata?.user_id;
        const plan = subscription.metadata?.plan;
        
        if (userId) {
          logger.info('Processing invoice.payment_failed', requestId, { userId, plan });
          
          // Update existing subscription status
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              current_period_end: new Date(subscription.current_period_end * 1000),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('provider', 'stripe')
            .eq('status', 'active');
          
          if (error) {
            logger.error('Failed to update subscription status to past_due', error, requestId);
          } else {
            logger.info('Successfully updated subscription status to past_due', requestId, { userId });
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;
        const plan = subscription.metadata?.plan;
        
        if (userId) {
          logger.info('Processing customer.subscription.deleted', requestId, { userId, plan });
          
          // Update existing subscription status
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              current_period_end: new Date(subscription.current_period_end * 1000),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('provider', 'stripe')
            .eq('status', 'active');
          
          if (error) {
            logger.error('Failed to update subscription status to canceled', error, requestId);
          } else {
            logger.info('Successfully updated subscription status to canceled', requestId, { userId });
          }
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
