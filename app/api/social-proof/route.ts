import { NextResponse } from 'next/server';
import { stepsSinceMidnight, nextMidnightZonedISO } from '@/lib/time-warsaw';

const DAILY_CAP = 50000;
const STEP_HOURS = 2;
const BASE_COUNT = 15000; // Starting count for today

export async function GET() {
  try {
    // Calculate current count based on steps since midnight
    const steps = stepsSinceMidnight(STEP_HOURS);
    
    // Each step adds 3-15 people, but we'll use a deterministic formula
    // to ensure consistency across requests
    const stepIncrement = Math.floor((steps * 7) + (steps % 3) * 2); // 7-15 range
    const todayCount = Math.min(BASE_COUNT + stepIncrement, DAILY_CAP);
    
    const response = {
      todayCount,
      stepHours: STEP_HOURS,
      dailyCap: DAILY_CAP,
      nextResetAt: nextMidnightZonedISO(),
      tz: 'Europe/Warsaw'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Social proof API error:', error);
    
    // Fallback response
    return NextResponse.json({
      todayCount: BASE_COUNT,
      stepHours: STEP_HOURS,
      dailyCap: DAILY_CAP,
      nextResetAt: nextMidnightZonedISO(),
      tz: 'Europe/Warsaw'
    });
  }
}
