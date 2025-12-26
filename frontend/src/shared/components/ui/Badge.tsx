import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full whitespace-nowrap';
  
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-success-50 text-success-700 border border-success-200',
    warning: 'bg-warning-50 text-warning-700 border border-warning-200',
    error: 'bg-error-50 text-error-700 border border-error-200',
    info: 'bg-primary-50 text-primary-700 border border-primary-200'
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  return (
    <motion.span
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      {children}
    </motion.span>
  );
};

export { Badge };
