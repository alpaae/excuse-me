-- Откат RLS (Row Level Security) - использовать только в случае проблем
-- ВНИМАНИЕ: Это отключит безопасность данных!

-- ========================================
-- DISABLE RLS ON TABLES
-- ========================================

-- Отключаем RLS на таблице profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Отключаем RLS на таблице subscriptions
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;

-- Отключаем RLS на таблице excuses
ALTER TABLE excuses DISABLE ROW LEVEL SECURITY;

-- Отключаем RLS на таблице social_proof
ALTER TABLE social_proof DISABLE ROW LEVEL SECURITY;

-- ========================================
-- DROP ALL POLICIES
-- ========================================

-- Удаляем все политики с таблицы profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Удаляем все политики с таблицы subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Service can insert subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Service can update subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Service can delete subscriptions" ON subscriptions;

-- Удаляем все политики с таблицы excuses
DROP POLICY IF EXISTS "Users can view own excuses" ON excuses;
DROP POLICY IF EXISTS "Users can insert own excuses" ON excuses;
DROP POLICY IF EXISTS "Users can update own excuses" ON excuses;
DROP POLICY IF EXISTS "Users can delete own excuses" ON excuses;

-- Удаляем все политики с таблицы social_proof
DROP POLICY IF EXISTS "Anyone can view social proof" ON social_proof;
DROP POLICY IF EXISTS "Service can insert social proof" ON social_proof;
DROP POLICY IF EXISTS "Service can update social proof" ON social_proof;

-- ========================================
-- VERIFY ROLLBACK
-- ========================================

-- Проверяем, что RLS отключен
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('profiles', 'subscriptions', 'excuses', 'social_proof')
ORDER BY tablename;

-- ========================================
-- WARNING
-- ========================================

-- После выполнения этого скрипта:
-- 1. Все таблицы будут доступны без ограничений
-- 2. Данные будут уязвимы для несанкционированного доступа
-- 3. Используйте только для отладки или восстановления
-- 4. НЕ используйте в продакшене!
