# OAuth 앱 등록 및 환경변수 설정 가이드

## 1. Google OAuth 설정

### 1-1. Google Cloud Console 프로젝트 생성

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com/ 방문
   - Google 계정으로 로그인

2. **새 프로젝트 생성**
   - 상단 프로젝트 선택 드롭다운 클릭
   - "새 프로젝트" 클릭
   - 프로젝트 이름: `memezing-oauth` (또는 원하는 이름)
   - "만들기" 클릭

3. **프로젝트 선택**
   - 생성된 프로젝트 선택

### 1-2. OAuth 2.0 클라이언트 ID 생성

1. **API 및 서비스 → 사용자 인증 정보**
   - 왼쪽 메뉴에서 "API 및 서비스" → "사용자 인증 정보" 클릭

2. **OAuth 동의 화면 설정**
   - "OAuth 동의 화면" 탭 클릭
   - 사용자 유형: "외부" 선택 (개인 개발자의 경우)
   - "만들기" 클릭

3. **앱 정보 입력**
   ```
   앱 이름: 밈징어
   사용자 지원 이메일: your-email@gmail.com
   앱 로고: (선택사항)
   앱 도메인:
   - 홈페이지: http://localhost:3000 (개발용)
   - 개인정보처리방침: http://localhost:3000/privacy
   - 서비스 약관: http://localhost:3000/terms
   개발자 연락처: your-email@gmail.com
   ```
   - "저장 후 계속" 클릭

4. **범위 설정**
   - "범위 추가 또는 삭제" 클릭
   - 다음 범위 선택:
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
   - "업데이트" 클릭
   - "저장 후 계속" 클릭

5. **테스트 사용자 추가** (개발 단계)
   - "테스트 사용자 추가" 클릭
   - 본인 Gmail 주소 추가
   - "저장 후 계속" 클릭

6. **OAuth 클라이언트 ID 생성**
   - "사용자 인증 정보" 탭으로 돌아가기
   - "+ 사용자 인증 정보 만들기" → "OAuth 클라이언트 ID" 클릭
   - 애플리케이션 유형: "웹 애플리케이션" 선택
   - 이름: `memezing-web-client`

7. **승인된 리디렉션 URI 설정**
   ```
   승인된 JavaScript 원본:
   - http://localhost:3000
   - http://localhost:5000

   승인된 리디렉션 URI:  
   - http://localhost:5000/api/auth/google/callback
   ```
   - "만들기" 클릭

8. **클라이언트 ID 복사**
   - 생성된 클라이언트 ID와 클라이언트 보안 비밀번호 복사
   - 안전한 곳에 저장

## 2. Kakao OAuth 설정

### 2-1. Kakao Developers 앱 등록

1. **Kakao Developers 접속**
   - https://developers.kakao.com/ 방문
   - 카카오 계정으로 로그인

2. **애플리케이션 추가**
   - "내 애플리케이션" 클릭
   - "애플리케이션 추가하기" 클릭
   - 앱 이름: `밈징어`
   - 사업자명: 개인 (또는 회사명)
   - "저장" 클릭

3. **앱 키 확인**
   - 생성된 앱 선택
   - "앱 설정" → "일반" 탭에서 앱 키 확인
   - `JavaScript 키` 또는 `REST API 키` 복사

### 2-2. 플랫폼 설정

1. **웹 플랫폼 등록**
   - "앱 설정" → "플랫폼" 클릭
   - "Web 플랫폼 등록" 클릭
   - 사이트 도메인: `http://localhost:3000`
   - "저장" 클릭

### 2-3. Kakao Login 활성화

1. **카카오 로그인 설정**
   - "제품 설정" → "카카오 로그인" 클릭
   - "활성화 설정"의 "ON" 클릭
   - "저장" 클릭

2. **Redirect URI 설정**
   - "Redirect URI" 섹션에서 "+" 클릭
   - URI: `http://localhost:5000/api/auth/kakao/callback`
   - "저장" 클릭

### 2-4. 동의항목 설정

1. **개인정보 보호**
   - "제품 설정" → "카카오 로그인" → "동의항목" 클릭
   - "nickname" (필수 동의)
   - "profile_image" (선택 동의)  
   - "account_email" (필수 동의)
   - "저장" 클릭

## 3. 환경변수 설정

### 3-1. 백엔드 환경변수 (.env)

`backend/.env` 파일 생성:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/memezing"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random"

# Session
SESSION_SECRET="your-super-secret-session-key-here-also-make-it-long"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Kakao OAuth  
KAKAO_CLIENT_ID="your-kakao-rest-api-key"

# Frontend URL
FRONTEND_URL="http://localhost:3000"

# Server
PORT=5000
NODE_ENV=development

# Cloudinary (이미지 업로드용)
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"  
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
```

### 3-2. 프론트엔드 환경변수 (.env.local)

`frontend/.env.local` 파일 생성:

```env
# API URL
NEXT_PUBLIC_API_URL="http://localhost:5000"

# 기타 공개 환경변수
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 4. 보안 키 생성 방법

### JWT Secret 생성
```bash
# Node.js에서 랜덤 키 생성
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Session Secret 생성  
```bash
# 또 다른 랜덤 키 생성
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 5. 테스트 방법

### 5-1. 환경변수 확인
```bash
# 백엔드에서
cd backend
node -e "require('dotenv').config(); console.log('Google:', !!process.env.GOOGLE_CLIENT_ID); console.log('Kakao:', !!process.env.KAKAO_CLIENT_ID);"
```

### 5-2. 서버 실행
```bash
# 백엔드 실행
cd backend
npm run dev

# 프론트엔드 실행 (다른 터미널)
cd frontend  
npm run dev
```

### 5-3. 로그인 테스트
1. http://localhost:3000/login 접속
2. Google/Kakao 로그인 버튼 클릭
3. OAuth 인증 진행
4. 성공적으로 로그인되는지 확인

## 6. 문제 해결

### 자주 발생하는 오류

1. **"redirect_uri_mismatch" 오류**
   - Google/Kakao 설정에서 리디렉션 URI 확인
   - 정확히 `http://localhost:5000/api/auth/google/callback` 입력했는지 확인

2. **"invalid_client" 오류**
   - 클라이언트 ID/Secret이 정확한지 확인
   - 환경변수 파일이 올바른 위치에 있는지 확인

3. **"scope" 관련 오류**
   - Google Console에서 필요한 범위가 활성화되었는지 확인
   - Kakao에서 동의항목이 올바르게 설정되었는지 확인

### 디버깅 팁
```bash
# 환경변수 로드 확인
cd backend
node -e "require('dotenv').config(); console.log(process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + '...');"
```

## 7. 운영 환경 배포 시

### Google OAuth 운영 설정
- 승인된 JavaScript 원본: `https://yourdomain.com`
- 승인된 리디렉션 URI: `https://yourdomain.com/api/auth/google/callback`

### Kakao OAuth 운영 설정  
- 사이트 도메인: `https://yourdomain.com`
- Redirect URI: `https://yourdomain.com/api/auth/kakao/callback`

### 환경변수 업데이트
```env
# 운영 환경
FRONTEND_URL="https://yourdomain.com"
NODE_ENV=production
```

이제 소셜 로그인이 완전히 작동할 것입니다! 🚀