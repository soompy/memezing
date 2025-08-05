import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAI 클라이언트 초기화 (환경변수가 없으면 null로 설정)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, existingTexts = [], count = 5 } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // OpenAI API 키가 설정되지 않은 경우 폴백 응답
    if (!openai) {
      console.warn('OPENAI_API_KEY not configured, using fallback response');
      
      // 폴백으로 템플릿 기반 응답 반환
      const fallbackSuggestions = [
        {
          id: `fallback-${Date.now()}-1`,
          text: '재미있는 밈 텍스트 예시',
          category: 'general',
          tone: 'funny' as const,
        },
        {
          id: `fallback-${Date.now()}-2`,
          text: '또 다른 밈 텍스트',
          category: 'general', 
          tone: 'trendy' as const,
        }
      ];

      return NextResponse.json({
        success: true,
        suggestions: fallbackSuggestions,
        note: 'Using fallback response - configure OPENAI_API_KEY for AI-generated content'
      });
    }

    // ChatGPT API 호출을 위한 시스템 프롬프트
    const systemPrompt = `당신은 한국어 밈 텍스트 생성 전문가입니다. 
다음 요구사항에 맞는 재미있고 트렌디한 한국어 밈 텍스트를 생성해주세요:

1. 한국의 최신 트렌드와 인터넷 문화를 반영
2. 자연스러운 한국어 표현 사용
3. 유머러스하고 공감할 수 있는 내용
4. 다양한 톤과 스타일 (재미있는, 아이러니한, 귀여운, 드라마틱한, 트렌디한)
5. 불쾌감을 주지 않는 건전한 내용

응답은 반드시 다음 JSON 형식으로만 제공해주세요:
{
  "suggestions": [
    {
      "id": "unique-id",
      "text": "밈 텍스트",
      "category": "카테고리",
      "tone": "funny|sarcastic|cute|dramatic|trendy"
    }
  ]
}`;

    let userPrompt = `다음 주제로 ${count}개의 밈 텍스트를 생성해주세요: ${prompt}`;
    
    if (existingTexts.length > 0) {
      userPrompt += `\n\n기존 텍스트들과 연관성을 고려해주세요: ${existingTexts.join(', ')}`;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // 무료 버전 사용
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      max_tokens: 1024,
      temperature: 0.8,
    });

    // ChatGPT 응답 파싱
    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from ChatGPT');
    }

    let responseData;
    try {
      responseData = JSON.parse(content);
    } catch (parseError) {
      // JSON 파싱 실패 시 텍스트에서 추출 시도
      console.error('Failed to parse ChatGPT response as JSON:', parseError);
      
      // 폴백: 간단한 텍스트 응답을 JSON 형태로 변환
      const lines = content.split('\n').filter(line => line.trim());
      const suggestions = lines.slice(0, count).map((line, index) => ({
        id: `ai-${Date.now()}-${index}`,
        text: line.trim().replace(/^\d+\.\s*/, '').replace(/^[\-\*]\s*/, '') || '재미있는 밈 텍스트',
        category: 'ai-generated',
        tone: 'funny' as const,
      }));
      
      return NextResponse.json({
        success: true,
        suggestions: suggestions.length > 0 ? suggestions : [{
          id: `ai-${Date.now()}-fallback`,
          text: '재미있는 밈 텍스트',
          category: 'ai-generated',
          tone: 'funny' as const,
        }],
      });
    }

    // ID가 없는 경우 추가
    if (responseData.suggestions) {
      responseData.suggestions = responseData.suggestions.map((suggestion: any, index: number) => ({
        ...suggestion,
        id: suggestion.id || `ai-${Date.now()}-${index}`,
      }));
    }

    return NextResponse.json({
      success: true,
      suggestions: responseData.suggestions || [],
    });

  } catch (error) {
    console.error('ChatGPT text generation error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate AI text with ChatGPT',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}