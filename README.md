# 🎭 밈징 - 한국 문화 특화 밈 생성 플랫폼

한국 문화에 특화된 밈 생성 및 공유 플랫폼입니다.

## 🚀 프로젝트 구조

```
memezing/
├── frontend/          # Next.js 프론트엔드
├── backend/           # Express.js 백엔드
└── README.md
```

## 🛠️ 기술 스택

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Fabric.js** (캔버스 편집)
- **React Query** (서버 상태 관리)
- **Zustand** (클라이언트 상태 관리)

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

## 📋 주요 기능 (MVP)

- 🎨 **밈 생성기**: 드래그앤드롭 기반 캔버스 편집
- 🖼️ **템플릿 갤러리**: 한국 인기 밈 템플릿
- 👤 **사용자 계정**: 회원가입/로그인
- 📱 **갤러리**: 인기 밈 조회 및 피드
- 🔗 **공유 기능**: SNS 공유 및 다운로드

## 🎯 개발 로드맵 (3개월)

### 1개월차 - 기초 구축
- [x] 프로젝트 초기 설정
- [ ] 인증 시스템 구현
- [ ] 기본 UI 컴포넌트 개발
- [ ] 밈 생성기 핵심 기능

### 2개월차 - 핵심 기능
- [ ] 템플릿 시스템
- [ ] 갤러리 기능
- [ ] 검색/필터링
- [ ] 공유 기능

### 3개월차 - 완성도 향상
- [ ] 성능 최적화
- [ ] 테스팅
- [ ] 배포 및 런칭

## 📄 라이선스

MIT License