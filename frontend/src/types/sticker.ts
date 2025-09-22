// 스티커 및 말풍선 관련 타입 정의

export interface StickerCategory {
  id: string;
  name: string;
  icon: string;
  description?: string;
  order: number;
}

export interface Sticker {
  id: string;
  name: string;
  categoryId: string;
  url: string;
  thumbnailUrl?: string;
  width: number;
  height: number;
  type: 'emoji' | 'speech-bubble' | 'shape' | 'decoration' | 'meme-face';
  tags: string[];
  popularity: number;
  isPremium?: boolean;
  metadata?: {
    transparent: boolean;
    vector: boolean;
    animated: boolean;
  };
}

export interface SpeechBubble extends Sticker {
  type: 'speech-bubble';
  bubbleStyle: 'speech' | 'thought' | 'scream' | 'whisper' | 'custom';
  tailPosition: 'bottom-left' | 'bottom-center' | 'bottom-right' | 'top-left' | 'top-center' | 'top-right' | 'left' | 'right';
  customizable: {
    backgroundColor: boolean;
    borderColor: boolean;
    borderWidth: boolean;
    fontSize: boolean;
    textColor: boolean;
    padding: boolean;
  };
  defaultText?: string;
}

export interface StickerPlacement {
  id: string;
  stickerId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  zIndex: number;
  // 말풍선 전용 속성
  text?: string;
  textStyle?: {
    fontSize: number;
    fontFamily: string;
    color: string;
    align: 'left' | 'center' | 'right';
    lineHeight: number;
  };
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

export interface StickerCollection {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  stickers: Sticker[];
  isDefault: boolean;
  isPremium?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Canvas에서 사용할 스티커 객체
export interface CanvasSticker extends fabric.Image {
  stickerData?: {
    stickerId: string;
    type: Sticker['type'];
    originalWidth: number;
    originalHeight: number;
    isLocked?: boolean;
  };
}

export interface CanvasSpeechBubble extends fabric.Group {
  bubbleData?: {
    stickerId: string;
    bubbleStyle: SpeechBubble['bubbleStyle'];
    tailPosition: SpeechBubble['tailPosition'];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    textObject?: fabric.Text;
  };
}