/** @type {import('next').NextConfig} */
const nextConfig = {
  // 이미지 최적화 설정
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
      {
        protocol: 'https',
        hostname: 'i.imgflip.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
    ],
    // 이미지 크기 제한
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 이미지 포맷 최적화
    formats: ['image/webp'],
  },

  // 헤더 설정 (CORS 및 보안)
  async headers() {
    return [
      {
        // API 라우트에 CORS 헤더 적용
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'development' 
              ? '*' 
              : 'https://memezing.vercel.app,https://www.memezing.com',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          },
        ],
      },
      {
        // 이미지 프록시에 추가 헤더
        source: '/api/image-proxy',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // 보안 헤더
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // 리다이렉트 설정
  async redirects() {
    return [
      // 예: www 없는 도메인을 www로 리다이렉트 (프로덕션에서)
      // {
      //   source: '/:path*',
      //   has: [
      //     {
      //       type: 'host',
      //       value: 'memezing.com',
      //     },
      //   ],
      //   destination: 'https://www.memezing.com/:path*',
      //   permanent: true,
      // },
    ];
  },

  // 리라이트 설정 (프록시)
  async rewrites() {
    return [
      // 외부 API 프록시 (필요한 경우)
      // {
      //   source: '/external-api/:path*',
      //   destination: 'https://api.external.com/:path*',
      // },
    ];
  },

  // 웹팩 설정
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Canvas 관련 설정 (Fabric.js용)
    config.externals = config.externals || {};
    if (isServer) {
      config.externals.canvas = 'canvas';
    }

    // 번들 분석기 설정 (개발 시)
    if (dev && !isServer) {
      config.optimization = config.optimization || {};
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          fabric: {
            test: /[\\/]node_modules[\\/](fabric)[\\/]/,
            name: 'fabric',
            chunks: 'all',
          },
        },
      };
    }

    return config;
  },

  // 실험적 기능
  experimental: {
    // 서버 컴포넌트 최적화
    serverComponentsExternalPackages: ['fabric'],
    // 정적 이미지 최적화
    optimizeImages: true,
  },

  // 환경 변수 설정
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // PoweredBy 헤더 제거
  poweredByHeader: false,

  // 압축 활성화
  compress: true,

  // 트레일링 슬래시 설정
  trailingSlash: false,

  // ESLint 설정
  eslint: {
    // 프로덕션 빌드 시 ESLint 무시 (CI/CD에서 별도로 실행)
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },

  // TypeScript 설정
  typescript: {
    // 프로덕션 빌드 시 타입 체크 무시 (CI/CD에서 별도로 실행)
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;