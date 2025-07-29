'use client';

import { Github, Twitter, Instagram, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: '템플릿', href: '#templates' },
      { name: '기능', href: '#features' },
      { name: '가격', href: '#pricing' },
      { name: '데모', href: '#demo' },
    ],
    company: [
      { name: '회사 소개', href: '#about' },
      { name: '블로그', href: '#blog' },
      { name: '채용', href: '#careers' },
      { name: '언론보도', href: '#press' },
    ],
    support: [
      { name: '고객지원', href: '#support' },
      { name: 'FAQ', href: '#faq' },
      { name: '가이드', href: '#guide' },
      { name: '커뮤니티', href: '#community' },
    ],
    legal: [
      { name: '이용약관', href: '#terms' },
      { name: '개인정보처리방침', href: '#privacy' },
      { name: '쿠키 정책', href: '#cookies' },
      { name: '라이선스', href: '#license' },
    ],
  };

  const socialLinks = [
    { name: 'GitHub', icon: Github, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'Email', icon: Mail, href: 'mailto:hello@memezing.com' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* 상단 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
          {/* 브랜드 및 설명 */}
          <div className="lg:col-span-1">
            <div className="text-2xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                🎭 밈징어
              </span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              누구나 쉽게 밈을 만들 수 있는 플랫폼입니다. 
              한국 문화에 특화된 템플릿으로 더욱 재미있는 콘텐츠를 만들어보세요.
            </p>
            
            {/* 소셜 링크 */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors duration-200 group"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-200" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* 링크 섹션들 */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              <div>
                <h3 className="font-semibold text-white mb-4">제품</h3>
                <ul className="space-y-3">
                  {footerLinks.product.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-gray-300 hover:text-white transition-colors duration-200"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-4">회사</h3>
                <ul className="space-y-3">
                  {footerLinks.company.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-gray-300 hover:text-white transition-colors duration-200"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-4">지원</h3>
                <ul className="space-y-3">
                  {footerLinks.support.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-gray-300 hover:text-white transition-colors duration-200"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-4">법적 고지</h3>
                <ul className="space-y-3">
                  {footerLinks.legal.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-gray-300 hover:text-white transition-colors duration-200"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            {/* 저작권 */}
            <div className="text-gray-400 text-sm mb-4 sm:mb-0">
              © {currentYear} 밈징어. All rights reserved.
            </div>

            {/* 추가 정보 */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-gray-400 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>서비스 정상 운영 중</span>
              </div>
              
              <div>
                Made with ❤️ in Seoul, Korea
              </div>
            </div>
          </div>
        </div>

        {/* 하단 추가 정보 */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="bg-gray-800 rounded-2xl p-6 text-center">
            <h4 className="font-semibold text-white mb-2">
              🚀 밈징어와 함께 바이럴 크리에이터가 되어보세요!
            </h4>
            <p className="text-gray-300 text-sm">
              매일 새로운 템플릿과 기능이 추가됩니다. 
              뉴스레터를 구독하고 최신 소식을 받아보세요.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="이메일 주소를 입력하세요"
                className="w-full sm:flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200">
                구독하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}