-- Обновление таблицы subscriptions для поддержки Stripe планов
-- Выполните этот скрипт в Supabase SQL Editor

-- Добавить новые поля для поддержки разных типов планов
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS generations_remaining INTEGER DEFAULT NULL;

-- Обновить существующие записи
UPDATE subscriptions 
SET plan_type = 'monthly' 
WHERE plan_type IS NULL;

-- Создать индекс для быстрого поиска по типу плана
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_type 
ON subscriptions(plan_type);

-- Создать индекс для поиска по оставшимся генерациям
CREATE INDEX IF NOT EXISTS idx_subscriptions_generations_remaining 
ON subscriptions(generations_remaining);

-- Добавить комментарии к таблице
COMMENT ON COLUMN subscriptions.plan_type IS 'Type of subscription plan: monthly, pack100';
COMMENT ON COLUMN subscriptions.generations_remaining IS 'Number of generations remaining for pack100 plan';

-- Проверить структуру таблицы
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
ORDER BY ordinal_position;
