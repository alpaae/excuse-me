'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, X, User, LogOut } from 'lucide-react';
import { CreatePanel } from '@/components/create-panel';
import { RightHeroPanel } from '@/components/right-hero-panel';
import { OnboardingModal } from '@/components/onboarding-modal';
import { AuthForm } from '@/components/auth/auth-form';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { LimitNotification } from '@/components/limit-notification';
import { PremiumBadge } from '@/components/premium-badge';

export default function HomePage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLimits, setUserLimits] = useState({ isPro: false, remaining: 3 });
  const supabase = createClient();

  useEffect(() => {
    // Get current user and limits
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Load user limits if authenticated
      if (user) {
        try {
          const response = await fetch('/api/limits');
          if (response.ok) {
            const data = await response.json();
            setUserLimits(data.limits);
          }
        } catch (error) {
          console.error('Error loading limits:', error);
        }
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
  }, [supabase.auth]);

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
    <div className="grid grid-rows-[auto_1fr] h-screen overflow-hidden">
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
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {/* User Limits for authenticated users */}
                  <LimitNotification
                    remaining={userLimits.remaining}
                    isPro={userLimits.isPro}
                    onUpgrade={() => window.location.href = '/account'}
                    className="hidden sm:flex"
                  />
                  
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-gray-900"
                    onClick={() => window.location.href = '/history'}
                  >
                    <User className="h-4 w-4 mr-2" />
                    History
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-gray-900 relative"
                    onClick={() => window.location.href = '/account'}
                  >
                    Account
                    {userLimits.isPro && (
                      <PremiumBadge 
                        size="sm" 
                        className="absolute -top-1 -right-1" 
                      />
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <LimitNotification
                    remaining={3}
                    isPro={false}
                    onUpgrade={() => setShowAuthModal(true)}
                    className="hidden sm:flex"
                  />
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    data-testid="btn-login"
                    onClick={() => setShowAuthModal(true)}
                  >
                    Sign In
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
            <CreatePanel userLimits={user ? userLimits : undefined} />
          </div>
          
          {/* Right Column: Hero Panel */}
          <div className="flex justify-center">
            <RightHeroPanel user={user} />
          </div>
        </div>

        {/* Mobile Layout: Tabs */}
        <div className="md:hidden">
          {/* Mobile Limit Notification */}
          <div className="mb-4">
            <LimitNotification
              remaining={user ? userLimits.remaining : 3}
              isPro={user ? userLimits.isPro : false}
              onUpgrade={() => user ? window.location.href = '/account' : setShowAuthModal(true)}
            />
          </div>
          
          <Tabs defaultValue="create" className="space-y-6" data-testid="home-tabs">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create</TabsTrigger>
              <TabsTrigger value="why">Why ExcuseME</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="space-y-0">
              <CreatePanel userLimits={user ? userLimits : undefined} />
            </TabsContent>
            
            <TabsContent value="why" className="space-y-0">
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Sign In</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAuthModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </Button>
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
