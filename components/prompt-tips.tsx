'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Lightbulb, MessageSquare, Clock, Users, Target } from 'lucide-react';

export function PromptTips() {
  const [isExpanded, setIsExpanded] = useState(false);

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
    <div className="mb-6">
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-blue-700 font-medium"
      >
        <div className="flex items-center space-x-2">
          <Lightbulb className="h-4 w-4" />
          <span>How to write better prompts</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {isExpanded && (
        <Card className="mt-3 border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="grid gap-3">
              {tips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="text-blue-600">
                      {tip.icon}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 text-sm">{tip.title}</h4>
                    <p className="text-blue-700 text-sm">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
              <h4 className="font-semibold text-gray-900 text-sm mb-2">Example:</h4>
              <p className="text-gray-700 text-sm italic">
                &ldquo;I need to cancel my dentist appointment tomorrow at 3 PM because I have an urgent work meeting that just came up&rdquo;
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
