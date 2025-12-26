import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ExecutiveInput = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  size = 'medium',
  variant = 'default',
  disabled = false,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(value ? true : false);

  const variants = {
    default: {
      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
      border: 'rgba(0, 0, 0, 0.03)',
      focusBorder: 'rgba(59, 130, 246, 0.3)'
    },
    filled: {
      background: 'linear-gradient(145deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.8) 100%)',
      border: 'rgba(0, 0, 0, 0.05)',
      focusBorder: 'rgba(59, 130, 246, 0.4)'
    }
  };

  const sizes = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-3 text-sm',
    large: 'px-5 py-4 text-base'
  };

  const currentVariant = variants[variant];
  const currentSize = sizes[size];

  const handleChange = (e) => {
    setHasValue(e.target.value.length > 0);
    if (onChange) onChange(e);
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    if (props.onFocus) props.onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (props.onBlur) props.onBlur(e);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Floating Label */}
      {label && (
        <motion.label
          className={`
            absolute left-4 pointer-events-none z-10 font-medium tracking-wide
            transition-all duration-300 ease-out origin-left
            ${isFocused || hasValue 
              ? 'text-xs text-slate-600 -translate-y-6 scale-90' 
              : 'text-sm text-slate-500 translate-y-3'
            }
          `}
          animate={{
            y: isFocused || hasValue ? -24 : 12,
            scale: isFocused || hasValue ? 0.9 : 1,
            color: isFocused ? '#3b82f6' : error ? '#dc2626' : '#64748b'
          }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        >
          {label}
        </motion.label>
      )}

      {/* Input Container */}
      <motion.div
        className="relative"
        animate={{
          scale: isFocused ? 1.01 : 1,
          y: isFocused ? -1 : 0
        }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Icon */}
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
            <motion.div
              animate={{ 
                color: isFocused ? '#3b82f6' : '#94a3b8',
                scale: isFocused ? 1.1 : 1
              }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.div>
          </div>
        )}

        {/* Input Field */}
        <motion.input
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={isFocused ? placeholder : ''}
          disabled={disabled}
          className={`
            w-full rounded-xl font-medium text-slate-700
            backdrop-blur-sm transition-all duration-300
            focus:outline-none placeholder-slate-400
            disabled:opacity-50 disabled:cursor-not-allowed
            ${currentSize}
            ${icon ? 'pl-12' : ''}
          `}
          style={{
            background: currentVariant.background,
            border: `1px solid ${error ? '#dc2626' : isFocused ? currentVariant.focusBorder : currentVariant.border}`,
            boxShadow: isFocused 
              ? `inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 4px 20px rgba(59, 130, 246, 0.15), 0 0 0 3px rgba(59, 130, 246, 0.1)`
              : 'inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 2px 8px rgba(0, 0, 0, 0.02)'
          }}
          {...props}
        />

        {/* Focus ring */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{
            opacity: isFocused ? 1 : 0,
            scale: isFocused ? 1 : 0.95
          }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          style={{
            boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)'
          }}
        />
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="mt-2 px-3 py-2 bg-red-50/80 border border-red-200/50 rounded-lg backdrop-blur-sm"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            <p className="text-xs font-medium text-red-600">
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExecutiveInput;
