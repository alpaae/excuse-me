'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { AuthForm } from '@/components/auth/auth-form';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/error-boundary';
import { useToast, toastMessages } from '@/lib/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Wand2, 
  Copy, 
  Share2, 
  Volume2, 
  Crown, 
  History, 
  AlertCircle, 
  Sparkles,
  MessageSquare,
  Mail,
  Phone,
  User,
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  Globe,
  Play,
  SparklesIcon,
  Shield,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react';
import { SocialProofBar } from '@/components/social-proof-bar';
import { FreeLimitBanner } from '@/components/free-limit-banner';
import { ExcuseCard } from '@/components/excuse-card';
import { LegendaryPop } from '@/components/legendary-pop';
import { BottomTrustBar } from '@/components/bottom-trust-bar';
import { OnboardingModal } from '@/components/onboarding-modal';
import { PromptTips } from '@/components/prompt-tips';

interface User {
  id: string;
  email?: string;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [resultRarity, setResultRarity] = useState<'common' | 'rare' | 'legendary' | null>(null);
  const [resultExcuseId, setResultExcuseId] = useState<string | null>(null);
  const [showLegendaryPop, setShowLegendaryPop] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showLimitBanner, setShowLimitBanner] = useState(false);
  const [showRateLimitBanner, setShowRateLimitBanner] = useState(false);
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState({
    scenario: '',
    tone: 'professional',
    channel: 'email',
    context: '',
  });

  const supabase = createClient();

  const checkUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);
  }, [supabase.auth]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setShowAuth(true);
      return;
    }

    // Clear previous results and banners
    setGenerating(true);
    setResult('');
    setResultRarity(null);
    setResultExcuseId(null);
    setShowLegendaryPop(false);
    setShowLimitBanner(false);
    setShowRateLimitBanner(false);
    
    try {
      // Server will automatically detect language from input
      const requestData = {
        ...formData,
      };

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      
      if (response.status === 200 && data.success) {
        // Successful generation - show result
        setResult(data.text);
        setResultRarity(data.rarity);
        setResultExcuseId(data.excuse_id);
        showSuccess('Excuse generated successfully!');
        
        // Show legendary pop if it's legendary and hasn't been shown this session
        if (data.rarity === 'legendary' && !sessionStorage.getItem('legendary:shown')) {
          setShowLegendaryPop(true);
          sessionStorage.setItem('legendary:shown', '1');
        }
        
        // Update limits if provided
        if (data.limits) {
          // Trigger SWR revalidation for limits
          // This will be handled by the FreeLimitBanner component
        }
      } else if (response.status === 429) {
        // Rate limit exceeded
        setShowRateLimitBanner(true);
        showError('Too many requests. Please wait a moment.');
      } else if (response.status === 402) {
        // Free limit exceeded
        setShowLimitBanner(true);
        showError('Free limit reached. Upgrade to Pro for unlimited generations.');
      } else {
        // Other errors
        showError(data.error || 'Failed to generate excuse');
      }
    } catch (error) {
      console.error('Error generating excuse:', error);
      showError('Network error. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess('Copied to clipboard!');
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

  const playTTS = async (text: string) => {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const audio = new Audio(URL.createObjectURL(blob));
        await audio.play();
      } else {
        showError('Failed to generate audio');
      }
    } catch (error) {
      console.error('Error playing TTS:', error);
      showError('Failed to play audio');
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'message': return <MessageSquare className="h-4 w-4" />;
      case 'call': return <Phone className="h-4 w-4" />;
      case 'in_person': return <User className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome to ExcuseME</h1>
            <p className="text-gray-600 mt-2">Sign in to start creating excuses</p>
          </div>
          <AuthForm onSuccess={() => setShowAuth(false)} />
          <Button 
            variant="ghost" 
            onClick={() => setShowAuth(false)}
            className="w-full mt-4"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Legendary Pop Animation */}
        {showLegendaryPop && (
          <LegendaryPop onComplete={() => setShowLegendaryPop(false)} />
        )}
        {/* Animated Background Elements */}
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
                {user ? (
                  <div className="flex items-center space-x-3">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => window.location.href = '/dashboard'}
                      className="bg-white/50 backdrop-blur-sm hover:bg-white/70"
                    >
                      <History className="mr-2 h-4 w-4" />
                      History
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => window.location.href = '/account'}
                      className="bg-white/50 backdrop-blur-sm hover:bg-white/70"
                    >
                      <Crown className="mr-2 h-4 w-4" />
                      Account
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={() => setShowAuth(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    data-testid="btn-login"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 container mx-auto px-6 py-8">
          <div className="max-w-3xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-full px-4 py-2 mb-4 shadow-lg">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">AI-powered excuses</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4 leading-tight">
                Create Perfect
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Excuses
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 mb-4 max-w-xl mx-auto leading-relaxed">
                Transform awkward situations into graceful exits with AI-powered, 
                context-aware excuses that feel natural and professional
              </p>
              
              {/* Social Proof Counter */}
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-full px-4 py-2 shadow-lg">
                <Users className="h-4 w-4 text-blue-600" />
                <SocialProofBar />
              </div>
            </div>



            {/* Form Section */}
            <div className="mb-8">
              {/* Input Form */}
              <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-2xl overflow-hidden">
                <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <Wand2 className="h-4 w-4 text-white" />
                    </div>
                    <span>Create Excuse</span>
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Describe the situation and get a polished excuse
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-4">
                  <form onSubmit={handleGenerate} className="space-y-4" data-testid="gen-form">
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
                        className="min-h-[100px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-base"
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
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="friendly">Friendly</SelectItem>
                            <SelectItem value="formal">Formal</SelectItem>
                            <SelectItem value="casual">Casual</SelectItem>
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
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="message">Message</SelectItem>
                            <SelectItem value="call">Phone Call</SelectItem>
                            <SelectItem value="in_person">In Person</SelectItem>
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
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      data-testid="gen-submit"
                    >
                      {generating ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Generating...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Wand2 className="h-5 w-5" />
                          <span>Generate Excuse</span>
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Result Section */}
              {result && (
                <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-2xl overflow-hidden mt-8">
                  <CardHeader className="pb-6 bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardTitle className="flex items-center space-x-3 text-2xl">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <span>Your Excuse</span>
                    </CardTitle>
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
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Banners */}
            {showRateLimitBanner && (
              <Card className="border-red-200 bg-red-50 mb-6" data-testid="banner-rate-limit">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-red-700 font-medium">Rate limit exceeded</p>
                      <p className="text-red-600 text-sm">Please wait a moment before trying again.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {showLimitBanner && (
              <Card className="border-orange-200 bg-orange-50 mb-6" data-testid="banner-free-limit">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3">
                    <Crown className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-orange-700 font-medium">Free limit reached</p>
                      <p className="text-orange-600 text-sm">Upgrade to Pro for unlimited excuse generations.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}



          </div>
        </main>


        
        {/* Onboarding Modal */}
        <OnboardingModal />
      </div>
    </ErrorBoundary>
  );
}
