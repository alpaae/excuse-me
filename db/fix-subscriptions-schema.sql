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

-- Исправить RLS политики для webhook
-- Удалить ВСЕ существующие политики (включая новые)
DROP POLICY IF EXISTS "subs owner select" ON subscriptions;
DROP POLICY IF EXISTS "subs owner upsert" ON subscriptions;
DROP POLICY IF EXISTS "subs owner update" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_webhook_insert" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_webhook_update" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_user_select" ON subscriptions;

-- Создать новые политики для webhook
CREATE POLICY "subscriptions_webhook_insert" ON subscriptions
  FOR INSERT 
  WITH CHECK (true); -- Разрешить вставку для webhook (включая anon)

CREATE POLICY "subscriptions_webhook_update" ON subscriptions
  FOR UPDATE 
  USING (true); -- Разрешить обновление для webhook (включая anon)

CREATE POLICY "subscriptions_user_select" ON subscriptions
  FOR SELECT 
  USING (auth.uid() = user_id); -- Пользователи видят только свои подписки

-- Создать специальную политику для anon пользователей (webhook)
CREATE POLICY "subscriptions_anon_all" ON subscriptions
  FOR ALL 
  USING (true) 
  WITH CHECK (true); -- Разрешить все операции для anon (webhook)

-- Включить RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Проверить созданные политики
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'subscriptions';
