'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, ArrowRight, CheckCircle, Sparkles, Crown, Zap } from 'lucide-react';
import { PromptTips } from '@/components/prompt-tips';
import { ExcuseCard } from '@/components/excuse-card';
import { LegendaryPop } from '@/components/legendary-pop';
import { SocialProofBar } from '@/components/social-proof-bar';

import { LimitReachedModal } from '@/components/limit-reached-modal';

interface CreatePanelProps {
  userLimits?: { isPro: boolean; remaining: number };
  onAuthRequired?: () => void; // Callback для открытия модала логина
}

export function CreatePanel({ userLimits, onAuthRequired }: CreatePanelProps) {
  const [formData, setFormData] = useState({
    scenario: '',
    tone: 'Professional',
    channel: 'Email',
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

    // Check if user is authenticated
    if (!userLimits) {
      // User is not authenticated, show auth modal
      if (onAuthRequired) {
        onAuthRequired();
      }
      return;
    }

    // Auto-detect language from input text
    const combinedText = `${formData.scenario} ${formData.context || ''}`.toLowerCase();
    let finalLang = 'en'; // Default to English
    
    // Enhanced language detection
    if (/[ąćęłńóśźż]/.test(combinedText) || 
        combinedText.includes('polski') || 
        combinedText.includes('polsce') || 
        combinedText.includes('polak') ||
        combinedText.includes('polska')) {
      finalLang = 'pl';
    } else if (/[а-яё]/.test(combinedText) || 
               combinedText.includes('россия') || 
               combinedText.includes('русский') ||
               combinedText.includes('русская')) {
      finalLang = 'ru';
    } else if (/[ñáéíóúü]/.test(combinedText) || 
               combinedText.includes('español') || 
               combinedText.includes('españa') ||
               combinedText.includes('hola') ||
               combinedText.includes('gracias')) {
      finalLang = 'es';
    } else if (/[äöüß]/.test(combinedText) || 
               combinedText.includes('deutsch') || 
               combinedText.includes('deutschland') ||
               combinedText.includes('guten') ||
               combinedText.includes('danke')) {
      finalLang = 'de';
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: formData.scenario,
          tone: formData.tone,
          channel: formData.channel,
          context: formData.context,
          language: finalLang
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data.excuse);
        setResultRarity(data.rarity);
        setResultExcuseId(data.id);
        
        // Show legendary pop if result is legendary
        if (data.rarity === 'legendary') {
          setShowLegendaryPop(true);
        }
      } else {
        const errorData = await response.json();
        if (errorData.error === 'LIMIT_REACHED') {
          setShowLimitModal(true);
        } else {
          setResult('Sorry, something went wrong. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error generating excuse:', error);
      setResult('Sorry, something went wrong. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleUpgrade = async (plan: 'monthly' | 'pack100') => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: plan,
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
    setShowLimitModal(false);
  };

  const handleUpgradeClick = () => {
    if (!userLimits) {
      // User is not authenticated, show auth modal
      if (onAuthRequired) {
        onAuthRequired();
      }
    } else {
      // User is authenticated, show plan selection modal
      setShowLimitModal(true);
    }
  };

  return (
    <div className="w-full max-w-[640px] mx-auto px-4 sm:px-0" data-testid="panel-create">
      <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
        {!result ? (
          // Form State
          <>
            <CardHeader className="pb-6 px-6 pt-6 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-3 text-2xl sm:text-xl">
                <div className="w-12 h-12 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto sm:mx-0">
                  <Wand2 className="h-6 w-6 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="text-center sm:text-left">Create Your Excuse</span>
              </CardTitle>
              <CardDescription className="text-center sm:text-left text-base sm:text-sm text-gray-600 mt-2">
                Describe the situation and get a polished excuse in seconds
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              {/* Plan Status Info - Mobile Optimized */}
              {limits.isPro && (limits.remaining === null || limits.remaining === Infinity) && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-center sm:text-left">
                    <div className="w-12 h-12 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto sm:mx-0">
                      <Crown className="h-6 w-6 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-yellow-800 text-lg sm:text-base">Pro Plan Active</h3>
                      <p className="text-sm text-yellow-700">Unlimited generations • No daily limits</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 100 Pack Info - Mobile Optimized */}
              {limits.isPro && limits.remaining !== null && limits.remaining !== Infinity && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-center sm:text-left">
                    <div className="w-12 h-12 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto sm:mx-0">
                      <Zap className="h-6 w-6 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-green-800 text-lg sm:text-base">100 Pack Active</h3>
                      <p className="text-sm text-green-700">{limits.remaining} generations remaining</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Free Plan Info - Mobile Optimized */}
              {!limits.isPro && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="w-12 h-12 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto sm:mx-0">
                        <Sparkles className="h-6 w-6 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-blue-800 text-lg sm:text-base">Free Plan</h3>
                        <p className="text-sm text-blue-700">{limits.remaining}/3 generations today</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleUpgradeClick()}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 sm:px-4 sm:py-2 text-base sm:text-sm font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Crown className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
                      Upgrade to Pro
                    </Button>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleGenerate} data-testid="gen-form" className="space-y-6">
                {/* Scenario Input - Mobile Optimized */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <Label htmlFor="scenario" className="text-lg sm:text-base font-bold text-gray-700 text-center sm:text-left">
                      What&apos;s the situation?
                    </Label>
                    {/* Social Proof Counter - Mobile Optimized */}
                    <div className="flex items-center justify-center sm:justify-end">
                      <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full px-4 py-2 shadow-sm">
                        <div className="w-6 h-6 sm:w-5 sm:h-5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                          <Sparkles className="h-4 w-4 sm:h-3 sm:w-3 text-white" />
                        </div>
                        <div className="text-sm sm:text-xs font-medium text-blue-700">
                          <SocialProofBar />
                        </div>
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
                    className="min-h-[120px] sm:min-h-[100px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-2xl text-base sm:text-sm p-4"
                  />
                </div>
                
                {/* Form Options - Mobile Optimized Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-base sm:text-sm font-semibold text-gray-700">Tone</Label>
                    <Select value={formData.tone} onValueChange={(value) => setFormData({ ...formData, tone: value })}>
                      <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-2xl h-12 sm:h-10 text-base sm:text-sm" data-testid="gen-tone">
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
                  
                  <div className="space-y-2">
                    <Label className="text-base sm:text-sm font-semibold text-gray-700">Channel</Label>
                    <Select value={formData.channel} onValueChange={(value) => setFormData({ ...formData, channel: value })}>
                      <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-2xl h-12 sm:h-10 text-base sm:text-sm" data-testid="gen-channel">
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
                </div>
                
                {/* Context Input - Mobile Optimized */}
                <div className="space-y-2">
                  <Label htmlFor="context" className="text-base sm:text-sm font-semibold text-gray-700">
                    Additional context (optional)
                  </Label>
                  <Textarea
                    id="context"
                    placeholder="Any additional details that might help create a better excuse..."
                    value={formData.context}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, context: e.target.value })}
                    className="min-h-[80px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-2xl text-base sm:text-sm p-4"
                  />
                </div>
                
                {/* Prompt Tips - Mobile Optimized */}
                <PromptTips />
                
                {/* Generate Button - Mobile Optimized */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={generating || !formData.scenario.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 sm:py-3 text-lg sm:text-base font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 h-16 sm:h-12"
                    data-testid="gen-submit"
                  >
                    <div className="flex items-center space-x-3">
                      {generating ? (
                        <>
                          <div className="w-6 h-6 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-6 w-6 sm:h-5 sm:w-5" />
                          <span>Generate Excuse</span>
                          <ArrowRight className="h-5 w-5 sm:h-4 sm:w-4" />
                        </>
                      )}
                    </div>
                  </Button>
                </div>
              </form>
            </CardContent>
          </>
        ) : (
          // Result State - Mobile Optimized
          <>
            <CardHeader className="pb-6 px-6 pt-6 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-3 text-2xl sm:text-xl">
                <div className="w-12 h-12 sm:w-10 sm:h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto sm:mx-0">
                  <CheckCircle className="h-6 w-6 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="text-center sm:text-left">Your Excuse is Ready!</span>
              </CardTitle>
              <CardDescription className="text-center sm:text-left text-base sm:text-sm text-gray-600 mt-2">
                Here&apos;s your polished excuse - copy, customize, or generate another
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                {resultRarity ? (
                  <ExcuseCard 
                    text={result} 
                    rarity={resultRarity} 
                    excuseId={resultExcuseId || undefined}
                    showCTA={true}
                  />
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <p className="text-gray-800 text-lg sm:text-base leading-relaxed whitespace-pre-wrap" data-testid="gen-result">
                      {result}
                    </p>
                  </div>
                )}
                
                {/* Action Buttons - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                  <Button 
                    onClick={() => {
                      setResult('');
                      setResultRarity(null);
                      setResultExcuseId(null);
                    }}
                    variant="outline"
                    className="flex-1 border-gray-200 hover:border-blue-500 hover:bg-blue-50 rounded-2xl py-3 sm:py-2 text-base sm:text-sm h-14 sm:h-10"
                  >
                    <Wand2 className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
                    Generate Another
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      navigator.clipboard.writeText(result);
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl py-3 sm:py-2 text-base sm:text-sm h-14 sm:h-10"
                  >
                    <CheckCircle className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
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
