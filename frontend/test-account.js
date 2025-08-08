// 테스트 계정 생성을 위한 스크립트
const createTestAccount = async () => {
  try {
    console.log('🚀 테스트 계정 생성 중...');
    
    const response = await fetch('http://localhost:3001/api/auth/create-test-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@memezing.com',
        password: 'test123!',
        name: '테스트 사용자'
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ 테스트 계정 생성 성공!');
      console.log('📧 이메일:', data.data.credentials?.email || data.data.email);
      console.log('🔑 비밀번호:', data.data.credentials?.password || 'test123!');
      console.log('👤 이름:', data.data.user?.name || data.data.name);
      console.log('\n로그인 페이지에서 위 정보로 로그인할 수 있습니다.');
    } else {
      console.error('❌ 테스트 계정 생성 실패:', data.error);
    }
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    console.log('💡 개발 서버가 실행 중인지 확인해주세요: npm run dev');
  }
};

// Node.js 환경에서 fetch 사용을 위한 polyfill
if (typeof fetch === 'undefined') {
  console.log('Node.js에서는 이 스크립트를 직접 실행할 수 없습니다.');
  console.log('브라우저에서 다음 코드를 실행하거나, Postman을 사용해주세요:\n');
  
  console.log(`
fetch('http://localhost:3001/api/auth/create-test-account', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@memezing.com',
    password: 'test123!',
    name: '테스트 사용자'
  })
}).then(res => res.json()).then(console.log);
  `);
} else {
  createTestAccount();
}