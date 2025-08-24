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
   - **Модель доступа:** сервер загружает файлы через SERVICE_ROLE, клиент получает signed URL

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

### E2E Status

**Cross-browser test results (retries=2):**

| Browser | Passed | Failed | Total | Success Rate |
|---------|--------|--------|-------|--------------|
| Chromium | 30 | 19 | 49 | 61% |
| Firefox | 30 | 19 | 49 | 61% |
| WebKit | 30 | 19 | 49 | 61% |

**Test Coverage:**
- ✅ **Homepage** - форма генерации отображается корректно
- ✅ **Generate API** - успешная генерация, rate limit, free limit работают
- ❌ **i18n Language Switching** - переключение языков не работает стабильно
- ❌ **Accept-Language Detection** - детект из заголовков не работает
- ❌ **Cross-browser i18n** - нестабильное поведение в разных браузерах

**Known Issues:**
1. **i18n Language Detection:**
   - Селектор языка показывает неправильный язык (ожидается 'Русский', получается 'English')
   - URL параметры не обновляются при переключении языка
   - Legacy параметр `lng` не мигрируется на `lang`
   - Закодированные URL параметры не декодируются корректно

2. **Accept-Language Header:**
   - Детект языка из заголовка `Accept-Language` не работает
   - Cookie `excuseme_lang` не устанавливается корректно через API

3. **API Issues:**
   - `/api/i18n/lang` возвращает статус 204 с телом (исправлено)
   - Нестабильная работа с cookie в разных браузерах

**Root Cause Analysis:**
- i18n система не полностью интегрирована с UI компонентами
- Middleware не обрабатывает все случаи детекта языка
- URL синхронизация не работает из-за проблем с роутингом
- API endpoint для установки cookie имеет проблемы с форматом ответа

**Next Steps:**
1. 🔧 **Fix i18n middleware** - исправить детект языка из Accept-Language
2. 🔧 **Fix URL sync** - исправить обновление URL при смене языка
3. 🔧 **Fix legacy parameter migration** - миграция `lng` → `lang`
4. 🔧 **Fix URL encoding** - корректная обработка закодированных параметров
5. 🔧 **Stabilize cross-browser** - обеспечить одинаковое поведение

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

## Middleware

### I18n Синхронизация

Middleware автоматически синхронизирует параметр `?lang` и cookie `excuseme_lang`:

#### **Логика работы:**

1. **Если есть `?lang` параметр:**
   - Нормализует локаль через `normalizeLocale()`
   - Устанавливает cookie `excuseme_lang=<val>; Path=/; Max-Age=15552000; SameSite=Lax`
   - **НЕ делает редирект** (избегаем флэки в тестах)

2. **Если нет `?lang`, но есть cookie:**
   - Ничего не делает (сохраняет существующий выбор пользователя)

3. **Если нет ни `?lang`, ни cookie:**
   - Определяет язык по `Accept-Language` заголовку
   - Устанавливает cookie с определенным языком
   - **НЕ делает редирект**

#### **Обрабатываемые пути:**
- `/` (корень)
- `/(web)/*` (веб-приложение)
- `/dashboard` (личный кабинет)
- `/account` (настройки аккаунта)

#### **Игнорируемые пути:**
- `/api/*` (API роуты)
- `/_next/static/*` (статические файлы)
- `/_next/image/*` (оптимизированные изображения)
- `/favicon.ico` (иконка сайта)
- `/manifest.webmanifest` (PWA манифест)

#### **Примеры работы:**

```bash
# Установка языка через URL
GET /?lang=en
→ Set-Cookie: excuseme_lang=en; Path=/; Max-Age=15552000; SameSite=Lax

# Сохранение существующего выбора
GET / (с cookie excuseme_lang=ru)
→ Никаких изменений

# Автоопределение по Accept-Language
GET / (без cookie, Accept-Language: ru-RU,ru;q=0.9)
→ Set-Cookie: excuseme_lang=ru; Path=/; Max-Age=15552000; SameSite=Lax
```

#### **Безопасность:**
- Cookie устанавливается с `SameSite=Lax`
- `Max-Age=15552000` (180 дней)
- `Path=/` (доступен на всех путях)
- Нормализация через `normalizeLocale()` предотвращает XSS

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
   - **Модель доступа:** сервер загружает через SERVICE_ROLE, клиент получает signed URL

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

### Lighthouse без @lhci/cli

Проект использует lightweight Lighthouse скрипт без зависимости от `@lhci/cli`:

**Запуск:**
```bash
# Запуск Lighthouse аудита (автоматически запускает сервер)
npm run lh:ci

# Запуск с dev сервером
npm run lighthouse:dev

# Открытие последнего отчета в браузере
npm run lighthouse:report
```

**Бюджет производительности:**
- Performance ≥ 85 (mobile)
- PWA installable = true
- Accessibility ≥ 90
- Best Practices ≥ 85
- SEO ≥ 90

**Особенности скрипта:**
- ✅ Автоматический запуск Next.js сервера
- ✅ Ожидание готовности через `/api/health`
- ✅ Chrome headless с оптимизированными флагами
- ✅ Mobile-first аудит (375x667, 2x DPR)
- ✅ HTML отчет с timestamp
- ✅ CI-ready (артефакты для GitHub Actions)

**Интерпретация отчета:**

1. **Performance Score (≥85):**
   - FCP (First Contentful Paint) < 2s
   - LCP (Largest Contentful Paint) < 2.5s
   - CLS (Cumulative Layout Shift) < 0.1
   - TBT (Total Blocking Time) < 300ms

2. **PWA Score (installable):**
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
🚀 Starting Next.js server...
✅ Server is ready!
⏳ Waiting for server to be ready...
✅ Server health check passed!
🔍 Launching Chrome...
📊 Running Lighthouse audit...

📈 Lighthouse Results:
=====================
Performance: 87.2/100 (target: ≥85)
✅ Performance target met!
PWA: 95.1/100 (target: installable)
✅ PWA is installable!
Accessibility: 92.3/100 (target: ≥90)
✅ Accessibility target met!
Best Practices: 88.7/100 (target: ≥85)
✅ Best Practices target met!
SEO: 91.5/100 (target: ≥90)
✅ SEO target met!

=====================
🎉 All Lighthouse targets met!
📄 Report saved: /path/to/lighthouse-reports/lighthouse-report-2025-01-24T10-30-00-000Z.html
```

## Environments

### Environment Variables Matrix

Проект использует разные переменные окружения для разных сред:

| Variable | Dev (.env.local) | Preview (Vercel) | Production (Vercel) | Client/Server |
|----------|------------------|------------------|---------------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Required | ✅ Required | ✅ Required | Client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Required | ✅ Required | ✅ Required | Client |
| `NEXT_PUBLIC_BASE_URL` | ✅ Required | ✅ Required | ✅ Required | Client |
| `NEXT_PUBLIC_FEATURE_PAYMENTS` | ⚠️ Optional | ⚠️ Optional | ⚠️ Optional | Client |
| `SUPABASE_SERVICE_ROLE` | ✅ Required | ✅ Required | ✅ Required | Server |
| `OPENAI_API_KEY` | ✅ Required | ✅ Required | ✅ Required | Server |
| `STRIPE_SECRET_KEY` | ⚠️ Optional | ⚠️ Optional | ⚠️ Optional | Server |
| `STRIPE_PRICE_PRO_MONTHLY` | ⚠️ Optional | ⚠️ Optional | ⚠️ Optional | Server |
| `STRIPE_WEBHOOK_SECRET` | ⚠️ Optional | ⚠️ Optional | ⚠️ Optional | Server |
| `TG_BOT_TOKEN` | ⚠️ Optional | ⚠️ Optional | ⚠️ Optional | Server |
| `UPSTASH_REDIS_REST_URL` | ⚠️ Optional | ⚠️ Optional | ⚠️ Optional | Server |
| `UPSTASH_REDIS_REST_TOKEN` | ⚠️ Optional | ⚠️ Optional | ⚠️ Optional | Server |

### Client vs Server Variables

#### Client-side (NEXT_PUBLIC_*)
Переменные с префиксом `NEXT_PUBLIC_` доступны в браузере:

- **`NEXT_PUBLIC_SUPABASE_URL`** - URL Supabase проекта
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** - публичный ключ для клиентского доступа
- **`NEXT_PUBLIC_BASE_URL`** - базовый URL приложения
- **`NEXT_PUBLIC_FEATURE_PAYMENTS`** - флаг включения платежей

#### Server-side (без NEXT_PUBLIC_)
Переменные без префикса доступны только на сервере:

- **`SUPABASE_SERVICE_ROLE`** - сервисный ключ для RLS bypass
- **`OPENAI_API_KEY`** - ключ для генерации отмазок
- **`STRIPE_*`** - ключи для платежной системы
- **`TG_BOT_TOKEN`** - токен Telegram бота
- **`UPSTASH_REDIS_*`** - ключи для rate limiting

### Environment Setup

#### Local Development (.env.local)
```bash
# Скопируйте .env.example
cp .env.example .env.local

# Заполните обязательные переменные
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE=your-service-role
OPENAI_API_KEY=your-openai-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

#### Vercel Preview
- Автоматически наследует Production переменные
- Можно переопределить для тестирования
- Используется для Pull Request previews

#### Vercel Production
- Все переменные должны быть настроены
- Рекомендуется использовать Vercel CLI для управления
- Регулярно проверяйте через `/api/ready`

### Environment Validation

Проект использует строгую валидацию переменных через Zod (`lib/env.ts`):

```typescript
// Валидация при импорте
import { serverEnv } from '@/lib/env';

// Приложение упадет с понятной ошибкой при отсутствии ключей
const openai = new OpenAI({
  apiKey: serverEnv.OPENAI_API_KEY, // Типизированный доступ
});
```

### Health & Readiness Checks

#### `/api/health` - Basic Health Check
```bash
curl https://your-app.vercel.app/api/health
# Returns: { ok: true, time: "2025-01-24T10:30:00.000Z" }
```

#### `/api/ready` - Environment Readiness
```bash
curl https://your-app.vercel.app/api/ready
# Returns: { ok: true, missing: [], features: { payments: true, telegram: false } }
```

### Security Notes

⚠️ **Важные моменты безопасности:**

1. **Никогда не коммитьте `.env.local`** - он в `.gitignore`
2. **`SUPABASE_SERVICE_ROLE`** - только на сервере, обходит RLS
3. **`OPENAI_API_KEY`** - храните в секретах, не в коде
4. **`STRIPE_SECRET_KEY`** - только на сервере, для webhooks
5. **Vercel Environment Variables** - автоматически шифруются

### Troubleshooting

#### "Invalid environment variables" ошибка
```bash
# Проверьте все обязательные переменные
npm run build

# Используйте /api/ready для диагностики
curl http://localhost:3000/api/ready
```

#### "Missing dependencies" в useEffect
```bash
# Запустите проверку hooks
npm run lint:hooks
```

## Readiness Checks

### Environment Readiness

Эндпоинт `/api/ready` проверяет готовность приложения к работе:

```bash
# Локально
curl http://localhost:3000/api/ready

# Production
curl https://your-app.vercel.app/api/ready
```

**Пример успешного ответа:**
```json
{
  "ok": true,
  "missing": [],
  "missingOptional": ["STRIPE_SECRET_KEY", "TG_BOT_TOKEN"],
  "env": {
    "nodeEnv": "production",
    "vercel": true,
    "vercelEnv": "production",
    "vercelRegion": "iad1"
  },
  "features": {
    "payments": false,
    "telegram": false,
    "redis": true
  },
  "timestamp": "2025-08-24T01:30:00.000Z"
}
```

**Пример ответа с ошибками:**
```json
{
  "ok": false,
  "missing": ["OPENAI_API_KEY", "SUPABASE_SERVICE_ROLE"],
  "missingOptional": ["STRIPE_SECRET_KEY", "TG_BOT_TOKEN"],
  "env": {
    "nodeEnv": "development",
    "vercel": false,
    "vercelEnv": null,
    "vercelRegion": null
  },
  "features": {
    "payments": false,
    "telegram": false,
    "redis": false
  },
  "timestamp": "2025-08-24T01:30:00.000Z"
}
```

### Проверяемые переменные

#### Критические (обязательные):
- `OPENAI_API_KEY` - для генерации отмазок
- `NEXT_PUBLIC_SUPABASE_URL` - для подключения к БД
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - для клиентского доступа
- `SUPABASE_SERVICE_ROLE` - для серверных операций

#### Опциональные (для полной функциональности):
- `STRIPE_SECRET_KEY` - для платежей
- `STRIPE_PRICE_PRO_MONTHLY` - для подписок
- `STRIPE_WEBHOOK_SECRET` - для webhook'ов
- `TG_BOT_TOKEN` - для Telegram Mini App

### Использование в CI/CD

Добавьте проверку готовности в ваш deployment pipeline:

```bash
# Проверка после деплоя
curl -f https://your-app.vercel.app/api/ready || exit 1

# Проверка с ожиданием
for i in {1..30}; do
  if curl -s https://your-app.vercel.app/api/ready | jq -e '.ok == true'; then
    echo "✅ App is ready!"
    break
  fi
  echo "⏳ Waiting for app to be ready... ($i/30)"
  sleep 10
done
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

### E2E Status

### Результаты последнего прогона (все браузеры)

| Браузер | Passed | Failed | Total | Успешность |
|---------|--------|--------|-------|------------|
| Chromium | 25 | 30 | 55 | 45.5% |
| Firefox | 25 | 30 | 55 | 45.5% |
| WebKit | 25 | 30 | 55 | 45.5% |
| **Всего** | **75** | **90** | **165** | **45.5%** |

### Основные проблемы

#### 1. i18n Language Switching (30 тестов)
- **Проблема:** Селектор языка не обновляется после выбора
- **Ошибка:** `Expected: "en", Received: "ru"`
- **Причина:** Middleware не синхронизирует состояние с UI
- **Статус:** 🔴 Критично

#### 2. Query Parameter Handling (15 тестов)
- **Проблема:** URL параметры не обрабатываются корректно
- **Ошибка:** `Expected: "en", Received: "ru"`
- **Причина:** Приоритет Accept-Language над query параметрами
- **Статус:** 🔴 Критично

#### 3. URL Encoding Issues (10 тестов)
- **Проблема:** Неправильное кодирование URL параметров
- **Ошибка:** `Expected: /lang=ru/, Received: /lang=%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9/`
- **Причина:** Двойное кодирование кириллических символов
- **Статус:** 🟡 Средняя

#### 4. Migration lng→lang (10 тестов)
- **Проблема:** Редиректы не работают корректно
- **Ошибка:** `Expected: /lang=ru/, Received: /lng=ru/`
- **Причина:** Middleware не обрабатывает миграцию
- **Статус:** 🔴 Критично

### Known Issues

#### 🔴 Критичные проблемы
1. **i18n State Synchronization** - селектор языка не отражает реальное состояние
2. **Query Parameter Priority** - Accept-Language имеет приоритет над URL параметрами
3. **Middleware Migration** - редиректы lng→lang не работают
4. **Cookie Synchronization** - cookie не синхронизируется с UI состоянием

#### 🟡 Средние проблемы
1. **URL Encoding** - двойное кодирование кириллических символов
2. **Fallback Handling** - невалидные параметры не обрабатываются корректно
3. **Cross-browser Consistency** - разное поведение в разных браузерах

#### 🟢 Малые проблемы
1. **Test Selectors** - некоторые селекторы нестабильны
2. **Timeout Issues** - некоторые тесты превышают таймаут
3. **Flaky Tests** - 3 теста показывают нестабильное поведение

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
