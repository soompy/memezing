// 스티커 관련 유틸리티 함수들

import * as fabric from 'fabric';
import type { Sticker, SpeechBubble, CanvasSticker, CanvasSpeechBubble } from '@/types/sticker';

/**
 * 스티커를 Fabric.js 이미지 객체로 변환
 */
export async function createStickerObject(sticker: Sticker): Promise<CanvasSticker> {
  return new Promise((resolve, reject) => {
    fabric.Image.fromURL(
      sticker.url,
      (img) => {
        if (!img) {
          reject(new Error('Failed to load sticker image'));
          return;
        }

        // 스티커 데이터 추가
        const stickerImg = img as CanvasSticker;
        stickerImg.stickerData = {
          stickerId: sticker.id,
          type: sticker.type,
          originalWidth: sticker.width,
          originalHeight: sticker.height,
          isLocked: false
        };

        // 기본 설정
        stickerImg.set({
          left: 100,
          top: 100,
          scaleX: 1,
          scaleY: 1,
          selectable: true,
          hasControls: true,
          hasBorders: true,
          cornerStyle: 'circle',
          cornerSize: 12,
          transparentCorners: false,
          cornerColor: '#2563eb',
          borderColor: '#2563eb',
          borderScaleFactor: 2,
        });

        // 크기 제한 (최대 캔버스의 1/3)
        const maxSize = 200;
        if (stickerImg.width! > maxSize || stickerImg.height! > maxSize) {
          const scale = Math.min(maxSize / stickerImg.width!, maxSize / stickerImg.height!);
          stickerImg.scale(scale);
        }

        resolve(stickerImg);
      },
      {
        crossOrigin: 'anonymous'
      }
    );
  });
}

/**
 * SVG 경로에서 말풍선 도형 생성
 */
export function createSpeechBubblePath(
  bubbleStyle: SpeechBubble['bubbleStyle'],
  tailPosition: SpeechBubble['tailPosition'],
  width: number = 200,
  height: number = 100
): string {
  const radius = 10;
  const tailSize = 15;

  switch (bubbleStyle) {
    case 'speech':
      return createSpeechBubbleSVG(width, height, radius, tailPosition, tailSize);
    case 'thought':
      return createThoughtBubbleSVG(width, height);
    case 'scream':
      return createScreamBubbleSVG(width, height, tailPosition);
    default:
      return createBasicRectangleSVG(width, height, radius);
  }
}

function createSpeechBubbleSVG(
  width: number,
  height: number,
  radius: number,
  tailPosition: string,
  tailSize: number
): string {
  const bubbleHeight = height - tailSize;
  let path = `M ${radius} 0 L ${width - radius} 0 Q ${width} 0 ${width} ${radius} L ${width} ${bubbleHeight - radius} Q ${width} ${bubbleHeight} ${width - radius} ${bubbleHeight}`;

  // 꼬리 위치에 따른 경로 추가
  switch (tailPosition) {
    case 'bottom-left':
      path += ` L ${tailSize * 2} ${bubbleHeight} L ${tailSize} ${height} L ${tailSize} ${bubbleHeight}`;
      break;
    case 'bottom-center':
      path += ` L ${width / 2 + tailSize} ${bubbleHeight} L ${width / 2} ${height} L ${width / 2 - tailSize} ${bubbleHeight}`;
      break;
    case 'bottom-right':
      path += ` L ${width - tailSize} ${bubbleHeight} L ${width - tailSize} ${height} L ${width - tailSize * 2} ${bubbleHeight}`;
      break;
  }

  path += ` L ${radius} ${bubbleHeight} Q 0 ${bubbleHeight} 0 ${bubbleHeight - radius} L 0 ${radius} Q 0 0 ${radius} 0 Z`;

  return path;
}

function createThoughtBubbleSVG(width: number, height: number): string {
  // 구름 모양의 말풍선
  const bubbles = [
    { x: width * 0.1, y: height * 0.8, r: 8 },
    { x: width * 0.05, y: height * 0.9, r: 5 },
    { x: width * 0.02, y: height * 0.95, r: 3 }
  ];

  let path = `M ${width * 0.2} ${height * 0.1} `;
  
  // 구름 모양 생성 (간단한 타원들의 조합)
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = width / 2 + Math.cos(angle) * width * 0.4;
    const y = height / 3 + Math.sin(angle) * height * 0.25;
    if (i === 0) {
      path += `M ${x} ${y} `;
    } else {
      path += `L ${x} ${y} `;
    }
  }
  path += 'Z ';

  // 작은 구름 버블들 추가
  bubbles.forEach(bubble => {
    path += `M ${bubble.x + bubble.r} ${bubble.y} A ${bubble.r} ${bubble.r} 0 1 1 ${bubble.x - bubble.r} ${bubble.y} A ${bubble.r} ${bubble.r} 0 1 1 ${bubble.x + bubble.r} ${bubble.y} `;
  });

  return path;
}

function createScreamBubbleSVG(width: number, height: number, tailPosition: string): string {
  // 톱니바퀴 모양의 외침 말풍선
  const spikes = 8;
  const spikeHeight = 10;
  let path = '';

  for (let i = 0; i <= spikes * 2; i++) {
    const angle = (i / (spikes * 2)) * Math.PI * 2;
    const radius = i % 2 === 0 ? (width / 2 - spikeHeight) : (width / 2);
    const x = width / 2 + Math.cos(angle) * radius;
    const y = height / 2 + Math.sin(angle) * radius;
    
    if (i === 0) {
      path += `M ${x} ${y} `;
    } else {
      path += `L ${x} ${y} `;
    }
  }
  
  path += 'Z';
  return path;
}

function createBasicRectangleSVG(width: number, height: number, radius: number): string {
  return `M ${radius} 0 L ${width - radius} 0 Q ${width} 0 ${width} ${radius} L ${width} ${height - radius} Q ${width} ${height} ${width - radius} ${height} L ${radius} ${height} Q 0 ${height} 0 ${height - radius} L 0 ${radius} Q 0 0 ${radius} 0 Z`;
}

/**
 * 말풍선 그룹 객체 생성
 */
export async function createSpeechBubbleGroup(
  speechBubble: SpeechBubble,
  text: string = '',
  options: {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    textColor?: string;
    fontSize?: number;
  } = {}
): Promise<CanvasSpeechBubble> {
  const {
    backgroundColor = '#ffffff',
    borderColor = '#000000',
    borderWidth = 2,
    textColor = '#000000',
    fontSize = 16
  } = options;

  const width = speechBubble.width;
  const height = speechBubble.height;

  // 말풍선 배경 생성
  const bubblePath = createSpeechBubblePath(
    speechBubble.bubbleStyle,
    speechBubble.tailPosition,
    width,
    height
  );

  const bubbleShape = new fabric.Path(bubblePath, {
    fill: backgroundColor,
    stroke: borderColor,
    strokeWidth: borderWidth,
    selectable: false,
    evented: false
  });

  // 텍스트 객체 생성
  const textObject = new fabric.Text(text || speechBubble.defaultText || '', {
    left: width / 2,
    top: height / 3,
    originX: 'center',
    originY: 'center',
    fontSize: fontSize,
    fill: textColor,
    fontFamily: 'Arial',
    textAlign: 'center',
    selectable: false,
    evented: false,
    width: width * 0.8
  });

  // 그룹으로 결합
  const group = new fabric.Group([bubbleShape, textObject], {
    left: 100,
    top: 100,
    selectable: true,
    hasControls: true,
    hasBorders: true,
    cornerStyle: 'circle',
    cornerSize: 12,
    transparentCorners: false,
    cornerColor: '#2563eb',
    borderColor: '#2563eb',
    borderScaleFactor: 2,
  }) as CanvasSpeechBubble;

  // 말풍선 데이터 추가
  group.bubbleData = {
    stickerId: speechBubble.id,
    bubbleStyle: speechBubble.bubbleStyle,
    tailPosition: speechBubble.tailPosition,
    backgroundColor,
    borderColor,
    borderWidth,
    textObject
  };

  return group;
}

/**
 * 선택된 객체의 타입 확인
 */
export function getObjectType(obj: fabric.Object | null): 'sticker' | 'speech-bubble' | 'text' | 'image' | null {
  if (!obj) return null;

  if ((obj as CanvasSticker).stickerData) {
    return 'sticker';
  }
  
  if ((obj as CanvasSpeechBubble).bubbleData) {
    return 'speech-bubble';
  }

  if (obj instanceof fabric.Text) {
    return 'text';
  }

  if (obj instanceof fabric.Image) {
    return 'image';
  }

  return null;
}

/**
 * 스티커/말풍선 Z-index 관리
 */
export function bringToFront(canvas: fabric.Canvas, obj: fabric.Object) {
  canvas.bringObjectToFront(obj);
  canvas.renderAll();
}

export function sendToBack(canvas: fabric.Canvas, obj: fabric.Object) {
  canvas.sendObjectToBack(obj);
  canvas.renderAll();
}

/**
 * 스티커 크기 제한 검증
 */
export function validateStickerSize(
  sticker: fabric.Object,
  canvasWidth: number,
  canvasHeight: number
): boolean {
  const maxWidth = canvasWidth * 0.8;
  const maxHeight = canvasHeight * 0.8;
  
  const stickerWidth = (sticker.width || 0) * (sticker.scaleX || 1);
  const stickerHeight = (sticker.height || 0) * (sticker.scaleY || 1);
  
  return stickerWidth <= maxWidth && stickerHeight <= maxHeight;
}