'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { PromptTips } from '@/components/prompt-tips';
import { ExcuseCard } from '@/components/excuse-card';
import { LegendaryPop } from '@/components/legendary-pop';
import { SocialProofBar } from '@/components/social-proof-bar';
import { LimitNotification } from '@/components/limit-notification';
import { LimitReachedModal } from '@/components/limit-reached-modal';

interface CreatePanelProps {
  userLimits?: { isPro: boolean; remaining: number };
}

export function CreatePanel({ userLimits }: CreatePanelProps) {
  const [formData, setFormData] = useState({
    scenario: '',
    tone: 'Professional',
    channel: 'Email',
    lang: 'en',
    context: ''
  });
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [resultRarity, setResultRarity] = useState<'common' | 'rare' | 'legendary' | null>(null);
  const [resultExcuseId, setResultExcuseId] = useState<string | null>(null);
  const [showLegendaryPop, setShowLegendaryPop] = useState(false);
  const [limits, setLimits] = useState({ isPro: false, remaining: 3, used: 0 });
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Load limits on component mount or when userLimits prop changes
  useEffect(() => {
    if (userLimits) {
      // Use limits from parent component
      setLimits({ ...userLimits, used: 0 });
    } else {
      // Load limits from API for non-authenticated users
      const loadLimits = async () => {
        try {
          const response = await fetch('/api/limits');
          if (response.ok) {
            const data = await response.json();
            setLimits(data.limits);
          }
        } catch (error) {
          console.error('Error loading limits:', error);
        }
      };

      loadLimits();
    }
  }, [userLimits]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.scenario.trim()) return;

    // Auto-detect language if not explicitly selected
    let finalLang = formData.lang;
    if (formData.lang === 'en' && (formData.scenario || formData.context)) {
      const combinedText = `${formData.scenario} ${formData.context || ''}`.toLowerCase();
      
      // Simple language detection for common patterns
      if (/[ąćęłńóśźż]/.test(combinedText) || 
          combinedText.includes('polski') || 
          combinedText.includes('polsce') || 
          combinedText.includes('polak')) {
        finalLang = 'pl';
      } else if (/[а-яё]/.test(combinedText) || 
                 combinedText.includes('россия') || 
                 combinedText.includes('русский')) {
        finalLang = 'ru';
      } else if (/[ñáéíóúü]/.test(combinedText) || 
                 combinedText.includes('español') || 
                 combinedText.includes('españa')) {
        finalLang = 'es';
      } else if (/[äöüß]/.test(combinedText) || 
                 combinedText.includes('deutsch') || 
                 combinedText.includes('deutschland')) {
        finalLang = 'de';
      } else if (/[àâçéèêëîïôûùüÿœ]/.test(combinedText) || 
                 combinedText.includes('français') || 
                 combinedText.includes('france')) {
        finalLang = 'fr';
      }
    }

    setGenerating(true);
    setResult('');
    setResultRarity(null);
    setResultExcuseId(null);

    // Show language detection notification if auto-detected
    if (finalLang !== formData.lang) {
      const langNames = {
        'pl': 'Polish', 'ru': 'Russian', 'es': 'Spanish', 
        'de': 'German', 'fr': 'French', 'en': 'English'
      };
      console.log(`Auto-detected language: ${langNames[finalLang as keyof typeof langNames] || finalLang}`);
    }

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          lang: finalLang
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.text);
        setResultRarity(data.rarity);
        setResultExcuseId(data.excuse_id);
        
        // Update limits after successful generation
        if (data.limits) {
          setLimits(data.limits);
        }
        
        // Show legendary pop for first legendary in session
        if (data.rarity === 'legendary' && !sessionStorage.getItem('legendary:shown')) {
          setShowLegendaryPop(true);
          sessionStorage.setItem('legendary:shown', '1');
        }
      } else {
        console.error('Generation failed:', data.error);
        
        // Show limit modal if limit reached
        if (response.status === 402 && (data.error === 'FREE_LIMIT_REACHED' || data.error === 'PACK_LIMIT_REACHED')) {
          setShowLimitModal(true);
        }
      }
    } catch (error) {
      console.error('Network error:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleUpgrade = (plan: 'monthly' | 'pack100') => {
    // Redirect to account page with plan parameter
    window.location.href = `/account?plan=${plan}`;
    setShowLimitModal(false);
  };

  return (
    <div className="max-w-[640px] w-full mx-auto" data-testid="panel-create">
      <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-2xl overflow-hidden">
        {!result ? (
          // Form State
          <>
            <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="flex items-center space-x-3 text-2xl">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Wand2 className="h-5 w-5 text-white" />
                </div>
                <span>Create Your Excuse</span>
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Describe the situation and get a polished excuse in seconds
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6">
              {/* Limit Notification */}
              <LimitNotification
                remaining={limits.remaining}
                isPro={limits.isPro}
                onUpgrade={() => setShowLimitModal(true)}
                className="mb-6"
              />
              
              <form onSubmit={handleGenerate} data-testid="gen-form">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="scenario" className="text-base font-semibold text-gray-700">
                        What&apos;s the situation?
                      </Label>
                      {/* Social Proof Counter */}
                      <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full px-3 py-1 shadow-sm">
                        <div className="w-5 h-5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                          <Sparkles className="h-3 w-3 text-white" />
                        </div>
                        <div className="text-xs font-medium text-blue-700">
                          <SocialProofBar />
                        </div>
                      </div>
                    </div>
                    <Textarea
                      id="scenario"
                      data-testid="gen-scenario"
                      placeholder="e.g., I need to cancel a meeting, I&apos;m running late to work, I can&apos;t make it to the party..."
                      value={formData.scenario}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, scenario: e.target.value })}
                      required
                      className="min-h-[120px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-base"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-gray-700">Tone</Label>
                      <Select value={formData.tone} onValueChange={(value) => setFormData({ ...formData, tone: value })}>
                        <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl" data-testid="gen-tone">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Professional">Professional</SelectItem>
                          <SelectItem value="Casual">Casual</SelectItem>
                          <SelectItem value="Friendly">Friendly</SelectItem>
                          <SelectItem value="Formal">Formal</SelectItem>
                          <SelectItem value="Humorous">Humorous</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-gray-700">Channel</Label>
                      <Select value={formData.channel} onValueChange={(value) => setFormData({ ...formData, channel: value })}>
                        <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl" data-testid="gen-channel">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Email">Email</SelectItem>
                          <SelectItem value="Text">Text</SelectItem>
                          <SelectItem value="Phone">Phone</SelectItem>
                          <SelectItem value="In Person">In Person</SelectItem>
                          <SelectItem value="Social Media">Social Media</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-gray-700">Language</Label>
                      <Select value={formData.lang} onValueChange={(value) => setFormData({ ...formData, lang: value })}>
                        <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl" data-testid="gen-language">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="pl">Polski</SelectItem>
                          <SelectItem value="ru">Русский</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="de">Deutsch</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="it">Italiano</SelectItem>
                          <SelectItem value="pt">Português</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="context" className="text-base font-semibold text-gray-700">
                      Additional Context (Optional)
                    </Label>
                    <Input
                      id="context"
                      data-testid="gen-context"
                      placeholder="Any specific details or requirements..."
                      value={formData.context}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, context: e.target.value })}
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                    />
                  </div>

                  {/* Prompt Tips */}
                  <PromptTips />

                  {/* Generate Button */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-500">Press ⌘⏎ / Ctrl⏎</span>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={generating || !formData.scenario.trim()}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      data-testid="gen-submit"
                    >
                      <div className="flex items-center space-x-2">
                        {generating ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-5 w-5" />
                            <span>Generate Excuse</span>
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </div>
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </>
        ) : (
          // Result State
          <>
            <CardHeader className="pb-6 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="flex items-center space-x-3 text-2xl">
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <span>Your Excuse is Ready!</span>
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Here&apos;s your polished excuse - copy, customize, or generate another
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="space-y-6">
                {resultRarity ? (
                  <ExcuseCard 
                    text={result} 
                    rarity={resultRarity} 
                    excuseId={resultExcuseId || undefined}
                    showCTA={true}
                  />
                ) : (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap" data-testid="gen-result">
                      {result}
                    </p>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
                  <Button 
                    onClick={() => {
                      setResult('');
                      setResultRarity(null);
                      setResultExcuseId(null);
                    }}
                    variant="outline"
                    className="flex-1 border-gray-200 hover:border-blue-500 hover:bg-blue-50 rounded-xl"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Another
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      navigator.clipboard.writeText(result);
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Copy to Clipboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        )}
      </Card>

      {/* Legendary Pop */}
      {showLegendaryPop && (
        <LegendaryPop onComplete={() => setShowLegendaryPop(false)} />
      )}
      
      {/* Limit Reached Modal */}
      <LimitReachedModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}
