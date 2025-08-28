'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Crown, Zap, X, Star, Calendar, Infinity } from 'lucide-react';

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (plan: 'monthly' | 'pack100') => void;
}

const plans = [
  {
    id: 'monthly',
    name: 'Pro Monthly',
    price: '$9.99',
    period: 'per month',
    features: ['Unlimited generations', 'Priority support', 'Advanced features'],
    icon: <Infinity className="h-5 w-5" />,
    popular: true,
    gradient: 'from-purple-600 to-blue-600'
  },
  {
    id: 'pack100',
    name: '100 Generations Pack',
    price: '$4.99',
    period: 'one-time',
    features: ['100 generations', 'No expiration', 'Perfect for occasional use'],
    icon: <Zap className="h-5 w-5" />,
    popular: false,
    gradient: 'from-green-600 to-emerald-600'
  }
];

export function LimitReachedModal({ isOpen, onClose, onUpgrade }: LimitReachedModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Free Limit Reached! 🎯
          </CardTitle>
          <p className="text-gray-600 mt-2">
            You've used all 3 free generations today. Choose a plan to continue creating excuses:
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Plans */}
          <div className="grid md:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${
                  plan.popular 
                    ? 'border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => onUpgrade(plan.id as 'monthly' | 'pack100')}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
                    Most Popular
                  </Badge>
                )}
                
                <div className="text-center">
                  <div className={`w-12 h-12 bg-gradient-to-r ${plan.gradient} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    {plan.icon}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500 text-sm ml-1">{plan.period}</span>
                  </div>
                  
                  <ul className="space-y-2 text-sm text-gray-600">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center justify-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Free plan reminder */}
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Free plan resets daily</span>
            </div>
            <p className="text-xs text-gray-500">
              Your 3 free generations will be available again tomorrow
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button
              onClick={() => onUpgrade('monthly')}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Crown className="h-4 w-4 mr-2" />
              Get Pro Monthly
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for check icon
function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}

// Helper component for alert icon
function AlertCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );
}
