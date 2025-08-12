import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 데이터베이스 연결을 확인 중...');
    
    // 데이터베이스 연결 테스트
    await prisma.$connect();
    console.log('✅ 데이터베이스 연결 성공');

    // 스키마 테이블 확인
    const userCount = await prisma.user.count();
    const memeCount = await prisma.meme.count();
    const templateCount = await prisma.template.count();
    const likeCount = await prisma.like.count();
    const commentCount = await prisma.comment.count();

    console.log('\n📊 데이터베이스 현황:');
    console.log(`- 사용자: ${userCount}명`);
    console.log(`- 밈: ${memeCount}개`);
    console.log(`- 템플릿: ${templateCount}개`);
    console.log(`- 좋아요: ${likeCount}개`);
    console.log(`- 댓글: ${commentCount}개`);

    if (userCount === 0 && memeCount === 0) {
      console.log('\n💡 테스트 데이터가 없습니다. 다음 명령어로 시드 데이터를 생성하세요:');
      console.log('npm run db:seed');
    }

    console.log('\n🎉 데이터베이스가 정상적으로 설정되었습니다!');
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('P1001')) {
        console.log('\n💡 해결 방법:');
        console.log('1. PostgreSQL이 설치되어 있는지 확인하세요');
        console.log('2. PostgreSQL 서비스가 실행 중인지 확인하세요');
        console.log('3. .env 파일의 DATABASE_URL이 올바른지 확인하세요');
        console.log('\n자세한 설정 방법은 scripts/setup-database.md 파일을 참고하세요.');
      }
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();