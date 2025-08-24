# 🔐 Настройка аутентификации для тестирования

## Проблема
Кнопка "Sign In" не работает, потому что не настроены переменные окружения для Supabase.

## Решение

### 1. Создайте проект в Supabase
1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Получите URL и ключи из настроек проекта

### 2. Обновите .env.local
Замените placeholder значения в `.env.local`:

```bash
# === SUPABASE ===
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE=your-actual-service-role-key
```

### 3. Настройте аутентификацию в Supabase
1. В Dashboard Supabase перейдите в Authentication > Settings
2. Добавьте домен `localhost:3000` в "Site URL"
3. Включите провайдеры:
   - Email (Magic Link)
   - GitHub (если нужен)

### 4. Создайте таблицы в базе данных
Выполните SQL миграции из `LOCAL_AUTH_SETUP.md`

## Альтернативное решение для быстрого тестирования

Если вы хотите просто протестировать UI без реальной аутентификации, можно временно заменить кнопку на простой alert:

```tsx
onClick={() => alert('Sign In functionality requires Supabase setup')}
```

## Текущий статус
- ✅ Кнопка "Sign In" добавлена в UI
- ✅ Модальное окно аутентификации реализовано
- ✅ AuthForm компонент готов
- ❌ Переменные окружения не настроены
- ❌ Supabase проект не создан

## Следующие шаги
1. Настройте Supabase проект
2. Обновите переменные окружения
3. Протестируйте аутентификацию
