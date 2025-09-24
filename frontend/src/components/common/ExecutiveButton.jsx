import React from 'react';
import { motion } from 'framer-motion';

export const ExecutiveButton = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon = null,
  onClick,
  className = '',
  ...props
}) => {
  const variants = {
    primary: {
      base: 'bg-gradient-to-r from-slate-900 to-slate-800 text-white border-slate-700/20',
      hover: 'shadow-xl shadow-slate-900/30',
      active: 'from-slate-800 to-slate-700'
    },
    secondary: {
      base: 'bg-gradient-to-r from-white/90 to-slate-50/90 text-slate-700 border-slate-200/50',
      hover: 'shadow-lg shadow-black/10',
      active: 'from-slate-50/90 to-slate-100/90'
    },
    success: {
      base: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400/20',
      hover: 'shadow-xl shadow-emerald-500/30',
      active: 'from-emerald-600 to-teal-600'
    },
    danger: {
      base: 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-400/20',
      hover: 'shadow-xl shadow-red-500/30',
      active: 'from-red-600 to-pink-600'
    }
  };

  const sizes = {
    small: 'px-3 py-2 text-xs font-medium',
    medium: 'px-5 py-3 text-sm font-semibold',
    large: 'px-8 py-4 text-base font-bold'
  };

  const currentVariant = variants[variant];
  const currentSize = sizes[size];

  const buttonMotion = {
    whileHover: disabled ? {} : { 
      scale: 1.02, 
      y: -1,
      transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] }
    },
    whileTap: disabled ? {} : { 
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };

  const iconMotion = {
    initial: { rotate: 0 },
    hover: { rotate: loading ? 360 : 5 },
    tap: { rotate: loading ? 360 : -5 }
  };

  return (
    <motion.button
      className={`
        relative inline-flex items-center justify-center gap-2
        ${currentSize}
        ${currentVariant.base}
        rounded-xl border backdrop-blur-sm
        transition-all duration-300 ease-out
        focus:outline-none focus:ring-2 focus:ring-blue-500/20
        disabled:opacity-50 disabled:cursor-not-allowed
        overflow-hidden
        ${className}
      `}
      disabled={disabled || loading}
      onClick={onClick}
      {...buttonMotion}
      {...props}
    >
      {/* Luxury hover effect overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-transparent opacity-0"
        initial={{ opacity: 0, x: '-100%' }}
        whileHover={{ 
          opacity: disabled ? 0 : 1, 
          x: '100%',
          transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] }
        }}
      />

      {/* Loading state */}
      {loading && (
        <motion.div
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Icon */}
      {icon && !loading && (
        <motion.div
          variants={iconMotion}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        >
          {icon}
        </motion.div>
      )}

      {/* Button content */}
      <motion.span
        className="relative font-medium tracking-[-0.01em]"
        animate={{ 
          opacity: loading ? 0.7 : 1,
          x: loading ? 8 : 0 
        }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      >
        {children}
      </motion.span>

      {/* Premium glow effect */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0"
        animate={{ opacity: disabled ? 0 : [0, 0.3, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.button>
  );
};

export default ExecutiveButton;
