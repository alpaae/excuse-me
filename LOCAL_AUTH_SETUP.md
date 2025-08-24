# Настройка локальной аутентификации

## 🔐 **Для тестирования личного кабинета и истории**

### **Шаг 1: Создать Supabase проект**

1. **Перейдите на [supabase.com](https://supabase.com)**
2. **Войдите в аккаунт** (или создайте новый)
3. **Создайте новый проект:**
   - Нажмите "New Project"
   - Выберите организацию
   - Введите имя проекта: `excuseme-mvp`
   - Введите пароль для базы данных
   - Выберите регион (ближайший к вам)
   - Нажмите "Create new project"

### **Шаг 2: Получить ключи**

1. **В Dashboard проекта** перейдите в Settings → API
2. **Скопируйте:**
   - **Project URL** (например: `https://your-project.supabase.co`)
   - **anon public** ключ
   - **service_role** ключ (в секции Project API keys)

### **Шаг 3: Обновить .env.local**

Замените placeholder значения в `.env.local`:

```bash
# === SUPABASE ===
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE=your-actual-service-role-key
```

### **Шаг 4: Настроить аутентификацию**

1. **В Supabase Dashboard** перейдите в Authentication → Settings
2. **Настройте провайдеры:**
   - **Email** (включен по умолчанию)
   - **Google** (опционально)
   - **GitHub** (опционально)

3. **Настройте URL:**
   - **Site URL:** `http://localhost:3000`
   - **Redirect URLs:** `http://localhost:3000/auth/callback`

### **Шаг 5: Создать таблицы**

Выполните SQL миграции в Supabase SQL Editor:

```sql
-- Создание таблицы excuses (если еще не создана)
CREATE TABLE IF NOT EXISTS public.excuses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    scenario TEXT NOT NULL,
    tone TEXT NOT NULL,
    channel TEXT NOT NULL,
    context TEXT,
    result_text TEXT NOT NULL,
    rarity TEXT NOT NULL DEFAULT 'common',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы user_profiles (если нужна)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    is_pro BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS политики
ALTER TABLE public.excuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Политика для excuses
CREATE POLICY "Users can view own excuses" ON public.excuses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own excuses" ON public.excuses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Политика для user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);
```

### **Шаг 6: Перезапустить сервер**

```bash
# Остановить сервер (Ctrl+C)
# Затем запустить заново
npm run dev
```

### **Шаг 7: Тестирование**

1. **Откройте http://localhost:3000**
2. **Нажмите "Sign In"**
3. **Создайте аккаунт** или войдите
4. **Тестируйте:**
   - Генерацию отмазок
   - Личный кабинет
   - Историю отмазок

### **Возможные проблемы:**

1. **"Invalid API key"** - проверьте правильность ключей
2. **"Site URL not allowed"** - проверьте настройки в Supabase Dashboard
3. **"Table not found"** - выполните SQL миграции

### **Альтернатива: Тестовые данные**

Если не хотите настраивать Supabase, можно создать мок-данные для тестирования UI:

```typescript
// В компонентах можно добавить условную логику
const isDev = process.env.NODE_ENV === 'development';
const mockUser = isDev ? { id: 'test', email: 'test@example.com' } : null;
```

**После настройки вы сможете полноценно тестировать все функции приложения!** 🚀
