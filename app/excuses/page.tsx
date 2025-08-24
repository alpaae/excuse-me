'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, Calendar, MessageSquare, Mail, Phone, User, Star, Heart, Copy, Play } from 'lucide-react';
import { useToast } from '@/lib/use-toast';
import { AuthGuard } from '@/lib/auth-guard';
import { ErrorBoundary } from '@/components/error-boundary';

interface Excuse {
  id: string;
  user_id: string;
  input: {
    lang: string;
    tone: string;
    channel: string;
    context: string;
    scenario: string;
  };
  result_text: string;
  tts_url: string | null;
  sent_via: string;
  is_favorite: boolean;
  created_at: string;
}

export default function ExcusesPage() {
  const [excuses, setExcuses] = useState<Excuse[]>([]);
  const { showError, showSuccess } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExcuses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/excuses');
      const data = await response.json();

      if (response.ok) {
        setExcuses(data.excuses || []);
      } else {
        console.error('Error loading excuses:', data.error);
        setError(data.error || 'Не удалось загрузить историю отмазок');
      }
    } catch (error) {
      console.error('Error loading excuses:', error);
      setError('Ошибка сети при загрузке истории');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExcuses();
  }, [loadExcuses]);

  const toggleFavorite = async (excuseId: string, currentFavorite: boolean) => {
    try {
      const response = await fetch(`/api/excuses/${excuseId}/favorite`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: !currentFavorite }),
      });

      if (response.ok) {
        setExcuses(prev => 
          prev.map(excuse => 
            excuse.id === excuseId 
              ? { ...excuse, is_favorite: !currentFavorite }
              : excuse
          )
        );
        showSuccess(currentFavorite ? 'Убрано из избранного' : 'Добавлено в избранное');
      } else {
        showError('Не удалось обновить избранное');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showError('Ошибка сети');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess('Скопировано в буфер обмена');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showError('Не удалось скопировать');
    }
  };

  const playTTS = async (ttsUrl: string) => {
    try {
      const audio = new Audio(ttsUrl);
      await audio.play();
    } catch (error) {
      console.error('Error playing TTS:', error);
      showError('Не удалось воспроизвести аудио');
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="h-3 w-3" />;
      case 'message': return <MessageSquare className="h-3 w-3" />;
      case 'call': return <Phone className="h-3 w-3" />;
      case 'in_person': return <User className="h-3 w-3" />;
      default: return <MessageSquare className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Заголовок */}
            <div className="text-center">
              <h1 className="text-3xl font-bold">История отмазок</h1>
              <p className="text-muted-foreground">Ваши созданные отмазки</p>
              <div className="mt-4 text-sm text-muted-foreground">
                Всего отмазок: {excuses.length}
              </div>
            </div>

            {/* Ошибка */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <p className="text-red-700">{error}</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={loadExcuses}
                  >
                    Попробовать снова
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Список отмазок */}
            <div className="space-y-4">
              {excuses.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      У вас пока нет отмазок. Создайте первую!
                    </p>
                    <Button className="mt-4" onClick={() => window.location.href = '/'}>
                      Создать отмазку
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                excuses.map((excuse) => (
                  <Card key={excuse.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{excuse.input.scenario}</CardTitle>
                            {excuse.is_favorite && (
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            )}
                          </div>
                          <CardDescription className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(excuse.created_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              {getChannelIcon(excuse.input.channel)}
                              {excuse.input.channel}
                            </span>
                            <span className="capitalize">{excuse.input.tone}</span>
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{excuse.input.lang}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(excuse.id, excuse.is_favorite)}
                          >
                            {excuse.is_favorite ? (
                              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                            ) : (
                              <Heart className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Сценарий:</p>
                        <p className="text-sm">{excuse.input.scenario}</p>
                        {excuse.input.context && (
                          <>
                            <p className="text-sm text-muted-foreground mt-2 mb-2">Контекст:</p>
                            <p className="text-sm">{excuse.input.context}</p>
                          </>
                        )}
                      </div>
                      
                      <div className="bg-primary/5 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Результат:</p>
                        <p className="whitespace-pre-wrap">{excuse.result_text}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(excuse.result_text)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Копировать
                        </Button>
                        {excuse.tts_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => playTTS(excuse.tts_url!)}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Воспроизвести
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </AuthGuard>
    </ErrorBoundary>
  );
}
