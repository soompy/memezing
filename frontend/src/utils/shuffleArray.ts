/**
 * 배열을 랜덤하게 섞어주는 Fisher-Yates 셔플 알고리즘
 * @param array 섞을 배열
 * @returns 섞인 새로운 배열 (원본 배열은 수정되지 않음)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]; // 원본 배열 복사
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * 배열의 일부를 랜덤하게 선택하여 반환
 * @param array 원본 배열
 * @param count 선택할 개수
 * @returns 랜덤하게 선택된 항목들의 배열
 */
export function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * 두 개 이상의 배열을 합치고 랜덤하게 섞어서 반환
 * @param arrays 합칠 배열들
 * @returns 합쳐지고 섞인 배열
 */
export function shuffleMultipleArrays<T>(...arrays: T[][]): T[] {
  const combined = arrays.flat();
  return shuffleArray(combined);
}