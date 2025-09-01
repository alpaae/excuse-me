'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sparkles, X, User, LogOut, CheckCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

// Lazy load components for better performance
const CreatePanel = dynamic(() => import('@/components/create-panel').then(mod => ({ default: mod.CreatePanel })), {
  loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>,
  ssr: false
});

const RightHeroPanel = dynamic(() => import('@/components/right-hero-panel').then(mod => ({ default: mod.RightHeroPanel })), {
  loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>,
  ssr: false
});

const OnboardingModal = dynamic(() => import('@/components/onboarding-modal').then(mod => ({ default: mod.OnboardingModal })), {
  ssr: false
});

const AuthForm = dynamic(() => import('@/components/auth/auth-form').then(mod => ({ default: mod.AuthForm })), {
  ssr: false
});

const LimitNotification = dynamic(() => import('@/components/limit-notification').then(mod => ({ default: mod.LimitNotification })), {
  ssr: false
});

const PremiumBadge = dynamic(() => import('@/components/premium-badge').then(mod => ({ default: mod.PremiumBadge })), {
  ssr: false
});

function HomePageContent() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLimits, setUserLimits] = useState({ isPro: false, remaining: 3 });
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<string>('');
  const supabase = createClient();

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
          refreshUserLimits();
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
    
    // Get current user and limits
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Load user limits if authenticated
      if (user) {
        await refreshUserLimits();
      }
      
      setLoading(false);
    };

    getUser();

    // Subscribe to authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Close modal after successful authentication
        if (event === 'SIGNED_IN') {
          setShowAuthModal(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth, user]);

  const refreshUserLimits = async () => {
    try {
      const response = await fetch('/api/limits');
      if (response.ok) {
        const data = await response.json();
        setUserLimits(data.limits);
      }
    } catch (error) {
      console.error('Error loading limits:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Payment Success Notification */}
      {showPaymentSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 animate-in slide-in-from-right duration-300">
          <CheckCircle className="h-5 w-5" />
          <div>
            <div className="font-semibold">Payment Successful!</div>
            <div className="text-sm opacity-90">
              {paymentPlan === 'monthly' ? 'Pro Monthly subscription activated' : '100 Generations Pack purchased'}
            </div>
          </div>
          <button
            onClick={() => setShowPaymentSuccess(false)}
            className="ml-4 hover:bg-green-600 rounded p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      
      {/* Row 1: Top Bar */}
      <header className="relative z-10 border-b border-white/20 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                ExcuseME
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {user ? (
                <>
                  {/* User Limits for authenticated users */}
                  <LimitNotification
                    remaining={userLimits.remaining}
                    isPro={userLimits.isPro}
                    onUpgrade={() => window.location.href = '/account'}
                    className="hidden sm:flex"
                    compact={true}
                  />
                  
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-gray-900 px-2 sm:px-3"
                    onClick={() => window.location.href = '/history'}
                  >
                    <User className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">History</span>
                    <span className="sm:hidden">Hist</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-gray-900 relative px-2 sm:px-3"
                    onClick={() => window.location.href = '/account'}
                  >
                    <span className="hidden sm:inline">Account</span>
                    <span className="sm:hidden">Acc</span>
                    {userLimits.isPro && (
                      <PremiumBadge 
                        size="sm" 
                        className="absolute -top-1 -right-1" 
                      />
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 px-2 sm:px-3"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Sign Out</span>
                    <span className="sm:hidden">Out</span>
                  </Button>
                </>
              ) : (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <LimitNotification
                    remaining={3}
                    isPro={false}
                    onUpgrade={() => setShowAuthModal(true)}
                    className="hidden sm:flex"
                    compact={true}
                  />
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-3 sm:px-4"
                    data-testid="btn-login"
                    onClick={() => setShowAuthModal(true)}
                  >
                    <span className="hidden sm:inline">Sign In</span>
                    <span className="sm:hidden">Login</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Row 2: Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Desktop Layout: Two Columns */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-8 md:items-start">
          {/* Left Column: Create Panel */}
          <div className="flex justify-center">
            <CreatePanel 
              userLimits={user ? userLimits : undefined} 
              onAuthRequired={() => setShowAuthModal(true)}
            />
          </div>
          
          {/* Right Column: Hero Panel */}
          <div className="flex justify-center">
            <RightHeroPanel user={user} />
          </div>
        </div>

        {/* Mobile Layout: Tabs */}
        <div className="md:hidden">
          
          <Tabs defaultValue="create" className="space-y-6" data-testid="home-tabs">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create</TabsTrigger>
              <TabsTrigger value="why">Why ExcuseME</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="space-y-0 h-auto">
              <CreatePanel 
                userLimits={user ? userLimits : undefined} 
                onAuthRequired={() => setShowAuthModal(true)}
              />
            </TabsContent>
            
            <TabsContent value="why" className="space-y-0 h-auto">
              <RightHeroPanel user={user} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Onboarding Modal */}
      <OnboardingModal />

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Sign In to Generate Excuses</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAuthModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Info about free generations */}
            <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              <div className="max-w-sm mx-auto">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Get 3 Free Generations Daily</h3>
                    <p className="text-sm text-gray-600">Sign in to access your daily free excuse generations</p>
                  </div>
                </div>
                <div className="bg-white/60 rounded-xl p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">3 free generations every day</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">AI-powered professional excuses</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Upgrade to Pro for unlimited access</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <AuthForm onSuccess={() => setShowAuthModal(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
