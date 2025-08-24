'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { AuthGuard } from '@/lib/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Crown, LogOut, Save, ArrowRight, Sparkles } from 'lucide-react';

interface Profile {
  id: string;
  display_name: string;
  created_at: string;
}

interface Subscription {
  id: string;
  provider: 'stripe' | 'telegram';
  status: 'active' | 'past_due' | 'canceled';
  current_period_end: string;
  created_at: string;
}

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const supabase = createClient();

  const loadUserData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Загружаем профиль
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
          setDisplayName(profileData.display_name || '');
        }

        // Загружаем подписку
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
  }, [loadUserData]);

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

  const handleUpgradeSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success_url: `${window.location.origin}/account?success=true`,
          cancel_url: `${window.location.origin}/account?canceled=true`,
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Header */}
        <header className="border-b border-white/20 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  ExcuseME
                </h1>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.history.back()}
                className="bg-white/50 backdrop-blur-sm hover:bg-white/70"
              >
                <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                Back
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
          {/* Page Title */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <User className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
              Account Settings
            </h1>
            <p className="text-gray-600 text-lg">Manage your profile and subscription</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Profile Section */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-2xl overflow-hidden">
              <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 to-purple-50">
                <CardTitle className="flex items-center space-x-3 text-2xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <span>Profile</span>
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Update your personal information
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-8 space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="displayName" className="text-base font-semibold text-gray-700">
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-base"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-gray-700">Email Address</Label>
                  <Input
                    value={profile?.id || ''}
                    disabled
                    className="bg-gray-50 border-gray-200 rounded-xl text-base"
                  />
                  <p className="text-sm text-gray-500">Email cannot be changed</p>
                </div>
                
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>

            {/* Subscription Section */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-2xl overflow-hidden">
              <CardHeader className="pb-6 bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center space-x-3 text-2xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <span>Subscription</span>
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Your Pro subscription status
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-gray-900">Current Plan</p>
                    <p className="text-sm text-gray-600">Unlimited excuses & premium features</p>
                  </div>
                  <Badge 
                    variant={subscription ? 'default' : 'secondary'}
                    className={`px-3 py-1 text-sm font-semibold ${
                      subscription 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {subscription ? 'Pro' : 'Free Plan'}
                  </Badge>
                </div>
                
                {subscription && (
                  <div className="space-y-4 p-4 bg-green-50 rounded-xl border border-green-200">
                    <h4 className="font-semibold text-green-900">Subscription Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-700">Provider:</span>
                        <span className="font-medium text-green-900 capitalize">{subscription.provider}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Valid until:</span>
                        <span className="font-medium text-green-900">
                          {new Date(subscription.current_period_end).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {!subscription && (
                  <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Crown className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-orange-900 mb-2">Upgrade to Pro</h4>
                      <p className="text-orange-700 text-sm mb-4">
                        Get unlimited excuse generations and unlock premium features
                      </p>
                      <Button 
                        onClick={handleUpgradeSubscription} 
                        className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                      >
                        <Crown className="mr-2 h-4 w-4" />
                        Upgrade to Pro
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sign Out Section */}
          <div className="mt-8">
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <LogOut className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Sign Out</h3>
                  <p className="text-gray-600 text-sm mb-6">
                    Sign out of your account
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={handleSignOut} 
                    className="border-gray-300 hover:bg-gray-50 text-gray-700"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
