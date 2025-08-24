# Next.js 15 Migration Guide

## Обзор

Проект обновлен с Next.js 14 до Next.js 15.5.0. Обнаружены несовместимости, требующие исправления.

## Найденные проблемы

### 🔴 Критические ошибки (блокируют сборку)

#### 1. Route Handler API изменения
**Файл**: `app/api/excuses/[id]/favorite/route.ts`
**Ошибка**: `Type "{ params: { id: string; }; }" is not a valid type for the function's second argument.`

**Решение**: Обновить сигнатуру функции POST
```typescript
// Было
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {

// Должно быть
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
```

#### 2. Cookies API изменения
**Файлы**: `lib/supabase-server.ts`, `lib/i18n-detect.ts`
**Ошибка**: `Property 'getAll' does not exist on type 'Promise<ReadonlyRequestCookies>'`

**Решение**: Добавить await для cookies
```typescript
// Было
const cookieStore = cookies();
return cookieStore.getAll();

// Должно быть
const cookieStore = await cookies();
return cookieStore.getAll();
```

#### 3. Rate Limit конфигурация
**Файл**: `lib/rate-limit.ts`
**Ошибка**: `Object literal may only specify known properties, and 'store' does not exist`

**Решение**: Обновить конфигурацию @upstash/ratelimit
```typescript
// Проверить документацию @upstash/ratelimit для Next.js 15
```

#### 4. Request IP API
**Файл**: `lib/rate-limit.ts`
**Ошибка**: `Property 'ip' does not exist on type 'NextRequest'`

**Решение**: Использовать headers для получения IP
```typescript
// Было
const ip = request.ip ?? '127.0.0.1';

// Должно быть
const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
          request.headers.get('x-real-ip') || 
          '127.0.0.1';
```

### 🟡 Предупреждения (не блокируют сборку)

#### 1. ESLint конфигурация
**Проблема**: `next lint` deprecated в Next.js 15
**Решение**: Мигрировать на ESLint CLI
```bash
npx @next/codemod@canary next-lint-to-eslint-cli .
```

#### 2. React Hooks Dependencies
**Файлы**: Множественные
**Проблема**: Missing dependencies в useEffect
**Решение**: Добавить зависимости или использовать useCallback

#### 3. TypeScript версия
**Проблема**: TypeScript 5.9.2 не поддерживается @typescript-eslint
**Решение**: Обновить до поддерживаемой версии или отключить правила

### 🔵 Конфигурация

#### 1. next.config.js
**Проблема**: `Unrecognized key(s) in object: 'appDir' at "experimental"`
**Решение**: Удалить `experimental.appDir` (по умолчанию включен в Next.js 15)

## План исправления

### Этап 1: Критические ошибки
1. ✅ Обновить Route Handler API
2. ✅ Исправить Cookies API
3. ✅ Обновить Rate Limit конфигурацию
4. ✅ Исправить Request IP API

### Этап 2: Конфигурация
1. ✅ Обновить next.config.js
2. ✅ Мигрировать ESLint
3. ✅ Обновить TypeScript

### Этап 3: Оптимизация
1. ✅ Исправить React Hooks warnings
2. ✅ Обновить тесты
3. ✅ Проверить производительность

## Команды для исправления

```bash
# Обновить ESLint
npx @next/codemod@canary next-lint-to-eslint-cli .

# Проверить сборку
npm run build

# Проверить типы
npm run type-check

# Запустить тесты
npm run test:e2e
```

## Статус миграции

- [x] Обновление Next.js до 15.5.0
- [ ] Исправление Route Handler API
- [ ] Исправление Cookies API
- [ ] Обновление Rate Limit
- [ ] Исправление Request IP
- [ ] Обновление конфигурации
- [ ] Миграция ESLint
- [ ] Исправление TypeScript ошибок
- [ ] Исправление React Hooks warnings
- [ ] Обновление тестов

## Примечания

- Next.js 15 включает множество breaking changes
- Рекомендуется тестировать каждое изменение отдельно
- Некоторые API изменились кардинально
- TypeScript 5.9.2 может требовать обновления
