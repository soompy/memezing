'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, DollarSign, Rocket } from 'lucide-react';
import { memeCoinTexts } from '@/data/memeCoinTemplates';

interface MemeCoinTextSuggestionsProps {
  coinId: string;
  coinName: string;
  onTextSelect: (text: string) => void;
  className?: string;
}

// 밈코인별 추가 텍스트 제안
const defaultMemeCoinTexts = [
  'TO THE MOON! 🚀',
  'HODL STRONG 💎🙌',
  'DIAMOND HANDS',
  'BUY THE DIP',
  'MOON SOON',
  'BULLISH AF 📈',
  'WAGMI (WE ALL GONNA MAKE IT)',
  'LFG (LET\'S F*CKING GO)',
  'APE IN 🦍',
  'THIS IS THE WAY',
  'PUMP IT UP',
  'NEVER SELLING',
  'COMMUNITY STRONG',
  '1000X INCOMING',
  'MEME COIN KING',
  'CRYPTO VIBES ONLY'
];

// 감정별 텍스트 카테고리
const textCategories = [
  {
    id: 'bullish',
    name: '강세장',
    icon: TrendingUp,
    color: 'from-green-400 to-emerald-500',
    texts: [
      'TO THE MOON! 🚀',
      'BULLISH AF 📈',
      'PUMP IT UP',
      '1000X INCOMING',
      'MOON SOON'
    ]
  },
  {
    id: 'hodl',
    name: 'HODL',
    icon: DollarSign,
    color: 'from-blue-400 to-cyan-500',
    texts: [
      'HODL STRONG 💎🙌',
      'DIAMOND HANDS',
      'NEVER SELLING',
      'THIS IS THE WAY',
      'WAGMI'
    ]
  },
  {
    id: 'hype',
    name: '흥분',
    icon: Zap,
    color: 'from-purple-400 to-pink-500',
    texts: [
      'LFG!!! 🔥',
      'APE IN 🦍',
      'MEME COIN KING',
      'CRYPTO VIBES ONLY',
      'COMMUNITY STRONG'
    ]
  },
  {
    id: 'opportunity',
    name: '기회',
    icon: Rocket,
    color: 'from-yellow-400 to-orange-500',
    texts: [
      'BUY THE DIP',
      'LAST CHANCE',
      'EARLY BIRD',
      'NEXT GEM 💎',
      'DON\'T MISS OUT'
    ]
  }
];

const MemeCoinTextSuggestions: React.FC<MemeCoinTextSuggestionsProps> = ({
  coinId,
  coinName,
  onTextSelect,
  className = ''
}) => {
  // 코인별 특화 텍스트 가져오기
  const coinSpecificTexts = memeCoinTexts[coinId as keyof typeof memeCoinTexts] || [];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 코인별 특화 텍스트 */}
      {coinSpecificTexts.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            {coinName} 전용 텍스트
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {coinSpecificTexts.map((text, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onTextSelect(text)}
                className="p-2 text-xs bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-md transition-all duration-200 hover:scale-105"
              >
                {text}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* 카테고리별 텍스트 */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">텍스트 카테고리</h4>
        {textCategories.map((category, categoryIndex) => {
          const IconComponent = category.icon;
          
          return (
            <div key={category.id}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg bg-gradient-to-r ${category.color}`}>
                  <IconComponent size={12} className="text-white" />
                </div>
                <span className="text-xs font-medium text-gray-600">
                  {category.name}
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-1.5">
                {category.texts.map((text, textIndex) => (
                  <motion.button
                    key={`${category.id}-${textIndex}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      delay: (categoryIndex * 0.1) + (textIndex * 0.03)
                    }}
                    onClick={() => onTextSelect(text)}
                    className={`
                      p-2 text-xs text-left rounded-lg transition-all duration-200
                      bg-gradient-to-r ${category.color} text-white opacity-90
                      hover:opacity-100 hover:shadow-md hover:scale-102
                    `}
                  >
                    {text}
                  </motion.button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 일반적인 밈코인 텍스트 */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          일반 밈코인 텍스트
        </h4>
        <div className="grid grid-cols-2 gap-1.5">
          {defaultMemeCoinTexts.slice(0, 8).map((text, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + (index * 0.05) }}
              onClick={() => onTextSelect(text)}
              className="p-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 hover:scale-105"
            >
              {text}
            </motion.button>
          ))}
        </div>
      </div>

      {/* 사용 팁 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
        <div className="flex items-start gap-2">
          <Zap size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700">
            <p className="font-medium mb-1">💡 팁</p>
            <p>밈코인 커뮤니티에서 인기 있는 표현들을 사용해보세요. 대문자와 이모지를 활용하면 더 임팩트 있는 밈을 만들 수 있어요!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemeCoinTextSuggestions;