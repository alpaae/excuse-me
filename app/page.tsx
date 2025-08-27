'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, X, User, LogOut } from 'lucide-react';
import { CreatePanel } from '@/components/create-panel';
import { RightHeroPanel } from '@/components/right-hero-panel';
import { BottomTrustBar } from '@/components/bottom-trust-bar';
import { OnboardingModal } from '@/components/onboarding-modal';
import { AuthForm } from '@/components/auth/auth-form';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

export default function HomePage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Получаем текущего пользователя
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // Подписываемся на изменения состояния аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Закрываем модальное окно после успешной аутентификации
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
    <div className="grid grid-rows-[auto_1fr_auto] h-screen overflow-hidden">
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
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-gray-900"
                    onClick={() => window.location.href = '/dashboard'}
                  >
                    <User className="h-4 w-4 mr-2" />
                    History
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-gray-900"
                    onClick={() => window.location.href = '/account'}
                  >
                    Account
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
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  data-testid="btn-login"
                  onClick={() => setShowAuthModal(true)}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Row 2: Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 h-full">
        {/* Desktop Layout: Two Columns */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-6 h-full">
          {/* Left Column: Create Panel */}
          <div className="flex items-center">
            <CreatePanel />
          </div>
          
          {/* Right Column: Hero Panel */}
          <div className="flex items-center">
            <RightHeroPanel user={user} />
          </div>
        </div>

        {/* Mobile Layout: Tabs */}
        <div className="md:hidden h-full flex flex-col">
          <Tabs defaultValue="create" className="h-full flex flex-col" data-testid="home-tabs">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="create">Create</TabsTrigger>
              <TabsTrigger value="why">Why ExcuseME</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="flex-1 h-full overflow-hidden">
              <CreatePanel />
            </TabsContent>
            
            <TabsContent value="why" className="flex-1 h-full overflow-hidden">
              <RightHeroPanel user={user} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Row 3: Bottom Trust Bar */}
      <BottomTrustBar />

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
