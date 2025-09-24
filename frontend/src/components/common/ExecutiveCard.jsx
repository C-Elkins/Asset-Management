import React from 'react';
import { motion } from 'framer-motion';

export const ExecutiveCard = ({
  children,
  className = '',
  variant = 'default',
  hover = true,
  padding = 'medium',
  ...props
}) => {
  const variants = {
    default: {
      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
      border: 'rgba(0, 0, 0, 0.03)',
      shadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 4px 20px rgba(0, 0, 0, 0.04), 0 0 40px rgba(0, 0, 0, 0.02)'
    },
    elevated: {
      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
      border: 'rgba(59, 130, 246, 0.1)',
      shadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 8px 40px rgba(0, 0, 0, 0.08), 0 0 80px rgba(0, 0, 0, 0.04)'
    },
    subtle: {
      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.6) 0%, rgba(248, 250, 252, 0.5) 100%)',
      border: 'rgba(0, 0, 0, 0.02)',
      shadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 2px 8px rgba(0, 0, 0, 0.02)'
    }
  };

  const paddingClasses = {
    none: '',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  };

  const currentVariant = variants[variant];
  const currentPadding = paddingClasses[padding];

  const cardMotion = hover ? {
    whileHover: {
      y: -2,
      transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] }
    },
    whileTap: {
      y: 0,
      transition: { duration: 0.1 }
    }
  } : {};

  return (
    <motion.div
      className={`
        relative rounded-2xl backdrop-blur-lg border overflow-hidden
        transition-all duration-400 ease-out
        ${currentPadding}
        ${className}
      `}
      style={{
        background: currentVariant.background,
        borderColor: currentVariant.border,
        boxShadow: currentVariant.shadow,
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      {...cardMotion}
      {...props}
    >
      {/* Luxury gradient overlay */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: hover ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Subtle animated background pattern */}
      <motion.div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}
        animate={{ 
          backgroundPosition: ['0px 0px', '20px 20px'],
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      />
    </motion.div>
  );
};

export default ExecutiveCard;
