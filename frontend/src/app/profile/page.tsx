'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Edit3, Share2, Download, Heart, Eye, Calendar, MapPin, Link as LinkIcon, Mail, User, Settings, Grid, List, TrendingUp, Award, Plus, Filter, Search, BookmarkIcon, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';

interface UserStats {
  totalMemes: number;
  totalLikes: number;
  totalViews: number;
  followers: number;
  following: number;
  joinDate: string;
}

interface UserMeme {
  id: string;
  title: string;
  imageUrl: string;
  likesCount: number;
  viewsCount: number;
  createdAt: string;
  isPublic: boolean;
  category?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'memes' | 'liked' | 'stats' | 'collections'>('memes');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  const [userStats, setUserStats] = useState<UserStats>({
    totalMemes: 42,
    totalLikes: 1247,
    totalViews: 8932,
    followers: 156,
    following: 89,
    joinDate: '2024년 1월 가입'
  });

  const [userMemes, setUserMemes] = useState<UserMeme[]>([
    {
      id: '1',
      title: '월요일 아침의 현실',
      imageUrl: 'https://i.imgflip.com/1g8my4.jpg',
      likesCount: 156,
      viewsCount: 892,
      createdAt: '2024-01-15',
      isPublic: true,
      category: 'daily'
    },
    {
      id: '2', 
      title: '금요일 오후 3시의 기분',
      imageUrl: 'https://i.imgflip.com/30b1gx.jpg',
      likesCount: 203,
      viewsCount: 1241,
      createdAt: '2024-01-12',
      isPublic: true,
      category: 'work'
    },
    {
      id: '3',
      title: '커피 없는 아침은 상상할 수 없어',
      imageUrl: 'https://i.imgflip.com/1bhk.jpg',
      likesCount: 89,
      viewsCount: 456,
      createdAt: '2024-01-10',
      isPublic: false,
      category: 'lifestyle'
    }
  ]);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '밈징 크리에이터',
    bio: '밈으로 세상을 더 재미있게 만들어가는 크리에이터입니다 🎭✨',
    location: '서울, 대한민국',
    website: 'https://meme-zing.com',
    interests: ['드라마', '음식', '일상', '유머']
  });

  // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleProfileUpdate = async () => {
    console.log('프로필 업데이트:', profileForm);
    setIsEditing(false);
  };

  const handleMemeAction = (action: string, memeId: string) => {
    console.log(`${action} meme:`, memeId);
  };

  const filteredMemes = userMemes.filter(meme => {
    const matchesSearch = meme.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || meme.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">프로필을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* 배경 데코레이션 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-secondary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* 프로필 헤더 */}
        <motion.div 
          className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            {/* 프로필 이미지 */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-primary-500 to-secondary-400 p-1">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  {user.avatar ? (
                    <img src={user.avatar} alt="프로필" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-gray-400" />
                  )}
                </div>
              </div>
              <button className="absolute bottom-2 right-2 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary-600 transition-colors group-hover:scale-110 transform duration-300">
                <Camera className="w-5 h-5" />
              </button>
            </div>

            {/* 프로필 정보 */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    label="이름"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    className="text-lg font-bold"
                  />
                  <textarea
                    placeholder="자기소개를 입력하세요..."
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all duration-300 resize-none"
                    rows={3}
                  />
                  <div className="flex gap-4">
                    <Input
                      label="위치"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                      className="flex-1"
                    />
                    <Input
                      label="웹사이트"
                      value={profileForm.website}
                      onChange={(e) => setProfileForm({...profileForm, website: e.target.value})}
                      className="flex-1"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                      {profileForm.name}
                    </h1>
                    <div className="flex items-center gap-2 bg-gradient-to-r from-primary-100 to-secondary-100 px-3 py-1 rounded-full">
                      <Award className="w-4 h-4 text-primary-600" />
                      <span className="text-sm font-medium text-primary-700">밈 마스터</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">{profileForm.bio}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profileForm.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <LinkIcon className="w-4 h-4" />
                      <a href={profileForm.website} className="text-primary-600 hover:underline">
                        {profileForm.website}
                      </a>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{userStats.joinDate}</span>
                    </div>
                  </div>

                  {/* 관심사 태그 */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {profileForm.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 rounded-full text-sm font-medium"
                      >
                        #{interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 액션 버튼 */}
              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleProfileUpdate}
                      className="bg-gradient-to-r from-primary-500 to-secondary-400 text-white px-6 py-2 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      저장하기
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      className="px-6 py-2 rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all duration-300"
                    >
                      취소
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-primary-500 to-secondary-400 text-white px-6 py-2 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      프로필 편집
                    </Button>
                    <Button
                      variant="outline"
                      className="px-6 py-2 rounded-xl border-2 border-gray-300 hover:border-primary-400 transition-all duration-300 flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      설정
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:min-w-[200px]">
              <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl">
                <div className="text-2xl font-bold text-primary-700">{userStats.totalMemes}</div>
                <div className="text-sm text-primary-600">밈 작품</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-2xl">
                <div className="text-2xl font-bold text-secondary-700">{userStats.totalLikes.toLocaleString()}</div>
                <div className="text-sm text-secondary-600">받은 좋아요</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-accent-50 to-accent-100 rounded-2xl">
                <div className="text-2xl font-bold text-accent-700">{userStats.totalViews.toLocaleString()}</div>
                <div className="text-sm text-accent-600">총 조회수</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
                <div className="text-2xl font-bold text-purple-700">{userStats.followers}</div>
                <div className="text-sm text-purple-600">팔로워</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 탭과 필터 */}
        <motion.div 
          className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {/* 탭 메뉴 */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { id: 'memes', label: '내 밈', icon: Grid, count: userStats.totalMemes },
              { id: 'liked', label: '좋아요한 밈', icon: Heart, count: 24 },
              { id: 'collections', label: '컬렉션', icon: BookmarkIcon, count: 6 },
              { id: 'stats', label: '통계', icon: TrendingUp, count: null }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-400 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* 검색 및 필터 (밈 탭에서만 표시) */}
          {(activeTab === 'memes' || activeTab === 'liked') && (
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="밈 제목으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all duration-300"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all duration-300"
                >
                  <option value="all">모든 카테고리</option>
                  <option value="daily">일상</option>
                  <option value="work">직장</option>
                  <option value="lifestyle">라이프스타일</option>
                </select>
                
                <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 transition-colors ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 transition-colors ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* 컨텐츠 영역 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {activeTab === 'memes' && (
            <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}`}>
              {filteredMemes.map((meme, index) => (
                <motion.div
                  key={meme.id}
                  className={`bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${
                    viewMode === 'list' ? 'flex gap-4 p-4' : ''
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <div className={`${viewMode === 'list' ? 'w-32 h-24' : 'aspect-square'} relative group`}>
                    <img
                      src={meme.imageUrl}
                      alt={meme.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMemeAction('edit', meme.id)}
                          className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors"
                        >
                          <Edit3 className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => handleMemeAction('share', meme.id)}
                          className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors"
                        >
                          <Share2 className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => handleMemeAction('download', meme.id)}
                          className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors"
                        >
                          <Download className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                    {!meme.isPublic && (
                      <div className="absolute top-2 right-2 p-1 bg-black/50 rounded-lg backdrop-blur-sm">
                        <Lock className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className={`${viewMode === 'list' ? 'flex-1' : 'p-4'}`}>
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{meme.title}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                      <span>{new Date(meme.createdAt).toLocaleDateString('ko-KR')}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        meme.isPublic ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {meme.isPublic ? '공개' : '비공개'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{meme.likesCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{meme.viewsCount}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* 새 밈 만들기 카드 */}
              <motion.button
                onClick={() => router.push('/meme-generator')}
                className="bg-gradient-to-br from-primary-100 to-secondary-100 border-2 border-dashed border-primary-300 rounded-2xl aspect-square flex flex-col items-center justify-center text-primary-600 hover:bg-gradient-to-br hover:from-primary-200 hover:to-secondary-200 transition-all duration-300 hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-12 h-12 mb-2" />
                <span className="font-medium">새 밈 만들기</span>
              </motion.button>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">월간 성장률</h3>
                    <p className="text-sm text-gray-500">지난 30일 기준</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-primary-600 mb-2">+24%</div>
                <p className="text-sm text-gray-600">저번 달 대비 조회수 증가</p>
              </div>

              {/* 더 많은 통계 카드들... */}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}