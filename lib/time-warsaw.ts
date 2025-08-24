import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz';

const TZ = 'Europe/Warsaw';

/**
 * Get the next midnight in Europe/Warsaw timezone as ISO string
 */
export function nextMidnightZonedISO(): string {
  const now = new Date();
  const warsawNow = utcToZonedTime(now, TZ);
  
  // Get tomorrow's midnight in Warsaw timezone
  const tomorrow = new Date(warsawNow);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  // Convert back to UTC for ISO string
  const utcMidnight = zonedTimeToUtc(tomorrow, TZ);
  return utcMidnight.toISOString();
}

/**
 * Calculate how many steps (of stepHours) have passed since midnight in Warsaw timezone
 */
export function stepsSinceMidnight(stepHours: number = 2): number {
  const now = new Date();
  const warsawNow = utcToZonedTime(now, TZ);
  
  // Get today's midnight in Warsaw timezone
  const todayMidnight = new Date(warsawNow);
  todayMidnight.setHours(0, 0, 0, 0);
  
  // Calculate hours since midnight
  const hoursSinceMidnight = (warsawNow.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60);
  
  // Return number of completed steps
  return Math.floor(hoursSinceMidnight / stepHours);
}

/**
 * Get current date in Warsaw timezone as YYYY-MM-DD
 */
export function getWarsawDateString(): string {
  const now = new Date();
  const warsawNow = utcToZonedTime(now, TZ);
  return format(warsawNow, 'yyyy-MM-dd');
}

/**
 * Get current time in Warsaw timezone
 */
export function getWarsawTime(): Date {
  const now = new Date();
  return utcToZonedTime(now, TZ);
}
