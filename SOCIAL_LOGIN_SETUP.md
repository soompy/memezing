# 소셜 로그인 구현 완료

## 구현된 기능

### 백엔드 (Node.js + Passport.js)
✅ **패키지 설치**
- passport, passport-google-oauth20, passport-kakao
- express-session (OAuth 세션 관리)

✅ **데이터베이스 스키마 업데이트**
```sql
-- User 테이블에 추가된 필드들
provider    String   @default("email") // email, google, kakao
providerId  String?  // OAuth provider ID  
avatar      String?  // Profile image URL
displayName String?  // Full name from OAuth
```

✅ **Passport 설정** (`backend/src/config/passport.ts`)
- JWT Strategy (기존 토큰 인증)
- Local Strategy (이메일/비밀번호 로그인)
- Google OAuth2 Strategy
- Kakao OAuth Strategy

✅ **OAuth 라우터** (`backend/src/routes/auth.ts`)
- `GET /api/auth/google` - Google 로그인 시작
- `GET /api/auth/google/callback` - Google 콜백
- `GET /api/auth/kakao` - Kakao 로그인 시작  
- `GET /api/auth/kakao/callback` - Kakao 콜백

### 프론트엔드 (Next.js)
✅ **소셜 로그인 컴포넌트** (`frontend/src/components/auth/SocialLogin.tsx`)
- Google/Kakao 로그인 버튼
- 로딩 상태 관리
- 프로바이더별 디자인

✅ **OAuth 콜백 페이지** (`frontend/src/app/auth/callback/page.tsx`)
- 토큰 수신 및 저장
- 사용자 인증 확인
- 성공/실패 상태 표시
- 신규/기존 사용자 구분하여 리다이렉션

✅ **로그인/회원가입 페이지 통합**
- 기존 폼 유지
- 소셜 로그인 버튼 추가

## 설정이 필요한 환경변수

### 백엔드 (.env)
```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Kakao OAuth  
KAKAO_CLIENT_ID=your_kakao_client_id

# Session
SESSION_SECRET=your_session_secret

# Frontend URL (콜백용)
FRONTEND_URL=http://localhost:3000
```

### 프론트엔드 (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## OAuth 앱 등록 가이드

### Google OAuth 설정
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "APIs & Services" → "Credentials" 이동
4. "Create Credentials" → "OAuth 2.0 Client IDs" 선택
5. 승인된 리디렉션 URI 추가:
   - `http://localhost:5000/api/auth/google/callback` (개발)
   - `https://yourdomain.com/api/auth/google/callback` (운영)

### Kakao OAuth 설정
1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 내 애플리케이션 → 애플리케이션 추가하기
3. 플랫폼 설정 → Web 플랫폼 등록
4. Redirect URI 설정:
   - `http://localhost:5000/api/auth/kakao/callback` (개발)
   - `https://yourdomain.com/api/auth/kakao/callback` (운영)
5. 동의항목 설정: 이메일, 프로필 정보

## 사용자 플로우

### 신규 사용자 (소셜 회원가입)
1. 소셜 로그인 버튼 클릭
2. OAuth 제공자에서 인증
3. 백엔드에서 새 사용자 생성
4. JWT 토큰 발급
5. `/auth/callback` 페이지에서 토큰 처리
6. `/onboarding` 페이지로 리다이렉션

### 기존 사용자 (소셜 로그인)
1. 소셜 로그인 버튼 클릭
2. OAuth 제공자에서 인증
3. 기존 사용자 정보 업데이트
4. JWT 토큰 발급
5. `/auth/callback` 페이지에서 토큰 처리
6. 홈페이지로 리다이렉션

### 계정 연동
- 이메일이 같은 경우 자동으로 기존 계정에 연동
- `provider` 필드가 `email`에서 `google` 또는 `kakao`로 업데이트

## 보안 고려사항

✅ **구현된 보안 기능**
- CSRF 보호 (Passport 기본 제공)
- 세션 보안 설정
- HTTPS 강제 (운영 환경)
- JWT 토큰 만료 설정 (7일)

✅ **데이터 보호**
- 민감한 OAuth 토큰은 서버에서만 처리
- 프론트엔드에는 JWT 토큰만 전달
- 사용자 비밀번호는 소셜 계정의 경우 null로 저장

## 테스트 방법

1. **개발 환경 실행**
   ```bash
   # 백엔드
   cd backend && npm run dev
   
   # 프론트엔드  
   cd frontend && npm run dev
   ```

2. **로그인 테스트**
   - http://localhost:3000/login 접속
   - Google/Kakao 로그인 버튼 클릭
   - OAuth 인증 완료 후 자동 로그인 확인

3. **신규 사용자 테스트**
   - 새로운 Google/Kakao 계정으로 로그인
   - 온보딩 페이지로 리다이렉션 확인

## 운영 배포 시 체크리스트

- [ ] Google/Kakao OAuth 앱의 운영 도메인 등록
- [ ] 환경변수 운영값으로 설정
- [ ] HTTPS 인증서 설정
- [ ] 데이터베이스 마이그레이션 실행
- [ ] OAuth 콜백 URL 테스트

소셜 로그인이 완전히 구현되었습니다! 🎉