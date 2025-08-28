-- Защита от манипуляций с датой в базе данных
-- Выполните этот скрипт в Supabase SQL Editor

-- Функция для проверки времени создания записи
CREATE OR REPLACE FUNCTION check_creation_time()
RETURNS TRIGGER AS $$
BEGIN
  -- Проверяем, что время создания не в прошлом (с допуском 5 минут)
  IF NEW.created_at < NOW() - INTERVAL '5 minutes' THEN
    RAISE EXCEPTION 'Creation time cannot be in the past';
  END IF;
  
  -- Проверяем, что время создания не в будущем (с допуском 5 минут)
  IF NEW.created_at > NOW() + INTERVAL '5 minutes' THEN
    RAISE EXCEPTION 'Creation time cannot be in the future';
  END IF;
  
  -- Устанавливаем серверное время, если не указано
  IF NEW.created_at IS NULL THEN
    NEW.created_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для таблицы excuses
DROP TRIGGER IF EXISTS check_excuse_creation_time ON excuses;
CREATE TRIGGER check_excuse_creation_time
  BEFORE INSERT ON excuses
  FOR EACH ROW
  EXECUTE FUNCTION check_creation_time();

-- Триггер для таблицы subscriptions
DROP TRIGGER IF EXISTS check_subscription_creation_time ON subscriptions;
CREATE TRIGGER check_subscription_creation_time
  BEFORE INSERT ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION check_creation_time();

-- Индекс для быстрого поиска по времени создания
CREATE INDEX IF NOT EXISTS idx_excuses_created_at ON excuses(created_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON subscriptions(created_at);

-- Комментарии
COMMENT ON FUNCTION check_creation_time() IS 'Validates creation time to prevent date manipulation';
COMMENT ON TRIGGER check_excuse_creation_time ON excuses IS 'Prevents creation of excuses with invalid timestamps';
COMMENT ON TRIGGER check_subscription_creation_time ON subscriptions IS 'Prevents creation of subscriptions with invalid timestamps';
