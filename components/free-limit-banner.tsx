'use client';

import { useLimits, useCountdown } from '@/lib/limits';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Crown } from 'lucide-react';

export function FreeLimitBanner() {
  const { limits, isLoading } = useLimits();
  const countdown = useCountdown(limits?.nextResetAt || '');

  if (isLoading || !limits) {
    return null;
  }

  // Don't show banner for Pro users
  if (limits.isPro) {
    return null;
  }

  const remaining = limits.remaining;

  return (
    <div 
      className={`bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-full px-4 py-2 shadow-lg ${
        remaining > 0 ? 'border-blue-200' : 'border-orange-200'
      }`}
      data-testid="free-limit-banner"
    >
      <div className="flex items-center space-x-2">
        {remaining > 0 ? (
          <Clock className="h-3 w-3 text-blue-600" />
        ) : (
          <Crown className="h-3 w-3 text-orange-600" />
        )}
        <span className={`text-xs font-medium ${
          remaining > 0 ? 'text-blue-700' : 'text-orange-700'
        }`}>
          {remaining > 0 
            ? `${remaining}/${limits.daily} • ${countdown}`
            : `Upgrade • ${countdown}`
          }
        </span>
      </div>
    </div>
  );
}
