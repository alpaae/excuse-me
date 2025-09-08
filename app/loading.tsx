'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

export default function Loading() {
  const [showTimeout, setShowTimeout] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev; // Stop at 90% until page loads
        return prev + Math.random() * 15;
      });
    }, 200);

    // Show timeout message after 8 seconds (reduced from 10)
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, 8000);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, []);

  if (showTimeout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-yellow-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Taking longer than expected
          </h1>
          
          <p className="text-gray-600 mb-6">
            The page is taking longer to load than usual. This might be due to network issues or high server load.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh page
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Go to homepage
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        {/* Optimized spinner */}
        <div className="relative w-16 h-16 mx-auto mb-4">
          <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
          <div className="absolute inset-0 rounded-full border-2 border-blue-200"></div>
        </div>
        
        <p className="text-lg text-gray-600 font-medium">Loading...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait while we prepare your experience</p>
        
        {/* Progress indicator with actual progress */}
        <div className="mt-4 w-48 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Loading tips */}
        <div className="mt-6 text-xs text-gray-400 max-w-xs mx-auto">
          <p>💡 Tip: Pages load faster on subsequent visits</p>
        </div>
      </div>
    </div>
  );
}
