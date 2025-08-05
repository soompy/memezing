# 🎭 밈징 - 한국 문화 특화 밈 생성 플랫폼

> **Version 1.3.0** - 2025.08.05 업데이트

한국 문화에 특화된 밈 생성 및 공유 플랫폼입니다.

## 🎯 최신 업데이트 하이라이트

### v1.3.0 (2025.08.05)
- 🔧 **Frontend-Backend 통합 배포** 완료
- 🚀 **단일 Vercel 프로젝트**로 통합 관리
- 🔐 **Next.js API Routes** 기반 인증 시스템 추가
- 📁 **파일 업로드 API** (이미지/템플릿) 구현
- 🎨 **관심사 선택 팝업 UI** 개선
- ⚡ **배포 프로세스** 단순화

### 🌐 배포된 사이트
- **Production**: [https://memezing-6nn2g8yhr-suris-projects.vercel.app/](https://memezing-6nn2g8yhr-suris-projects.vercel.app/)
- **Components Demo**: [/components](https://memezing-6nn2g8yhr-suris-projects.vercel.app/components)

## 🚀 프로젝트 구조

```
memezing/
├── frontend/                    # Next.js App Router 기반 프론트엔드
│   ├── src/app/api/            # 통합된 API Routes (인증, 업로드)
│   ├── src/components/         # 재사용 가능한 UI 컴포넌트
│   └── prisma/                 # 데이터베이스 스키마
├── backend/                    # 레거시 Express.js (API Routes로 이전 완료)
├── vercel.json                 # 통합 배포 설정
└── README.md
```

## 🛠️ 기술 스택

### Frontend & API
- **Next.js 15.4.4** (App Router + API Routes)
- **TypeScript**
- **Tailwind CSS** + **Emotion** (Styled Components)
- **Fabric.js** (캔버스 편집)
- **React Query** (서버 상태 관리)
- **Zustand** (클라이언트 상태 관리)
- **Framer Motion** (애니메이션)
- **NextAuth.js** + **Custom JWT** (하이브리드 인증)
- **Prisma** (ORM)
- **Cloudinary** (이미지 저장)
- **bcrypt** (비밀번호 해시)

### Infrastructure
- **Vercel** (통합 배포 플랫폼)
- **PostgreSQL** (데이터베이스)
- **Serverless Functions** (API 처리)

## 🏃‍♂️ 시작하기

### 1. 환경 설정

```bash
# 프로젝트 클론
git clone https://github.com/soompy/memezing.git
cd memezing

# Frontend 환경 설정
cd frontend
cp .env.local.example .env.local
# .env.local 파일을 수정하여 실제 값들을 입력하세요
```

#### 필수 환경변수
```env
# Database
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_database_url

# Auth
JWT_SECRET=your_jwt_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# OAuth (선택)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# OpenAI (선택)
OPENAI_API_KEY=your_openai_key
```

### 2. 개발 서버 실행

```bash
cd frontend
npm install
npm run dev
```

### 3. 배포

```bash
# GitHub에 푸시
git add .
git commit -m "변경사항"
git push origin main

# Vercel 배포 (루트에서)
cd ../
npx vercel --prod
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
- [x] **통합 배포 시스템** (Frontend + Backend → Single Vercel Project)
- [x] **하이브리드 인증 시스템** (NextAuth.js + Custom JWT)
- [x] **Next.js API Routes** 기반 백엔드 API
- [x] **파일 업로드 시스템** (Cloudinary 연동)
- [x] 디자인시스템 및 UI 컴포넌트 라이브러리
- [x] 밈 생성기 핵심 기능 (데스크톱/모바일)
- [x] 갤러리 기능
- [x] 사용자 프로필 시스템
- [x] 반응형 디자인
- [x] SSR 하이드레이션 최적화

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
밈징 플랫폼 (통합 아키텍처)
├── Next.js 15 App Router
│   ├── 🎨 프론트엔드
│   │   ├── 페이지 라우팅 (App Router)
│   │   ├── UI 컴포넌트 라이브러리
│   │   ├── 상태 관리 (Zustand)
│   │   └── 스타일링 (Tailwind + Emotion)
│   └── 🔧 백엔드 (API Routes)
│       ├── /api/auth/* (인증 API)
│       ├── /api/upload/* (파일 업로드)
│       ├── /api/memes (밈 관리)
│       └── /api/community/* (커뮤니티)
├── 🗄️ 데이터베이스
│   ├── Prisma ORM
│   └── PostgreSQL
├── ☁️ 파일 저장
│   └── Cloudinary
└── 🚀 배포
    └── Vercel (통합 배포)
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

### API 엔드포인트
```
# 인증 API
POST /api/auth/register    # 회원가입
POST /api/auth/login       # 로그인
GET  /api/auth/me          # 사용자 정보

# 파일 업로드 API
POST /api/upload/image     # 이미지 업로드
POST /api/upload/template  # 템플릿 업로드

# NextAuth.js
GET/POST /api/auth/[...nextauth]  # 소셜 로그인
```

### 컴포넌트 사용법
프로젝트의 모든 UI 컴포넌트는 `/components` 페이지에서 확인할 수 있습니다:
```
https://memezing-6nn2g8yhr-suris-projects.vercel.app/components
```

### 디자인 시스템
- **컬러**: Primary (#FF6B47), Secondary (#4ECDC4), Accent (#FFD93D)
- **컴포넌트**: Button, Input, Select, Checkbox, TabGroup, RangeSlider
- **반응형**: Mobile-first 접근방식

## 📄 라이선스

MIT License

---

> 🚀 **프로덕션 사이트**: [https://memezing-6nn2g8yhr-suris-projects.vercel.app](https://memezing-6nn2g8yhr-suris-projects.vercel.app)  
> 📚 **컴포넌트 데모**: [/components](https://memezing-6nn2g8yhr-suris-projects.vercel.app/components)  
> 📅 **마지막 업데이트**: 2025.08.05

## 🔧 통합 배포 아키텍처

이 프로젝트는 **Frontend + Backend를 단일 Vercel 프로젝트**로 통합하여 배포하는 현대적인 접근방식을 채택했습니다:

- ✅ **단일 도메인**: 하나의 URL로 전체 서비스 제공
- ✅ **환경변수 통합**: 한 곳에서 모든 설정 관리
- ✅ **배포 간소화**: 한 번의 배포로 프론트엔드+백엔드 동시 업데이트
- ✅ **비용 최적화**: Vercel의 Serverless Functions 활용