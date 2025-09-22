import { useState, useEffect, useCallback, useRef } from 'react';

export interface ImagePerformanceMetrics {
  loadTime: number;
  fileSize: number;
  cacheHit: boolean;
  format: string;
  dimensions: { width: number; height: number };
  compressionRatio?: number;
  fromProxy: boolean;
}

export interface PerformanceStats {
  totalRequests: number;
  cacheHitRate: number;
  averageLoadTime: number;
  totalDataSaved: number;
  formatDistribution: Record<string, number>;
  slowestImages: Array<{ url: string; loadTime: number }>;
  fastestImages: Array<{ url: string; loadTime: number }>;
}

/**
 * 이미지 로딩 성능 모니터링 훅
 */
export function useImagePerformance() {
  const [metrics, setMetrics] = useState<Map<string, ImagePerformanceMetrics>>(new Map());
  const [stats, setStats] = useState<PerformanceStats>({
    totalRequests: 0,
    cacheHitRate: 0,
    averageLoadTime: 0,
    totalDataSaved: 0,
    formatDistribution: {},
    slowestImages: [],
    fastestImages: []
  });

  const metricsRef = useRef(metrics);
  metricsRef.current = metrics;

  // 성능 메트릭 기록
  const recordMetric = useCallback((url: string, metric: ImagePerformanceMetrics) => {
    setMetrics(prev => {
      const newMetrics = new Map(prev);
      newMetrics.set(url, metric);
      return newMetrics;
    });
  }, []);

  // 통계 계산 및 업데이트
  useEffect(() => {
    const updateStats = () => {
      const metricsArray = Array.from(metricsRef.current.values());
      
      if (metricsArray.length === 0) return;

      const totalRequests = metricsArray.length;
      const cacheHits = metricsArray.filter(m => m.cacheHit).length;
      const cacheHitRate = (cacheHits / totalRequests) * 100;
      
      const totalLoadTime = metricsArray.reduce((sum, m) => sum + m.loadTime, 0);
      const averageLoadTime = totalLoadTime / totalRequests;
      
      const totalDataSaved = metricsArray.reduce((sum, m) => {
        if (m.compressionRatio) {
          return sum + (m.fileSize * (1 - m.compressionRatio));
        }
        return sum;
      }, 0);

      const formatDistribution: Record<string, number> = {};
      metricsArray.forEach(m => {
        formatDistribution[m.format] = (formatDistribution[m.format] || 0) + 1;
      });

      const sortedByLoadTime = [...metricsArray]
        .map(m => ({ url: Array.from(metricsRef.current.entries()).find(([, value]) => value === m)?.[0] || '', loadTime: m.loadTime }))
        .sort((a, b) => b.loadTime - a.loadTime);

      const slowestImages = sortedByLoadTime.slice(0, 5);
      const fastestImages = sortedByLoadTime.slice(-5).reverse();

      setStats({
        totalRequests,
        cacheHitRate,
        averageLoadTime,
        totalDataSaved,
        formatDistribution,
        slowestImages,
        fastestImages
      });
    };

    const intervalId = setInterval(updateStats, 5000); // 5초마다 통계 업데이트
    
    return () => clearInterval(intervalId);
  }, []);

  // 성능 리포트 생성
  const generateReport = useCallback(() => {
    const report = {
      timestamp: new Date().toISOString(),
      stats,
      recommendations: generateRecommendations(stats, metricsRef.current)
    };

    return report;
  }, [stats]);

  // 성능 데이터 클리어
  const clearMetrics = useCallback(() => {
    setMetrics(new Map());
    setStats({
      totalRequests: 0,
      cacheHitRate: 0,
      averageLoadTime: 0,
      totalDataSaved: 0,
      formatDistribution: {},
      slowestImages: [],
      fastestImages: []
    });
  }, []);

  // 특정 URL의 메트릭 가져오기
  const getMetricForUrl = useCallback((url: string) => {
    return metricsRef.current.get(url);
  }, []);

  return {
    recordMetric,
    stats,
    generateReport,
    clearMetrics,
    getMetricForUrl,
    totalMetrics: metrics.size
  };
}

/**
 * 성능 개선 권장사항 생성
 */
function generateRecommendations(
  stats: PerformanceStats,
  metrics: Map<string, ImagePerformanceMetrics>
): string[] {
  const recommendations: string[] = [];

  // 캐시 히트율이 낮은 경우
  if (stats.cacheHitRate < 50) {
    recommendations.push(
      `캐시 히트율이 ${stats.cacheHitRate.toFixed(1)}%로 낮습니다. 캐시 정책을 검토해보세요.`
    );
  }

  // 평균 로딩 시간이 긴 경우
  if (stats.averageLoadTime > 2000) {
    recommendations.push(
      `평균 로딩 시간이 ${(stats.averageLoadTime / 1000).toFixed(1)}초로 깁니다. 이미지 최적화를 고려해보세요.`
    );
  }

  // WebP 사용률이 낮은 경우
  const webpUsage = (stats.formatDistribution['webp'] || 0) / stats.totalRequests * 100;
  if (webpUsage < 70) {
    recommendations.push(
      `WebP 사용률이 ${webpUsage.toFixed(1)}%입니다. WebP 변환을 늘려 파일 크기를 줄일 수 있습니다.`
    );
  }

  // 큰 이미지가 많은 경우
  const largeImages = Array.from(metrics.values()).filter(m => m.fileSize > 1024 * 1024); // 1MB 이상
  if (largeImages.length > stats.totalRequests * 0.2) {
    recommendations.push(
      `대용량 이미지(1MB 이상)가 ${largeImages.length}개 있습니다. 적절한 리사이징을 고려해보세요.`
    );
  }

  // 느린 이미지가 많은 경우
  if (stats.slowestImages.length > 0 && stats.slowestImages[0].loadTime > 5000) {
    recommendations.push(
      `로딩이 매우 느린 이미지들이 있습니다. 우선순위가 높은 이미지는 사전 로딩을 고려해보세요.`
    );
  }

  // 데이터 절약량 표시
  if (stats.totalDataSaved > 0) {
    const savedMB = (stats.totalDataSaved / 1024 / 1024).toFixed(1);
    recommendations.push(
      `✅ 이미지 최적화를 통해 총 ${savedMB}MB의 데이터를 절약했습니다.`
    );
  }

  return recommendations;
}

/**
 * 웹 성능 지표 측정 훅
 */
export function useWebVitals() {
  const [vitals, setVitals] = useState<{
    lcp: number | null;
    fid: number | null;
    cls: number | null;
    fcp: number | null;
    ttfb: number | null;
  }>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null
  });

  useEffect(() => {
    // Web Vitals 측정 (브라우저 환경에서만)
    if (typeof window === 'undefined') return;

    const measureVitals = async () => {
      try {
        const { onLCP, onFID, onCLS, onFCP, onTTFB } = await import('web-vitals');

        onLCP((metric) => {
          setVitals(prev => ({ ...prev, lcp: metric.value }));
        });

        onFID((metric) => {
          setVitals(prev => ({ ...prev, fid: metric.value }));
        });

        onCLS((metric) => {
          setVitals(prev => ({ ...prev, cls: metric.value }));
        });

        onFCP((metric) => {
          setVitals(prev => ({ ...prev, fcp: metric.value }));
        });

        onTTFB((metric) => {
          setVitals(prev => ({ ...prev, ttfb: metric.value }));
        });
      } catch (error) {
        console.warn('Web Vitals measurement failed:', error);
      }
    };

    measureVitals();
  }, []);

  return vitals;
}

/**
 * 이미지 성능 개발 도구
 */
export function useImageDevTools() {
  const { recordMetric, stats, generateReport } = useImagePerformance();

  useEffect(() => {
    // 개발 환경에서만 콘솔에 성능 정보 출력
    if (process.env.NODE_ENV === 'development') {
      const logStats = () => {
        if (stats.totalRequests > 0) {
          console.group('🖼️ Image Performance Stats');
          console.log(`Total requests: ${stats.totalRequests}`);
          console.log(`Cache hit rate: ${stats.cacheHitRate.toFixed(1)}%`);
          console.log(`Average load time: ${(stats.averageLoadTime / 1000).toFixed(2)}s`);
          console.log(`Data saved: ${(stats.totalDataSaved / 1024 / 1024).toFixed(1)}MB`);
          console.log('Format distribution:', stats.formatDistribution);
          if (stats.slowestImages.length > 0) {
            console.log('Slowest images:', stats.slowestImages);
          }
          console.groupEnd();
        }
      };

      const intervalId = setInterval(logStats, 30000); // 30초마다 로그
      
      return () => clearInterval(intervalId);
    }
  }, [stats]);

  // 전역 성능 리포트 함수 등록
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      (window as any).__getImagePerformanceReport = generateReport;
    }
  }, [generateReport]);

  return {
    recordMetric,
    stats
  };
}