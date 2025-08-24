'use client';

import { useEffect, useState } from 'react';
import { useSocialProof } from '@/lib/social-proof';
import { Users } from 'lucide-react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
}

function AnimatedCounter({ value, duration = 500 }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startValue = displayValue;
    const endValue = value;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart);
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
      }
    };

    if (startValue !== endValue) {
      requestAnimationFrame(animate);
    }
  }, [value, duration, displayValue]);

  return (
    <span className="font-bold text-blue-600">
      {displayValue.toLocaleString()}
    </span>
  );
}

export function SocialProofBar() {
  const { count, isLoading, addLocalIncrement } = useSocialProof();

  useEffect(() => {
    // Add local increment on component mount
    const timer = setTimeout(() => {
      addLocalIncrement();
    }, 1000); // Small delay for better UX

    return () => clearTimeout(timer);
  }, [addLocalIncrement]);

  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-full px-6 py-3 shadow-lg">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-blue-700">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-full px-4 py-2 shadow-lg"
      data-testid="social-proof"
    >
      <div className="flex items-center space-x-2">
        <Users className="h-3 w-3 text-blue-600" />
        <span className="text-xs font-medium text-blue-700">
          <AnimatedCounter value={count} duration={600} />
          {' '}people today
        </span>
      </div>
    </div>
  );
}
