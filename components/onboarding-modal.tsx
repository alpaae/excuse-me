'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wand2, MessageSquare, Crown, Sparkles, ArrowRight, X } from 'lucide-react';

const ONBOARDING_KEY = 'onboarding:v1';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const steps: OnboardingStep[] = [
  {
    title: "Welcome to ExcuseME 🎭",
    description: "Your AI-powered excuse generator that crafts polite, believable excuses for any situation.",
    icon: <Sparkles className="h-8 w-8" />,
    color: "from-blue-600 to-purple-600"
  },
  {
    title: "Describe Your Situation",
    description: "Tell us what you need an excuse for - work, social events, appointments, or anything else.",
    icon: <MessageSquare className="h-8 w-8" />,
    color: "from-purple-600 to-pink-600"
  },
  {
    title: "Choose Tone & Channel",
    description: "Pick the right tone (professional, friendly, formal, casual) and how you'll deliver it.",
    icon: <Wand2 className="h-8 w-8" />,
    color: "from-pink-600 to-red-600"
  },
  {
    title: "Get Your Excuse",
    description: "Receive a polished, believable excuse instantly. Free plan gives 3 per day, Pro removes limits.",
    icon: <Crown className="h-8 w-8" />,
    color: "from-green-600 to-emerald-600"
  }
];

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem(ONBOARDING_KEY);
      if (!completed) {
        // Show modal after a short delay
        const timer = setTimeout(() => setIsOpen(true), 500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsOpen(false);
    localStorage.setItem(ONBOARDING_KEY, 'true');
  };

  const handleSkip = () => {
    handleComplete();
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white rounded-2xl shadow-2xl border-0">
        {/* Header */}
        <DialogHeader className="relative p-6 pb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="text-center">
            <div className={`w-16 h-16 bg-gradient-to-br ${currentStepData.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
              <div className="text-white">
                {currentStepData.icon}
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
              {currentStepData.title}
            </DialogTitle>
            <p className="text-gray-600 leading-relaxed">
              {currentStepData.description}
            </p>
          </div>
        </DialogHeader>

        {/* Progress */}
        <div className="px-6 pb-4">
          <div className="flex justify-center space-x-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              className={`flex-1 bg-gradient-to-r ${currentStepData.color} hover:opacity-90 text-white`}
            >
              {isLastStep ? (
                <>
                  Get Started
                  <Sparkles className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* Skip Link */}
          <div className="text-center mt-4">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Skip tutorial
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
