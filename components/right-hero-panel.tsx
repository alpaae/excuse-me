'use client';

import { Sparkles, CheckCircle, Zap, User } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface RightHeroPanelProps {
  user?: SupabaseUser | null;
}

export function RightHeroPanel({ user }: RightHeroPanelProps) {
  return (
    <div className="flex flex-col justify-center h-full max-w-[520px] mx-auto" data-testid="panel-why">
      {/* Hero Section */}
      <div className="text-center mb-8">
        {user ? (
          <div className="mb-6">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full px-4 py-2 mb-4 shadow-sm">
              <User className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">Welcome back!</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Hello, {user.user_metadata?.full_name || user.email?.split('@')[0] || 'there'}! 👋
            </h2>
            <p className="text-gray-600 text-sm">
              Ready to create another perfect excuse?
            </p>
          </div>
        ) : (
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-full px-4 py-2 mb-4 shadow-lg">
            <Zap className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">AI-powered excuses</span>
          </div>
        )}
        
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4 leading-tight" data-testid="hero-title">
          Create Perfect
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Excuses
          </span>
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 leading-relaxed" data-testid="hero-subtitle">
          Transform awkward situations into graceful exits with AI-powered, 
          context-aware excuses that feel natural and professional
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20" role="article" data-testid="feature-ai">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">AI-Powered</h3>
          <p className="text-gray-600 text-xs">Advanced AI creates natural, believable excuses</p>
        </div>
        
        <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20" role="article" data-testid="feature-professional">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Professional</h3>
          <p className="text-gray-600 text-xs">Polished and appropriate for any situation</p>
        </div>
        
        <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20" role="article" data-testid="feature-instant">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Instant</h3>
          <p className="text-gray-600 text-xs">Get your excuse in seconds, not minutes</p>
        </div>
      </div>
    </div>
  );
}
