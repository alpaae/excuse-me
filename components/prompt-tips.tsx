'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, MessageSquare, Clock, Users, Target, X } from 'lucide-react';

export function PromptTips() {
  const [showModal, setShowModal] = useState(false);

  const tips = [
    {
      icon: <MessageSquare className="h-4 w-4" />,
      title: "Be Specific",
      description: "Instead of 'I can't come', try 'I can't attend the team meeting tomorrow at 2 PM'"
    },
    {
      icon: <Clock className="h-4 w-4" />,
      title: "Include Timing",
      description: "Mention when you need the excuse for - today, tomorrow, next week"
    },
    {
      icon: <Users className="h-4 w-4" />,
      title: "Consider the Audience",
      description: "Think about who you're talking to - boss, friend, family member"
    },
    {
      icon: <Target className="h-4 w-4" />,
      title: "Add Context",
      description: "Include relevant details like location, event type, or relationship"
    }
  ];

  return (
    <>
      <div className="mb-3">
        <Button
          variant="ghost"
          onClick={() => setShowModal(true)}
          className="w-full flex items-center justify-center p-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-700 font-medium text-sm"
        >
          <Lightbulb className="h-4 w-4 mr-2" />
          <span>How to write better prompts</span>
        </Button>
      </div>

      {/* Prompt Tips Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">How to Write Better Prompts</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6">
              <div className="grid gap-4">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="text-blue-600">
                        {tip.icon}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">{tip.title}</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-gray-900 text-sm mb-2">Example:</h4>
                <p className="text-gray-700 text-sm italic leading-relaxed">
                  &ldquo;I need to cancel my dentist appointment tomorrow at 3 PM because I have an urgent work meeting that just came up&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
