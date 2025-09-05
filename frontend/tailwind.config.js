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
          DEFAULT: '#9069eb',  // 모던 보라 - 메인 브랜드 컬러
          50: '#f7f5ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#9069eb',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        secondary: {
          DEFAULT: '#6de0d8',  // 밝은 틸 - 쿨한 균형감
          50: '#f0fffe',
          100: '#ccfbf4',
          200: '#99f6e9',
          300: '#5eead6',
          400: '#6de0d8',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
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