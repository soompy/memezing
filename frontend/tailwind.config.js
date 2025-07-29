/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // 밈징어 브랜드 컬러 시스템
        primary: {
          DEFAULT: '#FF6B47',  // 코랄 오렌지 - 메인 브랜드 컬러
          50: '#FFF5F3',
          100: '#FFE6E0',
          200: '#FFD1C7',
          300: '#FFB3A3',
          400: '#FF8B6F',
          500: '#FF6B47',  
          600: '#FF4A1F',
          700: '#E6330A',
          800: '#CC2E09',
          900: '#A82A0A',
        },
        secondary: {
          DEFAULT: '#4ECDC4',  // 틸 블루 - 쿨한 균형감
          50: '#F0FDFC',
          100: '#D9F9F6',
          200: '#B8F2ED', 
          300: '#87E8DF',
          400: '#4ECDC4',
          500: '#2BB8AC',
          600: '#1F9B92',
          700: '#1B7F78',
          800: '#186660',
          900: '#165650',
        },
        accent: {
          DEFAULT: '#FFD93D',  // 선샤인 옐로 - 재미있는 포인트
          50: '#FFFBEB',
          100: '#FFF4C6',
          200: '#FFE888',
          300: '#FFD93D',
          400: '#FFC107',
          500: '#FFAB00',
          600: '#FF8F00',
          700: '#FF6F00',
          800: '#E65100',
          900: '#BF360C',
        },
        text: {
          DEFAULT: '#2C3E50',  // 다크 네이비 - 고급스러운 텍스트
          50: '#F8F9FA',
          100: '#E9ECEF', 
          200: '#DEE2E6',
          300: '#CED4DA',
          400: '#6C757D',
          500: '#495057',
          600: '#343A40',
          700: '#2C3E50',
          800: '#212529',
          900: '#1A1D20',
        },
      },
      animation: {
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
      },
    },
  },
  plugins: [],
};