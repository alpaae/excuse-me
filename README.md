# ExcuseME MVP

SaaS приложение для генерации вежливых отмазок с поддержкой PWA, Telegram Mini App и мультиязычности.

## Технологии

- **Frontend**: Next.js 15.5.0 (App Router), React 18.3.1, TypeScript 5.9.2
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: OpenAI (Chat API, TTS)
- **Payments**: Stripe
- **Testing**: Playwright E2E
- **Deployment**: Vercel

### System Info
```
Operating System: darwin (arm64)
Node: 24.6.0
npm: 11.5.1
Next.js: 15.5.0 (Latest)
React: 18.3.1
React DOM: 18.3.1
TypeScript: 5.9.2
```
- **PWA**: Service Worker, Web App Manifest
- **Telegram**: Mini App с HMAC верификацией

### 🔄 Недавно обновлено до Next.js 15

**Статус:** ✅ Миграция завершена успешно  
**Дата:** 24 августа 2025  
**Версия:** Next.js 14 → 15.5.0

**Ключевые улучшения:**
- ✅ Полная совместимость с Next.js 15.5.0
- ✅ Устранены уязвимости dev-зависимостей
- ✅ Обновлены все API и типы
- ✅ Улучшена производительность и PWA
- ✅ Строгая проверка TypeScript

**📋 Подробности:** [MIGRATION.md](./MIGRATION.md)

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

**Lighthouse (производительность и PWA):**
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

## Environments

### Переменные окружения

Приложение использует разные переменные окружения для разных сред:

#### 1. **Development (.env.local)**
```bash
# Supabase (локальная разработка)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-...

# Stripe (test mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_PRO_MONTHLY=price_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# Telegram (опционально)
TG_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_FEATURE_PAYMENTS=true

# Upstash Redis (опционально)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

#### 2. **Vercel Preview (Pull Requests)**
```bash
# Supabase (тестовый проект)
NEXT_PUBLIC_SUPABASE_URL=https://your-preview-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=preview-anon-key
SUPABASE_SERVICE_ROLE=preview-service-role-key

# OpenAI
OPENAI_API_KEY=sk-...

# Stripe (test mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_PRO_MONTHLY=price_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# App
NEXT_PUBLIC_BASE_URL=https://your-app-git-preview-branch.vercel.app
NEXT_PUBLIC_FEATURE_PAYMENTS=true
```

#### 3. **Vercel Production**
```bash
# Supabase (production проект)
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=production-anon-key
SUPABASE_SERVICE_ROLE=production-service-role-key

# OpenAI
OPENAI_API_KEY=sk-...

# Stripe (live mode)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_PRO_MONTHLY=price_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...

# Telegram
TG_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# App
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
NEXT_PUBLIC_FEATURE_PAYMENTS=true

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

### Матрица переменных

| Переменная | Dev | Preview | Production | Примечание |
|------------|-----|---------|------------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | ✅ | Разные проекты |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | ✅ | Разные ключи |
| `SUPABASE_SERVICE_ROLE` | ✅ | ✅ | ✅ | **Только сервер** |
| `OPENAI_API_KEY` | ✅ | ✅ | ✅ | Одинаковый |
| `STRIPE_SECRET_KEY` | `sk_test_` | `sk_test_` | `sk_live_` | Test/Live режимы |
| `STRIPE_PRICE_PRO_MONTHLY` | `price_test_` | `price_test_` | `price_live_` | Test/Live цены |
| `STRIPE_WEBHOOK_SECRET` | `whsec_test_` | `whsec_test_` | `whsec_live_` | Test/Live webhooks |
| `TG_BOT_TOKEN` | ❌ | ❌ | ✅ | Только production |
| `NEXT_PUBLIC_BASE_URL` | `localhost:3000` | `preview.vercel.app` | `app.vercel.app` | Автоматически |
| `NEXT_PUBLIC_FEATURE_PAYMENTS` | `true` | `true` | `true` | Одинаковый |
| `UPSTASH_REDIS_REST_URL` | ❌ | ❌ | ✅ | Только production |

### Важные замечания

#### 🔒 **Безопасность**
- `SUPABASE_SERVICE_ROLE` используется **только на сервере** (API routes)
- Никогда не экспортируйте service role в клиентский код
- В development можно использовать один проект Supabase
- В production обязательно отдельный проект

#### 🧪 **Тестирование**
- Preview environment использует Stripe test mode
- Можно безопасно тестировать платежи
- Webhook URL: `https://preview.vercel.app/api/stripe/webhook`

#### 🚀 **Production**
- Обязательно Stripe live mode
- Отдельный Supabase проект
- Настроенный Telegram бот
- Upstash Redis для rate limiting

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

### Lighthouse Аудит

Lighthouse автоматически проверяет производительность, PWA функциональность и Core Web Vitals.

**Запуск:**
```bash
# Запуск аудита (требует запущенный dev сервер)
npm run lighthouse

# Автоматический запуск dev сервера + аудит
npm run lighthouse:dev

# Открытие последнего отчета в браузере
npm run lighthouse:report
```

**Интерпретация отчета:**

1. **Performance Score (≥85):**
   - FCP (First Contentful Paint) < 2s
   - LCP (Largest Contentful Paint) < 2.5s
   - CLS (Cumulative Layout Shift) < 0.1
   - TBT (Total Blocking Time) < 300ms

2. **PWA Score (≥80):**
   - ✅ Installable manifest
   - ✅ Service Worker
   - ✅ HTTPS
   - ✅ Responsive design

3. **Accessibility (≥90):**
   - ARIA labels
   - Color contrast
   - Keyboard navigation

4. **Best Practices (≥85):**
   - HTTPS usage
   - Console errors
   - Image optimization

5. **SEO (≥90):**
   - Meta tags
   - Structured data
   - Mobile-friendly

**Результаты:**
- ✅ **Отчеты сохраняются** в `lighthouse-reports/` с timestamp
- ✅ **Автоматическая проверка** бюджета производительности
- ✅ **Детальный HTML отчет** для анализа в браузере
- ✅ **Консольный вывод** с результатами и статусом

**Пример вывода:**
```
📈 Результаты аудита:
==================================================
✅ PERFORMANCE: 92/100
✅ ACCESSIBILITY: 95/100
✅ BEST-PRACTICES: 88/100
✅ SEO: 92/100
✅ PWA: 85/100

🎯 Проверка бюджета:
==================================================
✅ performance: 92 >= 85
✅ accessibility: 95 >= 90
✅ best-practices: 88 >= 85
✅ seo: 92 >= 90
✅ pwa: 85 >= 80

✅ Все метрики соответствуют бюджету!
```

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

## Troubleshooting

### Известные предупреждения

#### TypeScript Version Warning
```
WARNING: You are currently running a version of TypeScript which is not officially supported by @typescript-eslint/typescript-estree.
SUPPORTED TYPESCRIPT VERSIONS: >=4.3.5 <5.4.0
YOUR TYPESCRIPT VERSION: 5.9.2
```
**Решение:** Это предупреждение не критично. TypeScript 5.9.2 работает корректно с Next.js 15, но @typescript-eslint еще не обновил поддержку. Можно игнорировать или понизить версию TypeScript до 5.3.x если критично.

#### Next.js Build Warnings
```
⚠ Using edge runtime on a page currently disables static generation for that page
⚠ metadataBase property in metadata export is not set for resolving social open graph or twitter images
```
**Решение:** 
- Edge runtime предупреждение для API routes - нормально для dynamic API
- metadataBase можно добавить в `app/layout.tsx` если нужны Open Graph изображения

#### E2E Tests Issues
- **Проблема:** 24 из 30 тестов падают из-за селекторов
- **Причина:** shadcn/ui компоненты имеют сложную DOM структуру
- **Решение:** Обновить селекторы в Playwright тестах для работы с Select компонентами

### Environment Variables Validation

Проект использует строгую валидацию переменных окружения с помощью Zod схемы (`lib/env.ts`).

#### Типичные ошибки и решения:

**1. Отсутствующие обязательные переменные:**
```
❌ Invalid server environment variables:
OPENAI_API_KEY: String must contain at least 1 character(s)
SUPABASE_SERVICE_ROLE: String must contain at least 1 character(s)
```
**Решение:** Добавьте отсутствующие переменные в `.env.local` или Vercel.

**2. Неверный формат URL:**
```
❌ Invalid client environment variables:
NEXT_PUBLIC_SUPABASE_URL: NEXT_PUBLIC_SUPABASE_URL must be a valid URL
```
**Решение:** Убедитесь, что URL включает протокол (`https://`).

**3. API роуты падают при старте:**
```
Error: ❌ Invalid server environment variables:
OPENAI_API_KEY: String must contain at least 1 character(s)
```
**Решение:** Все API роуты валидируют переменные при импорте. Убедитесь, что все обязательные переменные заполнены.

#### Валидация переменных:
- **Client vars:** Валидируются при сборке
- **Server vars:** Валидируются при импорте в API routes
- **Опциональные:** Stripe, Telegram, Redis - не обязательны для базовой работы

### Успешные метрики (последний прогон)
- ✅ **Lint:** 0 ошибок, 0 предупреждений
- ✅ **TypeCheck:** 0 ошибок  
- ✅ **Build:** Успешная сборка
- ✅ **Security:** 0 уязвимостей
- ✅ **Bundle Size:** 272 kB First Load JS
- ✅ **Env Validation:** Строгая типизация переменных окружения

### Производительность сборки
```
Route (app)                                Size  First Load JS    
┌ ○ /                                   6.15 kB         272 kB
├ ○ /_not-found                           183 B         266 kB
├ ○ /account                            3.15 kB         269 kB
├ ○ /admin/i18n                         4.08 kB         270 kB
├ ○ /dashboard                          6.28 kB         272 kB
+ First Load JS shared by all            266 kB
  └ chunks/vendors-1c69582e47df27e3.js   264 kB
```

## Лицензия

MIT
