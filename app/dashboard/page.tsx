'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { AuthGuard } from '@/lib/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Copy, Share2, Volume2, Filter, History, Heart } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadExcuses();
  }, [filter, favoritesOnly]);

  const loadExcuses = async () => {
    try {
      let query = supabase
        .from('excuses')
        .select('*')
        .order('created_at', { ascending: false });

      if (favoritesOnly) {
        query = query.eq('is_favorite', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading excuses:', error);
        return;
      }

      setExcuses(data || []);
    } catch (error) {
      console.error('Error loading excuses:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (excuseId: string, currentFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from('excuses')
        .update({ is_favorite: !currentFavorite })
        .eq('id', excuseId);

      if (!error) {
        setExcuses(excuses.map(excuse => 
          excuse.id === excuseId 
            ? { ...excuse, is_favorite: !currentFavorite }
            : excuse
        ));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Можно добавить toast уведомление
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const shareExcuse = (text: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'ExcuseME - Отмазка',
        text: text,
      });
    } else {
      copyToClipboard(text);
    }
  };

  const filteredExcuses = excuses.filter(excuse => {
    const matchesSearch = searchTerm === '' || 
      excuse.result_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      excuse.input.scenario.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
      (filter === 'favorites' && excuse.is_favorite);
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Заголовок */}
          <div className="text-center">
            <h1 className="text-3xl font-bold">Панель управления</h1>
            <p className="text-muted-foreground">История и избранные отмазки</p>
          </div>

          {/* Фильтры */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Фильтры
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Поиск по тексту или сценарию..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filter} onValueChange={(value: 'all' | 'favorites') => setFilter(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Все
                      </div>
                    </SelectItem>
                    <SelectItem value="favorites">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Избранное
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Список отмазок */}
          <div className="space-y-4">
            {filteredExcuses.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    {searchTerm || filter === 'favorites' 
                      ? 'Ничего не найдено' 
                      : 'У вас пока нет отмазок. Создайте первую!'}
                  </p>
                  <Button className="mt-4" onClick={() => window.location.href = '/'}>
                    Создать отмазку
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredExcuses.map((excuse) => (
                <Card key={excuse.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{excuse.input.scenario}</CardTitle>
                        <CardDescription>
                          {new Date(excuse.created_at).toLocaleDateString()} • {excuse.input.tone} • {excuse.input.channel}
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
                      <p className="text-sm leading-relaxed">{excuse.result_text}</p>
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
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => shareExcuse(excuse.result_text)}
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Поделиться
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
                          Слушать
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
  );
}
