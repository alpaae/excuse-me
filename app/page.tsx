'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, Zap, Sparkles, ArrowRight, CheckCircle, X } from 'lucide-react';
import { PromptTips } from '@/components/prompt-tips';
import { ExcuseCard } from '@/components/excuse-card';
import { LegendaryPop } from '@/components/legendary-pop';
import { OnboardingModal } from '@/components/onboarding-modal';
import { AuthForm } from '@/components/auth/auth-form';

export default function HomePage() {
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
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.scenario.trim()) return;

    setGenerating(true);
    setResult('');
    setResultRarity(null);
    setResultExcuseId(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.text);
        setResultRarity(data.rarity);
        setResultExcuseId(data.excuse_id);
        
        // Show legendary pop for first legendary in session
        if (data.rarity === 'legendary' && !sessionStorage.getItem('legendary:shown')) {
          setShowLegendaryPop(true);
          sessionStorage.setItem('legendary:shown', '1');
        }
      } else {
        console.error('Generation failed:', data.error);
      }
    } catch (error) {
      console.error('Network error:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300/10 to-purple-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/20 bg-white/80 backdrop-blur-xl sticky top-0">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                ExcuseME
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                data-testid="btn-login"
                onClick={() => {
                  // Временно показываем alert вместо модального окна
                  // пока не настроен Supabase
                  alert('Sign In functionality requires Supabase setup. Check AUTH_SETUP.md for instructions.');
                  // setShowAuthModal(true);
                }}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-full px-4 py-2 mb-4 shadow-lg">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">AI-powered excuses</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4 leading-tight">
              Create Perfect
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Excuses
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-4 max-w-2xl mx-auto leading-relaxed">
              Transform awkward situations into graceful exits with AI-powered, 
              context-aware excuses that feel natural and professional
            </p>
          </div>

          {/* Main Card - Form or Result */}
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
                  <form onSubmit={handleGenerate} className="space-y-6" data-testid="gen-form">
                    <div className="space-y-3">
                      <Label htmlFor="scenario" className="text-base font-semibold text-gray-700">
                        What&apos;s the situation?
                      </Label>
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
                    
                    <div className="grid grid-cols-2 gap-6">
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
                                     {resultRarity ? (
                     <ExcuseCard 
                       text={result} 
                       rarity={resultRarity} 
                       excuseId={resultExcuseId || undefined}
                       showCTA={true}
                       className="mb-6"
                     />
                   ) : (
                     <div className="bg-gray-50 rounded-xl p-6 mb-6">
                       <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap" data-testid="gen-result">
                         {result}
                       </p>
                     </div>
                   )}
                  
                  <div className="flex flex-col sm:flex-row gap-4">
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
                </CardContent>
              </>
            )}
          </Card>

          {/* Features Section */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-gray-600 text-sm">Advanced AI creates natural, believable excuses</p>
            </div>
            
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Professional</h3>
              <p className="text-gray-600 text-sm">Polished and appropriate for any situation</p>
            </div>
            
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant</h3>
              <p className="text-gray-600 text-sm">Get your excuse in seconds, not minutes</p>
            </div>
          </div>
        </div>
      </main>

      {/* Onboarding Modal */}
      <OnboardingModal />

      {/* Legendary Pop */}
      {showLegendaryPop && (
        <LegendaryPop onComplete={() => setShowLegendaryPop(false)} />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Sign In</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAuthModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6">
              <AuthForm onSuccess={() => setShowAuthModal(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
