'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, Calendar, MessageSquare, Mail, Phone, User, Star, Heart, Copy, Play, Sparkles, ArrowRight } from 'lucide-react';
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
        setError(data.error || 'Failed to load excuse history');
      }
    } catch (error) {
      console.error('Error loading excuses:', error);
      setError('Network error while loading history');
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
        showSuccess(currentFavorite ? 'Removed from favorites' : 'Added to favorites');
      } else {
        showError('Failed to update favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showError('Network error');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess('Copied to clipboard');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showError('Failed to copy');
    }
  };

  const playTTS = async (ttsUrl: string) => {
    try {
      const audio = new Audio(ttsUrl);
      await audio.play();
    } catch (error) {
      console.error('Error playing TTS:', error);
      showError('Failed to play audio');
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AuthGuard>
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

          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              {/* Заголовок */}
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
                  Excuse History
                </h1>
                <p className="text-xl text-gray-600 mb-4">Your created excuses</p>
                <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2">
                  <History className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    Total excuses: {excuses.length}
                  </span>
                </div>
              </div>

              {/* Ошибка */}
              {error && (
                <Card className="border-red-200 bg-red-50 mb-6">
                  <CardContent className="pt-6">
                    <p className="text-red-700">{error}</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={loadExcuses}
                    >
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Excuses List */}
              <div className="space-y-6">
                {excuses.length === 0 ? (
                  <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
                    <CardContent className="py-12 text-center">
                      <p className="text-gray-600 mb-4">
                        You don&apos;t have any excuses yet. Create your first one!
                      </p>
                      <Button 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        onClick={() => window.history.back()}
                      >
                        Create Excuse
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  excuses.map((excuse) => (
                    <Card key={excuse.id} className="bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-xl font-semibold text-gray-900">{excuse.input.scenario}</CardTitle>
                              {excuse.is_favorite && (
                                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                                <Calendar className="h-4 w-4" />
                                {new Date(excuse.created_at).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                                {getChannelIcon(excuse.input.channel)}
                                <span className="capitalize">{excuse.input.channel}</span>
                              </span>
                              <span className="bg-purple-50 px-3 py-1 rounded-full capitalize">{excuse.input.tone}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-0">
                              {excuse.input.lang.toUpperCase()}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(excuse.id, excuse.is_favorite)}
                              className="hover:bg-red-50"
                            >
                              {excuse.is_favorite ? (
                                <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                              ) : (
                                <Heart className="h-5 w-5 text-gray-400 hover:text-red-500" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-100">
                          <p className="text-sm font-medium text-gray-700 mb-3">Scenario:</p>
                          <p className="text-gray-800 leading-relaxed">{excuse.input.scenario}</p>
                          {excuse.input.context && (
                            <>
                              <p className="text-sm font-medium text-gray-700 mt-4 mb-3">Context:</p>
                              <p className="text-gray-800 leading-relaxed">{excuse.input.context}</p>
                            </>
                          )}
                        </div>
                        
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100">
                          <p className="text-sm font-medium text-blue-700 mb-3">Result:</p>
                          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{excuse.result_text}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(excuse.result_text)}
                            className="flex-1 bg-white/50 backdrop-blur-sm border-gray-200 hover:bg-white/70"
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy
                          </Button>
                          {excuse.tts_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => playTTS(excuse.tts_url!)}
                              className="flex-1 bg-white/50 backdrop-blur-sm border-gray-200 hover:bg-white/70"
                            >
                              <Play className="mr-2 h-4 w-4" />
                              Play
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
        </div>
      </AuthGuard>
    </ErrorBoundary>
  );
}
