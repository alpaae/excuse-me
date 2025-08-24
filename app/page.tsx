'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { AuthForm } from '@/components/auth/auth-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Wand2, Copy, Share2, Volume2, Crown, History } from 'lucide-react';

interface User {
  id: string;
  email?: string;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [showLimitBanner, setShowLimitBanner] = useState(false);
  
  const [formData, setFormData] = useState({
    scenario: '',
    tone: 'professional',
    channel: 'email',
    lang: 'ru',
    context: '',
  });

  const supabase = createClient();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setShowAuth(true);
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.text);
        setShowLimitBanner(false);
      } else if (data.error === 'FREE_LIMIT_REACHED') {
        setShowLimitBanner(true);
        setResult('');
      } else {
        setResult('Ошибка при генерации. Попробуйте еще раз.');
        setShowLimitBanner(false);
      }
    } catch (error) {
      setResult('Произошла ошибка. Попробуйте еще раз.');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const shareResult = () => {
    if (navigator.share) {
      navigator.share({
        title: 'ExcuseME - Отмазка',
        text: result,
      });
    } else {
      copyToClipboard();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showAuth) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <AuthForm />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Заголовок */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              ExcuseME
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Генератор вежливых отмазок
            </p>
            {user && (
              <div className="mt-4 flex items-center justify-center gap-4">
                <Badge variant="outline">
                  {user.email}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard'}>
                  <History className="mr-2 h-4 w-4" />
                  История
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/account'}>
                  <Crown className="mr-2 h-4 w-4" />
                  Аккаунт
                </Button>
              </div>
            )}
          </div>

          {/* Баннер лимита */}
          {showLimitBanner && (
            <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Crown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <div>
                      <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                        Достигнут дневной лимит
                      </h3>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        Бесплатные пользователи могут генерировать до 3 отмазок в день
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => window.location.href = '/account'}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    Перейти на Pro
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Форма генерации */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Создать отмазку
              </CardTitle>
              <CardDescription>
                Опишите ситуацию и получите вежливую отмазку
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="scenario">Сценарий</Label>
                  <Input
                    id="scenario"
                    placeholder="Например: отмена встречи, опоздание на работу, пропуск вечеринки..."
                    value={formData.scenario}
                    onChange={(e) => setFormData({ ...formData, scenario: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Тон</Label>
                    <Select value={formData.tone} onValueChange={(value) => setFormData({ ...formData, tone: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Профессиональный</SelectItem>
                        <SelectItem value="friendly">Дружелюбный</SelectItem>
                        <SelectItem value="formal">Формальный</SelectItem>
                        <SelectItem value="casual">Неформальный</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Канал</Label>
                    <Select value={formData.channel} onValueChange={(value) => setFormData({ ...formData, channel: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="message">Сообщение</SelectItem>
                        <SelectItem value="call">Звонок</SelectItem>
                        <SelectItem value="in_person">Лично</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Язык</Label>
                    <Select value={formData.lang} onValueChange={(value) => setFormData({ ...formData, lang: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ru">Русский</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="context">Дополнительный контекст (опционально)</Label>
                  <Input
                    id="context"
                    placeholder="Дополнительные детали для более точной отмазки..."
                    value={formData.context}
                    onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={generating}>
                  <Wand2 className="mr-2 h-4 w-4" />
                  {generating ? 'Генерация...' : 'Сгенерировать отмазку'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Результат */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Результат</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{result}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={copyToClipboard}>
                    <Copy className="mr-2 h-4 w-4" />
                    Копировать
                  </Button>
                  
                  <Button variant="outline" onClick={shareResult}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Поделиться
                  </Button>
                  
                  <Button variant="outline">
                    <Volume2 className="mr-2 h-4 w-4" />
                    Слушать
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTA для неавторизованных пользователей */}
          {!user && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">
                  Войдите, чтобы сохранять историю отмазок и получить больше возможностей
                </p>
                <Button onClick={() => setShowAuth(true)}>
                  Войти в аккаунт
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
