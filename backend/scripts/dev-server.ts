import { spawn } from 'child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ 데이터베이스 연결 확인됨');
    return true;
  } catch (error) {
    console.log('❌ 데이터베이스 연결 실패');
    console.log('💡 PostgreSQL 서버가 실행 중인지 확인하세요');
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function startDevelopmentServer() {
  console.log('🚀 밈징 백엔드 개발 서버를 시작합니다...\n');

  // 데이터베이스 연결 확인
  const dbConnected = await checkDatabaseConnection();
  
  if (!dbConnected) {
    console.log('\n⚠️  데이터베이스 연결이 실패했지만 서버를 시작합니다.');
    console.log('일부 기능이 작동하지 않을 수 있습니다.\n');
  }

  // Prisma 클라이언트 생성
  console.log('🔄 Prisma 클라이언트 생성 중...');
  const generateProcess = spawn('npx', ['prisma', 'generate'], {
    stdio: 'inherit',
    shell: true,
  });

  generateProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Prisma 클라이언트 생성 완료\n');
      
      // 개발 서버 시작
      console.log('🚀 Express 서버 시작...');
      const devProcess = spawn('npx', ['nodemon', 'src/index.ts'], {
        stdio: 'inherit',
        shell: true,
      });

      devProcess.on('close', (code) => {
        console.log(`\n개발 서버가 종료되었습니다 (코드: ${code})`);
      });

      // Ctrl+C 핸들링
      process.on('SIGINT', () => {
        console.log('\n🛑 서버를 종료합니다...');
        devProcess.kill('SIGINT');
        process.exit(0);
      });
    } else {
      console.error('❌ Prisma 클라이언트 생성 실패');
      process.exit(1);
    }
  });
}

startDevelopmentServer();