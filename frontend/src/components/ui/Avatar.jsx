import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { User } from 'lucide-react';
import Badge from './Badge';

/**
 * Premium Avatar Component - $1M Apple-Grade Quality
 * 
 * Features:
 * - Multiple sizes with perfect proportions
 * - Image loading with smooth transitions
 * - Fallback initials with perfect typography
 * - Status indicator with pulsing animation
 * - Ring variants for active states
 * - Glass morphism and solid variants
 * - Hover animations and micro-interactions
 */

const Avatar = ({
  src,
  alt,
  name,
  initials,
  size = 'md',
  variant = 'default',
  status,
  showStatus = false,
  ring = false,
  className,
  onClick,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Generate initials from name if not provided
  const getInitials = (name) => {
    if (initials) return initials;
    if (!name) return '';
    
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayInitials = getInitials(name);

  const sizes = {
    xs: 'w-6 h-6 text-caption',
    sm: 'w-8 h-8 text-body-sm',
    md: 'w-10 h-10 text-body-md',
    lg: 'w-12 h-12 text-body-lg',
    xl: 'w-16 h-16 text-heading-4',
    '2xl': 'w-20 h-20 text-heading-3',
    '3xl': 'w-24 h-24 text-heading-2'
  };

  const variants = {
    default: `
      bg-apple-gray-100 text-apple-text-primary
      border border-border-light
    `,
    glass: `
      bg-apple-glass-light text-apple-text-primary
      border border-apple-white/20 backdrop-filter-sm
      shadow-apple-1
    `,
    solid: `
      bg-apple-white text-apple-text-primary
      border border-border-light shadow-apple-2
    `,
    gradient: `
      bg-gradient-to-br from-apple-blue-400 to-apple-purple-500
      text-apple-white border-0
      shadow-apple-3
    `
  };

  const ringVariants = {
    none: '',
    primary: 'ring-2 ring-apple-blue-primary ring-offset-2',
    success: 'ring-2 ring-apple-green-primary ring-offset-2',
    warning: 'ring-2 ring-apple-orange-primary ring-offset-2',
    danger: 'ring-2 ring-apple-red-primary ring-offset-2'
  };

  const statusConfig = {
    online: { color: 'bg-apple-green-primary', dot: true },
    offline: { color: 'bg-apple-gray-400', dot: false },
    away: { color: 'bg-apple-orange-primary', dot: true },
    busy: { color: 'bg-apple-red-primary', dot: false }
  };

  const avatarClasses = clsx(
    'relative inline-flex items-center justify-center flex-shrink-0',
    'rounded-radius-full font-semibold select-none overflow-hidden',
    'transition-all duration-200 ease-apple',
    sizes[size],
    variants[variant],
    {
      [ringVariants[ring]]: ring && typeof ring === 'string',
      [ringVariants.primary]: ring === true,
      'cursor-pointer hover:scale-105': onClick
    },
    className
  );

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10',
    '3xl': 'w-12 h-12'
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5 -bottom-0 -right-0',
    sm: 'w-2 h-2 -bottom-0.5 -right-0.5',
    md: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5',
    lg: 'w-3 h-3 -bottom-1 -right-1',
    xl: 'w-3.5 h-3.5 -bottom-1 -right-1',
    '2xl': 'w-4 h-4 -bottom-1 -right-1',
    '3xl': 'w-5 h-5 -bottom-1 -right-1'
  };

  return (
    <motion.div
      className={avatarClasses}
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {/* Image */}
      {src && !imageError && (
        <motion.img
          src={src}
          alt={alt || name || 'Avatar'}
          className="w-full h-full object-cover"
          onError={handleImageError}
          onLoad={handleImageLoad}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ 
            opacity: imageLoaded ? 1 : 0,
            scale: imageLoaded ? 1 : 1.1
          }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      )}

      {/* Fallback Content */}
      {(!src || imageError) && (
        <motion.div
          className="flex items-center justify-center w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {displayInitials ? (
            <span className="font-semibold leading-none">
              {displayInitials}
            </span>
          ) : (
            <User className={clsx('text-apple-text-secondary', iconSizes[size])} />
          )}
        </motion.div>
      )}

      {/* Status Indicator */}
      {showStatus && status && (
        <motion.div
          className={clsx(
            'absolute rounded-radius-full border-2 border-apple-white',
            statusSizes[size],
            statusConfig[status]?.color
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 500,
            damping: 30,
            delay: 0.1
          }}
        >
          {statusConfig[status]?.dot && (
            <motion.div
              className="w-full h-full rounded-radius-full bg-current opacity-75"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

// Avatar Group for displaying multiple avatars
export const AvatarGroup = ({ 
  avatars = [], 
  max = 5, 
  size = 'md',
  showMore = true,
  className,
  ...props 
}) => {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = Math.max(0, avatars.length - max);

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <motion.div
      className={clsx('flex -space-x-2', className)}
      variants={containerVariants}
      initial="hidden"
      animate="show"
      {...props}
    >
      {visibleAvatars.map((avatar, index) => (
        <motion.div
          key={avatar.id || index}
          variants={itemVariants}
          className="relative"
          style={{ zIndex: visibleAvatars.length - index }}
        >
          <Avatar
            size={size}
            ring="primary"
            {...avatar}
          />
        </motion.div>
      ))}
      
      {remainingCount > 0 && showMore && (
        <motion.div
          variants={itemVariants}
          className="relative"
          style={{ zIndex: 0 }}
        >
          <Avatar
            size={size}
            variant="glass"
            ring="primary"
            initials={`+${remainingCount}`}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default Avatar;
