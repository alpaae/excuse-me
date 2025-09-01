'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function Loading() {
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    // Show timeout message after 10 seconds
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, 10000);

    return () => clearTimeout(timer);
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
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600 font-medium">Loading...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait while we prepare your experience</p>
        
        {/* Progress indicator */}
        <div className="mt-4 w-48 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
