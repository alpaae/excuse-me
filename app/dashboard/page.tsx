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
import { ExcuseCard } from '@/components/excuse-card';
import { BottomTrustBar } from '@/components/bottom-trust-bar';

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
  rarity: 'common' | 'rare' | 'legendary';
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
        <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Excuse History
            </h1>
            <p className="text-gray-600 mt-2">Your created excuses</p>
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-full px-4 py-2 mt-4 shadow-sm">
              <span className="text-sm font-medium text-gray-700">
                {excuses.length} excuse{excuses.length !== 1 ? 's' : ''}
              </span>
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
          <div className="space-y-6">
            {excuses.length === 0 ? (
              <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl rounded-2xl">
                <CardContent className="py-16 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No excuses yet</h3>
                  <p className="text-gray-600 mb-6">
                    Create your first excuse to get started
                  </p>
                  <Button 
                    onClick={() => window.history.back()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    Create Excuse
                  </Button>
                </CardContent>
              </Card>
            ) : (
              excuses.map((excuse) => (
                <Card key={excuse.id} className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-200">
                  <CardContent className="p-6">
                    {/* Header with metadata */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">
                            {excuse.input.scenario}
                          </h3>
                          {excuse.is_favorite && (
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                          )}
                        </div>
                        
                        {/* Metadata badges */}
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(excuse.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            {getChannelIcon(excuse.input.channel)}
                            {excuse.input.channel}
                          </span>
                          <span className="capitalize">{excuse.input.tone}</span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant="outline" className="text-xs">
                          {excuse.input.lang}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(excuse.id, excuse.is_favorite)}
                          className="h-8 w-8 p-0"
                        >
                          <Star className={`h-4 w-4 ${excuse.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Excuse content */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <ExcuseCard 
                        text={excuse.result_text} 
                        rarity={excuse.rarity} 
                        excuseId={excuse.id}
                        isFavorite={excuse.is_favorite}
                        onFavoriteToggle={(isFavorite) => {
                          setExcuses(excuses.map(e =>
                            e.id === excuse.id ? { ...e, is_favorite: isFavorite } : e
                          ));
                        }}
                        showCTA={true}
                        className="mb-0"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

        </div>
      </div>

      {/* Bottom Trust Bar */}
      <BottomTrustBar />
      </AuthGuard>
    </ErrorBoundary>
  );
}
