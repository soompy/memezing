'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Share2, Download, MoreHorizontal, Bookmark, Flag } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';

interface MemePost {
  id: string;
  title: string;
  imageUrl: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  tags: string[];
  template: string;
}

const mockMemes: MemePost[] = [
  {
    id: '1',
    title: '월요일의 현실',
    imageUrl: 'https://i.imgflip.com/30b1gx.jpg',
    author: { id: '1', username: '밈마스터', avatar: undefined },
    createdAt: '2시간 전',
    likes: 142,
    comments: 23,
    shares: 8,
    isLiked: false,
    isBookmarked: false,
    tags: ['월요일', '직장인', '현실'],
    template: '드레이크 밈'
  },
  {
    id: '2',
    title: '치킨 vs 피자의 영원한 딜레마',
    imageUrl: 'https://i.imgflip.com/1ur9b0.jpg',
    author: { id: '2', username: '음식러버' },
    createdAt: '5시간 전',
    likes: 89,
    comments: 15,
    shares: 12,
    isLiked: true,
    isBookmarked: false,
    tags: ['음식', '선택장애', '치킨', '피자'],
    template: '한눈파는 남친'
  },
  {
    id: '3',
    title: '시험 기간 vs 방학',
    imageUrl: 'https://i.imgflip.com/345v97.jpg',
    author: { id: '3', username: '대학생라이프' },
    createdAt: '1일 전',
    likes: 256,
    comments: 47,
    shares: 32,
    isLiked: false,
    isBookmarked: true,
    tags: ['대학생', '시험', '방학', '공부'],
    template: '고양이 vs 여자'
  },
];

export default function FeedPage() {
  const router = useRouter();
  const { } = useAuthStore();
  const [memes, setMemes] = useState<MemePost[]>(mockMemes);
  const [filter, setFilter] = useState<'all' | 'following' | 'trending'>('all');
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const handleLike = (memeId: string) => {
    setMemes(prev => prev.map(meme => 
      meme.id === memeId 
        ? { 
            ...meme, 
            isLiked: !meme.isLiked,
            likes: meme.isLiked ? meme.likes - 1 : meme.likes + 1
          }
        : meme
    ));
  };

  const handleBookmark = (memeId: string) => {
    setMemes(prev => prev.map(meme => 
      meme.id === memeId 
        ? { ...meme, isBookmarked: !meme.isBookmarked }
        : meme
    ));
  };

  const handleShare = async (meme: MemePost) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: meme.title,
          text: `${meme.title} - 밈징어에서 확인하세요!`,
          url: `${window.location.origin}/meme/${meme.id}`
        });
      } catch {
        console.log('공유 취소됨');
      }
    } else {
      // 웹 공유 API를 지원하지 않는 경우 URL 복사
      navigator.clipboard.writeText(`${window.location.origin}/meme/${meme.id}`);
      alert('링크가 복사되었습니다!');
    }
  };

  const handleDownload = (meme: MemePost) => {
    const link = document.createElement('a');
    link.href = meme.imageUrl;
    link.download = `${meme.title}.jpg`;
    link.click();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-900 mb-4">밈 피드</h1>
          
          {/* 필터 탭 */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'all', label: '전체' },
              { key: 'following', label: '팔로잉' },
              { key: 'trending', label: '트렌딩' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as 'all' | 'following' | 'trending')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-600 hover:text-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 밈 생성 버튼 */}
        <div className="mb-8">
          <Button
            onClick={() => router.push('/meme-generator')}
            className="w-full py-4"
            size="lg"
          >
            🎨 새 밈 만들기
          </Button>
        </div>

        {/* 밈 목록 */}
        <div className="space-y-6">
          {memes.map((meme) => (
            <div key={meme.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* 작성자 정보 */}
              <div className="p-4 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {meme.author.username.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-900">{meme.author.username}</p>
                      <p className="text-sm text-500">{meme.createdAt}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(showMenu === meme.id ? null : meme.id)}
                      className="p-2 text-400 hover:text-600 rounded-full hover:bg-gray-100"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    {showMenu === meme.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button className="w-full text-left px-4 py-2 text-sm text-700 hover:bg-primary-50 flex items-center">
                          <Flag className="w-4 h-4 mr-2" />
                          신고하기
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm text-700 hover:bg-primary-50 flex items-center">
                          <Download className="w-4 h-4 mr-2" />
                          다운로드
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 밈 제목 */}
              <div className="px-4 pb-3">
                <h2 className="text-lg font-semibold text-900">{meme.title}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {meme.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary-50 text-primary text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 밈 이미지 */}
              <div className="relative">
                <img
                  src={meme.imageUrl}
                  alt={meme.title}
                  className="w-full h-auto cursor-pointer"
                  onClick={() => router.push(`/meme/${meme.id}`)}
                />
              </div>

              {/* 인터랙션 버튼 */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => handleLike(meme.id)}
                      className={`flex items-center space-x-2 ${
                        meme.isLiked ? 'text-red-500' : 'text-600 hover:text-red-500'
                      }`}
                    >
                      <Heart
                        className={`w-6 h-6 ${meme.isLiked ? 'fill-current' : ''}`}
                      />
                      <span className="font-medium">{formatNumber(meme.likes)}</span>
                    </button>
                    
                    <button
                      onClick={() => router.push(`/meme/${meme.id}#comments`)}
                      className="flex items-center space-x-2 text-600 hover:text-primary"
                    >
                      <MessageCircle className="w-6 h-6" />
                      <span className="font-medium">{formatNumber(meme.comments)}</span>
                    </button>
                    
                    <button
                      onClick={() => handleShare(meme)}
                      className="flex items-center space-x-2 text-600 hover:text-secondary"
                    >
                      <Share2 className="w-6 h-6" />
                      <span className="font-medium">{formatNumber(meme.shares)}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleBookmark(meme.id)}
                    className={`p-2 rounded-full ${
                      meme.isBookmarked 
                        ? 'text-yellow-500 bg-yellow-50' 
                        : 'text-400 hover:text-accent hover:bg-accent-50'
                    }`}
                  >
                    <Bookmark
                      className={`w-5 h-5 ${meme.isBookmarked ? 'fill-current' : ''}`}
                    />
                  </button>
                </div>

                {/* 템플릿 정보 */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    템플릿: <span className="font-medium">{meme.template}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 로딩 더 보기 */}
        <div className="mt-8 text-center">
          <Button variant="outline" className="px-8">
            더 보기
          </Button>
        </div>
      </div>

      {/* 클릭 외부 영역에서 메뉴 닫기 */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(null)}
        />
      )}
    </div>
  );
}