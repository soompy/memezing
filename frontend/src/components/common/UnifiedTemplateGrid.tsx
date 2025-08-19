'use client';

import React from 'react';
import ProxiedImage from '@/components/ui/ProxiedImage';
import type { MemeTemplate } from '@/components/meme/FabricCanvas';

interface UnifiedTemplateGridProps {
  templates: MemeTemplate[];
  selectedTemplate: MemeTemplate | null;
  onTemplateSelect: (template: MemeTemplate) => void;
  isLoading?: boolean;
  onSidebarClose?: () => void;
}

const UnifiedTemplateGrid: React.FC<UnifiedTemplateGridProps> = ({
  templates,
  selectedTemplate,
  onTemplateSelect,
  isLoading = false,
  onSidebarClose
}) => {
  const handleTemplateSelect = (template: MemeTemplate) => {
    onTemplateSelect(template);
    onSidebarClose?.();
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">템플릿 선택</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {templates.map((template) => {
          const isSelected = selectedTemplate?.id === template.id;
          
          return (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              disabled={isLoading}
              className={`
                group relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300
                ${isSelected 
                  ? 'border-primary-500 ring-2 ring-primary-200 scale-105 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md hover:scale-102'
                }
                bg-white
              `}
            >
              {/* 템플릿 이미지 */}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <ProxiedImage
                  src={template.url}
                  alt={template.name}
                  fallbackCategory="default"
                  className="w-full h-full group-hover:scale-110 transition-transform duration-300"
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

              {/* 템플릿 정보 */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-2">
                <p className="text-xs font-bold truncate">{template.name}</p>
              </div>

              {/* 호버 효과 */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default UnifiedTemplateGrid;