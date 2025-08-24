'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, ArrowRight, CheckCircle } from 'lucide-react';
import { PromptTips } from '@/components/prompt-tips';
import { ExcuseCard } from '@/components/excuse-card';
import { LegendaryPop } from '@/components/legendary-pop';

export function CreatePanel() {
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
    <div className="max-w-[640px] w-full mx-auto h-full flex flex-col" data-testid="panel-create">
      <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-2xl overflow-hidden flex-1 flex flex-col max-h-full">
        {!result ? (
          // Form State
          <>
            <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
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
            
            <CardContent className="p-6 flex-1 flex flex-col">
              <form onSubmit={handleGenerate} className="flex-1 flex flex-col" data-testid="gen-form">
                {/* Scrollable Form Content */}
                <div className="flex-1 overflow-y-auto space-y-6 pr-2">
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
                </div>

                {/* Fixed Generate Button */}
                <div className="flex-shrink-0 pt-4 border-t border-gray-100 bg-white/70 backdrop-blur mt-4">
                  <div className="flex items-center justify-between mb-2">
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
              </form>
            </CardContent>
          </>
        ) : (
          // Result State
          <>
            <CardHeader className="pb-6 bg-gradient-to-r from-green-50 to-emerald-50 flex-shrink-0">
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
            
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto">
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
              </div>
              
              <div className="flex-shrink-0 pt-4 border-t border-gray-100 mt-4">
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
              </div>
            </CardContent>
          </>
        )}
      </Card>

      {/* Legendary Pop */}
      {showLegendaryPop && (
        <LegendaryPop onComplete={() => setShowLegendaryPop(false)} />
      )}
    </div>
  );
}
