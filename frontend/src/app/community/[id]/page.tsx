'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Heart, Share2, Download, Send, MessageCircle, MoreHorizontal, Flag } from 'lucide-react';
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
  description?: string;
}

interface Comment {
  id: string;
  author: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
}

// 샘플 데이터
const sampleMeme: MemePost = {
  id: '1',
  title: '월요일 오전의 현실',
  imageUrl: 'https://i.imgflip.com/30b1gx.jpg',
  author: '밈마스터',
  likes: 1247,
  shares: 342,
  views: 15632,
  createdAt: '2시간 전',
  isLiked: false,
  description: '월요일 아침에 일어나는 모든 직장인들의 마음을 대변하는 밈입니다. 😴'
};

const sampleComments: Comment[] = [
  {
    id: '1',
    author: '직장인99',
    content: '너무 공감됩니다 ㅠㅠ 월요일은 정말...',
    createdAt: '1시간 전',
    likes: 23,
    isLiked: false,
    replies: [
      {
        id: '1-1',
        author: '밈마스터',
        content: '월요병은 진짜 국민병이죠 ㅋㅋ',
        createdAt: '50분 전',
        likes: 5,
        isLiked: false
      }
    ]
  },
  {
    id: '2',
    author: '코딩왕',
    content: '개발자도 마찬가지... 월요일엔 코드가 더 안 보여요 😅',
    createdAt: '30분 전',
    likes: 15,
    isLiked: true
  },
  {
    id: '3',
    author: '대학생라이프',
    content: '학생도 월요일은 힘들어요... 특히 1교시 있을 때',
    createdAt: '15분 전',
    likes: 8,
    isLiked: false
  }
];

export default function MemeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [meme, setMeme] = useState<MemePost>(sampleMeme);
  const [comments, setComments] = useState<Comment[]>(sampleComments);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleLike = useCallback(() => {
    setMeme(prev => ({
      ...prev,
      isLiked: !prev.isLiked,
      likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1
    }));
  }, []);

  const handleShare = useCallback(async () => {
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
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 클립보드에 복사되었습니다!');
    }
  }, [meme.title]);

  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.download = `${meme.title}.jpg`;
    link.href = meme.imageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [meme.title, meme.imageUrl]);

  const handleCommentLike = useCallback((commentId: string) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          isLiked: !comment.isLiked,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
        };
      }
      // 대댓글 처리
      if (comment.replies) {
        return {
          ...comment,
          replies: comment.replies.map(reply => 
            reply.id === commentId 
              ? {
                  ...reply,
                  isLiked: !reply.isLiked,
                  likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1
                }
              : reply
          )
        };
      }
      return comment;
    }));
  }, []);

  const handleAddComment = useCallback(() => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: '나',
      content: newComment,
      createdAt: '방금 전',
      likes: 0,
      isLiked: false
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
  }, [newComment]);

  const handleAddReply = useCallback((parentId: string) => {
    if (!replyContent.trim()) return;

    const reply: Comment = {
      id: `${parentId}-${Date.now()}`,
      author: '나',
      content: replyContent,
      createdAt: '방금 전',
      likes: 0,
      isLiked: false
    };

    setComments(prev => prev.map(comment => 
      comment.id === parentId
        ? {
            ...comment,
            replies: [...(comment.replies || []), reply]
          }
        : comment
    ));
    
    setReplyContent('');
    setReplyTo(null);
  }, [replyContent]);

  // 조회수 증가 (실제 구현에서는 API 호출)
  useEffect(() => {
    setMeme(prev => ({ ...prev, views: prev.views + 1 }));
  }, []);

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
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 밈 이미지 및 정보 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* 밈 이미지 */}
              <div className="aspect-square relative">
                <img
                  src={meme.imageUrl}
                  alt={meme.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* 밈 정보 */}
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{meme.title}</h1>
                
                {/* 작성자 정보 */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">{meme.author[0]}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{meme.author}</p>
                    <p className="text-sm text-gray-500">{meme.createdAt}</p>
                  </div>
                </div>
                
                {/* 설명 */}
                {meme.description && (
                  <p className="text-gray-700 mb-4">{meme.description}</p>
                )}
                
                {/* 통계 */}
                <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
                  <div className="flex items-center space-x-1">
                    <Heart size={16} />
                    <span>{meme.likes.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Share2 size={16} />
                    <span>{meme.shares.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle size={16} />
                    <span>{comments.length}</span>
                  </div>
                  <div className="text-gray-500">
                    조회 {meme.views.toLocaleString()}
                  </div>
                </div>
                
                {/* 액션 버튼 */}
                <div className="flex items-center space-x-3">
                  <Button
                    variant={meme.isLiked ? "primary" : "secondary"}
                    size="sm"
                    onClick={handleLike}
                    className="flex-1"
                  >
                    <Heart 
                      size={16} 
                      className={`mr-2 ${meme.isLiked ? 'fill-current' : ''}`} 
                    />
                    좋아요
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleShare}
                  >
                    <Share2 size={16} className="mr-2" />
                    공유
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleDownload}
                  >
                    <Download size={16} className="mr-2" />
                    다운로드
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* 댓글 섹션 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">댓글 {comments.length}</h3>
              </div>
              
              {/* 댓글 입력 */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-gray-600">나</span>
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="댓글을 입력하세요..."
                      className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        size="sm"
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                      >
                        <Send size={14} className="mr-1" />
                        댓글 작성
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 댓글 목록 */}
              <div className="max-h-96 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-gray-600">{comment.author[0]}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                          <span className="text-xs text-gray-500">{comment.createdAt}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                        
                        {/* 댓글 액션 */}
                        <div className="flex items-center space-x-3 text-xs">
                          <button
                            onClick={() => handleCommentLike(comment.id)}
                            className={`flex items-center space-x-1 hover:text-red-500 ${
                              comment.isLiked ? 'text-red-500' : 'text-gray-500'
                            }`}
                          >
                            <Heart size={12} className={comment.isLiked ? 'fill-current' : ''} />
                            <span>{comment.likes}</span>
                          </button>
                          <button
                            onClick={() => setReplyTo(comment.id)}
                            className="text-gray-500 hover:text-blue-500"
                          >
                            답글
                          </button>
                          <button className="text-gray-500 hover:text-gray-700">
                            <MoreHorizontal size={12} />
                          </button>
                        </div>
                        
                        {/* 답글 입력 */}
                        {replyTo === comment.id && (
                          <div className="mt-3 ml-4">
                            <div className="flex space-x-2">
                              <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="답글을 입력하세요..."
                                className="flex-1 p-2 text-sm border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={2}
                              />
                              <div className="flex flex-col space-y-1">
                                <button
                                  onClick={() => handleAddReply(comment.id)}
                                  disabled={!replyContent.trim()}
                                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded disabled:opacity-50"
                                >
                                  작성
                                </button>
                                <button
                                  onClick={() => setReplyTo(null)}
                                  className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded"
                                >
                                  취소
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* 대댓글 목록 */}
                        {comment.replies && comment.replies.map((reply) => (
                          <div key={reply.id} className="mt-3 ml-4 pl-3 border-l-2 border-gray-200">
                            <div className="flex space-x-2">
                              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-medium text-gray-600">{reply.author[0]}</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-sm font-medium text-gray-900">{reply.author}</span>
                                  <span className="text-xs text-gray-500">{reply.createdAt}</span>
                                </div>
                                <p className="text-sm text-gray-700 mb-1">{reply.content}</p>
                                <button
                                  onClick={() => handleCommentLike(reply.id)}
                                  className={`flex items-center space-x-1 text-xs hover:text-red-500 ${
                                    reply.isLiked ? 'text-red-500' : 'text-gray-500'
                                  }`}
                                >
                                  <Heart size={10} className={reply.isLiked ? 'fill-current' : ''} />
                                  <span>{reply.likes}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}