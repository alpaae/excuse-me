-- Безопасное добавление поля stripe_customer_id в таблицу subscriptions
-- Этот скрипт можно выполнять даже если RLS отключены

-- Проверяем, существует ли уже поле
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' 
        AND column_name = 'stripe_customer_id'
    ) THEN
        -- Добавляем поле только если его нет
        ALTER TABLE subscriptions 
        ADD COLUMN stripe_customer_id TEXT;
        
        RAISE NOTICE 'Field stripe_customer_id added successfully';
    ELSE
        RAISE NOTICE 'Field stripe_customer_id already exists';
    END IF;
END $$;

-- Создаем индекс только если его нет
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'subscriptions' 
        AND indexname = 'idx_subscriptions_stripe_customer_id'
    ) THEN
        CREATE INDEX idx_subscriptions_stripe_customer_id 
        ON subscriptions(stripe_customer_id);
        
        RAISE NOTICE 'Index idx_subscriptions_stripe_customer_id created successfully';
    ELSE
        RAISE NOTICE 'Index idx_subscriptions_stripe_customer_id already exists';
    END IF;
END $$;

-- Добавляем комментарий к полю
COMMENT ON COLUMN subscriptions.stripe_customer_id IS 'Stripe customer ID for billing portal access';

-- Показываем текущую структуру таблицы
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
ORDER BY ordinal_position;
