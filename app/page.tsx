'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { AuthForm } from '@/components/auth/auth-form';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/error-boundary';
import { useToast, toastMessages } from '@/lib/use-toast';
import { useCurrentLocale } from '@/components/i18n-provider';
import { LanguageSwitch } from '@/components/language-switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Wand2, 
  Copy, 
  Share2, 
  Volume2, 
  Crown, 
  History, 
  AlertCircle, 
  Sparkles,
  MessageSquare,
  Mail,
  Phone,
  User,
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  Globe
} from 'lucide-react';

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
  const [showRateLimitBanner, setShowRateLimitBanner] = useState(false);
  const { showSuccess, showError } = useToast();
  const { currentLocale } = useCurrentLocale();
  
  const [formData, setFormData] = useState({
    scenario: '',
    tone: 'professional',
    channel: 'email',
    lang: 'ru',
    context: '',
  });

  const supabase = createClient();

  const checkUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);
  }, [supabase.auth]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  // Синхронизируем язык формы с текущим языком приложения
  useEffect(() => {
    if (currentLocale && currentLocale !== formData.lang) {
      setFormData(prev => ({ ...prev, lang: currentLocale }));
    }
  }, [currentLocale, formData.lang]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setShowAuth(true);
      return;
    }

    // Очищаем предыдущие результаты и баннеры
    setGenerating(true);
    setResult('');
    setShowLimitBanner(false);
    setShowRateLimitBanner(false);
    
    try {
      // Используем текущую локаль из провайдера для генерации
      const requestData = {
        ...formData,
        lang: currentLocale, // Всегда используем текущую локаль из провайдера
      };

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      
      if (response.status === 200 && data.success) {
        // Успешная генерация - показываем результат
        setResult(data.text);
        showSuccess(toastMessages.generate.success);
      } else if (response.status === 429 || data.error === 'RATE_LIMIT') {
        // Rate limit ошибка - показываем баннер
        setShowRateLimitBanner(true);
        showError(toastMessages.generate.rateLimit);
      } else if (response.status === 402 || data.error === 'FREE_LIMIT_REACHED') {
        // Free limit ошибка - показываем баннер с CTA
        setShowLimitBanner(true);
        showError(toastMessages.generate.freeLimit);
      } else {
        // Другие ошибки
        showError(data.error || toastMessages.generate.error);
      }
    } catch (error) {
      console.error('Generation error:', error);
      showError(toastMessages.generate.error);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result);
      showSuccess('Скопировано в буфер обмена');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showError('Не удалось скопировать');
    }
  };

  const shareExcuse = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Отмазка',
          text: result,
        });
      } else {
        await navigator.clipboard.writeText(result);
        showSuccess('Скопировано в буфер обмена');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      showError('Не удалось поделиться');
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'message': return <MessageSquare className="h-4 w-4" />;
      case 'call': return <Phone className="h-4 w-4" />;
      case 'in_person': return <User className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Header */}
        <header className="border-b border-white/20 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  ExcuseMe
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <LanguageSwitch />
                
                {user ? (
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="bg-white/50 backdrop-blur-sm">
                      {user.email}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => window.location.href = '/excuses'}
                      className="bg-white/50 backdrop-blur-sm hover:bg-white/70"
                    >
                      <History className="mr-2 h-4 w-4" />
                      История
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => window.location.href = '/account'}
                      className="bg-white/50 backdrop-blur-sm hover:bg-white/70"
                    >
                      <Crown className="mr-2 h-4 w-4" />
                      Аккаунт
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={() => setShowAuth(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    Войти
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-6">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">AI-powered excuses</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
                Создавайте идеальные отмазки
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Искусственный интеллект поможет вам создать вежливые и убедительные отмазки для любой ситуации
              </p>
              
              <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Мгновенная генерация</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Множество языков</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Профессиональный тон</span>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* Input Form */}
              <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center space-x-2 text-2xl">
                    <Wand2 className="h-6 w-6 text-blue-600" />
                    <span>Создать отмазку</span>
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Опишите ситуацию и получите вежливую отмазку
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleGenerate} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="scenario" className="text-sm font-medium text-gray-700">
                        Сценарий
                      </Label>
                                             <Textarea
                         id="scenario"
                         placeholder="Например: отмена встречи, опоздание на работу, пропуск вечеринки..."
                         value={formData.scenario}
                         onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, scenario: e.target.value })}
                         required
                         className="min-h-[100px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Тон</Label>
                        <Select value={formData.tone} onValueChange={(value) => setFormData({ ...formData, tone: value })}>
                          <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
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
                        <Label className="text-sm font-medium text-gray-700">Канал</Label>
                        <Select value={formData.channel} onValueChange={(value) => setFormData({ ...formData, channel: value })}>
                          <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
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
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Язык</Label>
                      <LanguageSwitch />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="context" className="text-sm font-medium text-gray-700">
                        Дополнительный контекст (опционально)
                      </Label>
                      <Input
                        id="context"
                        placeholder="Дополнительные детали для более точной отмазки..."
                        value={formData.context}
                        onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-medium"
                      disabled={generating}
                    >
                      {generating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Генерация...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-5 w-5" />
                          Сгенерировать отмазку
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Result Section */}
              <div className="space-y-6">
                {result && (
                  <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center space-x-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span>Результат</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-100">
                        <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">{result}</p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyToClipboard}
                          className="flex-1 bg-white/50 backdrop-blur-sm border-gray-200 hover:bg-white/70"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Копировать
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={shareExcuse}
                          className="flex-1 bg-white/50 backdrop-blur-sm border-gray-200 hover:bg-white/70"
                        >
                          <Share2 className="mr-2 h-4 w-4" />
                          Поделиться
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Features Preview */}
                <Card className="bg-white/60 backdrop-blur-xl border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Возможности</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Множество каналов</p>
                          <p className="text-sm text-gray-600">Email, сообщения, звонки, личные встречи</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Globe className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Множество языков</p>
                          <p className="text-sm text-gray-600">Русский, английский, испанский и другие</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">AI-генерация</p>
                          <p className="text-sm text-gray-600">Умные и контекстные отмазки</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Rate Limit Banner */}
            {showRateLimitBanner && (
              <Card className="bg-yellow-50 border-yellow-200 mb-6">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium text-yellow-800">Слишком много запросов</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Пожалуйста, подождите немного перед следующим запросом.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Free Limit Banner */}
            {showLimitBanner && (
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 mb-6">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <Crown className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium text-purple-800">Достигнут лимит бесплатных запросов</h3>
                      <p className="text-sm text-purple-700 mt-1">
                        Обновите аккаунт для неограниченного доступа к генерации отмазок.
                      </p>
                      <Button 
                        className="mt-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                        onClick={() => window.location.href = '/account'}
                      >
                        Обновить аккаунт
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        {/* Auth Modal */}
        {showAuth && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                             <AuthForm />
              <Button 
                variant="ghost" 
                className="w-full mt-4" 
                onClick={() => setShowAuth(false)}
              >
                Отмена
              </Button>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
