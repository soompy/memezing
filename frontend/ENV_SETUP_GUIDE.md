# 환경변수 설정 가이드

## 필수 환경변수 설정

`.env.local` 파일에서 다음 환경변수들을 실제 값으로 교체해주세요:

### 1. OpenAI API (ChatGPT)
```
OPENAI_API_KEY="your-openai-api-key"
```
- **발급처**: [OpenAI Platform](https://platform.openai.com/api-keys)
- **모델**: GPT-3.5-turbo (무료 사용량 포함)
- **용도**: AI 텍스트 생성 기능
- **설정 방법**:
  1. OpenAI 계정 생성 또는 로그인
  2. API Keys 페이지에서 새 키 생성
  3. 무료 사용량: $5 크레딧 (신규 계정)
- **필수 여부**: ⭐ 필수 (AI 기능 사용 불가)

### 2. 카카오 OAuth
```
KAKAO_CLIENT_ID="your-kakao-client-id"
KAKAO_CLIENT_SECRET="your-kakao-client-secret"
```
- **발급처**: [Kakao Developers](https://developers.kakao.com)
- **설정 방법**:
  1. 내 애플리케이션 > 애플리케이션 추가하기
  2. 플랫폼 설정 > Web 플랫폼 등록
  3. Redirect URI: `http://localhost:3000/api/auth/callback/kakao`
  4. 동의항목: 닉네임, 프로필 이미지, 카카오계정(이메일)
- **필수 여부**: 선택 (카카오 로그인 기능)

### 3. 네이버 OAuth
```
NAVER_CLIENT_ID="your-naver-client-id"
NAVER_CLIENT_SECRET="your-naver-client-secret"
```
- **발급처**: [Naver Developers](https://developers.naver.com)
- **설정 방법**:
  1. Application > 애플리케이션 등록
  2. 서비스 URL: `http://localhost:3000`
  3. Callback URL: `http://localhost:3000/api/auth/callback/naver`
  4. 권한: 회원이름, 이메일주소, 프로필이미지
- **필수 여부**: 선택 (네이버 로그인 기능)

### 4. Google OAuth (이미 설정된 경우)
```
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```
- **발급처**: [Google Cloud Console](https://console.cloud.google.com)
- **설정 방법**:
  1. APIs & Services > Credentials
  2. OAuth 2.0 Client IDs 생성
  3. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
- **필수 여부**: 선택 (구글 로그인 기능)

### 5. Cloudinary (이미지 업로드)
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-cloudinary-upload-preset"
```
- **발급처**: [Cloudinary](https://cloudinary.com)
- **설정 방법**:
  1. Dashboard에서 Cloud Name 확인
  2. Settings > Upload > Upload presets에서 unsigned preset 생성
- **필수 여부**: 선택 (이미지 업로드 기능)

## 프로덕션 환경 설정

프로덕션 배포 시에는 다음 URL들을 실제 도메인으로 변경해야 합니다:

1. **NextAuth URL 설정**:
   ```
   NEXTAUTH_URL="https://your-domain.com"
   ```

2. **Callback URL 업데이트**:
   - 카카오: `https://your-domain.com/api/auth/callback/kakao`
   - 네이버: `https://your-domain.com/api/auth/callback/naver`
   - 구글: `https://your-domain.com/api/auth/callback/google`

3. **API URL 설정**:
   ```
   NEXT_PUBLIC_API_URL="https://your-api-domain.com"
   ```

### 📋 프로덕션 배포 가이드
상세한 프로덕션 배포 방법은 [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) 문서를 참고하세요:
- Vercel, Netlify, AWS, GCP 배포 방법
- 플랫폼별 환경변수 설정
- 보안 모범 사례
- 응급 상황 대응 방법

## 보안 주의사항

⚠️ **중요**: 
- `.env.local` 파일은 절대 git에 커밋하지 마세요
- 환경변수는 서버 사이드에서만 사용되므로 `NEXT_PUBLIC_` 접두사가 없는 한 클라이언트에 노출되지 않습니다
- API 키들은 정기적으로 재생성하는 것을 권장합니다

## 테스트 방법

환경변수 설정 후 다음 기능들을 테스트해보세요:

1. **ChatGPT AI 텍스트 생성**: 밈 생성기 > AI 텍스트 생성 버튼
   - GPT-3.5-turbo 모델 사용
   - 한국어 밈 텍스트 자동 생성
2. **소셜 로그인**: 로그인 페이지 > 각 소셜 로그인 버튼
3. **이미지 업로드**: 밈 생성기 > 이미지 업로드 기능

### OpenAI API 사용량 확인
- [OpenAI Usage Dashboard](https://platform.openai.com/usage)에서 API 사용량 모니터링 가능
- 무료 크레딧 소진 후 유료 결제 필요

---

설정 완료 후 개발 서버를 재시작하여 변경사항을 적용하세요:
```bash
npm run dev
```