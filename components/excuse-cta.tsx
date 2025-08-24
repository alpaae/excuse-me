'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/use-toast';
import { Heart, Share2, Crown } from 'lucide-react';

interface ExcuseCTAProps {
  excuseId: string;
  text: string;
  isFavorite?: boolean;
  onFavoriteToggle?: (isFavorite: boolean) => void;
}

export function ExcuseCTA({ excuseId, text, isFavorite = false, onFavoriteToggle }: ExcuseCTAProps) {
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/excuses/${excuseId}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: !isFavorite }),
      });

      if (response.ok) {
        showSuccess('Saved to your collection');
        onFavoriteToggle?.(!isFavorite);
      } else {
        showError('Failed to save excuse');
      }
    } catch (error) {
      console.error('Error saving excuse:', error);
      showError('Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    const encodedText = encodeURIComponent(text);
    const shareUrl = `https://wa.me/?text=${encodedText}`;
    
    // Try WhatsApp first, fallback to email
    if (navigator.share) {
      navigator.share({
        title: 'ExcuseME - Excuse',
        text: text,
        url: window.location.origin,
      }).catch(() => {
        // Fallback to WhatsApp
        window.open(shareUrl, '_blank');
      });
    } else {
      // Fallback to WhatsApp
      window.open(shareUrl, '_blank');
    }
  };

  const handleOpenPro = () => {
    window.location.href = '/account';
  };

  return (
    <div className="flex items-center space-x-3 mt-6">
      <Button 
        onClick={handleSave}
        disabled={saving}
        variant="outline"
        className="flex-1 bg-white hover:bg-gray-50 border-gray-200 rounded-xl"
        data-testid="cta-save"
      >
        <Heart className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
        {saving ? 'Saving...' : (isFavorite ? 'Saved' : 'Save')}
      </Button>
      
      <Button 
        onClick={handleShare}
        variant="outline"
        className="flex-1 bg-white hover:bg-gray-50 border-gray-200 rounded-xl"
        data-testid="cta-share"
      >
        <Share2 className="mr-2 h-4 w-4" />
        Share
      </Button>
      
      <Button 
        onClick={handleOpenPro}
        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        data-testid="cta-pro"
      >
        <Crown className="mr-2 h-4 w-4" />
        Open Pro
      </Button>
    </div>
  );
}
