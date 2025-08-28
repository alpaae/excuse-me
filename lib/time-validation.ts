import { getWarsawDateString } from './time-warsaw';

/**
 * Проверяет, что время создания записи не в прошлом
 * Защищает от манипуляций с датой на клиенте
 */
export function validateCreationTime(creationTime: string): boolean {
  const now = new Date();
  const creation = new Date(creationTime);
  
  // Разрешаем небольшое отклонение (5 минут) для синхронизации времени
  const timeDiff = now.getTime() - creation.getTime();
  const maxAllowedDiff = 5 * 60 * 1000; // 5 минут в миллисекундах
  
  return timeDiff >= -maxAllowedDiff && timeDiff <= maxAllowedDiff;
}

/**
 * Получает текущее серверное время в Warsaw timezone
 */
export function getCurrentServerTime(): string {
  return new Date().toISOString();
}

/**
 * Проверяет, что дата находится в текущем дне по Warsaw timezone
 */
export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = getWarsawDateString();
  const dateOnly = date.toISOString().split('T')[0];
  
  return dateOnly === today;
}

/**
 * Получает границы текущего дня по Warsaw timezone
 */
export function getTodayBoundaries(): { start: string; end: string } {
  const today = getWarsawDateString();
  const start = new Date(today + 'T00:00:00.000Z');
  const end = new Date(today + 'T23:59:59.999Z');
  
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}
