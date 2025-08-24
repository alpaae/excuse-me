'use client';

import { useEffect, useState } from 'react';
import { AuthGuard } from '@/lib/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { Star, Copy, Share2, Volume2, Filter, History, Heart, Calendar, MessageSquare, Phone, User } from 'lucide-react';

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

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function DashboardPage() {
  const [excuses, setExcuses] = useState<Excuse[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [filters, setFilters] = useState({
    search: '',
    favoritesOnly: false,
    sortBy: 'created_at' as 'created_at' | 'updated_at',
    sortOrder: 'desc' as 'asc' | 'desc',
  });

  useEffect(() => {
    loadExcuses();
  }, [filters, pagination.page]);

  const loadExcuses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        favorites: filters.favoritesOnly.toString(),
        search: filters.search,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      const response = await fetch(`/api/excuses?${params}`);
      const data = await response.json();

      if (response.ok) {
        setExcuses(data.excuses);
        setPagination(data.pagination);
      } else {
        console.error('Error loading excuses:', data.error);
      }
    } catch (error) {
      console.error('Error loading excuses:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <MessageSquare className="h-4 w-4" />;
      case 'call': return <Phone className="h-4 w-4" />;
      case 'in_person': return <User className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleSearchChange = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
    setPagination(prev => ({ ...prev, page: 1 })); // Сброс на первую страницу
  };

  const handleFilterChange = (favoritesOnly: boolean) => {
    setFilters(prev => ({ ...prev, favoritesOnly }));
    setPagination(prev => ({ ...prev, page: 1 }));
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
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Заголовок */}
          <div className="text-center">
            <h1 className="text-3xl font-bold">Панель управления</h1>
            <p className="text-muted-foreground">История и избранные отмазки</p>
            <div className="mt-4 text-sm text-muted-foreground">
              Всего отмазок: {pagination.total} • Страница {pagination.page} из {pagination.totalPages}
            </div>
          </div>

          {/* Фильтры */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Фильтры и поиск
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Поиск по тексту или сценарию..."
                    value={filters.search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
                
                <Select 
                  value={filters.favoritesOnly ? 'favorites' : 'all'} 
                  onValueChange={(value) => handleFilterChange(value === 'favorites')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Все отмазки
                      </div>
                    </SelectItem>
                    <SelectItem value="favorites">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Только избранные
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onValueChange={(value) => {
                    const [sortBy, sortOrder] = value.split('-') as ['created_at' | 'updated_at', 'asc' | 'desc'];
                    setFilters(prev => ({ ...prev, sortBy, sortOrder }));
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at-desc">Новые сначала</SelectItem>
                    <SelectItem value="created_at-asc">Старые сначала</SelectItem>
                    <SelectItem value="updated_at-desc">Недавно обновленные</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Список отмазок */}
          <div className="space-y-4">
            {excuses.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    {filters.search || filters.favoritesOnly
                      ? 'Ничего не найдено' 
                      : 'У вас пока нет отмазок. Создайте первую!'}
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

          {/* Пагинация */}
          {pagination.totalPages > 1 && (
            <Card>
              <CardContent className="pt-6">
                <Pagination>
                  <PaginationContent>
                    {pagination.hasPrev && (
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(pagination.page - 1);
                          }}
                        />
                      </PaginationItem>
                    )}
                    
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            isActive={page === pagination.page}
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(page);
                            }}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    {pagination.totalPages > 5 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    
                    {pagination.hasNext && (
                      <PaginationItem>
                        <PaginationNext 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(pagination.page + 1);
                          }}
                        />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
