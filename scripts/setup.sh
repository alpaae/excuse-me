#!/bin/bash

echo "🚀 ExcuseME MVP Setup Script"
echo "=============================="

# Проверяем наличие Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен. Установите Node.js 18+"
    exit 1
fi

# Проверяем версию Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Требуется Node.js 18+. Текущая версия: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) найден"

# Устанавливаем зависимости
echo "📦 Устанавливаем зависимости..."
npm install

# Проверяем наличие .env.local
if [ ! -f ".env.local" ]; then
    echo "📝 Создаем .env.local из примера..."
    cp env.example .env.local
    echo "⚠️  Отредактируйте .env.local и добавьте ваши API ключи"
else
    echo "✅ .env.local уже существует"
fi

# Проверяем Git
if ! command -v git &> /dev/null; then
    echo "❌ Git не установлен"
    exit 1
fi

# Проверяем что мы в Git репозитории
if [ ! -d ".git" ]; then
    echo "📝 Инициализируем Git репозиторий..."
    git init
    git add .
    git commit -m "Initial commit"
else
    echo "✅ Git репозиторий найден"
fi

# Проверяем build
echo "🔨 Проверяем сборку..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Сборка успешна"
else
    echo "❌ Ошибка сборки. Проверьте зависимости и код"
    exit 1
fi

echo ""
echo "🎉 Настройка завершена!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Отредактируйте .env.local и добавьте API ключи"
echo "2. Настройте Supabase проект"
echo "3. Настройте OpenAI API"
echo "4. (Опционально) Настройте Stripe"
echo "5. (Опционально) Настройте Telegram Bot"
echo "6. Запустите: npm run dev"
echo "7. Деплой: git push origin main"
echo ""
echo "📚 Документация: README.md"
