import React from 'react';
import { motion } from 'framer-motion';

export const ExecutiveLoader = ({ size = 'medium', color = 'primary' }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10', 
    large: 'w-16 h-16'
  };

  const colorSchemes = {
    primary: 'from-blue-500 to-cyan-500',
    success: 'from-emerald-500 to-teal-500',
    warning: 'from-amber-500 to-orange-500',
    danger: 'from-red-500 to-pink-500'
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      {/* Outer rotating ring */}
      <motion.div
        className={`absolute inset-0 rounded-full bg-gradient-to-r ${colorSchemes[color]} opacity-20`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Inner pulsing core */}
      <motion.div
        className={`absolute inset-2 rounded-full bg-gradient-to-r ${colorSchemes[color]}`}
        animate={{
          scale: [0.8, 1.2, 0.8],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: [0.23, 1, 0.32, 1]
        }}
      />
      
      {/* Central glow */}
      <motion.div
        className={`absolute inset-4 rounded-full bg-gradient-to-r ${colorSchemes[color]} blur-sm`}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.8, 0.3]
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

export const ExecutivePageLoader = ({ message = "Loading..." }) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'linear-gradient(145deg, rgba(248, 250, 252, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
        backdropFilter: 'blur(32px) saturate(180%)',
        WebkitBackdropFilter: 'blur(32px) saturate(180%)'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
    >
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05, ease: [0.23, 1, 0.32, 1] }}
      >
        <ExecutiveLoader size="large" />
        <motion.p
          className="mt-6 text-sm font-semibold text-slate-600 tracking-wide"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {message}
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export const ExecutiveProgressBar = ({ progress, className = "" }) => {
  return (
    <div className={`h-1 bg-slate-200 rounded-full overflow-hidden ${className}`}>
      <motion.div
        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
        style={{ width: `${progress}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      />
    </div>
  );
};
