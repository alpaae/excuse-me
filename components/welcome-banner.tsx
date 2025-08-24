'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Sparkles } from 'lucide-react';

const WELCOME_KEY = 'welcome:v1';

export function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(WELCOME_KEY);
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(WELCOME_KEY, 'true');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 mb-8 relative overflow-hidden" data-testid="welcome-banner">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-purple-100/20"></div>
      
      <CardContent className="pt-6 relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Welcome to ExcuseME 🎭
              </h3>
            </div>
            
            <p className="text-gray-700 leading-relaxed">
              Describe the situation, pick a tone and channel — we craft a polite, believable excuse. 
              Free plan gives 3 per day. Pro removes limits and unlocks rarer gems.
            </p>
            
            <Button 
              onClick={handleDismiss}
              className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              data-testid="welcome-dismiss"
            >
              Got it
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 -mt-2 -mr-2"
            data-testid="welcome-close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
