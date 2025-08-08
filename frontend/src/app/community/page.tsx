'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { ArrowLeft, Heart, Share2, Download, TrendingUp, Clock, Users, Eye, Plus, ImageIcon, LogIn, User } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useToastContext } from '@/context/ToastContext';

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
  commentsCount?: number;
}

interface CommunityStats {
  totalMembers: number;
  todayLikes: number;
  todayShares: number;
  totalMemes: number;
}

interface CommunityResponse {
  success: boolean;
  data: {
    memes: MemePost[];
    stats: CommunityStats;
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  error?: string;
}

// API에서 커뮤니티 데이터를 가져오는 함수
async function fetchCommunityData(sortBy: 'popular' | 'recent' = 'popular', page: number = 1): Promise<CommunityResponse | null> {
  try {
    const response = await fetch(`/api/community?sortBy=${sortBy}&page=${page}`);
    const data = await response.json();
    
    if (data.success) {
      return data;
    } else {
      throw new Error(data.error || 'Failed to fetch community data');
    }
  } catch (error) {
    console.error('Error fetching community data:', error);
    return null;
  }
}

export default function CommunityPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [memes, setMemes] = useState<MemePost[]>([]);
  const [stats, setStats] = useState<CommunityStats>({
    totalMembers: 0,
    todayLikes: 0,
    todayShares: 0,
    totalMemes: 0
  });
  const [sortBy, setSortBy] = useState<'popular' | 'recent'>('popular');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { showSuccess } = useToastContext();

  // 데이터 로드 함수
  const loadCommunityData = useCallback(async (newSortBy?: 'popular' | 'recent', reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentPage = reset ? 1 : page;
      const currentSortBy = newSortBy || sortBy;
      
      const data = await fetchCommunityData(currentSortBy, currentPage);
      
      if (data) {
        if (reset) {
          setMemes(data.data.memes);
          setPage(1);
        } else {
          setMemes(prev => [...prev, ...data.data.memes]);
        }
        setStats(data.data.stats);
        setHasMore(data.data.pagination.hasNext);
      } else {
        setError('커뮤니티 데이터를 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('Community data loading error:', error);
      setError('데이터 로딩 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [sortBy, page]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadCommunityData(undefined, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // refresh 파라미터 감지하여 데이터 새로고침
  useEffect(() => {
    const refresh = searchParams.get('refresh');
    if (refresh === 'true') {
      loadCommunityData(undefined, true);
      // URL에서 refresh 파라미터 제거
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('refresh');
      router.replace(newUrl.pathname + newUrl.search, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // 정렬 변경 시 데이터 재로드
  const handleSortChange = useCallback((newSortBy: 'popular' | 'recent') => {
    setSortBy(newSortBy);
    setPage(1);
    loadCommunityData(newSortBy, true);
  }, [loadCommunityData]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // 업로드 페이지로 이동
  const handleUpload = useCallback(() => {
    router.push('/community/upload');
  }, [router]);

  // 로그인 페이지로 이동
  const goToLogin = useCallback(() => {
    router.push('/auth/signin');
  }, [router]);

  const handleLike = useCallback(async (memeId: string) => {
    try {
      // 낙관적 업데이트
      setMemes(prev => prev.map(meme => 
        meme.id === memeId 
          ? { 
              ...meme, 
              isLiked: !meme.isLiked,
              likes: meme.isLiked ? meme.likes - 1 : meme.likes + 1
            }
          : meme
      ));

      // API 호출
      const response = await fetch(`/api/memes/${memeId}/like`, {
        method: 'POST'
      });

      if (!response.ok) {
        // 실패시 되돌리기
        setMemes(prev => prev.map(meme => 
          meme.id === memeId 
            ? { 
                ...meme, 
                isLiked: !meme.isLiked,
                likes: meme.isLiked ? meme.likes - 1 : meme.likes + 1
              }
            : meme
        ));
        showSuccess('좋아요 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Like error:', error);
      // 실패시 되돌리기
      setMemes(prev => prev.map(meme => 
        meme.id === memeId 
          ? { 
              ...meme, 
              isLiked: !meme.isLiked,
              likes: meme.isLiked ? meme.likes - 1 : meme.likes + 1
            }
          : meme
      ));
    }
  }, [showSuccess]);

  const handleShare = useCallback(async (meme: MemePost) => {
    if (!meme || !meme.title) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: meme.title,
          text: `${meme.title} - 밈징에서 만든 재미있는 밈!`,
          url: window.location.href
        });
      } catch (shareError) {
        console.log('공유 취소됨:', shareError);
      }
    } else {
      // 폴백: 클립보드에 복사
      navigator.clipboard.writeText(window.location.href);
      showSuccess('링크가 복사되었습니다!');
    }
  }, [showSuccess]);

  const handleDownload = useCallback((meme: MemePost) => {
    if (!meme || !meme.title || !meme.imageUrl) return;
    
    const link = document.createElement('a');
    link.download = `${meme.title}.jpg`;
    link.href = meme.imageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // 더 보기 버튼 클릭
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      loadCommunityData(sortBy, false);
    }
  }, [loading, hasMore, sortBy, loadCommunityData]);

  return (
    <div className="min-h-screen bg-gray-50 md:pt-0">
      {/* 헤더 - 모바일 최적화 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        {/* 모바일 헤더 */}
        <div className="md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <Button variant="secondary" size="sm" onClick={handleBack} className="p-2">
                <ArrowLeft size={18} />
              </Button>
              <h1 className="text-gray-900 text-lg" style={{fontFamily: "'Black Han Sans', sans-serif", fontSize: '1.5rem', fontWeight: 'light'}}>
                밈징 커뮤니티
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              {session ? (
                <Button variant="outline" size="sm" onClick={() => router.push('/profile')} className="px-2 py-2">
                  <User size={16} />
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={goToLogin} className="px-2 py-2">
                  <LogIn size={16} />
                </Button>
              )}
              <Button variant="primary" size="sm" onClick={handleUpload} className="px-3 py-2">
                <Plus size={16} className="mr-1" />
                업로드
              </Button>
            </div>
          </div>
          
          {/* 모바일 정렬 탭 */}
          <div className="flex border-t border-gray-100">
            <button
              onClick={() => handleSortChange('popular')}
              className={`flex-1 flex items-center justify-center py-3 text-sm font-medium transition-colors ${
                sortBy === 'popular'
                  ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TrendingUp size={16} className="mr-2" />
              인기순
            </button>
            <button
              onClick={() => handleSortChange('recent')}
              className={`flex-1 flex items-center justify-center py-3 text-sm font-medium transition-colors ${
                sortBy === 'recent'
                  ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clock size={16} className="mr-2" />
              최신순
            </button>
          </div>
        </div>
        
        {/* 데스크톱 헤더 (기존 유지) */}
        <div className="hidden md:block px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="secondary" size="sm" onClick={handleBack}>
                <ArrowLeft size={16} className="mr-2" />
                뒤로가기
              </Button>
              <h1 className="text-gray-900 leading-tight" style={{fontFamily: "'Black Han Sans', sans-serif", fontSize: '1.7rem', fontWeight: 'light'}}>
                밈징 커뮤니티
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={sortBy === 'popular' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleSortChange('popular')}
              >
                <TrendingUp size={16} className="mr-1" />
                인기순
              </Button>
              <Button
                variant={sortBy === 'recent' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleSortChange('recent')}
              >
                <Clock size={16} className="mr-1" />
                최신순
              </Button>
              <div className="w-px h-6 bg-gray-300 mx-2"></div>
              {session ? (
                <Button variant="outline" size="sm" onClick={() => router.push('/profile')}>
                  <User size={16} className="mr-1" />
                  {session.user?.name || '프로필'}
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={goToLogin}>
                  <LogIn size={16} className="mr-1" />
                  로그인
                </Button>
              )}
              <Button variant="primary" size="sm" onClick={handleUpload}>
                <Plus size={16} className="mr-1" />
                업로드
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto p-4 md:p-6">
        {/* 통계 카드 - 모바일 최적화 */}
        <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6">
            <div className="flex flex-col md:flex-row items-center md:items-center md:space-x-3 text-center md:text-left">
              <div className="p-2 bg-blue-100 rounded-lg mb-2 md:mb-0 mx-auto md:mx-0">
                <Users className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-600">총 멤버</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.totalMembers.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6">
            <div className="flex flex-col md:flex-row items-center md:items-center md:space-x-3 text-center md:text-left">
              <div className="p-2 bg-green-100 rounded-lg mb-2 md:mb-0 mx-auto md:mx-0">
                <Heart className="w-4 h-4 md:w-6 md:h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-600">오늘의 좋아요</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.todayLikes.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6">
            <div className="flex flex-col md:flex-row items-center md:items-center md:space-x-3 text-center md:text-left">
              <div className="p-2 bg-purple-100 rounded-lg mb-2 md:mb-0 mx-auto md:mx-0">
                <Share2 className="w-4 h-4 md:w-6 md:h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-600">오늘의 공유</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.todayShares.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 로딩 상태 */}
        {loading && memes.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">커뮤니티 데이터를 불러오는 중...</p>
            </div>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => loadCommunityData(undefined, true)}>
                다시 시도
              </Button>
            </div>
          </div>
        )}

        {/* 밈 그리드 - 모바일 최적화 */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {memes.length > 0 ? memes.map((meme) => meme ? (
            <div key={meme.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* 밈 이미지 */}
              <div 
                className="aspect-square relative cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => router.push(`/community/${meme.id}`)}
              >
                <Image
                  src={meme.imageUrl}
                  alt={meme.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              
              {/* 밈 정보 */}
              <div className="p-3 md:p-4">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base line-clamp-2">{meme.title}</h3>
                
                {/* 작성자 정보 */}
                <div className="flex items-center space-x-2 mb-2 md:mb-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <Users size={12} className="text-gray-600 md:w-4 md:h-4" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-900">{meme.author}</p>
                    <p className="text-xs text-gray-500">{meme.createdAt}</p>
                  </div>
                </div>
                
                {/* 통계 */}
                <div className="flex items-center justify-between text-xs md:text-sm text-gray-600 mb-3 md:mb-4">
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <div className="flex items-center space-x-1">
                      <Heart size={12} className="md:w-4 md:h-4" />
                      <span>{meme.likes.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Share2 size={12} className="md:w-4 md:h-4" />
                      <span>{meme.shares.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye size={12} className="md:w-4 md:h-4" />
                      <span>{meme.views.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                {/* 액션 버튼 - 모바일 최적화 */}
                <div className="flex items-center space-x-1 md:space-x-2">
                  <Button
                    variant={meme.isLiked ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => handleLike(meme.id)}
                    className="flex-1 text-xs md:text-sm py-2 px-2 md:px-3"
                  >
                    <Heart 
                      size={12} 
                      className={`mr-1 md:w-4 md:h-4 ${meme.isLiked ? 'fill-current' : ''}`} 
                    />
                    <span className="hidden md:inline">좋아요</span>
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleShare(meme)}
                    className="p-2 md:px-3"
                  >
                    <Share2 size={12} className="md:w-4 md:h-4" />
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownload(meme)}
                    className="p-2 md:px-3"
                  >
                    <Download size={12} className="md:w-4 md:h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : null) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500 mb-4">
                  <ImageIcon size={48} className="mx-auto mb-2" />
                  <p className="text-lg">아직 공유된 밈이 없습니다.</p>
                  <p className="text-sm">첫 번째 밈을 업로드해보세요!</p>
                </div>
                <Button onClick={handleUpload} size="lg">
                  <Plus size={16} className="mr-2" />
                  첫 밈 업로드하기
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* 더 보기 버튼 */}
        {!loading && !error && hasMore && memes.length > 0 && (
          <div className="text-center mt-8">
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={handleLoadMore}
              disabled={loading}
            >
              {loading ? '로딩 중...' : '더 많은 밈 보기'}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}