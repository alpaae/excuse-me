-- Исправление схемы таблицы subscriptions
-- Выполните этот скрипт в Supabase SQL Editor

-- Добавить недостающую колонку updated_at
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Добавить недостающую колонку created_at если её нет
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Обновить существующие записи
UPDATE subscriptions 
SET 
  updated_at = NOW(),
  created_at = COALESCE(created_at, NOW())
WHERE updated_at IS NULL OR created_at IS NULL;

-- Создать индекс для updated_at
CREATE INDEX IF NOT EXISTS idx_subscriptions_updated_at 
ON subscriptions(updated_at);

-- Проверить структуру таблицы
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
ORDER BY ordinal_position;
