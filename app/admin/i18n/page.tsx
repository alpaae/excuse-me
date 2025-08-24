'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { AuthGuard } from '@/lib/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Save, X, Globe, Database } from 'lucide-react';

interface Translation {
  id: string;
  locale: string;
  namespace: string;
  key: string;
  value: string;
  updated_at: string;
}

export default function AdminI18nPage() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocale, setSelectedLocale] = useState('all');
  const [selectedNamespace, setSelectedNamespace] = useState('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadTranslations();
  }, [selectedLocale, selectedNamespace]);

  const loadTranslations = async () => {
    try {
      let query = supabase
        .from('i18n_cache')
        .select('*')
        .order('updated_at', { ascending: false });

      if (selectedLocale !== 'all') {
        query = query.eq('locale', selectedLocale);
      }

      if (selectedNamespace !== 'all') {
        query = query.eq('namespace', selectedNamespace);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading translations:', error);
        return;
      }

      setTranslations(data || []);
    } catch (error) {
      console.error('Error loading translations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (translation: Translation) => {
    setEditingId(translation.id);
    setEditValue(translation.value);
  };

  const handleSave = async () => {
    if (!editingId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('i18n_cache')
        .update({
          value: editValue,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingId);

      if (!error) {
        setTranslations(translations.map(t => 
          t.id === editingId 
            ? { ...t, value: editValue, updated_at: new Date().toISOString() }
            : t
        ));
        setEditingId(null);
        setEditValue('');
      }
    } catch (error) {
      console.error('Error saving translation:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const filteredTranslations = translations.filter(translation => {
    const matchesSearch = searchTerm === '' || 
      translation.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      translation.value.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const locales = ['all', 'en', 'ru', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'];
  const namespaces = ['all', 'common', 'auth', 'excuse', 'dashboard', 'account'];

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
            <h1 className="text-3xl font-bold">Управление переводами</h1>
            <p className="text-muted-foreground">Поиск и редактирование переводов</p>
          </div>

          {/* Фильтры */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Фильтры
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Поиск</Label>
                  <Input
                    placeholder="Поиск по ключу или значению..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Язык</Label>
                  <Select value={selectedLocale} onValueChange={setSelectedLocale}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locales.map(locale => (
                        <SelectItem key={locale} value={locale}>
                          {locale === 'all' ? 'Все языки' : locale.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Пространство имен</Label>
                  <Select value={selectedNamespace} onValueChange={setSelectedNamespace}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {namespaces.map(namespace => (
                        <SelectItem key={namespace} value={namespace}>
                          {namespace === 'all' ? 'Все' : namespace}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Список переводов */}
          <div className="space-y-4">
            {filteredTranslations.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    {searchTerm || selectedLocale !== 'all' || selectedNamespace !== 'all'
                      ? 'Ничего не найдено'
                      : 'Переводы не найдены'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredTranslations.map((translation) => (
                <Card key={translation.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{translation.locale}</Badge>
                            <Badge variant="secondary">{translation.namespace}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(translation.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="font-mono text-sm bg-muted p-2 rounded">
                            {translation.key}
                          </div>
                        </div>
                        
                        {editingId === translation.id ? (
                          <div className="flex items-center gap-2">
                            <Button size="sm" onClick={handleSave} disabled={saving}>
                              <Save className="mr-2 h-4 w-4" />
                              {saving ? 'Сохранение...' : 'Сохранить'}
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancel}>
                              <X className="mr-2 h-4 w-4" />
                              Отмена
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => handleEdit(translation)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Редактировать
                          </Button>
                        )}
                      </div>

                      {editingId === translation.id ? (
                        <div className="space-y-2">
                          <Label>Значение</Label>
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            placeholder="Введите перевод..."
                          />
                        </div>
                      ) : (
                        <div className="bg-muted p-3 rounded">
                          <p className="text-sm">{translation.value}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Статистика */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Статистика
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{translations.length}</div>
                  <div className="text-sm text-muted-foreground">Всего переводов</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {new Set(translations.map(t => t.locale)).size}
                  </div>
                  <div className="text-sm text-muted-foreground">Языков</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {new Set(translations.map(t => t.namespace)).size}
                  </div>
                  <div className="text-sm text-muted-foreground">Пространств имен</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {new Set(translations.map(t => t.key)).size}
                  </div>
                  <div className="text-sm text-muted-foreground">Уникальных ключей</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
