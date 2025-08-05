# 프로덕션 배포 시 환경변수 보안 설정 가이드

## 🚀 주요 배포 플랫폼별 환경변수 설정 방법

### 1. Vercel (추천)

**장점**: Next.js에 최적화, 자동 HTTPS, 간단한 설정

#### 설정 방법:
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 배포
vercel

# 환경변수 설정 (CLI)
vercel env add OPENAI_API_KEY
vercel env add KAKAO_CLIENT_ID
vercel env add KAKAO_CLIENT_SECRET
vercel env add NAVER_CLIENT_ID
vercel env add NAVER_CLIENT_SECRET
vercel env add NEXTAUTH_SECRET
```

#### 웹 대시보드에서 설정:
1. [Vercel Dashboard](https://vercel.com/dashboard) 로그인
2. 프로젝트 선택 → Settings → Environment Variables
3. 각 환경변수 추가:
   ```
   Name: OPENAI_API_KEY
   Value: sk-proj-your-actual-key
   Environment: Production, Preview, Development
   ```

#### 프로덕션 URL 업데이트:
```bash
NEXTAUTH_URL="https://your-app-name.vercel.app"
```

---

### 2. Netlify

**장점**: 무료 플랜, 쉬운 설정, Git 연동

#### 설정 방법:
1. [Netlify Dashboard](https://app.netlify.com) 로그인
2. Site settings → Environment variables
3. 환경변수 추가:
   ```
   Key: OPENAI_API_KEY
   Value: your-actual-api-key
   Scopes: All deploy contexts
   ```

#### netlify.toml 설정:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### 3. AWS (EC2 + S3)

**장점**: 완전한 제어, 확장성, 엔터프라이즈급

#### EC2 환경변수 설정:
```bash
# PM2 ecosystem 파일
# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'memezing-frontend',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      NEXTAUTH_URL: 'https://yourdomain.com',
      // 다른 환경변수들...
    }
  }]
}

# 서버에서 환경변수 설정
sudo nano /etc/environment
# 또는
echo 'export OPENAI_API_KEY="your-key"' >> ~/.bashrc
```

#### AWS Systems Manager Parameter Store 사용:
```bash
# AWS CLI로 보안 파라미터 저장
aws ssm put-parameter \
  --name "/memezing/openai-api-key" \
  --value "sk-proj-your-key" \
  --type "SecureString"

# Node.js에서 불러오기
const AWS = require('aws-sdk');
const ssm = new AWS.SSM();

const getParameter = async (name) => {
  const result = await ssm.getParameter({
    Name: name,
    WithDecryption: true
  }).promise();
  return result.Parameter.Value;
};
```

---

### 4. Google Cloud Platform

**장점**: Google 서비스와 연동, 스케일링

#### Cloud Run 배포:
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# 환경변수와 함께 배포
gcloud run deploy memezing-frontend \
  --source . \
  --platform managed \
  --region asia-northeast1 \
  --set-env-vars OPENAI_API_KEY="your-key" \
  --set-env-vars NEXTAUTH_URL="https://your-domain.com"
```

#### Secret Manager 사용:
```bash
# 시크릿 생성
gcloud secrets create openai-api-key --data-file=-
echo "sk-proj-your-key" | gcloud secrets create openai-api-key --data-file=-

# Cloud Run에서 시크릿 사용
gcloud run deploy memezing-frontend \
  --set-secrets OPENAI_API_KEY=openai-api-key:latest
```

---

## 🔐 보안 모범 사례

### 1. 환경별 분리
```bash
# 개발 환경
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="sk-proj-dev-key"

# 스테이징 환경  
NEXTAUTH_URL="https://staging.yourdomain.com"
OPENAI_API_KEY="sk-proj-staging-key"

# 프로덕션 환경
NEXTAUTH_URL="https://yourdomain.com"
OPENAI_API_KEY="sk-proj-prod-key"
```

### 2. OAuth Callback URL 업데이트

**카카오 개발자 센터:**
```
개발: http://localhost:3000/api/auth/callback/kakao
프로덕션: https://yourdomain.com/api/auth/callback/kakao
```

**네이버 개발자 센터:**
```
개발: http://localhost:3000/api/auth/callback/naver
프로덕션: https://yourdomain.com/api/auth/callback/naver
```

**구글 클라우드 콘솔:**
```
개발: http://localhost:3000/api/auth/callback/google
프로덕션: https://yourdomain.com/api/auth/callback/google
```

### 3. 보안 체크리스트

- [ ] **API 키 분리**: 개발/스테이징/프로덕션 환경별로 다른 키 사용
- [ ] **HTTPS 강제**: 프로덕션에서는 반드시 HTTPS 사용
- [ ] **도메인 제한**: OAuth 앱에서 허용 도메인 제한
- [ ] **키 순환**: 정기적으로 API 키 재생성
- [ ] **접근 권한**: 최소 권한 원칙 적용
- [ ] **모니터링**: API 사용량 및 이상 접근 모니터링

## ⚡ 성능 최적화

### Next.js 프로덕션 최적화:
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 프로덕션 최적화
  compress: true,
  poweredByHeader: false,
  
  // 환경변수 검증
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // 보안 헤더
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

## 🚨 응급 상황 대응

### API 키 유출 시 대응:
1. **즉시 키 무효화** - 해당 서비스에서 키 삭제
2. **새 키 생성** - 새로운 API 키 발급  
3. **환경변수 업데이트** - 모든 배포 환경의 키 교체
4. **재배포** - 새 키로 서비스 재시작
5. **로그 분석** - 유출 경로 및 피해 범위 확인

### 모니터링 설정:
```javascript
// 사용량 모니터링
const monitorApiUsage = () => {
  // OpenAI API 사용량 체크
  // 비정상적인 사용 패턴 감지
  // 알림 발송
}
```

---

## 📋 배포 전 체크리스트

- [ ] 모든 환경변수 설정 완료
- [ ] OAuth 콜백 URL 업데이트
- [ ] HTTPS 인증서 설정
- [ ] 도메인 DNS 설정  
- [ ] 데이터베이스 연결 확인
- [ ] API 엔드포인트 테스트
- [ ] 성능 테스트 완료
- [ ] 보안 스캔 완료
- [ ] 백업 계획 수립
- [ ] 모니터링 대시보드 설정

이 가이드를 따라 배포하면 프로덕션 환경에서 안전하고 안정적으로 서비스를 운영할 수 있습니다.