'use client';

import { Crown } from 'lucide-react';

interface PremiumBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PremiumBadge({ className = '', size = 'md' }: PremiumBadgeProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className={`inline-flex items-center justify-center bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-0.5 shadow-sm ${className}`}>
      <Crown className={`${sizeClasses[size]} text-white`} />
    </div>
  );
}
