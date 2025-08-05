# 🎭 밈징 - 한국 문화 특화 밈 생성 플랫폼

> **Version 1.2.0** - 2024.08.05 업데이트

한국 문화에 특화된 밈 생성 및 공유 플랫폼입니다.

## 🎯 최신 업데이트 하이라이트

### v1.2.0 (2024.08.05)
- ✨ **디자인시스템 기반 Checkbox 컴포넌트** 추가
- 🔧 **SSR 하이드레이션 오류** 완전 해결
- 🎨 **CSS-in-JS keyframes 오류** 수정
- 🔧 **모달 오버레이 opacity** 0.5로 통일
- ♻️ **Input 컴포넌트 표준화** 완료
- 📚 **Components 페이지** 확장 (Checkbox 데모 추가)
- 🚀 **Vercel 프로덕션 배포** 완료

### 🌐 배포된 사이트
- **Production**: [https://frontend-z52wglvg9-suris-projects.vercel.app](https://frontend-z52wglvg9-suris-projects.vercel.app)
- **Components Demo**: [/components](https://frontend-z52wglvg9-suris-projects.vercel.app/components)

## 🚀 프로젝트 구조

```
memezing/
├── frontend/          # Next.js 프론트엔드
├── backend/           # Express.js 백엔드
└── README.md
```

## 🛠️ 기술 스택

### Frontend
- **Next.js 15.4.4** (App Router)
- **TypeScript**
- **Tailwind CSS** + **Emotion** (Styled Components)
- **Fabric.js** (캔버스 편집)
- **React Query** (서버 상태 관리)
- **Zustand** (클라이언트 상태 관리)
- **Framer Motion** (애니메이션)
- **NextAuth.js** (인증)
- **Prisma** (ORM)

### Backend
- **Node.js + Express**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**
- **Redis**
- **Cloudinary**

## 🏃‍♂️ 시작하기

### 1. 환경 설정

#### Backend 환경 설정
```bash
cd backend
cp .env.example .env
# .env 파일을 수정하여 실제 값들을 입력하세요
```

#### Frontend 환경 설정
```bash
cd frontend
cp .env.local.example .env.local
# .env.local 파일을 수정하여 실제 값들을 입력하세요
```

### 2. 개발 서버 실행

#### Backend 서버
```bash
cd backend
npm run dev
```

#### Frontend 서버
```bash
cd frontend
npm run dev
```

## 📋 주요 기능

### 🎨 핵심 기능
- **밈 생성기**: 드래그앤드롭 기반 캔버스 편집 (데스크톱/모바일)
- **템플릿 갤러리**: 한국 인기 밈 템플릿 제공
- **사용자 계정**: 회원가입/로그인 (소셜 로그인 지원)
- **갤러리**: 인기 밈 조회 및 피드
- **공유 기능**: SNS 공유 및 다운로드

### 🔧 시스템 기능
- **디자인시스템**: 일관된 UI 컴포넌트 라이브러리
- **반응형 디자인**: 모바일/데스크톱 최적화
- **SSR 지원**: Next.js 기반 서버사이드 렌더링
- **컴포넌트 데모**: `/components` 페이지에서 모든 UI 확인 가능

## 🎯 개발 현황

### ✅ 완료된 기능
- [x] 프로젝트 초기 설정
- [x] 인증 시스템 구현 (NextAuth.js)
- [x] 디자인시스템 및 UI 컴포넌트 라이브러리
- [x] 밈 생성기 핵심 기능 (데스크톱/모바일)
- [x] 갤러리 기능
- [x] 사용자 프로필 시스템
- [x] 반응형 디자인
- [x] SSR 하이드레이션 최적화
- [x] Vercel 프로덕션 배포

### 🚧 진행 중
- [ ] 템플릿 시스템 확장
- [ ] 검색/필터링 고도화
- [ ] 커뮤니티 기능
- [ ] AI 텍스트 생성 기능

### 📋 예정된 기능
- [ ] 실시간 협업 편집
- [ ] 밈 챌린지/콘테스트
- [ ] 고급 편집 도구
- [ ] 모바일 앱 개발

## 🏗️ 프로젝트 아키텍처

```
밈징 플랫폼
├── 프론트엔드 (Next.js 15)
│   ├── 페이지 라우팅 (App Router)
│   ├── UI 컴포넌트 라이브러리
│   ├── 상태 관리 (Zustand)
│   ├── 인증 (NextAuth.js)
│   └── 스타일링 (Tailwind + Emotion)
├── 백엔드 (Express.js)
│   ├── REST API
│   ├── 데이터베이스 (Prisma + PostgreSQL)
│   └── 파일 저장 (Cloudinary)
└── 배포
    ├── 프론트엔드: Vercel
    └── 백엔드: 추후 결정
```

## 📊 성능 지표

### 번들 크기 최적화
- 홈페이지: 12.6 kB
- 로그인: 4.89 kB (이전 7.64 kB)
- 회원가입: 4.8 kB (이전 5.31 kB)
- 밈 생성기: 22.3 kB
- 컴포넌트 데모: 8.14 kB

### 기술적 개선사항
- ✅ SSR 하이드레이션 오류 해결
- ✅ CSS-in-JS 최적화
- ✅ 컴포넌트 재사용성 향상
- ✅ 타입 안전성 확보

## 📚 개발 가이드

### 컴포넌트 사용법
프로젝트의 모든 UI 컴포넌트는 `/components` 페이지에서 확인할 수 있습니다:
```
https://frontend-z52wglvg9-suris-projects.vercel.app/components
```

### 디자인 시스템
- **컬러**: Primary (#FF6B47), Secondary (#4ECDC4), Accent (#FFD93D)
- **컴포넌트**: Button, Input, Select, Checkbox, TabGroup, RangeSlider
- **반응형**: Mobile-first 접근방식

## 📄 라이선스

MIT License

---

> 🚀 **프로덕션 사이트**: [https://memezing.vercel.app](https://memezing.vercel.app)  
> 📚 **컴포넌트 데모**: [/components](https://memezing.vercel.app/components)  
> 📅 **마지막 업데이트**: 2024.08.05