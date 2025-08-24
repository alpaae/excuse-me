# ExcuseME MVP

SaaS приложение для генерации вежливых отмазок с поддержкой PWA, Telegram Mini App и мультиязычности.

## Технологии

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: OpenAI (ChatGPT, TTS)
- **Payments**: Stripe
- **Deployment**: Vercel
- **PWA**: Service Worker, Web App Manifest

## Быстрый старт

### 1. Клонирование и установка

```bash
git clone <repository-url>
cd excuseme-mvp
npm install
```

### 2. Настройка переменных окружения

Скопируйте `env.example` в `.env.local` и заполните значения:

```bash
cp env.example .env.local
```

### 3. Настройка Supabase

1. Создайте проект на [supabase.com](https://supabase.com)
2. Получите URL и ANON KEY из настроек проекта
3. Добавьте их в `.env.local`
4. Примените схему БД:
   - Откройте SQL Editor в Supabase Dashboard
   - Скопируйте содержимое `db/schema.sql`
   - Выполните SQL скрипт

### 4. Настройка OpenAI

1. Получите API ключ на [platform.openai.com](https://platform.openai.com)
2. Добавьте в `.env.local`

### 5. Настройка Stripe (опционально)

1. Создайте аккаунт на [stripe.com](https://stripe.com)
2. Получите секретный ключ и webhook secret
3. Создайте продукт и цену для подписки
4. Добавьте данные в `.env.local`

### 6. Запуск разработки

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

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
