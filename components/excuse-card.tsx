'use client';

import { Badge } from '@/components/ui/badge';
import { getRarityInfo, type Rarity } from '@/lib/rarity';

interface ExcuseCardProps {
  text: string;
  rarity: Rarity;
  className?: string;
}

export function ExcuseCard({ text, rarity, className = '' }: ExcuseCardProps) {
  const rarityInfo = getRarityInfo(rarity);

  return (
    <div className={`bg-gray-50 rounded-xl p-6 ${className}`}>
      {/* Rarity Badge */}
      <div className="mb-4 flex justify-center">
        <Badge 
          className={`${rarityInfo.color} ${rarityInfo.textColor} ${rarityInfo.borderColor} ${rarityInfo.glow} border-2 px-3 py-1 text-sm font-semibold`}
          data-testid="rarity-badge"
        >
          <span className="mr-1">{rarityInfo.icon}</span>
          {rarityInfo.label}
        </Badge>
      </div>

      {/* Excuse Text */}
      <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
        {text}
      </p>
    </div>
  );
}
