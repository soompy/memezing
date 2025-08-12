import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 시드 데이터 생성을 시작합니다...');

  // 테스트 사용자 생성
  const hashedPassword = await bcrypt.hash('test123!', 10);

  const testUser1 = await prisma.user.upsert({
    where: { email: 'test1@memezing.com' },
    update: {},
    create: {
      email: 'test1@memezing.com',
      name: '밈징 테스터',
      password: hashedPassword,
      provider: 'email',
      bio: '밈징 플랫폼의 테스트 사용자입니다.',
      interests: ['일상', '드라마', '음식'],
      isVerified: true,
      isActive: true,
      lastLoginAt: new Date(),
    },
  });

  const testUser2 = await prisma.user.upsert({
    where: { email: 'test2@memezing.com' },
    update: {},
    create: {
      email: 'test2@memezing.com',
      name: '밈마스터',
      password: hashedPassword,
      provider: 'email',
      bio: '재미있는 밈을 만드는 것이 취미입니다.',
      interests: ['게임', '연예인', '동물'],
      isVerified: false,
      isActive: true,
      lastLoginAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 하루 전
    },
  });

  const testUser3 = await prisma.user.upsert({
    where: { email: 'test3@memezing.com' },
    update: {},
    create: {
      email: 'test3@memezing.com',
      name: '소셜러',
      password: hashedPassword,
      provider: 'google',
      bio: '소셜 미디어를 사랑하는 사용자입니다.',
      interests: ['여행', '음식', '일상'],
      isVerified: false,
      isActive: true,
      lastLoginAt: new Date(),
    },
  });

  console.log('✅ 테스트 사용자 생성 완료');

  // 팔로우 관계 생성
  await prisma.follow.createMany({
    data: [
      { followerId: testUser1.id, followingId: testUser2.id },
      { followerId: testUser2.id, followingId: testUser3.id },
      { followerId: testUser3.id, followingId: testUser1.id },
    ],
    skipDuplicates: true,
  });

  console.log('✅ 팔로우 관계 생성 완료');

  // 밈 템플릿 생성
  const template1 = await prisma.template.create({
    data: {
      name: '드레이크 포인팅',
      imageUrl: 'https://i.imgflip.com/30b1gx.jpg',
      category: '반응',
      textBoxes: [
        { x: 250, y: 130, width: 300, height: 100 },
        { x: 250, y: 380, width: 300, height: 100 },
      ],
      isActive: true,
      usageCount: 150,
    },
  });

  const template2 = await prisma.template.create({
    data: {
      name: '디스트랙티드 보이프렌드',
      imageUrl: 'https://i.imgflip.com/1ur9b0.jpg',
      category: '상황',
      textBoxes: [
        { x: 180, y: 20, width: 150, height: 50 },
        { x: 370, y: 20, width: 150, height: 50 },
        { x: 50, y: 20, width: 150, height: 50 },
      ],
      isActive: true,
      usageCount: 89,
    },
  });

  const template3 = await prisma.template.create({
    data: {
      name: '체인지 마이 마인드',
      imageUrl: 'https://i.imgflip.com/24y43o.jpg',
      category: '의견',
      textBoxes: [
        { x: 100, y: 100, width: 200, height: 80 },
      ],
      isActive: true,
      usageCount: 67,
    },
  });

  console.log('✅ 밈 템플릿 생성 완료');

  // 테스트 밈 생성
  const meme1 = await prisma.meme.create({
    data: {
      title: '새 프로젝트 시작할 때',
      description: '개발자들의 영원한 고민',
      imageUrl: 'https://example.com/meme1.jpg',
      templateId: template1.id,
      userId: testUser1.id,
      textBoxes: [
        { text: '기존 코드 리팩토링', x: 250, y: 130, fontSize: 24 },
        { text: '새 프로젝트 시작', x: 250, y: 380, fontSize: 24 },
      ],
      tags: ['개발', '프로그래밍', '직장'],
      isPublic: true,
      viewsCount: 42,
      likesCount: 8,
      sharesCount: 2,
      downloadsCount: 3,
    },
  });

  const meme2 = await prisma.meme.create({
    data: {
      title: '점심 메뉴 고민',
      description: '매일 반복되는 점심 고민',
      imageUrl: 'https://example.com/meme2.jpg',
      templateId: template2.id,
      userId: testUser2.id,
      textBoxes: [
        { text: '나', x: 180, y: 20, fontSize: 20 },
        { text: '새로운 맛집', x: 370, y: 20, fontSize: 20 },
        { text: '집밥', x: 50, y: 20, fontSize: 20 },
      ],
      tags: ['음식', '일상', '고민'],
      isPublic: true,
      viewsCount: 73,
      likesCount: 15,
      sharesCount: 5,
      downloadsCount: 7,
    },
  });

  const meme3 = await prisma.meme.create({
    data: {
      title: '주말에 운동하자',
      description: '주말 운동 계획의 현실',
      imageUrl: 'https://example.com/meme3.jpg',
      templateId: template3.id,
      userId: testUser3.id,
      textBoxes: [
        { text: '주말에는 잠자는 게 최고다\\nChange my mind', x: 100, y: 100, fontSize: 22 },
      ],
      tags: ['주말', '운동', '현실'],
      isPublic: true,
      viewsCount: 28,
      likesCount: 6,
      sharesCount: 1,
      downloadsCount: 2,
    },
  });

  console.log('✅ 테스트 밈 생성 완료');

  // 좋아요 생성
  await prisma.like.createMany({
    data: [
      { userId: testUser1.id, memeId: meme2.id },
      { userId: testUser1.id, memeId: meme3.id },
      { userId: testUser2.id, memeId: meme1.id },
      { userId: testUser2.id, memeId: meme3.id },
      { userId: testUser3.id, memeId: meme1.id },
      { userId: testUser3.id, memeId: meme2.id },
    ],
    skipDuplicates: true,
  });

  console.log('✅ 좋아요 생성 완료');

  // 댓글 생성
  await prisma.comment.createMany({
    data: [
      {
        content: '너무 공감돼요 ㅋㅋㅋ',
        userId: testUser2.id,
        memeId: meme1.id,
      },
      {
        content: '이거 완전 제 얘기네요 😂',
        userId: testUser3.id,
        memeId: meme1.id,
      },
      {
        content: '맛집 탐방도 좋지만 집밥이 진리죠!',
        userId: testUser1.id,
        memeId: meme2.id,
      },
      {
        content: '주말에 일어나는 것도 힘든데 운동이라니... ㅠㅠ',
        userId: testUser2.id,
        memeId: meme3.id,
      },
    ],
  });

  console.log('✅ 댓글 생성 완료');

  // 북마크 생성
  await prisma.bookmark.createMany({
    data: [
      { userId: testUser1.id, memeId: meme2.id },
      { userId: testUser2.id, memeId: meme3.id },
      { userId: testUser3.id, memeId: meme1.id },
    ],
    skipDuplicates: true,
  });

  console.log('✅ 북마크 생성 완료');

  // 컬렉션 생성
  const collection1 = await prisma.collection.create({
    data: {
      name: '직장인 밈 모음',
      description: '직장인들이 공감할 만한 밈들을 모았습니다.',
      userId: testUser1.id,
      isPublic: true,
      items: {
        create: [
          { memeId: meme1.id, order: 1 },
          { memeId: meme2.id, order: 2 },
        ],
      },
    },
  });

  const collection2 = await prisma.collection.create({
    data: {
      name: '일상 개그',
      description: '일상에서 벌어지는 재미있는 상황들',
      userId: testUser2.id,
      isPublic: true,
      items: {
        create: [
          { memeId: meme2.id, order: 1 },
          { memeId: meme3.id, order: 2 },
        ],
      },
    },
  });

  console.log('✅ 컬렉션 생성 완료');

  // 사용자 상호작용 로그 생성
  await prisma.userInteraction.createMany({
    data: [
      {
        userId: testUser1.id,
        action: 'view',
        targetType: 'meme',
        targetId: meme2.id,
        userAgent: 'Mozilla/5.0 (Test Browser)',
        metadata: { timestamp: new Date() },
      },
      {
        userId: testUser2.id,
        action: 'like',
        targetType: 'meme',
        targetId: meme1.id,
        userAgent: 'Mozilla/5.0 (Test Browser)',
        metadata: { timestamp: new Date() },
      },
      {
        userId: testUser3.id,
        action: 'download',
        targetType: 'meme',
        targetId: meme1.id,
        userAgent: 'Mozilla/5.0 (Test Browser)',
        metadata: { timestamp: new Date() },
      },
    ],
  });

  console.log('✅ 사용자 상호작용 로그 생성 완료');

  console.log('🎉 시드 데이터 생성이 완료되었습니다!');
  console.log('');
  console.log('생성된 테스트 데이터:');
  console.log('- 사용자 3명 (test1@memezing.com, test2@memezing.com, test3@memezing.com)');
  console.log('- 비밀번호: test123!');
  console.log('- 밈 템플릿 3개');
  console.log('- 테스트 밈 3개');
  console.log('- 좋아요, 댓글, 북마크, 컬렉션 등 상호작용 데이터');
  console.log('');
}

main()
  .catch((e) => {
    console.error('시드 데이터 생성 중 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });