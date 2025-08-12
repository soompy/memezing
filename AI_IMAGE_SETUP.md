# 🎨 AI 이미지 생성 기능 설정 가이드

현재 "AI 이미지 생성에 실패하여 더미 이미지를 반환합니다" 메시지가 나타나는 이유는 AI 이미지 생성 API가 설정되지 않았기 때문입니다.

## 🚀 해결 방법

### 방법 1: OpenAI DALL-E API 사용 (유료, 고품질)

1. **OpenAI 계정 생성 및 API 키 발급**:
   - [OpenAI Platform](https://platform.openai.com/api-keys) 방문
   - 계정 생성 후 로그인
   - "Create new secret key" 클릭하여 API 키 생성
   - 결제 방법 등록 (DALL-E 3는 유료 서비스)

2. **환경변수 설정**:
   ```bash
   # frontend/.env.local 파일 수정
   OPENAI_API_KEY="sk-your-actual-openai-api-key-here"
   ```

3. **가격 정보**:
   - DALL-E 3: $0.04 per 1024×1024 image
   - DALL-E 2: $0.02 per 1024×1024 image

### 방법 2: Hugging Face API 사용 (무료, 제한적)

1. **Hugging Face 토큰 생성**:
   - [Hugging Face Settings](https://huggingface.co/settings/tokens) 방문
   - 계정 생성 후 "New token" 클릭
   - "Read" 권한으로 토큰 생성

2. **환경변수 설정**:
   ```bash
   # frontend/.env.local 파일 수정
   HUGGINGFACE_API_KEY="hf_your-huggingface-token-here"
   ```

3. **특징**:
   - 무료 사용 가능
   - 속도가 느릴 수 있음
   - 품질이 OpenAI보다 낮을 수 있음

### 방법 3: 현재 상태 유지 (무료, 기본)

API 키를 설정하지 않으면 다음과 같이 작동합니다:
- 사용자의 프롬프트가 포함된 컬러풀한 placeholder 이미지 생성
- "AI Generated: [프롬프트]" 텍스트가 포함된 이미지
- 다양한 색상으로 랜덤 생성

## 🔧 설정 후 서버 재시작

환경변수를 변경한 후에는 프론트엔드 서버를 재시작해야 합니다:

```bash
# 기존 서버 종료 (Ctrl+C)
cd frontend
npm run dev
```

## 🧪 테스트 방법

1. 밈 생성기 페이지로 이동: http://localhost:3000/meme-generator
2. "AI 이미지 생성" 버튼 클릭
3. 프롬프트 입력 (예: "funny cat wearing sunglasses")
4. 생성 버튼 클릭
5. 결과 확인

## 💡 추천사항

- **개발/테스트**: 방법 3 (무료 placeholder) 또는 방법 2 (Hugging Face)
- **프로덕션**: 방법 1 (OpenAI DALL-E) - 고품질 이미지 필요시
- **데모/프로토타입**: 방법 2 (Hugging Face) - 무료로 실제 AI 생성 이미지

## 🔍 문제 해결

### 여전히 더미 이미지가 나온다면:
1. `.env.local` 파일에서 API 키가 올바르게 설정되었는지 확인
2. 프론트엔드 서버를 완전히 재시작
3. 브라우저 개발자 도구에서 네트워크 탭을 확인하여 API 응답 확인

### OpenAI API 오류가 발생한다면:
1. API 키가 유효한지 확인
2. OpenAI 계정에 충분한 크레딧이 있는지 확인
3. API 사용량 제한에 걸리지 않았는지 확인

현재 시스템은 API 키가 없어도 기본적으로 작동하도록 설계되어 있으므로, 필요에 따라 단계적으로 업그레이드할 수 있습니다.