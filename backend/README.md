# 밈징(Memezing) 백엔드

밈 생성 및 공유 소셜 플랫폼 백엔드 API 서버입니다.

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정
`.env` 파일을 생성하고 다음 내용을 입력하세요:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/memezing"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Redis (선택사항)
REDIS_URL="redis://localhost:6379"

# Cloudinary (이미지 업로드)
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# API
PORT=5000
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:3000"
```

### 3. 데이터베이스 설정
```bash
# PostgreSQL 설치 (macOS)
brew install postgresql
brew services start postgresql
createdb memezing

# 또는 자세한 설정 가이드 확인
cat scripts/setup-database.md
```

### 4. 데이터베이스 초기화
```bash
# Prisma 클라이언트 생성
npm run db:generate

# 스키마 적용
npm run db:push

# 테스트 데이터 생성 (선택사항)
npm run db:seed
```

### 5. 개발 서버 실행
```bash
npm run dev
```

서버가 `http://localhost:5000`에서 실행됩니다.

## 📝 사용 가능한 스크립트

- `npm run dev` - 개발 서버 시작 (nodemon 사용)
- `npm run build` - TypeScript 컴파일
- `npm start` - 빌드된 서버 실행
- `npm run db:generate` - Prisma 클라이언트 생성
- `npm run db:push` - 스키마를 데이터베이스에 적용
- `npm run db:seed` - 테스트 데이터 생성
- `npm run db:reset` - 데이터베이스 초기화
- `npm run db:studio` - Prisma Studio 실행 (데이터베이스 GUI)
- `npm run db:check` - 데이터베이스 연결 및 상태 확인

## 🏗️ 프로젝트 구조

```
backend/
├── src/
│   ├── config/          # 설정 파일들
│   │   └── passport.ts  # Passport 인증 설정
│   ├── middleware/      # Express 미들웨어
│   │   └── auth.ts      # JWT 인증 미들웨어
│   ├── routes/          # API 라우터들
│   │   ├── auth.ts      # 인증 관련 API
│   │   ├── users.ts     # 사용자 관련 API
│   │   ├── memes.ts     # 밈 관련 API
│   │   ├── comments.ts  # 댓글 관련 API
│   │   ├── social.ts    # 소셜 기능 API
│   │   ├── feed.ts      # 피드 알고리즘 API
│   │   ├── search.ts    # 검색 API
│   │   ├── ai.ts        # AI 텍스트 생성 API
│   │   └── analytics.ts # 분석 및 통계 API
│   ├── services/        # 비즈니스 로직
│   │   ├── authService.ts
│   │   └── socialService.ts
│   ├── types/           # TypeScript 타입 정의
│   │   └── passport-kakao.d.ts
│   └── index.ts         # Express 서버 엔트리포인트
├── prisma/
│   ├── schema.prisma    # 데이터베이스 스키마
│   └── seed.ts          # 테스트 데이터 시드 스크립트
├── scripts/
│   ├── setup-database.md  # 데이터베이스 설정 가이드
│   ├── check-db.ts        # 데이터베이스 상태 확인 스크립트
│   └── dev-server.ts      # 개발 서버 시작 스크립트
└── README.md
```

## 🔐 API 인증

대부분의 API 엔드포인트는 JWT 토큰을 통한 인증이 필요합니다.

### 로그인 후 토큰 사용
```javascript
// 로그인
POST /api/auth/login
{
  "email": "test1@memezing.com",
  "password": "test123!"
}

// 응답에서 토큰을 받아 헤더에 포함
Authorization: Bearer <JWT_TOKEN>
```

## 📡 주요 API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보
- `POST /api/auth/logout` - 로그아웃

### 밈
- `GET /api/memes` - 밈 목록 조회
- `POST /api/memes` - 밈 생성
- `GET /api/memes/:id` - 특정 밈 조회
- `PUT /api/memes/:id` - 밈 수정
- `DELETE /api/memes/:id` - 밈 삭제
- `POST /api/memes/:id/like` - 밈 좋아요/취소

### 소셜 기능
- `POST /api/social/follow` - 사용자 팔로우/언팔로우
- `POST /api/social/bookmark` - 밈 북마크/취소
- `GET /api/social/followers/:userId` - 팔로워 목록
- `GET /api/social/following/:userId` - 팔로잉 목록

### 피드
- `GET /api/feed` - 개인화된 피드
- `GET /api/feed/trending` - 트렌딩 피드

### 검색
- `GET /api/search?q=검색어` - 통합 검색
- `GET /api/search/trending` - 인기 검색어
- `GET /api/search/suggestions?q=검색어` - 검색 제안

## 🗄️ 데이터베이스 스키마

### 주요 모델
- **User**: 사용자 정보
- **Meme**: 밈 데이터
- **Template**: 밈 템플릿
- **Like**: 좋아요 관계
- **Comment**: 댓글
- **Follow**: 팔로우 관계
- **Bookmark**: 북마크
- **Collection**: 밈 컬렉션
- **UserInteraction**: 사용자 상호작용 로그

## 🧪 테스트 데이터

시드 스크립트를 실행하면 다음 테스트 계정들이 생성됩니다:

- **test1@memezing.com** (비밀번호: test123!) - 인증된 사용자
- **test2@memezing.com** (비밀번호: test123!) - 일반 사용자
- **test3@memezing.com** (비밀번호: test123!) - 소셜 로그인 사용자

## 🔧 개발 도구

### Prisma Studio
```bash
npm run db:studio
```
브라우저에서 `http://localhost:5555`로 데이터베이스를 시각적으로 관리할 수 있습니다.

### 데이터베이스 상태 확인
```bash
npm run db:check
```

## 🚨 문제 해결

### P1001: 데이터베이스 연결 오류
1. PostgreSQL이 설치되어 있는지 확인
2. PostgreSQL 서비스가 실행 중인지 확인 (`brew services start postgresql`)
3. `.env` 파일의 `DATABASE_URL`이 올바른지 확인

### 의존성 오류
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript 컴파일 오류
```bash
npm run build
```

## 📚 기술 스택

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Passport.js + JWT
- **Image Upload**: Cloudinary
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate limiting

## 🤝 기여 가이드

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.