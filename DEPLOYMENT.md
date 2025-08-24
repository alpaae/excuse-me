# 🚀 Деплой ExcuseME MVP

## Быстрая настройка

### 1. Подготовка к деплою

```bash
# Убедитесь что все изменения закоммичены
git add .
git commit -m "feat: ready for deployment"
git push origin main
```

### 2. Настройка Supabase

1. Создайте проект на [supabase.com](https://supabase.com)
2. Получите URL и ключи из Settings → API
3. Добавьте в переменные окружения:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE`

### 3. Настройка OpenAI

1. Получите API ключ на [platform.openai.com](https://platform.openai.com)
2. Добавьте `OPENAI_API_KEY` в переменные окружения

### 4. Деплой на Vercel

1. Подключите репозиторий на [vercel.com](https://vercel.com)
2. Добавьте все переменные окружения из `env.example`
3. Установите `NEXT_PUBLIC_BASE_URL` = ваш домен
4. Деплой произойдет автоматически

### 5. Проверка

После деплоя проверьте:
- ✅ Приложение доступно по URL
- ✅ i18n работает (переключение языков)
- ✅ Генерация отмазок работает
- ✅ Аутентификация работает

## Переменные окружения

### Обязательные
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE=your-service-role-key
OPENAI_API_KEY=sk-your-openai-api-key
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```

### Опциональные
```
NEXT_PUBLIC_FEATURE_PAYMENTS=true
TG_BOT_TOKEN=your-telegram-bot-token
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PRICE_PRO_MONTHLY=price_your-monthly-price-id
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

## Структура проекта

```
excuseme-mvp/
├── app/                    # Next.js App Router
├── components/             # React компоненты
├── lib/                    # Утилиты и конфигурация
├── middleware.ts           # i18n middleware
├── vercel.json            # Конфигурация Vercel
├── env.example            # Пример переменных
└── scripts/setup.sh       # Скрипт настройки
```

## Мониторинг

- **Vercel Analytics:** автоматически включены
- **Supabase Logs:** доступны в Dashboard
- **OpenAI Usage:** отслеживается в OpenAI Dashboard
