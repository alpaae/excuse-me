# Stripe Setup Guide

## 🎯 **Настройка Stripe для ExcuseME**

### **1. Создание аккаунта Stripe**

1. Зайдите на [stripe.com](https://stripe.com)
2. Создайте аккаунт
3. Переключитесь в **Test Mode** для разработки

### **2. Создание продуктов и цен**

#### **Продукт 1: Pro Monthly Subscription**
1. **Dashboard** → **Products** → **Add Product**
2. **Name:** `Pro Monthly Subscription`
3. **Description:** `Unlimited excuse generations with premium features`
4. **Pricing model:** `Standard pricing`
5. **Price:** `$4.99` per month
6. **Billing period:** `Monthly`
7. **Copy Price ID** (начинается с `price_`)

#### **Продукт 2: 100 Generations Pack**
1. **Dashboard** → **Products** → **Add Product**
2. **Name:** `100 Generations Pack`
3. **Description:** `100 excuse generations with no expiration`
4. **Pricing model:** `One-time payment`
5. **Price:** `$4.99`
6. **Copy Price ID** (начинается с `price_`)

### **3. Настройка Webhook**

1. **Dashboard** → **Developers** → **Webhooks**
2. **Add endpoint**
3. **Endpoint URL:** `https://your-domain.vercel.app/api/stripe/webhook`
4. **Events to send:**
   - `checkout.session.completed` ⭐ **Обязательно**
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
5. **Copy Webhook Secret** (начинается с `whsec_`)

**⚠️ Важно:** Замените `your-domain.vercel.app` на ваш реальный домен из Vercel Dashboard!

### **4. Получение API ключей**

1. **Dashboard** → **Developers** → **API keys**
2. **Copy:**
   - **Publishable key** (начинается с `pk_test_` или `pk_live_`)
   - **Secret key** (начинается с `sk_test_` или `sk_live_`)

### **5. Настройка переменных окружения**

Добавьте в `.env.local`:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PRICE_PRO_MONTHLY=price_your_monthly_price_id_here
STRIPE_PRICE_PACK_100=price_your_pack_price_id_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### **6. Обновление базы данных**

Добавьте новые поля в таблицу `subscriptions`:

```sql
-- Добавить поля для поддержки разных типов планов
ALTER TABLE subscriptions 
ADD COLUMN plan_type TEXT DEFAULT 'monthly',
ADD COLUMN generations_remaining INTEGER DEFAULT NULL;

-- Обновить существующие записи
UPDATE subscriptions 
SET plan_type = 'monthly' 
WHERE plan_type IS NULL;
```

### **7. Защита от манипуляций с датой**

Выполните SQL скрипт для защиты от изменения времени на устройстве:

```sql
-- Выполните содержимое файла db/time-protection.sql
-- Это добавит триггеры для проверки времени создания записей
```

### **8. Тестирование**

#### **Тестовые карты Stripe:**
- **Успешная оплата:** `4242 4242 4242 4242`
- **Недостаточно средств:** `4000 0000 0000 0002`
- **Карта отклонена:** `4000 0000 0000 0002`

#### **Тестовые даты:**
- **Любая будущая дата:** `12/25`
- **Любой CVC:** `123`

### **9. Переход в Production**

1. **Stripe Dashboard** → **Toggle Live Mode**
2. Создайте новые продукты и цены в Live Mode
3. Обновите переменные окружения с Live ключами
4. Настройте Production webhook

### **10. Мониторинг**

#### **Stripe Dashboard:**
- **Payments** - все транзакции
- **Subscriptions** - активные подписки
- **Webhooks** - логи webhook событий

#### **Логи приложения:**
- Проверяйте логи в Vercel Dashboard
- Мониторьте ошибки в Stripe Dashboard

## 🔧 **Типы планов**

### **Pro Monthly ($4.99/месяц)**
- ✅ Безлимитные генерации
- ✅ Приоритетная поддержка
- ✅ Расширенные функции
- 🔄 Автоматическое продление

### **100 Generations Pack ($4.99)**
- ✅ 100 генераций
- ✅ Без срока действия
- ✅ Идеально для периодического использования
- ❌ Без автоматического продления

## 🚀 **Готово!**

После настройки Stripe:
1. Пользователи смогут покупать планы через безопасный checkout
2. Webhook автоматически обновит статус подписки
3. Лимиты будут правильно применяться
4. Значок премиума появится у Pro пользователей
