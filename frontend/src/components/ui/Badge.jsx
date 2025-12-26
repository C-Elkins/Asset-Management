import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

/**
 * Premium Badge Component - $1M Apple-Grade Quality
 * 
 * Features:
 * - Multiple variants with perfect color schemes
 * - Subtle hover animations and micro-interactions
 * - Icon support with proper spacing
 * - Removable badges with smooth exit animations
 * - Accessible design with proper contrast
 * - Glass morphism and solid variants
 */

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  onRemove,
  removable = false,
  className,
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center gap-1.5 font-medium
    rounded-radius-full transition-all duration-150 ease-apple
    focus:outline-none focus:ring-2 focus:ring-offset-1
  `;

  const variants = {
    default: `
      bg-apple-gray-100 text-apple-text-primary
      hover:bg-apple-gray-200 focus:ring-apple-gray-300
    `,
    primary: `
      bg-apple-blue-primary text-apple-white
      hover:bg-apple-blue-600 focus:ring-apple-blue-light
      shadow-sm
    `,
    success: `
      bg-apple-green-primary text-apple-white
      hover:bg-apple-green-600 focus:ring-apple-green-light
      shadow-sm
    `,
    warning: `
      bg-apple-orange-primary text-apple-white
      hover:bg-apple-orange-600 focus:ring-apple-orange-light
      shadow-sm
    `,
    danger: `
      bg-apple-red-primary text-apple-white
      hover:bg-apple-red-600 focus:ring-apple-red-light
      shadow-sm
    `,
    info: `
      bg-apple-cyan-primary text-apple-white
      hover:bg-apple-cyan-600 focus:ring-apple-cyan-light
      shadow-sm
    `,
    glass: `
      bg-apple-glass-light text-apple-text-primary
      border border-apple-white/20 backdrop-filter-sm
      hover:bg-apple-glass-medium focus:ring-apple-blue-light
      shadow-apple-1
    `,
    outline: `
      bg-transparent text-apple-text-primary
      border border-border-medium
      hover:bg-apple-gray-50 hover:border-border-strong
      focus:ring-apple-gray-300
    `,
    subtle: `
      bg-apple-gray-50 text-apple-text-secondary
      hover:bg-apple-gray-100 hover:text-apple-text-primary
      focus:ring-apple-gray-200
    `
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-caption',
    md: 'px-2.5 py-1 text-body-sm',
    lg: 'px-3 py-1.5 text-body-md'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };

  const badgeClasses = clsx(
    baseClasses,
    variants[variant],
    sizes[size],
    className
  );

  const handleRemove = (e) => {
    e.stopPropagation();
    onRemove?.();
  };

  return (
    <motion.span
      className={badgeClasses}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {Icon && (
        <Icon className={clsx('flex-shrink-0', iconSizes[size])} />
      )}
      
      <span className="leading-none">
        {children}
      </span>

      {(removable || onRemove) && (
        <motion.button
          onClick={handleRemove}
          className={clsx(
            'ml-1 -mr-1 p-0.5 rounded-radius-full',
            'hover:bg-apple-white/20 focus:bg-apple-white/20',
            'focus:outline-none transition-colors duration-150',
            'flex items-center justify-center flex-shrink-0'
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Remove"
        >
          <svg 
            className={clsx('flex-shrink-0', iconSizes[size])} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
              clipRule="evenodd" 
            />
          </svg>
        </motion.button>
      )}
    </motion.span>
  );
};

// Status Badge Variant for system status, online/offline, etc.
export const StatusBadge = ({ 
  status, 
  showDot = true, 
  ...props 
}) => {
  const statusVariants = {
    online: { variant: 'success', text: 'Online' },
    offline: { variant: 'subtle', text: 'Offline' },
    away: { variant: 'warning', text: 'Away' },
    busy: { variant: 'danger', text: 'Busy' },
    idle: { variant: 'info', text: 'Idle' },
    unknown: { variant: 'outline', text: 'Unknown' }
  };

  const statusConfig = statusVariants[status] || statusVariants.unknown;

  return (
    <Badge
      variant={statusConfig.variant}
      {...props}
    >
      {showDot && (
        <motion.span
          className="w-1.5 h-1.5 rounded-radius-full bg-current"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      )}
      {statusConfig.text}
    </Badge>
  );
};

// Notification Badge (small, usually numeric)
export const NotificationBadge = ({ 
  count, 
  max = 99, 
  showZero = false,
  className,
  ...props 
}) => {
  if (!showZero && (!count || count <= 0)) {
    return null;
  }

  const displayCount = count > max ? `${max}+` : count;

  return (
    <motion.span
      className={clsx(
        'inline-flex items-center justify-center',
        'min-w-[1.25rem] h-5 px-1.5',
        'bg-apple-red-primary text-apple-white',
        'text-caption font-semibold leading-none',
        'rounded-radius-full shadow-sm',
        className
      )}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 500,
        damping: 30
      }}
      {...props}
    >
      {displayCount}
    </motion.span>
  );
};

export default Badge;
