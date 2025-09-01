-- Включение RLS (Row Level Security) на всех таблицах
-- Этот файл нужно выполнить ПЕРЕД созданием политик

-- ========================================
-- ENABLE RLS ON TABLES
-- ========================================

-- Включаем RLS на таблице profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Включаем RLS на таблице subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Включаем RLS на таблице excuses
ALTER TABLE excuses ENABLE ROW LEVEL SECURITY;

-- Включаем RLS на таблице social_proof
ALTER TABLE social_proof ENABLE ROW LEVEL SECURITY;

-- ========================================
-- VERIFY RLS STATUS
-- ========================================

-- Проверяем статус RLS на всех таблицах
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('profiles', 'subscriptions', 'excuses', 'social_proof')
ORDER BY tablename;

-- ========================================
-- IMPORTANT NOTES
-- ========================================

-- После выполнения этого скрипта:
-- 1. Все таблицы будут защищены RLS
-- 2. Без политик доступ будет заблокирован
-- 3. Нужно сразу выполнить rls-policies.sql
-- 4. Service Role ключ обходит RLS автоматически
