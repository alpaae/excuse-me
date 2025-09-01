-- RLS политики для безопасного доступа к данным
-- Этот файл нужно выполнить после включения RLS на таблицах

-- ========================================
-- PROFILES TABLE POLICIES
-- ========================================

-- Политика для чтения профиля (только свой профиль)
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Политика для обновления профиля (только свой профиль)
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Политика для вставки профиля (только при регистрации)
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ========================================
-- SUBSCRIPTIONS TABLE POLICIES
-- ========================================

-- Политика для чтения подписки (только свои подписки)
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Политика для вставки подписки (только через webhook)
CREATE POLICY "Service can insert subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (true);

-- Политика для обновления подписки (только через webhook)
CREATE POLICY "Service can update subscriptions" ON subscriptions
    FOR UPDATE USING (true);

-- Политика для удаления подписки (только через webhook)
CREATE POLICY "Service can delete subscriptions" ON subscriptions
    FOR DELETE USING (true);

-- ========================================
-- EXCUSES TABLE POLICIES
-- ========================================

-- Политика для чтения отмазок (только свои)
CREATE POLICY "Users can view own excuses" ON excuses
    FOR SELECT USING (auth.uid() = user_id);

-- Политика для вставки отмазок (только свои)
CREATE POLICY "Users can insert own excuses" ON excuses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Политика для обновления отмазок (только свои)
CREATE POLICY "Users can update own excuses" ON excuses
    FOR UPDATE USING (auth.uid() = user_id);

-- Политика для удаления отмазок (только свои)
CREATE POLICY "Users can delete own excuses" ON excuses
    FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- SOCIAL_PROOF TABLE POLICIES
-- ========================================

-- Политика для чтения социальных доказательств (всем)
CREATE POLICY "Anyone can view social proof" ON social_proof
    FOR SELECT USING (true);

-- Политика для вставки социальных доказательств (только через API)
CREATE POLICY "Service can insert social proof" ON social_proof
    FOR INSERT WITH CHECK (true);

-- Политика для обновления социальных доказательств (только через API)
CREATE POLICY "Service can update social proof" ON social_proof
    FOR UPDATE USING (true);
