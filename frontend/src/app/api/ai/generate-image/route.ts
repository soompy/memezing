import { NextRequest, NextResponse } from 'next/server';

interface OpenAIImageResponse {
  data: {
    url: string;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, size = '1024x1024', quality = 'standard' } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // OpenAI API 키 확인
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      // 폴백: 더미 이미지 반환
      return NextResponse.json({
        success: true,
        data: {
          imageUrl: `https://picsum.photos/1024/1024?random=${Date.now()}`,
          prompt: prompt,
          fallback: true,
          message: 'OpenAI API 키가 설정되지 않아 더미 이미지를 반환합니다.'
        }
      });
    }

    // OpenAI DALL-E API 호출
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `Create a meme-style image: ${prompt}. Make it humorous, clean, and suitable for memes. High contrast, bold elements, simple composition.`,
        n: 1,
        size: size,
        quality: quality,
        response_format: 'url'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('OpenAI API Error:', errorData);
      
      // 에러 시 폴백 이미지 반환
      return NextResponse.json({
        success: true,
        data: {
          imageUrl: `https://picsum.photos/1024/1024?random=${Date.now()}`,
          prompt: prompt,
          fallback: true,
          message: 'AI 이미지 생성에 실패하여 더미 이미지를 반환합니다.'
        }
      });
    }

    const data: OpenAIImageResponse = await response.json();

    if (!data.data || data.data.length === 0) {
      throw new Error('No image generated');
    }

    return NextResponse.json({
      success: true,
      data: {
        imageUrl: data.data[0].url,
        prompt: prompt,
        fallback: false
      }
    });

  } catch (error) {
    console.error('Image generation error:', error);
    
    // 에러 시에도 폴백 이미지 제공
    return NextResponse.json({
      success: true,
      data: {
        imageUrl: `https://picsum.photos/1024/1024?random=${Date.now()}`,
        prompt: 'fallback image',
        fallback: true,
        message: '이미지 생성 중 오류가 발생하여 더미 이미지를 반환합니다.'
      }
    });
  }
}