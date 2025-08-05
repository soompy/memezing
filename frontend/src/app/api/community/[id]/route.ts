import { NextRequest, NextResponse } from 'next/server';

interface MemePost {
  id: string;
  title: string;
  imageUrl: string;
  author: string;
  likes: number;
  shares: number;
  views: number;
  createdAt: string;
  isLiked: boolean;
  description?: string;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}

// 임시 데이터 (실제로는 데이터베이스에서 가져올 것)
const SAMPLE_MEMES: Record<string, MemePost> = {
  '1': {
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
  }
};

const SAMPLE_COMMENTS: Record<string, Comment[]> = {
  '1': [
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
    }
  ]
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const meme = SAMPLE_MEMES[id];
    const comments = SAMPLE_COMMENTS[id] || [];

    if (!meme) {
      return NextResponse.json(
        { success: false, error: 'Meme not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        meme,
        comments
      }
    });

  } catch (error) {
    console.error('Community meme fetch error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch meme details',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}