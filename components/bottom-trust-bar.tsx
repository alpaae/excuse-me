'use client';

import { SocialProofBar } from './social-proof-bar';
import { FreeLimitBanner } from './free-limit-banner';

export function BottomTrustBar() {
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-gray-200/50 pb-safe"
      data-testid="bottom-trust-bar"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Social Proof - Left side */}
          <div className="flex-1 w-full sm:w-auto">
            <SocialProofBar />
          </div>
          
          {/* Free Limit Banner - Right side (only for non-Pro) */}
          <div className="flex-1 w-full sm:w-auto">
            <FreeLimitBanner />
          </div>
        </div>
      </div>
    </div>
  );
}
