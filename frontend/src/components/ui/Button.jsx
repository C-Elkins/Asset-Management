import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

/**
 * Premium Button Component - $1M Apple-Grade Quality
 * 
 * Features:
 * - Framer Motion animations for buttery-smooth interactions
 * - Performance-optimized with hardware acceleration
 * - Reduced motion support for accessibility
 * - Ripple effect on click for premium feedback
 * - Advanced hover, focus, and press states
 * - Loading states with elegant spinner
 * - Icon support with perfect spacing
 * - Fully accessible with proper ARIA attributes
 */

const Button = React.memo(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  className,
  onClick,
  type = 'button',
  ...props
}) => {
  const [ripples, setRipples] = useState([]);
  
  // Check for reduced motion preference
  const reducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleClick = (event) => {
    if (disabled || loading) return;

    // Create ripple effect only if motion is not reduced
    if (!reducedMotion) {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;
      
      const newRipple = {
        id: Date.now(),
        x,
        y,
        size
      };

      setRipples(prev => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 600);
    }

    onClick?.(event);
  };

  const renderIcon = () => {
    if (loading) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <Loader2 
            className={clsx(
              'animate-spin',
              size === 'xs' && 'w-3 h-3',
              size === 'sm' && 'w-4 h-4',
              size === 'md' && 'w-4 h-4',
              size === 'lg' && 'w-5 h-5',
              size === 'xl' && 'w-6 h-6'
            )} 
          />
        </motion.div>
      );
    }

    if (Icon) {
      return (
        <Icon 
          className={clsx(
            size === 'xs' && 'w-3 h-3',
            size === 'sm' && 'w-4 h-4',
            size === 'md' && 'w-4 h-4',
            size === 'lg' && 'w-5 h-5',
            size === 'xl' && 'w-6 h-6'
          )} 
        />
      );
    }

    return null;
  };

  // Base classes for all buttons
  const baseClasses = clsx(
    // Layout & positioning
    'relative inline-flex items-center justify-center overflow-hidden',
    'font-medium tracking-wide transition-all duration-200 ease-out',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed',
    // Hardware acceleration
    'transform-gpu will-change-transform',
    // Premium touch targets
    'select-none touch-manipulation'
  );

  // Size variants
  const sizeClasses = clsx({
    'gap-1.5 px-2.5 py-1.5 text-xs rounded-md min-h-[28px]': size === 'xs',
    'gap-2 px-3 py-2 text-sm rounded-md min-h-[32px]': size === 'sm',
    'gap-2 px-4 py-2.5 text-sm rounded-lg min-h-[40px]': size === 'md',
    'gap-2.5 px-5 py-3 text-base rounded-lg min-h-[44px]': size === 'lg',
    'gap-3 px-6 py-4 text-lg rounded-xl min-h-[52px]': size === 'xl'
  });

  // Variant-specific styles
  const variantClasses = clsx({
    // Primary - Apple blue with premium gradient
    'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 focus-visible:ring-blue-500 border border-blue-400/50': 
      variant === 'primary',
    
    // Secondary - Elegant glass morphism
    'bg-white/10 backdrop-blur-xl text-gray-900 dark:text-gray-100 border border-white/20 hover:bg-white/20 focus-visible:ring-gray-400 shadow-lg': 
      variant === 'secondary',
    
    // Outline - Clean and minimal
    'bg-transparent border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:ring-gray-400':
      variant === 'outline',
    
    // Ghost - Subtle and clean
    'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-gray-400':
      variant === 'ghost',
    
    // Destructive - Elegant red with safety
    'bg-gradient-to-b from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 focus-visible:ring-red-500 border border-red-400/50':
      variant === 'destructive'
  });

  // Disabled states
  const disabledClasses = clsx({
    'opacity-50 hover:shadow-lg': disabled && !loading,
    'cursor-wait': loading
  });

  const buttonClasses = clsx(
    baseClasses,
    sizeClasses,
    variantClasses,
    disabledClasses,
    className
  );

  // Motion properties for smooth interactions
  const motionProps = reducedMotion ? {} : {
    whileHover: disabled || loading ? {} : { 
      scale: 1.02,
      y: -1,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    whileTap: disabled || loading ? {} : { 
      scale: 0.98,
      transition: { duration: 0.1, ease: "easeOut" }
    },
    initial: { scale: 1 },
    animate: { scale: 1 },
    style: {
      transform: 'translateZ(0)', // Force hardware acceleration
      backfaceVisibility: 'hidden'
    }
  };

  return (
    <motion.button
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      type={type}
      aria-disabled={disabled || loading}
      aria-label={loading ? `${children || 'Button'} - Loading` : undefined}
      {...motionProps}
      {...props}
    >
      {/* Ripple effects */}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      {/* Hover glow effect */}
      {!reducedMotion && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 pointer-events-none"
          whileHover={disabled || loading ? {} : {
            opacity: [0, 0.1, 0],
            x: [-100, 100],
            transition: { duration: 0.6, ease: "easeInOut" }
          }}
          style={{ transform: 'skewX(-45deg)' }}
        />
      )}
      
      {/* Content */}
      <span className="relative flex items-center justify-center gap-inherit z-10">
        {Icon && iconPosition === 'left' && renderIcon()}
        {loading && !Icon && renderIcon()}
        {children && (
          <span className={loading && !children ? 'sr-only' : ''}>
            {children}
          </span>
        )}
        {Icon && iconPosition === 'right' && renderIcon()}
      </span>
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
