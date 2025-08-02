// 테마 색상 정의
export const colors = {
  light: {
    // 기본 색상
    primary: '#1f2937',
    secondary: '#6b7280',
    accent: '#3b82f6',
    
    // 배경색
    background: '#ffffff',
    surface: '#f9fafb',
    surfaceHover: '#f3f4f6',
    
    // 텍스트 색상
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
      muted: '#9ca3af',
      inverse: '#ffffff',
    },
    
    // 보더 색상
    border: {
      light: '#e5e7eb',
      medium: '#d1d5db',
      dark: '#9ca3af',
    },
    
    // 상태 색상
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    // 오버레이
    overlay: 'rgba(0, 0, 0, 0.5)',
    
    // 그림자
    shadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
  },
  
  dark: {
    // 기본 색상
    primary: '#ffffff',
    secondary: '#9ca3af',
    accent: '#60a5fa',
    
    // 배경색
    background: '#111827',
    surface: '#1f2937',
    surfaceHover: '#374151',
    
    // 텍스트 색상
    text: {
      primary: '#ffffff',
      secondary: '#d1d5db',
      muted: '#9ca3af',
      inverse: '#1f2937',
    },
    
    // 보더 색상
    border: {
      light: '#374151',
      medium: '#4b5563',
      dark: '#6b7280',
    },
    
    // 상태 색상
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#60a5fa',
    
    // 오버레이
    overlay: 'rgba(0, 0, 0, 0.7)',
    
    // 그림자
    shadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
    },
  },
} as const;

// 애니메이션 지속시간
export const transitions = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
} as const;

// Z-index 레벨
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  toast: 1070,
} as const;