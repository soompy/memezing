'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Share2, Download, TrendingUp, Clock, Users, Eye } from 'lucide-react';
import Button from '@/components/ui/Button';

interface MemePost {
  id: string;
  title: string;
  imageUrl: string;
  author: string;
  authorAvatar?: string;
  likes: number;
  shares: number;
  views: number;
  createdAt: string;
  isLiked?: boolean;
}

const popularMemes: MemePost[] = [
  {
    id: '1',
    title: '월요일 오전의 현실',
    imageUrl: 'https://i.imgflip.com/30b1gx.jpg',
    author: '밈마스터',
    likes: 1247,
    shares: 342,
    views: 15632,
    createdAt: '2시간 전',
    isLiked: false
  },
  {
    id: '2',
    title: '개발자의 일상',
    imageUrl: 'https://i.imgflip.com/1ur9b0.jpg',
    author: '코딩왕',
    likes: 2156,
    shares: 578,
    views: 23481,
    createdAt: '5시간 전',
    isLiked: true
  },
  {
    id: '3',
    title: '금요일 퇴근시간',
    imageUrl: 'https://i.imgflip.com/345v97.jpg',
    author: '직장인24',
    likes: 3421,
    shares: 892,
    views: 41253,
    createdAt: '1일 전',
    isLiked: false
  },
  {
    id: '4',
    title: '시험 기간의 현실',
    imageUrl: 'https://i.imgflip.com/1g8my4.jpg',
    author: '대학생라이프',
    likes: 876,
    shares: 234,
    views: 12456,
    createdAt: '3일 전',
    isLiked: false
  },
  {
    id: '5',
    title: '연말정산 시즌',
    imageUrl: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=400&h=400&fit=crop&crop=face',
    author: '세금고민러',
    likes: 1987,
    shares: 445,
    views: 18734,
    createdAt: '1주 전',
    isLiked: true
  },
  {
    id: '6',
    title: '다이어트 다짐 vs 현실',
    imageUrl: 'https://images.unsplash.com/photo-1569913486515-b74bf7751574?w=400&h=400&fit=crop&crop=face',
    author: '운동러버',
    likes: 2543,
    shares: 667,
    views: 29876,
    createdAt: '2주 전',
    isLiked: false
  }
];

export default function CommunityPage() {
  const router = useRouter();
  const [memes, setMemes] = useState<MemePost[]>(popularMemes);
  const [sortBy, setSortBy] = useState<'popular' | 'recent'>('popular');

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleLike = useCallback((memeId: string) => {
    setMemes(prev => prev.map(meme => 
      meme.id === memeId 
        ? { 
            ...meme, 
            isLiked: !meme.isLiked,
            likes: meme.isLiked ? meme.likes - 1 : meme.likes + 1
          }
        : meme
    ));
  }, []);

  const handleShare = useCallback(async (meme: MemePost) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: meme.title,
          text: `${meme.title} - 밈징에서 만든 재미있는 밈!`,
          url: window.location.href
        });
      } catch (error) {
        console.log('공유 취소됨');
      }
    } else {
      // 폴백: 클립보드에 복사
      navigator.clipboard.writeText(window.location.href);
      // TODO: 토스트 알림으로 교체
    }
  }, []);

  const handleDownload = useCallback((meme: MemePost) => {
    // 실제 구현에서는 이미지를 다운로드하는 로직이 필요
    const link = document.createElement('a');
    link.download = `${meme.title}.jpg`;
    link.href = meme.imageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const sortedMemes = [...memes].sort((a, b) => {
    if (sortBy === 'popular') {
      return b.likes - a.likes;
    } else {
      // 최신순 (간단한 예시로 ID 역순)
      return b.id.localeCompare(a.id);
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="secondary" size="sm" onClick={handleBack}>
              <ArrowLeft size={16} className="mr-2" />
              뒤로가기
            </Button>
            <h1 className="text-gray-900" style={{fontFamily: "'Black Han Sans', sans-serif", fontSize: '1.7rem', fontWeight: 'light'}}>
              밈징 커뮤니티
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={sortBy === 'popular' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSortBy('popular')}
            >
              <TrendingUp size={16} className="mr-1" />
              인기순
            </Button>
            <Button
              variant={sortBy === 'recent' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSortBy('recent')}
            >
              <Clock size={16} className="mr-1" />
              최신순
            </Button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto p-4 md:p-6">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">총 멤버</p>
                <p className="text-2xl font-bold text-gray-900">12,487</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">오늘의 좋아요</p>
                <p className="text-2xl font-bold text-gray-900">3,251</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Share2 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">오늘의 공유</p>
                <p className="text-2xl font-bold text-gray-900">892</p>
              </div>
            </div>
          </div>
        </div>

        {/* 밈 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedMemes.map((meme) => (
            <div key={meme.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* 밈 이미지 */}
              <div 
                className="aspect-square relative cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => router.push(`/community/${meme.id}`)}
              >
                <img
                  src={meme.imageUrl}
                  alt={meme.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* 밈 정보 */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{meme.title}</h3>
                
                {/* 작성자 정보 */}
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <Users size={14} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{meme.author}</p>
                    <p className="text-xs text-gray-500">{meme.createdAt}</p>
                  </div>
                </div>
                
                {/* 통계 */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Heart size={14} />
                      <span>{meme.likes.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Share2 size={14} />
                      <span>{meme.shares.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye size={14} />
                      <span>{meme.views.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                {/* 액션 버튼 */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant={meme.isLiked ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => handleLike(meme.id)}
                    className="flex-1"
                  >
                    <Heart 
                      size={14} 
                      className={`mr-1 ${meme.isLiked ? 'fill-current' : ''}`} 
                    />
                    좋아요
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleShare(meme)}
                  >
                    <Share2 size={14} />
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownload(meme)}
                  >
                    <Download size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* 더 보기 버튼 */}
        <div className="text-center mt-8">
          <Button variant="secondary" size="lg">
            더 많은 밈 보기
          </Button>
        </div>
      </main>
    </div>
  );
}