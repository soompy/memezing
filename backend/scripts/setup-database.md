# 데이터베이스 설정 가이드

## PostgreSQL 설치 및 설정

### macOS (Homebrew 사용)
```bash
# PostgreSQL 설치
brew install postgresql

# PostgreSQL 서비스 시작
brew services start postgresql

# 데이터베이스 생성
createdb memezing
```

### Ubuntu/Debian
```bash
# PostgreSQL 설치
sudo apt update
sudo apt install postgresql postgresql-contrib

# PostgreSQL 서비스 시작
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 사용자 및 데이터베이스 생성
sudo -u postgres psql
CREATE DATABASE memezing;
CREATE USER username WITH ENCRYPTED PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE memezing TO username;
\q
```

### Windows
1. PostgreSQL 공식 사이트에서 Windows 인스톨러 다운로드
2. 설치 후 pgAdmin을 통해 `memezing` 데이터베이스 생성

## 환경변수 설정

`.env` 파일의 `DATABASE_URL`을 실제 데이터베이스 정보로 업데이트:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/memezing"
```

## 데이터베이스 초기화

```bash
# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 스키마 적용
npx prisma db push

# 테스트 데이터 생성 (선택사항)
npx prisma db seed
```

## 테스트 계정

시드 스크립트 실행 시 다음 테스트 계정들이 생성됩니다:

- **test1@memezing.com** (비밀번호: test123!) - 인증된 사용자
- **test2@memezing.com** (비밀번호: test123!) - 일반 사용자  
- **test3@memezing.com** (비밀번호: test123!) - Google 소셜 로그인 사용자

## 데이터베이스 관리 명령어

```bash
# 데이터베이스 상태 확인
npx prisma db status

# 스키마 변경사항 적용
npx prisma db push

# 마이그레이션 생성
npx prisma migrate dev --name "migration_name"

# 데이터베이스 초기화 (모든 데이터 삭제)
npx prisma migrate reset

# Prisma Studio로 데이터베이스 확인
npx prisma studio
```

## 문제 해결

### 연결 오류 (P1001)
- PostgreSQL 서비스가 실행 중인지 확인
- 포트 5432가 사용 가능한지 확인
- DATABASE_URL의 사용자명/비밀번호가 정확한지 확인

### 권한 오류
- PostgreSQL 사용자에게 데이터베이스 접근 권한이 있는지 확인
- `GRANT ALL PRIVILEGES ON DATABASE memezing TO username;` 실행