import { useEffect } from 'react';

/**
 * Performance monitoring utilities
 */

// Log Web Vitals metrics (requires web-vitals package)
export const reportWebVitals = (onPerfEntry?: (metric: any) => void) => {
  // Note: Install web-vitals package to enable this feature
  // npm install web-vitals
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    console.log('Web Vitals monitoring available - install web-vitals package to enable');
  }
};

/**
 * Hook to measure component render time
 */
export const usePerformanceMonitor = (componentName: string, enabled = false) => {
  useEffect(() => {
    if (!enabled || process.env.NODE_ENV !== 'development') return;

    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const renderTime = end - start;
      
      if (renderTime > 16) { // If render takes longer than one frame (16ms)
        console.warn(
          `⚠️ ${componentName} render time: ${renderTime.toFixed(2)}ms`
        );
      }
    };
  });
};

/**
 * Preload critical resources
 */
export const preloadResource = (href: string, as: string) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
};

/**
 * Prefetch resources for next navigation
 */
export const prefetchResource = (href: string) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
};
