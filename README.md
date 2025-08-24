# ExcuseME MVP

SaaS приложение для генерации вежливых отмазок с поддержкой PWA, Telegram Mini App и мультиязычности.

## Технологии

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: OpenAI (ChatGPT, TTS)
- **Payments**: Stripe
- **Deployment**: Vercel
- **PWA**: Service Worker, Web App Manifest
- **Telegram**: Mini App с HMAC верификацией

## Быстрый старт

### 1. Клонирование и установка

```bash
git clone <repository-url>
cd excuseme-mvp
npm install
```

### 2. Настройка переменных окружения

#### Локально
Скопируйте `env.example` в `.env.local` и заполните значения:

```bash
cp env.example .env.local
```

#### Vercel
Добавьте следующие переменные в настройках проекта Vercel:

**Обязательные:**
- `NEXT_PUBLIC_SUPABASE_URL` - URL вашего Supabase проекта
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon Key из Supabase
- `SUPABASE_SERVICE_ROLE` - Service Role Key из Supabase
- `OPENAI_API_KEY` - API ключ OpenAI
- `NEXT_PUBLIC_BASE_URL` - URL вашего приложения (например, https://your-app.vercel.app)

**Опциональные:**
- `NEXT_PUBLIC_FEATURE_PAYMENTS` - true/false для включения платежей
- `TG_BOT_TOKEN` - токен Telegram бота для Mini App
- `STRIPE_SECRET_KEY` - секретный ключ Stripe
- `STRIPE_PRICE_PRO_MONTHLY` - ID цены Stripe для месячной подписки
- `STRIPE_WEBHOOK_SECRET` - секрет webhook'а Stripe

### 3. Настройка Supabase

1. Создайте проект на [supabase.com](https://supabase.com)
2. Получите URL и ANON KEY из настроек проекта
3. Добавьте их в переменные окружения
4. **Примените схему БД:**
   - Откройте SQL Editor в Supabase Dashboard
   - Скопируйте содержимое `db/schema.sql`
   - Выполните SQL скрипт
   - Убедитесь, что все таблицы созданы и RLS политики применены
5. **Настройте Storage:**
   - Откройте Storage в Supabase Dashboard
   - Создайте новый bucket с именем `tts`
   - Установите bucket как **private** (не public)
   - Настройте RLS политики для bucket:
     - Откройте SQL Editor в Supabase Dashboard
     - Скопируйте содержимое `db/storage-policies.sql`
     - Выполните SQL скрипт

### 4. Настройка OpenAI

1. Получите API ключ на [platform.openai.com](https://platform.openai.com)
2. Добавьте в переменные окружения

### 5. Настройка Stripe (опционально)

1. Создайте аккаунт на [stripe.com](https://stripe.com)
2. Получите секретный ключ из Dashboard
3. Создайте продукт и цену для месячной подписки
4. **Настройте webhook в Stripe Dashboard:**
   - URL: `https://your-app.vercel.app/api/stripe/webhook`
   - События: `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.deleted`
   - Получите webhook secret и добавьте в переменные окружения

### 6. Настройка Telegram Mini App (опционально)

1. Создайте бота через @BotFather
2. Получите токен бота
3. Добавьте в переменные окружения
4. Настройте webhook для авторизации

### 7. Запуск разработки

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

### 8. Тестирование

```bash
npm run test
```

## Структура проекта

```
/app
  /(web)          # Web приложение
  /dashboard      # Личный кабинет
  /account        # Настройки аккаунта
  /tg             # Telegram Mini App
  /admin          # Админ панель
  /api            # API роуты
/components       # UI компоненты
/lib              # Утилиты и конфигурации
/db               # Схема базы данных
/locales          # Файлы локализации
/public           # Статические файлы
```

## Деплой

### Vercel

1. Подключите репозиторий к Vercel
2. Добавьте переменные окружения в настройках проекта
3. Настройте автодеплой из main ветки

### GitHub Actions

Рекомендуется настроить CI/CD для автоматического деплоя при пуше в main ветку.

## PWA

Приложение поддерживает установку на домашний экран:
- iOS: Safari → Поделиться → На экран "Домой"
- Android: Chrome → Меню → Установить приложение

## Telegram Mini App

Для настройки Telegram Mini App:
1. Создайте бота через @BotFather
2. Получите токен бота
3. Добавьте в `.env.local`
4. Настройте webhook для авторизации

## Лицензия

MIT
