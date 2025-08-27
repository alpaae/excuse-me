'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, Mail } from 'lucide-react';

interface AuthFormProps {
  onSuccess?: () => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
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
          emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/auth/callback`,
        },
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage('Check your email for magic link! You can close this window.');
        setEmail('');
        // Автоматически закрываем модальное окно через 3 секунды
        setTimeout(() => {
          onSuccess?.();
        }, 3000);
      }
    } catch (error) {
      setMessage('An error occurred while sending magic link');
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
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/auth/callback`,
        },
      });

      if (error) {
        setMessage(error.message);
      } else {
        onSuccess?.();
      }
    } catch (error) {
      setMessage('An error occurred while signing in with GitHub');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign in to ExcuseME</CardTitle>
        <CardDescription>
          Sign in with email or GitHub to access the excuse generator
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
            {loading ? 'Sending...' : 'Send magic link'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGitHubSignIn}
          disabled={loading}
        >
          <Github className="mr-2 h-4 w-4" />
          Sign in with GitHub
        </Button>

        {message && (
          <div className={`text-sm p-3 rounded-md ${
            message.includes('error') 
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
