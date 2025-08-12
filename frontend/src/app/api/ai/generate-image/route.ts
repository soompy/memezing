import { NextRequest, NextResponse } from 'next/server';

interface OpenAIImageResponse {
  data: {
    url: string;
  }[];
}

// 무료 대체 이미지 생성 함수
async function generateFallbackImage(prompt: string): Promise<string> {
  // 방법 1: Hugging Face Inference API (무료)
  const hfApiKey = process.env.HUGGINGFACE_API_KEY;
  if (hfApiKey && hfApiKey !== 'your-huggingface-api-key') {
    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
        {
          headers: {
            'Authorization': `Bearer ${hfApiKey}`,
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            inputs: `meme style, funny, ${prompt}, high contrast, bold text, simple composition`,
            parameters: {
              num_inference_steps: 20,
              guidance_scale: 7.5,
            }
          }),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        // Base64로 변환하여 반환
        const arrayBuffer = await blob.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        return `data:image/png;base64,${base64}`;
      }
    } catch (error) {
      console.error('Hugging Face API error:', error);
    }
  }

  // 방법 2: 프롬프트가 포함된 더 나은 placeholder 이미지
  const words = prompt.split(' ').slice(0, 8).join(' '); // 처음 8단어만
  const encodedPrompt = encodeURIComponent(words);
  
  // 다양한 색상 조합 중 랜덤 선택
  const colors = [
    { bg: '4A90E2', text: 'FFFFFF' }, // 파랑/흰색
    { bg: 'E74C3C', text: 'FFFFFF' }, // 빨강/흰색  
    { bg: '2ECC71', text: 'FFFFFF' }, // 초록/흰색
    { bg: 'F39C12', text: 'FFFFFF' }, // 주황/흰색
    { bg: '9B59B6', text: 'FFFFFF' }, // 보라/흰색
  ];
  
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  return `https://via.placeholder.com/1024x1024/${randomColor.bg}/${randomColor.text}?text=AI+Generated:+${encodedPrompt}`;
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
    if (!openaiApiKey || openaiApiKey === 'your-openai-api-key') {
      // 폴백: 무료 이미지 생성 서비스 사용
      try {
        // Hugging Face의 무료 이미지 생성 API 사용 (예시)
        const fallbackImageUrl = await generateFallbackImage(prompt);
        return NextResponse.json({
          success: true,
          data: {
            imageUrl: fallbackImageUrl,
            prompt: prompt,
            fallback: true,
            message: 'OpenAI API 키가 설정되지 않아 대체 서비스를 사용합니다.'
          }
        });
      } catch (error) {
        // 대체 서비스도 실패하면 더미 이미지
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