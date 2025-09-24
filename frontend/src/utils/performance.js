import React from 'react';

/**
 * Performance Optimization Utilities - $1M Apple-Grade Quality
 * 
 * Features:
 * - Animation performance monitoring
 * - Reduced motion detection
 * - Hardware acceleration utilities
 * - Memory-efficient animation management
 */

// Check for reduced motion preference
export const useReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Optimized animation variants for performance
export const createOptimizedVariants = (reducedMotion = false) => ({
  // Container animations with staggering
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.1,
        delayChildren: reducedMotion ? 0 : 0.2,
        duration: reducedMotion ? 0.01 : 0.3
      }
    }
  },
  
  // Item animations
  item: {
    hidden: { 
      opacity: 0, 
      y: reducedMotion ? 0 : 20 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: reducedMotion ? 0.01 : 0.4,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  },
  
  // Button interactions
  button: {
    hover: reducedMotion ? {} : { 
      scale: 1.02, 
      y: -1,
      transition: { duration: 0.15 }
    },
    tap: reducedMotion ? {} : { 
      scale: 0.98, 
      y: 0,
      transition: { duration: 0.1 }
    }
  },
  
  // Modal animations
  modal: {
    overlay: {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { duration: reducedMotion ? 0.01 : 0.3 }
      },
      exit: { 
        opacity: 0,
        transition: { duration: reducedMotion ? 0.01 : 0.2 }
      }
    },
    content: {
      hidden: { 
        scale: reducedMotion ? 1 : 0.8,
        opacity: 0,
        y: reducedMotion ? 0 : 50
      },
      visible: { 
        scale: 1,
        opacity: 1,
        y: 0,
        transition: reducedMotion ? 
          { duration: 0.01 } : 
          {
            type: "spring",
            damping: 20,
            stiffness: 300
          }
      },
      exit: { 
        scale: reducedMotion ? 1 : 0.8,
        opacity: 0,
        y: reducedMotion ? 0 : 50,
        transition: { duration: reducedMotion ? 0.01 : 0.2 }
      }
    }
  }
});

// Hardware acceleration utilities
export const hardwareAcceleration = {
  // Force GPU acceleration for smooth animations
  accelerate: {
    willChange: 'transform',
    backfaceVisibility: 'hidden',
    perspective: 1000
  },
  
  // Remove hardware acceleration when not needed
  decelerate: {
    willChange: 'auto',
    backfaceVisibility: 'visible',
    perspective: 'none'
  }
};

// Intersection Observer hook for performance-conscious animations
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const [ref, setRef] = React.useState(null);

  React.useEffect(() => {
    if (!ref || typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, options]);

  return [setRef, isIntersecting];
};

// Debounced animation trigger for performance
export const useDebouncedAnimation = (callback, delay = 16) => {
  const timeoutRef = React.useRef(null);
  
  return React.useCallback((...args) => {
    if (timeoutRef.current) {
      cancelAnimationFrame(timeoutRef.current);
    }
    
    timeoutRef.current = requestAnimationFrame(() => {
      callback(...args);
    });
  }, [callback, delay]);
};

// Memory-efficient component wrapper
export const withPerformanceOptimization = (Component) => {
  return React.memo(Component, (prevProps, nextProps) => {
    // Custom comparison for performance-critical props
    const criticalProps = ['isVisible', 'isLoading', 'data'];
    
    for (const prop of criticalProps) {
      if (prevProps[prop] !== nextProps[prop]) {
        return false;
      }
    }
    
    return true;
  });
};

// FPS monitoring for development
export const useFPSMonitor = () => {
  const [fps, setFps] = React.useState(60);
  
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    let lastTime = performance.now();
    let frameCount = 0;
    
    const measureFPS = () => {
      const currentTime = performance.now();
      frameCount++;
      
      if (currentTime - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    measureFPS();
  }, []);
  
  return fps;
};

// Animation performance CSS classes
export const performanceClasses = {
  // GPU acceleration
  accelerated: 'will-change-transform backface-hidden',
  
  // Smooth transitions
  smooth: 'transition-all duration-200 ease-apple',
  
  // High performance transforms
  transform: 'transform-gpu',
  
  // Optimized for mobile
  mobile: 'touch-manipulation'
};

export default {
  useReducedMotion,
  createOptimizedVariants,
  hardwareAcceleration,
  useIntersectionObserver,
  useDebouncedAnimation,
  withPerformanceOptimization,
  useFPSMonitor,
  performanceClasses
};
