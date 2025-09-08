'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sparkles, X, User, LogOut, CheckCircle, RefreshCw } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

// Import components directly for better reliability
import { CreatePanel } from '@/components/create-panel';
import { RightHeroPanel } from '@/components/right-hero-panel';
import { OnboardingModal } from '@/components/onboarding-modal';
import { AuthForm } from '@/components/auth/auth-form';
import { LimitNotification } from '@/components/limit-notification';
import { PremiumBadge } from '@/components/premium-badge';

function HomePageContent() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLimits, setUserLimits] = useState({ isPro: false, remaining: 3 });
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<string>('');
  const supabase = createClient();

  const refreshUserLimits = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/limits');
      if (response.ok) {
        const data = await response.json();
        setUserLimits(data.limits);
      }
    } catch (error) {
      console.error('Error refreshing limits:', error);
    }
  }, [user]);

  useEffect(() => {
    // Check for payment success from URL
    const checkPaymentSuccess = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const payment = urlParams.get('payment');
      const plan = urlParams.get('plan');
      
      if (payment === 'success' && plan) {
        setShowPaymentSuccess(true);
        setPaymentPlan(plan);
        
        // Refresh user limits after successful payment
        if (user) {
          // Add a small delay to ensure Stripe webhook has processed
          setTimeout(() => {
            refreshUserLimits();
          }, 2000);
        }
        
        // Clear URL parameters
        const url = new URL(window.location.href);
        url.searchParams.delete('payment');
        url.searchParams.delete('plan');
        window.history.replaceState({}, '', url.toString());
      }
    };
    
    // Check on mount
    checkPaymentSuccess();
    
    // Get current user and limits with timeout
    const getUser = async () => {
      try {
        // Add timeout for auth operations
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout')), 15000)
        );
        
        const authPromise = supabase.auth.getUser();
        const result = await Promise.race([authPromise, timeoutPromise]) as any;
        const { data: { user } } = result;
        
        setUser(user);
        
        // Load user limits if authenticated
        if (user) {
          await refreshUserLimits();
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Auth error:', error);
        setLoading(false);
        // Continue without user if auth fails
      }
    };

    getUser();

    // Subscribe to authentication state changes with timeout
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          setUser(session?.user ?? null);
          setLoading(false);
          
          // Close modal after successful authentication
          if (event === 'SIGNED_IN') {
            setShowAuthModal(false);
          }
        } catch (error) {
          console.error('Auth state change error:', error);
        }
      }
    );

    // Set up periodic refresh for Pro users
    let refreshInterval: NodeJS.Timeout;
    if (user && userLimits.isPro) {
      refreshInterval = setInterval(() => {
        refreshUserLimits();
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      subscription.unsubscribe();
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [user, userLimits.isPro, refreshUserLimits, supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserLimits({ isPro: false, remaining: 3 });
  };

  const handleAuthRequired = () => {
    setShowAuthModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300/10 to-purple-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header - Mobile Optimized */}
      <header className="relative z-10 border-b border-white/20 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title - Mobile Optimized */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                ExcuseME
              </h1>
            </div>
            
            {/* User Actions - Mobile Optimized */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Limit Notification - Show for 100 Pack users */}
              {userLimits.remaining !== null && userLimits.remaining !== Infinity && (
                <div className="hidden sm:block">
                  <LimitNotification 
                    remaining={userLimits.remaining} 
                    isPro={userLimits.isPro} 
                    compact={true} 
                  />
                </div>
              )}
              
              {/* Refresh Button for Pro users */}
              {userLimits.isPro && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshUserLimits}
                  className="p-2 sm:p-2 rounded-xl hover:bg-blue-50 text-blue-600"
                >
                  <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              )}
              
              {/* User Menu */}
              {user ? (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {/* Premium Badge */}
                  {userLimits.isPro && (
                    <div className="hidden sm:block">
                      <PremiumBadge />
                    </div>
                  )}
                  
                  {/* User Avatar */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = '/account'}
                    className="p-2 sm:p-2 rounded-xl hover:bg-blue-50 text-gray-600"
                  >
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                  
                  {/* Sign Out */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="p-2 sm:p-2 rounded-xl hover:bg-red-50 text-red-600"
                  >
                    <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 sm:px-6 sm:py-2 text-sm sm:text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile Optimized */}
      <main className="relative z-10 flex-1">
        {/* Payment Success Notification */}
        {showPaymentSuccess && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md mx-4">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-800">Payment Successful!</h3>
                  <p className="text-sm text-green-700">
                    Your {paymentPlan === 'monthly' ? 'Pro Monthly' : '100 Pack'} plan is now active.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPaymentSuccess(false)}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Layout */}
        <div className="block lg:hidden">
          <div className="px-4 py-6 space-y-6">
            {/* Hero Section - Mobile */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                Create Perfect Excuses
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  in Seconds
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Transform any situation into a polished, believable excuse with our AI-powered generator
              </p>
            </div>

            {/* Create Panel - Mobile */}
            <CreatePanel 
              userLimits={userLimits} 
              onAuthRequired={handleAuthRequired}
            />

            {/* Features Section - Mobile */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900 text-center">Why Choose ExcuseME?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-center mb-2">AI-Powered</h4>
                  <p className="text-sm text-gray-600 text-center">Advanced AI generates contextually appropriate excuses</p>
                </div>
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-center mb-2">Professional</h4>
                  <p className="text-sm text-gray-600 text-center">Maintain your reputation with polished excuses</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left Column - Create Panel */}
              <div className="flex justify-center">
                <CreatePanel 
                  userLimits={userLimits} 
                  onAuthRequired={handleAuthRequired}
                />
              </div>
              
              {/* Right Column - Hero Panel */}
              <div className="sticky top-8">
                <RightHeroPanel />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAuthModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <AuthForm onSuccess={() => setShowAuthModal(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Modal */}
      <OnboardingModal />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
