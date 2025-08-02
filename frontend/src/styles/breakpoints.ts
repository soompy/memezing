// 반응형 브레이크포인트 정의
export const breakpoints = {
  xs: '320px',   // Extra small devices (phones)
  sm: '640px',   // Small devices (large phones) 
  md: '768px',   // Medium devices (tablets)
  lg: '1024px',  // Large devices (laptops)
  xl: '1280px',  // Extra large devices (desktops)
  '2xl': '1536px' // 2X large devices (large desktops)
};

// 미디어 쿼리 헬퍼
export const mediaQuery = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
  
  // Max-width 버전
  maxXs: `@media (max-width: ${parseInt(breakpoints.sm) - 1}px)`,
  maxSm: `@media (max-width: ${parseInt(breakpoints.md) - 1}px)`,
  maxMd: `@media (max-width: ${parseInt(breakpoints.lg) - 1}px)`,
  maxLg: `@media (max-width: ${parseInt(breakpoints.xl) - 1}px)`,
  
  // 터치 디바이스 감지
  touch: '@media (hover: none) and (pointer: coarse)',
  hover: '@media (hover: hover) and (pointer: fine)',
};

// 컨테이너 최대 너비
export const containerMaxWidth = {
  sm: '640px',
  md: '768px', 
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};