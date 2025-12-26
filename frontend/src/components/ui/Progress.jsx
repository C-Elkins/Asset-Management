import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

/**
 * Premium Progress Component - $1M Apple-Grade Quality
 * 
 * Features:
 * - Smooth animated progress bars
 * - Multiple variants and sizes
 * - Indeterminate loading states
 * - Glass morphism and solid variants
 * - Perfect Apple-style animations
 * - Accessible progress indication
 */

const Progress = ({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  indeterminate = false,
  showLabel = false,
  label,
  className,
  ...props
}) => {
  const percentage = value !== undefined ? Math.min(Math.max((value / max) * 100, 0), 100) : 0;

  const baseClasses = `
    relative w-full rounded-radius-full overflow-hidden
    backdrop-filter-sm
  `;

  const variants = {
    default: `
      bg-apple-gray-200
    `,
    glass: `
      bg-apple-glass-light border border-apple-white/20
    `,
    minimal: `
      bg-apple-gray-100
    `
  };

  const sizes = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-6'
  };

  const barVariants = {
    default: 'bg-apple-blue-primary',
    success: 'bg-apple-green-primary',
    warning: 'bg-apple-orange-primary',
    danger: 'bg-apple-red-primary',
    glass: 'bg-gradient-to-r from-apple-blue-400 to-apple-blue-600'
  };

  const containerClasses = clsx(
    baseClasses,
    variants[variant],
    sizes[size],
    className
  );

  const barClasses = clsx(
    'h-full rounded-radius-full transition-all duration-300 ease-apple',
    barVariants[variant] || barVariants.default
  );

  const progressVariants = {
    initial: { width: '0%' },
    animate: { 
      width: `${percentage}%`,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const indeterminateVariants = {
    animate: {
      x: ['-100%', '100%'],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  };

  return (
    <div className={clsx('space-y-2', { 'space-y-1': size === 'xs' })}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between">
          <span className="text-body-sm font-medium text-apple-text-secondary">
            {label || 'Progress'}
          </span>
          {!indeterminate && showLabel && (
            <span className="text-body-sm font-medium text-apple-text-secondary">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      
      <div className={containerClasses} {...props}>
        {indeterminate ? (
          <motion.div
            className={clsx(
              barClasses,
              'absolute top-0 left-0 w-1/3',
              'bg-gradient-to-r from-transparent via-current to-transparent'
            )}
            variants={indeterminateVariants}
            animate="animate"
          />
        ) : (
          <motion.div
            className={barClasses}
            variants={progressVariants}
            initial="initial"
            animate="animate"
            style={{ width: 0 }}
          >
            {/* Shimmer effect for better visual feedback */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
              style={{
                animation: 'shimmer 2s infinite linear',
                backgroundSize: '200% 100%'
              }}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Circular Progress variant
export const CircularProgress = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  indeterminate = false,
  showLabel = false,
  className,
  ...props
}) => {
  const percentage = value !== undefined ? Math.min(Math.max((value / max) * 100, 0), 100) : 0;
  
  const sizes = {
    xs: { size: 16, strokeWidth: 2 },
    sm: { size: 20, strokeWidth: 2 },
    md: { size: 24, strokeWidth: 3 },
    lg: { size: 32, strokeWidth: 3 },
    xl: { size: 48, strokeWidth: 4 }
  };

  const config = sizes[size];
  const radius = (config.size - config.strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const variants = {
    default: 'text-apple-blue-primary',
    success: 'text-apple-green-primary',
    warning: 'text-apple-orange-primary',
    danger: 'text-apple-red-primary'
  };

  return (
    <div className={clsx('inline-flex items-center justify-center relative', className)}>
      <svg
        width={config.size}
        height={config.size}
        viewBox={`0 0 ${config.size} ${config.size}`}
        className={clsx('transform -rotate-90', variants[variant])}
        {...props}
      >
        {/* Background circle */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          fill="none"
          className="opacity-20"
        />
        
        {/* Progress circle */}
        {!indeterminate ? (
          <motion.circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        ) : (
          <motion.circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference * 0.25}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: `${config.size / 2}px ${config.size / 2}px` }}
          />
        )}
      </svg>
      
      {showLabel && !indeterminate && (
        <span className="absolute inset-0 flex items-center justify-center text-caption font-semibold text-apple-text-primary">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};

// Skeleton Loader for premium loading states
export const Skeleton = ({
  variant = 'rectangle',
  width,
  height,
  className,
  ...props
}) => {
  const baseClasses = `
    bg-gradient-to-r from-apple-gray-200 via-apple-gray-100 to-apple-gray-200
    bg-[length:200%_100%] animate-pulse rounded-radius-sm
  `;

  const variants = {
    rectangle: 'rounded-radius-sm',
    circle: 'rounded-radius-full aspect-square',
    text: 'rounded-radius-sm h-4',
    button: 'rounded-radius-md h-10'
  };

  const style = {
    width,
    height,
    animation: 'shimmer 2s infinite linear'
  };

  return (
    <div
      className={clsx(baseClasses, variants[variant], className)}
      style={style}
      {...props}
    />
  );
};

export default Progress;
