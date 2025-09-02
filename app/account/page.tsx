'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { AuthGuard } from '@/lib/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Crown, LogOut, Save, ArrowRight, Sparkles, Shield, Settings, CreditCard, Zap, X } from 'lucide-react';

interface Profile {
  id: string;
  display_name: string;
  created_at: string;
}

interface Subscription {
  id: string;
  provider: 'stripe' | 'telegram';
  status: 'active' | 'past_due' | 'canceled';
  plan_type: 'monthly' | 'pack100';
  generations_remaining: number | null;
  current_period_end: string;
  created_at: string;
  stripe_customer_id?: string;
}

function AccountPageContent() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'pack100' | null>(null);
  const supabase = createClient();
  const searchParams = useSearchParams();

  const loadUserData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Load profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
          setDisplayName(profileData.display_name || '');
        }

        // Load subscription
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        setSubscription(subscriptionData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadUserData();
    
    // Check for plan parameter in URL
    const plan = searchParams.get('plan') as 'monthly' | 'pack100' | null;
    if (plan && (plan === 'monthly' || plan === 'pack100')) {
      setSelectedPlan(plan);
      setShowUpgradeModal(true);
    }
  }, [loadUserData, searchParams]);

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', profile.id);

      if (!error) {
        setProfile({ ...profile, display_name: displayName });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpgradeSubscription = async (plan: 'monthly' | 'pack100' = 'monthly') => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success_url: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/?payment=success&plan=${plan}`,
          cancel_url: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/?payment=canceled`,
          plan: plan,
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile?.id,
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        if (url) {
          window.location.href = url;
        }
      } else {
        console.error('Failed to create billing portal session');
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300/10 to-purple-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Header */}
        <header className="relative z-10 border-b border-white/20 bg-white/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => window.location.href = '/'}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  ExcuseME
                </h1>
              </button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.history.back();
                  }
                }}
                className="bg-white/50 backdrop-blur-sm hover:bg-white/70 text-gray-700"
              >
                <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                Back
              </Button>
            </div>
          </div>
        </header>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 overflow-y-auto min-h-[calc(100vh-80px)]">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="relative inline-block mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <User className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center border-3 border-white shadow-md">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-3">
              Account Settings
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto px-4">
              Manage your profile, subscription, and account preferences
            </p>
          </div>

          {/* Main Content Grid - Two Equal Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
            {/* Profile Card */}
            <div>
              <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden h-full">
                <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">Profile Information</CardTitle>
                      <CardDescription className="text-base text-gray-600">
                        Update your personal details and preferences
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName" className="text-sm font-semibold text-gray-700 flex items-center">
                        <User className="h-4 w-4 mr-2 text-blue-600" />
                        Display Name
                      </Label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter your name"
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-base h-10"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-green-600" />
                        Email Address
                      </Label>
                      <Input
                        value={profile?.id || ''}
                        disabled
                        className="bg-gray-50 border-gray-200 rounded-xl text-base h-10"
                      />
                      <p className="text-sm text-gray-500 flex items-center">
                        <Shield className="h-3 w-3 mr-1" />
                        Email cannot be changed
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-3">
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={saving}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 h-12"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? 'Saving Changes...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subscription Card */}
            <div>
              <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden h-full">
                <CardHeader className="pb-6 bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Crown className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">Subscription</CardTitle>
                      <CardDescription className="text-gray-600">
                        Your plan status
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
                    <div>
                      <p className="font-bold text-gray-900">Current Plan</p>
                      <p className="text-sm text-gray-600">
                        {subscription?.plan_type === 'monthly' 
                          ? 'Unlimited excuses & premium features' 
                          : subscription?.plan_type === 'pack100'
                          ? `${subscription.generations_remaining || 0} generations remaining`
                          : 'Free plan with daily limits'
                        }
                      </p>
                    </div>
                    <Badge 
                      variant={subscription ? 'default' : 'secondary'}
                      className={`px-4 py-2 text-sm font-bold rounded-full ${
                        subscription?.plan_type === 'monthly'
                          ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg'
                          : subscription?.plan_type === 'pack100'
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                          : 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700'
                      }`}
                    >
                      {subscription?.plan_type === 'monthly' 
                        ? 'Pro Monthly' 
                        : subscription?.plan_type === 'pack100'
                        ? '100 Pack'
                        : 'Free Plan'
                      }
                    </Badge>
                  </div>
                  
                  {subscription && (
                    <div className={`space-y-4 p-4 rounded-2xl border ${
                      subscription.plan_type === 'monthly'
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                        : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                    }`}>
                      <h4 className={`font-bold flex items-center ${
                        subscription.plan_type === 'monthly'
                          ? 'text-yellow-900'
                          : 'text-green-900'
                      }`}>
                        <Zap className="h-4 w-4 mr-2" />
                        Subscription Details
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className={subscription.plan_type === 'monthly' ? 'text-yellow-700' : 'text-green-700'}>Plan Type:</span>
                          <span className={`font-semibold capitalize ${
                            subscription.plan_type === 'monthly' ? 'text-yellow-900' : 'text-green-900'
                          }`}>
                            {subscription.plan_type === 'monthly' ? 'Pro Monthly' : '100 Pack'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={subscription.plan_type === 'monthly' ? 'text-yellow-700' : 'text-green-700'}>Status:</span>
                          <span className={`font-semibold capitalize ${
                            subscription.plan_type === 'monthly' ? 'text-yellow-900' : 'text-green-900'
                          }`}>
                            {subscription.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={subscription.plan_type === 'monthly' ? 'text-yellow-700' : 'text-green-700'}>Valid until:</span>
                          <span className={`font-semibold ${
                            subscription.plan_type === 'monthly' ? 'text-yellow-900' : 'text-green-900'
                          }`}>
                            {new Date(subscription.current_period_end).toLocaleDateString()}
                          </span>
                        </div>
                        {subscription.plan_type === 'pack100' && (
                          <div className="flex justify-between items-center">
                            <span className="text-green-700">Generations left:</span>
                            <span className="font-semibold text-green-900">
                              {subscription.generations_remaining || 0}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Manage Billing Button for Stripe subscriptions */}
                      {subscription.provider === 'stripe' && subscription.plan_type === 'monthly' && (
                        <div className="pt-4 border-t border-gray-200">
                          <Button
                            onClick={handleManageBilling}
                            className="w-full py-2 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Manage Billing
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {!subscription && (
                    <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <Crown className="h-8 w-8 text-white" />
                        </div>
                        <h4 className="font-bold text-orange-900 mb-3 text-lg">Upgrade to Pro</h4>
                        <p className="text-orange-700 text-sm mb-6 leading-relaxed">
                          Get unlimited excuse generations and unlock premium features
                        </p>
                        <div className="space-y-3">
                          <Button 
                            onClick={() => handleUpgradeSubscription('monthly')} 
                            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            <Crown className="mr-2 h-5 w-5" />
                            Pro Monthly - $9.99/month
                          </Button>
                          <Button 
                            onClick={() => handleUpgradeSubscription('pack100')} 
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            <Zap className="mr-2 h-5 w-5" />
                            100 Pack - $4.99
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-12">
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Preferences</h3>
                <p className="text-gray-600 text-sm">Customize your experience</p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Billing</h3>
                <p className="text-gray-600 text-sm mb-4">Manage your payments</p>
                {subscription?.provider === 'stripe' && (
                  <Button
                    onClick={handleManageBilling}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Manage Billing
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Security</h3>
                <p className="text-gray-600 text-sm">Account protection</p>
              </CardContent>
            </Card>
          </div>

          {/* Sign Out Section */}
          <div className="text-center">
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl rounded-2xl overflow-hidden max-w-md mx-auto">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <LogOut className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-xl">Sign Out</h3>
                <p className="text-gray-600 text-sm mb-8 leading-relaxed">
                  Sign out of your account. You can always sign back in later.
                </p>
                <Button 
                  variant="outline" 
                  onClick={handleSignOut} 
                  className="border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-6 rounded-xl font-semibold"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Bottom Spacing for Better Scrolling */}
          <div className="h-20"></div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUpgradeModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {selectedPlan === 'monthly' ? 'Pro Monthly Plan' : '100 Generations Pack'}
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                {selectedPlan === 'monthly' 
                  ? 'Unlimited generations with premium features' 
                  : '100 generations with no expiration'
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {selectedPlan === 'monthly' ? '$9.99' : '$4.99'}
                </div>
                <div className="text-gray-500">
                  {selectedPlan === 'monthly' ? 'per month' : 'one-time payment'}
                </div>
              </div>

              <div className="space-y-3">
                {selectedPlan === 'monthly' ? (
                  <>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-gray-700">Unlimited excuse generations</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-gray-700">Priority support</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-gray-700">Advanced features</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-gray-700">100 generations</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-gray-700">No expiration date</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-gray-700">Perfect for occasional use</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col space-y-3">
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/stripe/checkout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          plan: selectedPlan,
                          success_url: `${window.location.origin}/account?success=true&plan=${selectedPlan}`,
                          cancel_url: `${window.location.origin}/account?canceled=true`,
                        }),
                      });

                      if (response.ok) {
                        const data = await response.json();
                        window.location.href = data.url;
                      } else {
                        console.error('Failed to create checkout session');
                      }
                    } catch (error) {
                      console.error('Error creating checkout session:', error);
                    }
                    setShowUpgradeModal(false);
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-xl font-semibold"
                >
                  <Crown className="mr-2 h-5 w-5" />
                  Upgrade Now
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl"
                >
                  Maybe Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AuthGuard>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading account...</p>
        </div>
      </div>
    }>
      <AccountPageContent />
    </Suspense>
  );
}
