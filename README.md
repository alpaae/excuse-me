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

1. **Создание бота:**
   - Откройте [@BotFather](https://t.me/BotFather) в Telegram
   - Отправьте команду `/newbot`
   - Следуйте инструкциям для создания бота
   - Сохраните токен бота

2. **Настройка Web App:**
   - Отправьте команду `/setmenubutton` в @BotFather
   - Выберите вашего бота
   - Установите текст кнопки (например, "ExcuseME")
   - Установите URL: `https://your-app.vercel.app/tg`
   - Или используйте команду `/setcommands` для добавления команды

3. **Альтернативная настройка через BotFather:**
   ```
   /mybots -> Выберите бота -> Bot Settings -> Menu Button
   URL: https://your-app.vercel.app/tg
   Text: ExcuseME
   ```

4. **Проверка initData:**
   - **Development**: initData проверяется локально
   - **Production**: initData проверяется на сервере через HMAC
   - Убедитесь, что `TG_BOT_TOKEN` установлен в переменных окружения

5. **Пример ссылки для тестирования:**
   ```
   https://t.me/your_bot_username?startapp=test
   ```

6. **Добавьте токен в переменные окружения:**
   ```
   TG_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

### 7. Запуск разработки

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

### 8. Тестирование

**Unit тесты:**
```bash
npm run test
```

**E2E тесты (Playwright):**
```bash
# Headless режим
npm run test:e2e

# С отображением браузера
npm run test:e2e:headed

# С UI интерфейсом Playwright
npm run test:e2e:ui
```

**Что покрывают E2E тесты:**
- Отображение главной страницы и формы генерации
- Мокирование API `/api/generate` и проверка результатов
- Обработка ошибок (rate limit, free limit)
- Переключение языков через `?lang=` параметр
- Авторизация и неавторизованные состояния

**Lighthouse CI (производительность и PWA):**
```bash
# Полный анализ (запуск сервера + сбор + проверка)
npm run lighthouse

# Только сбор метрик
npm run lighthouse:collect

# Только проверка бюджета
npm run lighthouse:assert
```

**Бюджет производительности:**
- Performance ≥ 85 (mobile)
- PWA installable = true
- Core Web Vitals: FCP < 2s, LCP < 2.5s, CLS < 0.1, TBT < 300ms
- Accessibility ≥ 90
- Best Practices ≥ 80
- SEO ≥ 80

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
/tests/e2e        # Playwright E2E тесты
```

## Деплой

### Чек-лист деплоя

#### 1. Vercel Environment Variables

Настройте следующие переменные в Vercel Dashboard → Settings → Environment Variables:

**Supabase:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE=your-service-role-key
```

**OpenAI:**
```
OPENAI_API_KEY=sk-...
```

**Stripe:**
```
STRIPE_SECRET_KEY=sk_live_... или sk_test_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Telegram:**
```
TG_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

**App:**
```
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
NEXT_PUBLIC_FEATURE_PAYMENTS=true
```

#### 2. Supabase Setup

1. **Применение схемы БД:**
   - Откройте Supabase Dashboard → SQL Editor
   - Скопируйте содержимое `db/schema.sql`
   - Выполните SQL скрипт

2. **Создание Storage Bucket:**
   - Перейдите в Storage → Create bucket
   - Имя: `tts`
   - Тип: Private
   - Примените RLS политики из `db/storage-policies.sql`

#### 3. Stripe Webhook Setup

1. **Создание webhook:**
   - Stripe Dashboard → Developers → Webhooks
   - Endpoint URL: `https://your-app.vercel.app/api/stripe/webhook`
   - Events: `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.deleted`

2. **Получение webhook secret:**
   - Скопируйте `whsec_...` из webhook деталей
   - Добавьте в `STRIPE_WEBHOOK_SECRET`

#### 4. Health Check

Endpoint `/api/health` для мониторинга приложения уже создан.

**Формат ответа:**
```json
{
  "ok": true,
  "time": "2024-01-20T10:30:00.000Z",
  "env": {
    "vercel": true,
    "region": "fra1"
  }
}
```

#### 5. Smoke Test

После деплоя проверьте:

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Supabase connection
curl https://your-app.vercel.app/api/excuses

# Stripe webhook (должен вернуть 405 для GET)
curl https://your-app.vercel.app/api/stripe/webhook
```

### Автоматический деплой

1. Подключите репозиторий к Vercel
2. Настройте переменные окружения
3. Деплой автоматически запустится при push в main

## PWA

Приложение поддерживает установку на домашний экран:
- iOS: Safari → Поделиться → На экран "Домой"
- Android: Chrome → Меню → Установить приложение

## Telegram Mini App

### Настройка

1. **Создание бота через @BotFather:**
   ```
   /newbot
   Bot name: ExcuseME Bot
   Username: your_excuseme_bot
   ```

2. **Настройка Web App URL:**
   ```
   /setmenubutton
   Выберите бота: @your_excuseme_bot
   Text: ExcuseME
   URL: https://your-app.vercel.app/tg
   ```

3. **Альтернативный способ через BotFather:**
   - `/mybots` → Выберите бота → `Bot Settings` → `Menu Button`
   - URL: `https://your-app.vercel.app/tg`
   - Text: `ExcuseME`

### Тестирование

**Ссылка для тестирования:**
```
https://t.me/your_excuseme_bot?startapp=test
```

**Проверка initData:**
- **Development**: проверка отключена для локальной разработки
- **Production**: HMAC проверка на сервере с использованием `TG_BOT_TOKEN`

### Безопасность

- initData проверяется через HMAC-SHA256
- Токен бота хранится в переменных окружения
- Доступ только для авторизованных пользователей бота

## Производительность и PWA

### Lighthouse CI

Lighthouse CI автоматически проверяет производительность, PWA функциональность и Core Web Vitals.

**Запуск:**
```bash
npm run lighthouse
```

**Интерпретация отчета:**

1. **Performance Score (≥85):**
   - FCP (First Contentful Paint) < 2s
   - LCP (Largest Contentful Paint) < 2.5s
   - CLS (Cumulative Layout Shift) < 0.1
   - TBT (Total Blocking Time) < 300ms

2. **PWA Score (≥90):**
   - ✅ Installable manifest
   - ✅ Service Worker
   - ✅ HTTPS
   - ✅ Responsive design

3. **Accessibility (≥90):**
   - ARIA labels
   - Color contrast
   - Keyboard navigation

4. **Best Practices (≥80):**
   - HTTPS usage
   - Console errors
   - Image optimization

5. **SEO (≥80):**
   - Meta tags
   - Structured data
   - Mobile-friendly

**Отчеты сохраняются в `/lighthouse-reports/`**

## Мониторинг

### Health Check

Используйте `/api/health` для проверки состояния приложения:

```bash
# Локально
curl http://localhost:3000/api/health

# Production
curl https://your-app.vercel.app/api/health
```

**Ответ:**
```json
{
  "ok": true,
  "time": "2024-01-20T10:30:00.000Z",
  "env": {
    "vercel": true,
    "region": "fra1"
  }
}
```

**Поля:**
- `ok` - статус приложения (всегда `true` если сервер отвечает)
- `time` - текущее время сервера в ISO формате
- `env.vercel` - запущено ли приложение на Vercel
- `env.region` - регион Vercel (если применимо)

### Использование в мониторинге

Добавьте health check в ваш мониторинг:

**Uptime Robot:**
- URL: `https://your-app.vercel.app/api/health`
- Keyword: `"ok":true`

**Grafana/Prometheus:**
```yaml
- job_name: 'excuseme-health'
  static_configs:
    - targets: ['your-app.vercel.app']
  metrics_path: '/api/health'
  scheme: https
```

## Лицензия

MIT
