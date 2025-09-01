-- Добавление поля stripe_customer_id в таблицу subscriptions
-- Это поле будет хранить ID клиента Stripe для управления подпиской

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Создание индекса для быстрого поиска по stripe_customer_id
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id 
ON subscriptions(stripe_customer_id);

-- Добавление комментария к полю
COMMENT ON COLUMN subscriptions.stripe_customer_id IS 'Stripe customer ID for billing portal access';
