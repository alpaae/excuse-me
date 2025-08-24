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
    <Card 
      className={`border-0 shadow-lg rounded-xl ${
        remaining > 0 
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' 
          : 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200'
      }`}
      data-testid="free-limit-banner"
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {remaining > 0 ? (
              <Clock className="h-5 w-5 text-blue-600" />
            ) : (
              <Crown className="h-5 w-5 text-orange-600" />
            )}
            <div>
              <p className={`text-sm font-medium ${
                remaining > 0 ? 'text-blue-700' : 'text-orange-700'
              }`}>
                {remaining > 0 
                  ? `${remaining} of ${limits.daily} free excuses left today`
                  : 'Out of free excuses for today'
                }
              </p>
              <p className={`text-xs ${
                remaining > 0 ? 'text-blue-600' : 'text-orange-600'
              }`}>
                Resets in {countdown}
              </p>
            </div>
          </div>
          
          {remaining === 0 && (
            <div className="text-right">
              <p className="text-xs text-orange-600 font-medium">
                Upgrade to Pro for unlimited excuses
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
