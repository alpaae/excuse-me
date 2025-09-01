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
  compact?: boolean;
}

export function LimitNotification({ remaining, isPro, onUpgrade, className = '', compact = false }: LimitNotificationProps) {
  if (isPro) {
    if (remaining === null || remaining === Infinity) {
      // Monthly Pro Plan - Unlimited
      if (compact) {
        return (
          <div className={`bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/50 rounded-xl px-3 py-2 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
                <Crown className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium text-yellow-800">∞</span>
            </div>
          </div>
        );
      }
      return (
        <div className={`bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/50 rounded-2xl px-5 py-4 shadow-sm ${className}`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-sm">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-base font-semibold text-yellow-800">Pro Plan</span>
              <p className="text-sm text-yellow-700 mt-1">Unlimited Generations</p>
            </div>
          </div>
        </div>
      );
    } else if (remaining > 0) {
      // 100 Pack Plan
      if (compact) {
        return (
          <div className={`bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-xl px-3 py-2 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                <Zap className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium text-green-800">{remaining}</span>
            </div>
          </div>
        );
      }
      return (
        <div className={`bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl px-5 py-4 shadow-sm ${className}`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-base font-semibold text-green-800">100 Pack</span>
              <p className="text-sm text-green-700 mt-1">{remaining} generations left</p>
            </div>
          </div>
        </div>
      );
    }
  }

  if (compact) {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 rounded-xl px-3 py-2 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
            <Sparkles className="h-3 w-3 text-white" />
          </div>
          <span className="text-sm font-medium text-blue-700">{remaining}/3</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl px-5 py-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <span className="text-base font-semibold text-gray-800">Free Plan</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 font-medium">
                {remaining}/3 today
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mt-1">Upgrade to Pro for unlimited generations</p>
          </div>
        </div>
        {onUpgrade && (
          <Button
            size="sm"
            onClick={onUpgrade}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade
          </Button>
        )}
      </div>
    </div>
  );
}
