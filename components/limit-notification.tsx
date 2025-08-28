'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Crown, Zap, X, AlertCircle } from 'lucide-react';

interface LimitNotificationProps {
  remaining: number;
  isPro: boolean;
  onUpgrade?: () => void;
  className?: string;
}

export function LimitNotification({ remaining, isPro, onUpgrade, className = '' }: LimitNotificationProps) {
  if (isPro) {
    if (remaining === Infinity) {
      return (
        <div className={`flex items-center space-x-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl px-4 py-3 ${className}`}>
          <Crown className="h-5 w-5 text-yellow-600" />
          <span className="text-sm font-medium text-yellow-800">Pro Plan - Unlimited Generations</span>
        </div>
      );
    } else {
      return (
        <div className={`flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl px-4 py-3 ${className}`}>
          <Zap className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-800">100 Pack - {remaining} generations left</span>
        </div>
      );
    }
  }

  return (
    <div className={`flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl px-4 py-3 ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Free Plan</span>
            <Badge variant="outline" className="text-xs">
              {remaining}/3 today
            </Badge>
          </div>
          <p className="text-xs text-gray-500">Upgrade to Pro for unlimited generations</p>
        </div>
      </div>
      {onUpgrade && (
        <Button
          size="sm"
          onClick={onUpgrade}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs px-3 py-1"
        >
          <Crown className="h-3 w-3 mr-1" />
          Upgrade
        </Button>
      )}
    </div>
  );
}
