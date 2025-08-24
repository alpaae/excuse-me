'use client';

import { SocialProofBar } from './social-proof-bar';
import { FreeLimitBanner } from './free-limit-banner';

export function BottomTrustBar() {
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-200/60"
      data-testid="bottom-trust-bar"
    >
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Social Proof - Compact */}
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <SocialProofBar />
          </div>
          
          {/* Free Limit Banner - Compact */}
          <div className="flex items-center">
            <FreeLimitBanner />
          </div>
        </div>
      </div>
    </div>
  );
}
