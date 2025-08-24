'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, Mail } from 'lucide-react';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const supabase = createClient();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage('Проверьте email для magic link!');
        setEmail('');
      }
    } catch (error) {
      setMessage('Произошла ошибка при отправке magic link');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage(error.message);
      }
    } catch (error) {
      setMessage('Произошла ошибка при входе через GitHub');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Войти в ExcuseME</CardTitle>
        <CardDescription>
          Войдите через email или GitHub для доступа к генератору отмазок
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            <Mail className="mr-2 h-4 w-4" />
            {loading ? 'Отправка...' : 'Отправить magic link'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Или</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGitHubSignIn}
          disabled={loading}
        >
          <Github className="mr-2 h-4 w-4" />
          Войти через GitHub
        </Button>

        {message && (
          <div className={`text-sm p-3 rounded-md ${
            message.includes('ошибка') 
              ? 'bg-destructive/10 text-destructive' 
              : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
          }`}>
            {message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
