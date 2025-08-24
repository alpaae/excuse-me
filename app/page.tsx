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
  Globe
} from 'lucide-react';

interface User {
  id: string;
  email?: string;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState('');
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

  // Function to detect language from user input
  const detectLanguage = (text: string): string => {
    // Simple heuristics for language detection
    const russianPattern = /[а-яё]/i;
    const englishPattern = /[a-z]/i;
    const polishPattern = /[ąćęłńóśźż]/i;
    const germanPattern = /[äöüß]/i;
    const frenchPattern = /[àâäéèêëïîôöùûüÿç]/i;
    const spanishPattern = /[ñáéíóúü]/i;
    
    if (russianPattern.test(text)) return 'ru';
    if (polishPattern.test(text)) return 'pl';
    if (germanPattern.test(text)) return 'de';
    if (frenchPattern.test(text)) return 'fr';
    if (spanishPattern.test(text)) return 'es';
    if (englishPattern.test(text)) return 'en';
    
    return 'en'; // Default to English
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setShowAuth(true);
      return;
    }

    // Clear previous results and banners
    setGenerating(true);
    setResult('');
    setShowLimitBanner(false);
    setShowRateLimitBanner(false);
    
    try {
      // Automatically detect language based on context
      const combinedText = `${formData.scenario} ${formData.context}`.trim();
      const detectedLang = detectLanguage(combinedText);
      
      const requestData = {
        ...formData,
        lang: detectedLang,
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
        showSuccess(toastMessages.generate.success);
      } else if (response.status === 429 || data.error === 'RATE_LIMIT') {
        // Rate limit error - show banner
        setShowRateLimitBanner(true);
        showError(toastMessages.generate.rateLimit);
      } else if (response.status === 402 || data.error === 'FREE_LIMIT_REACHED') {
        // Free limit error - show banner with CTA
        setShowLimitBanner(true);
        showError(toastMessages.generate.freeLimit);
      } else {
        // Other errors
        showError(data.error || toastMessages.generate.error);
      }
    } catch (error) {
      console.error('Generation error:', error);
      showError(toastMessages.generate.error);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result);
      showSuccess('Copied to clipboard');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showError('Failed to copy');
    }
  };

  const shareExcuse = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Excuse',
          text: result,
        });
      } else {
        await navigator.clipboard.writeText(result);
        showSuccess('Copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      showError('Failed to share');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
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
              
              <div className="flex items-center space-x-4">
                {user ? (
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="bg-white/50 backdrop-blur-sm">
                      {user.email}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => window.location.href = '/excuses'}
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
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
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
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-6">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">AI-powered excuses</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
                Create Perfect Excuses
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                AI helps you create polite and convincing excuses for any situation
              </p>
              
              <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Instant generation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Multiple languages</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Professional tone</span>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* Input Form */}
              <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center space-x-2 text-2xl">
                    <Wand2 className="h-6 w-6 text-blue-600" />
                    <span>Create Excuse</span>
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Describe the situation and get a polite excuse
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleGenerate} className="space-y-6" data-testid="gen-form">
                    <div className="space-y-2">
                      <Label htmlFor="scenario" className="text-sm font-medium text-gray-700">
                        Scenario
                      </Label>
                      <Textarea
                        id="scenario"
                        data-testid="gen-scenario"
                        placeholder="e.g., canceling a meeting, being late to work, missing a party..."
                        value={formData.scenario}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, scenario: e.target.value })}
                        required
                        className="min-h-[100px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Tone</Label>
                        <Select value={formData.tone} onValueChange={(value) => setFormData({ ...formData, tone: value })}>
                          <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500" data-testid="gen-tone">
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

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Channel</Label>
                        <Select value={formData.channel} onValueChange={(value) => setFormData({ ...formData, channel: value })}>
                          <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500" data-testid="gen-channel">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="message">Message</SelectItem>
                            <SelectItem value="call">Call</SelectItem>
                            <SelectItem value="in_person">In Person</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="context" className="text-sm font-medium text-gray-700">
                        Additional Context (optional)
                      </Label>
                      <Input
                        id="context"
                        data-testid="gen-context"
                        placeholder="Additional details for more accurate excuse..."
                        value={formData.context}
                        onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      data-testid="gen-submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-medium"
                      disabled={generating}
                    >
                      {generating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-5 w-5" />
                          Generate Excuse
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Result Section */}
              <div className="space-y-6">
                {result && (
                  <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center space-x-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span>Result</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-100" data-testid="gen-result">
                        <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">{result}</p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyToClipboard}
                          className="flex-1 bg-white/50 backdrop-blur-sm border-gray-200 hover:bg-white/70"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={shareExcuse}
                          className="flex-1 bg-white/50 backdrop-blur-sm border-gray-200 hover:bg-white/70"
                        >
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Features Preview */}
                <Card className="bg-white/60 backdrop-blur-xl border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Multiple channels</p>
                          <p className="text-sm text-gray-600">Email, messages, calls, in-person meetings</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Globe className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Auto language detection</p>
                          <p className="text-sm text-gray-600">Write in any language, get response in same language</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">AI generation</p>
                          <p className="text-sm text-gray-600">Smart and contextual excuses</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Rate Limit Banner */}
            {showRateLimitBanner && (
              <Card className="bg-yellow-50 border-yellow-200 mb-6" data-testid="banner-rate-limit">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium text-yellow-800">Too many requests</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Please wait a moment before making another request.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Free Limit Banner */}
            {showLimitBanner && (
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 mb-6" data-testid="banner-free-limit">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <Crown className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium text-purple-800">Free limit reached</h3>
                      <p className="text-sm text-purple-700 mt-1">
                        Upgrade your account for unlimited excuse generation.
                      </p>
                      <Button 
                        className="mt-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                        onClick={() => window.location.href = '/account'}
                      >
                        Upgrade Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        {/* Auth Modal */}
        {showAuth && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" data-testid="auth-dialog">
              <AuthForm />
              <Button 
                variant="ghost" 
                className="w-full mt-4" 
                onClick={() => setShowAuth(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
