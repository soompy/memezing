// 이미지 캐싱 유틸리티

export interface CacheEntry {
  data: ArrayBuffer | string;
  contentType: string;
  timestamp: number;
  etag?: string;
  size: number;
  accessCount: number;
  lastAccess: number;
}

export interface CacheConfig {
  maxSize: number; // 최대 캐시 크기 (MB)
  maxEntries: number; // 최대 엔트리 수
  ttl: number; // Time To Live (ms)
  gcInterval: number; // Garbage Collection 간격 (ms)
}

/**
 * 고성능 이미지 캐시 매니저
 * - LRU (Least Recently Used) 알고리즘
 * - 메모리 사용량 제한
 * - 자동 가비지 컬렉션
 * - IndexedDB 백업 (선택적)
 */
export class ImageCacheManager {
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig;
  private currentSize = 0; // bytes
  private gcTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: config.maxSize || 50, // 50MB
      maxEntries: config.maxEntries || 500,
      ttl: config.ttl || 1000 * 60 * 60 * 24, // 24시간
      gcInterval: config.gcInterval || 1000 * 60 * 10, // 10분
    };

    this.startGarbageCollection();
  }

  /**
   * 캐시에서 이미지 가져오기
   */
  get(key: string): CacheEntry | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // TTL 체크
    if (Date.now() - entry.timestamp > this.config.ttl) {
      this.delete(key);
      return null;
    }

    // 접근 정보 업데이트 (LRU)
    entry.accessCount++;
    entry.lastAccess = Date.now();

    return entry;
  }

  /**
   * 캐시에 이미지 저장
   */
  set(key: string, data: ArrayBuffer | string, contentType: string, etag?: string): boolean {
    const size = typeof data === 'string' ? data.length : data.byteLength;
    
    // 크기 제한 체크
    if (size > this.config.maxSize * 1024 * 1024 * 0.1) {
      console.warn(`Image too large for cache: ${size} bytes`);
      return false;
    }

    // 기존 엔트리가 있다면 제거
    if (this.cache.has(key)) {
      this.delete(key);
    }

    // 캐시 공간 확보
    this.ensureCacheSpace(size);

    const entry: CacheEntry = {
      data,
      contentType,
      timestamp: Date.now(),
      etag,
      size,
      accessCount: 1,
      lastAccess: Date.now(),
    };

    this.cache.set(key, entry);
    this.currentSize += size;

    return true;
  }

  /**
   * 캐시에서 이미지 삭제
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentSize -= entry.size;
      return this.cache.delete(key);
    }
    return false;
  }

  /**
   * 캐시 클리어
   */
  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }

  /**
   * 캐시 통계
   */
  getStats() {
    return {
      entries: this.cache.size,
      size: this.currentSize,
      maxSize: this.config.maxSize * 1024 * 1024,
      hitRate: this.calculateHitRate(),
      oldestEntry: this.getOldestEntry(),
      newestEntry: this.getNewestEntry(),
    };
  }

  /**
   * 캐시 공간 확보
   */
  private ensureCacheSpace(requiredSize: number): void {
    const maxSizeBytes = this.config.maxSize * 1024 * 1024;
    
    // 크기 제한 체크
    while (
      (this.currentSize + requiredSize > maxSizeBytes) ||
      (this.cache.size >= this.config.maxEntries)
    ) {
      this.evictLRU();
    }
  }

  /**
   * LRU 알고리즘으로 엔트리 제거
   */
  private evictLRU(): void {
    if (this.cache.size === 0) return;

    let oldestKey = '';
    let oldestAccess = Date.now();

    // 가장 오래된 접근 시간을 가진 엔트리 찾기
    for (const [key, entry] of this.cache) {
      if (entry.lastAccess < oldestAccess) {
        oldestAccess = entry.lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  /**
   * 가비지 컬렉션 시작
   */
  private startGarbageCollection(): void {
    this.gcTimer = setInterval(() => {
      this.runGarbageCollection();
    }, this.config.gcInterval);
  }

  /**
   * 가비지 컬렉션 실행
   */
  private runGarbageCollection(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache) {
      // TTL 초과한 엔트리 수집
      if (now - entry.timestamp > this.config.ttl) {
        keysToDelete.push(key);
      }
    }

    // 만료된 엔트리 삭제
    keysToDelete.forEach(key => this.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`Garbage collection: removed ${keysToDelete.length} expired entries`);
    }
  }

  /**
   * 캐시 히트율 계산
   */
  private calculateHitRate(): number {
    if (this.cache.size === 0) return 0;

    let totalAccess = 0;
    for (const entry of this.cache.values()) {
      totalAccess += entry.accessCount;
    }

    return totalAccess / this.cache.size;
  }

  /**
   * 가장 오래된 엔트리 정보
   */
  private getOldestEntry(): { key: string; age: number } | null {
    if (this.cache.size === 0) return null;

    let oldestKey = '';
    let oldestTimestamp = Date.now();

    for (const [key, entry] of this.cache) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    return {
      key: oldestKey,
      age: Date.now() - oldestTimestamp
    };
  }

  /**
   * 가장 새로운 엔트리 정보
   */
  private getNewestEntry(): { key: string; age: number } | null {
    if (this.cache.size === 0) return null;

    let newestKey = '';
    let newestTimestamp = 0;

    for (const [key, entry] of this.cache) {
      if (entry.timestamp > newestTimestamp) {
        newestTimestamp = entry.timestamp;
        newestKey = key;
      }
    }

    return {
      key: newestKey,
      age: Date.now() - newestTimestamp
    };
  }

  /**
   * 메모리 정리
   */
  destroy(): void {
    if (this.gcTimer) {
      clearInterval(this.gcTimer);
      this.gcTimer = null;
    }
    this.clear();
  }
}

// 전역 이미지 캐시 인스턴스
export const globalImageCache = new ImageCacheManager({
  maxSize: 100, // 100MB
  maxEntries: 1000,
  ttl: 1000 * 60 * 60 * 24, // 24시간
  gcInterval: 1000 * 60 * 5, // 5분
});

/**
 * IndexedDB를 사용한 영구 캐시 (선택적)
 */
export class IndexedDBImageCache {
  private dbName = 'memezing-image-cache';
  private dbVersion = 1;
  private storeName = 'images';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('IndexedDB not available in server environment'));
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 스토어가 존재하지 않으면 생성
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async get(key: string): Promise<CacheEntry | null> {
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result && Date.now() - result.timestamp < 7 * 24 * 60 * 60 * 1000) { // 7일
          resolve(result);
        } else {
          // 만료된 경우 삭제
          this.delete(key);
          resolve(null);
        }
      };
    });
  }

  async set(key: string, data: ArrayBuffer, contentType: string, etag?: string): Promise<void> {
    if (!this.db) return;

    const entry: CacheEntry & { key: string } = {
      key,
      data,
      contentType,
      timestamp: Date.now(),
      etag,
      size: data.byteLength,
      accessCount: 1,
      lastAccess: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(entry);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async delete(key: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

// 영구 캐시 인스턴스 (브라우저 환경에서만)
export const persistentImageCache = new IndexedDBImageCache();

// 브라우저 환경에서 자동 초기화
if (typeof window !== 'undefined') {
  persistentImageCache.init().catch(console.error);
}