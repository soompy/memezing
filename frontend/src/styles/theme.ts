// 브랜드 컬러 팔레트
export const brandColors = {
  // 메인 브랜드 컬러
  primary: {
    50: '#FFF5F3',
    100: '#FFE6E0',
    200: '#FFD1C7',
    300: '#FFB3A3',
    400: '#FF8B6F',
    500: '#FF6B47', // 메인 브랜드 컬러
    600: '#FF4A1F',
    700: '#E6330A',
    800: '#B8260A',
    900: '#8A1D08',
  },
  
  // 보조 브랜드 컬러
  secondary: {
    50: '#F0FDFC',
    100: '#D9F9F6',
    200: '#B8F2ED',
    300: '#87E8DF',
    400: '#4ECDC4', // 보조 브랜드 컬러
    500: '#1F9B92',
    600: '#1B7F78',
    700: '#16635E',
    800: '#124B47',
    900: '#0F3633',
  },
  
  // 액센트 컬러
  accent: {
    50: '#FFFBEB',
    100: '#FFF2C7',
    200: '#FFE888',
    300: '#FFD93D', // 액센트 컬러
    400: '#FFC107',
    500: '#FF9800',
    600: '#F57C00',
    700: '#E65100',
    800: '#BF360C',
    900: '#8D2F00',
  },
  
  // 그레이 스케일
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#2C3E50', // 메인 텍스트 컬러
    900: '#111827',
  },
  
  // 특수 용도 컬러
  special: {
    gradient: {
      primary: 'linear-gradient(135deg, #FF6B47 0%, #4ECDC4 100%)',
      secondary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      accent: 'linear-gradient(to right, #FFD93D, #FF6B47)',
      purple: 'linear-gradient(to bottom right, #581C87, #1E3A8A, #4C1D95)',
    },
    social: {
      kakao: '#fee500',
      naver: '#03c75a',
    },
  },
};

// 컴포넌트별 컬러 매핑
export const componentColors = {
  // Features 섹션 컬러
  features: {
    blue: {
      bg: brandColors.primary[50],
      icon: brandColors.primary[500],
      accent: brandColors.primary[500],
    },
    purple: {
      bg: brandColors.secondary[50],
      icon: brandColors.secondary[400],
      accent: brandColors.secondary[400],
    },
    green: {
      bg: brandColors.accent[50],
      icon: brandColors.accent[300],
      accent: brandColors.accent[300],
    },
  },
  
  // HowItWorks 스텝 컬러
  steps: [
    {
      color: brandColors.primary[500],
      bgColor: brandColors.primary[50],
    },
    {
      color: brandColors.secondary[400],
      bgColor: brandColors.secondary[50],
    },
    {
      color: brandColors.accent[300],
      bgColor: brandColors.accent[50],
    },
  ],
  
  // 통계 컬러
  stats: [
    { color: brandColors.primary[500] },
    { color: brandColors.secondary[400] },
    { color: brandColors.accent[300] },
  ],
  
  // 관심사 컬러
  interests: [
    { color: '#ec4899', bgColor: '#fdf2f8' }, // 일상/라이프
    { color: '#2563eb', bgColor: '#eff6ff' }, // 소셜/친구
    { color: '#d97706', bgColor: '#fffbeb' }, // 카페/맛집
    { color: '#dc2626', bgColor: '#fef2f2' }, // 음악/엔터
    { color: '#16a34a', bgColor: '#f0fdf4' }, // 사진/여행
    { color: '#4b5563', bgColor: '#f9fafb' }, // 직장/업무
    { color: '#4f46e5', bgColor: '#eef2ff' }, // 학습/교육
    { color: '#ea580c', bgColor: '#fff7ed' }, // 트렌드/이슈
  ],
};

// 기존 테마 색상 정의 (브랜드 컬러 사용)
export const colors = {
  light: {
    // 기본 색상
    primary: brandColors.gray[800],
    secondary: brandColors.gray[500],
    accent: brandColors.primary[500],
    
    // 배경색
    background: '#ffffff',
    surface: brandColors.gray[50],
    surfaceHover: brandColors.gray[100],
    
    // 텍스트 색상
    text: {
      primary: brandColors.gray[800],
      secondary: brandColors.gray[500],
      muted: brandColors.gray[400],
      inverse: '#ffffff',
    },
    
    // 보더 색상
    border: {
      light: brandColors.gray[200],
      medium: brandColors.gray[300],
      dark: brandColors.gray[400],
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

// 유틸리티 함수들
export const getColor = (path: string) => {
  const keys = path.split('.');
  let result: any = brandColors;
  
  for (const key of keys) {
    result = result?.[key];
  }
  
  return result || path;
};

// CSS 변수 생성 헬퍼
export const createCSSVariables = () => {
  const flattenColors = (obj: any, prefix = '') => {
    let vars: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}-${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        vars = { ...vars, ...flattenColors(value, newKey) };
      } else if (typeof value === 'string') {
        vars[`--color-${newKey}`] = value;
      }
    }
    
    return vars;
  };
  
  return {
    ...flattenColors(brandColors),
    ...flattenColors({ gray: brandColors.gray }),
  };
};

// Emotion에서 사용할 테마 객체
export const theme = {
  colors: {
    ...brandColors,
    ...colors.light,
  },
  componentColors,
  transitions,
  zIndex,
} as const;

export type Theme = typeof theme;