'use client';

import React, { useState } from 'react';
import { Coins, TrendingUp, Users, Zap, Star } from 'lucide-react';
import type { MemeTemplate } from './FabricCanvas';

// 간단한 밈코인 데이터
const memeCoinTemplates = [
  {
    id: 'pepe-coin',
    name: 'PEPE 코인',
    url: 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: 'HODL PEPE' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: '🚀 TO THE MOON' }
    ]
  },
  {
    id: 'doge-coin',
    name: 'DOGE 코인',
    url: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
    textBoxes: [
      { x: 50, y: 30, width: 150, height: 40, defaultText: 'such crypto' },
      { x: 250, y: 80, width: 120, height: 40, defaultText: 'much hodl' },
      { x: 30, y: 200, width: 140, height: 40, defaultText: 'very moon' },
      { x: 280, y: 250, width: 100, height: 40, defaultText: 'wow' }
    ]
  },
  {
    id: 'shiba-coin',
    name: 'SHIB 코인',
    url: 'https://assets.coingecko.com/coins/images/11939/large/shiba.png',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: 'SHIBA ARMY STRONG' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: 'BURNING SHIB 🔥' }
    ]
  },
  {
    id: 'bonk-coin',
    name: 'BONK 코인',
    url: 'https://assets.coingecko.com/coins/images/28600/large/bonk.jpg',
    textBoxes: [
      { x: 10, y: 10, width: 380, height: 60, defaultText: 'BONK IT UP!' },
      { x: 10, y: 320, width: 380, height: 60, defaultText: 'SOLANA MEME KING 👑' }
    ]
  }
];

interface MemeCoinSelectorProps {
  onCoinSelect: (template: MemeTemplate) => void;
  selectedCoin?: MemeTemplate | null;
  className?: string;
}

const MemeCoinSelector: React.FC<MemeCoinSelectorProps> = ({
  onCoinSelect,
  selectedCoin,
  className = ''
}) => {

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 코인 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {memeCoinTemplates.map((coin) => {
          const isSelected = selectedCoin?.id === coin.id;
          
          return (
            <button
              key={coin.id}
              onClick={() => onCoinSelect(coin)}
              className={`
                group relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300
                ${isSelected 
                  ? 'border-primary-500 ring-2 ring-primary-200 scale-105 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md hover:scale-102'
                }
                bg-white
              `}
            >
              {/* 코인 이미지 */}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <img
                  src={coin.url}
                  alt={coin.name}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* 선택 표시 */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              )}

              {/* 코인 정보 */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-2">
                <p className="text-xs font-bold truncate">{coin.name}</p>
              </div>

              {/* 호버 효과 */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

              {/* 인기 배지 */}
              {(coin.id.includes('doge') || coin.id.includes('pepe')) && (
                <div className="absolute top-2 left-2">
                  <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    HOT
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
};

export default MemeCoinSelector;