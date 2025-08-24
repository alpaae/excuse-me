'use client';

import { useEffect, useState, useCallback } from 'react';
import { AuthGuard } from '@/lib/auth-guard';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/error-boundary';
import { useToast } from '@/lib/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Copy, Share2, Volume2, Heart, Calendar, MessageSquare, Phone, User } from 'lucide-react';
import { SocialProofBar } from '@/components/social-proof-bar';
import { FreeLimitBanner } from '@/components/free-limit-banner';

interface Excuse {
  id: string;
  input: {
    scenario: string;
    tone: string;
    channel: string;
    lang: string;
    context?: string;
  };
  result_text: string;
  tts_url?: string;
  sent_via: string;
  is_favorite: boolean;
  created_at: string;
}



export default function DashboardPage() {
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: !currentFavorite }),
      });

            if (response.ok) {
        setExcuses(excuses.map(excuse =>
          excuse.id === excuseId
            ? { ...excuse, is_favorite: !currentFavorite }
            : excuse
        ));
        showSuccess(currentFavorite ? 'Removed from favorites' : 'Added to favorites');
      } else {
        showError('Failed to update favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showError('Network error while updating favorites');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess('Copied to clipboard');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showError('Failed to copy text');
    }
  };

  const shareExcuse = (text: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'ExcuseME - Excuse',
        text: text,
      });
    } else {
      copyToClipboard(text);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <MessageSquare className="h-4 w-4" />;
      case 'call': return <Phone className="h-4 w-4" />;
      case 'in_person': return <User className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
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
          {/* Free Limit Banner */}
          <FreeLimitBanner />

          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold">Excuse History</h1>
            <p className="text-muted-foreground">Your created excuses</p>
            <div className="mt-4 text-sm text-muted-foreground">
              Total excuses: {excuses.length}
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
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Excuses List */}
          <div className="space-y-4">
            {excuses.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    You don&apos;t have any excuses yet. Create your first one!
                  </p>
                  <Button className="mt-4" onClick={() => window.history.back()}>
                    Create Excuse
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
                          <Star className={`h-4 w-4 ${excuse.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{excuse.result_text}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(excuse.result_text)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => shareExcuse(excuse.result_text)}
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                      
                      {excuse.tts_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const audio = new Audio(excuse.tts_url);
                            audio.play();
                          }}
                        >
                          <Volume2 className="mr-2 h-4 w-4" />
                          Listen
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Social Proof */}
          <div className="text-center mt-12">
            <SocialProofBar />
          </div>

        </div>
      </div>
      </AuthGuard>
    </ErrorBoundary>
  );
}
