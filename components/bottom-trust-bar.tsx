'use client';

import { Users } from 'lucide-react';
import { SocialProofBar } from '@/components/social-proof-bar';
import { FreeLimitBanner } from '@/components/free-limit-banner';

export function BottomTrustBar() {
  return (
    <div className="border-t border-white/20 bg-white/80 backdrop-blur-xl px-6 py-3" data-testid="bottom-trust-bar">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Social Proof */}
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-blue-600" />
          <SocialProofBar />
        </div>
        
        {/* Free Limit Banner */}
        <div className="hidden md:block">
          <FreeLimitBanner />
        </div>
      </div>
    </div>
  );
}
