'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { AuthGuard } from '@/lib/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Crown, LogOut, Save } from 'lucide-react';

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

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
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
  };

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
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Заголовок */}
          <div className="text-center">
            <h1 className="text-3xl font-bold">Аккаунт</h1>
            <p className="text-muted-foreground">Управление профилем и подпиской</p>
          </div>

          {/* Профиль */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Профиль
              </CardTitle>
              <CardDescription>
                Обновите информацию о себе
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Имя</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ваше имя"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={profile?.id || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              <Button onClick={handleSaveProfile} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </CardContent>
          </Card>

          {/* Подписка */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Подписка
              </CardTitle>
              <CardDescription>
                Статус вашей подписки Pro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Статус:</span>
                <Badge variant={subscription ? 'default' : 'secondary'}>
                  {subscription ? 'Pro' : 'Бесплатный план'}
                </Badge>
              </div>
              
              {subscription && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Провайдер:</span>
                    <span className="capitalize">{subscription.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Действует до:</span>
                    <span>{new Date(subscription.current_period_end).toLocaleDateString()}</span>
                  </div>
                </div>
              )}

              {!subscription && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm mb-3">
                    Перейдите на Pro для неограниченного количества генераций отмазок
                  </p>
                  <Button onClick={handleUpgradeSubscription} className="w-full">
                    <Crown className="mr-2 h-4 w-4" />
                    Перейти на Pro
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Выход */}
          <Card>
            <CardContent className="pt-6">
              <Button variant="outline" onClick={handleSignOut} className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Выйти
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
