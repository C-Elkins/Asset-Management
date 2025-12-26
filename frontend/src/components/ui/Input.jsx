import React, { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react';

/**
 * Premium Input Component - $1M Apple-Grade Quality
 * 
 * Features:
 * - Glass morphism design with perfect shadows
 * - Floating labels with smooth animations
 * - Multiple variants and states
 * - Built-in validation and error states
 * - Password visibility toggle
 * - Icon support with proper spacing
 * - Accessible by default
 */

const Input = forwardRef(({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  success,
  disabled = false,
  required = false,
  icon: Icon,
  iconPosition = 'left',
  variant = 'default',
  size = 'md',
  className,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasValue, setHasValue] = useState(Boolean(value));

  const handleChange = (e) => {
    setHasValue(Boolean(e.target.value));
    onChange?.(e);
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;
  const shouldShowFloatingLabel = label && (variant === 'floating' || isFocused || hasValue);

  const baseClasses = `
    w-full px-4 py-3 rounded-radius-md
    bg-apple-glass-ultra-light border
    text-apple-text-primary placeholder-apple-text-tertiary
    backdrop-filter-md transition-all duration-200 ease-apple
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    default: `
      border-border-light
      focus:border-apple-blue-primary focus:ring-apple-blue-light
      hover:border-border-medium hover:bg-apple-glass-light
    `,
    floating: `
      border-border-light pt-6 pb-2
      focus:border-apple-blue-primary focus:ring-apple-blue-light
      hover:border-border-medium hover:bg-apple-glass-light
    `
  };

  const states = {
    error: 'border-apple-red-primary focus:ring-apple-red-light',
    success: 'border-apple-green-primary focus:ring-apple-green-light'
  };

  const sizes = {
    sm: 'px-3 py-2 text-body-sm',
    md: 'px-4 py-3 text-body-md',
    lg: 'px-5 py-4 text-body-lg'
  };

  const inputClasses = clsx(
    baseClasses,
    variants[variant],
    sizes[size],
    {
      [states.error]: error,
      [states.success]: success,
      'pl-10': Icon && iconPosition === 'left',
      'pr-10': (Icon && iconPosition === 'right') || type === 'password',
      'pt-6 pb-2': variant === 'floating'
    },
    className
  );

  const containerClasses = clsx('relative', {
    'opacity-50': disabled
  });

  return (
    <div className={containerClasses}>
      {/* Floating/Standard Label */}
      <AnimatePresence>
        {label && (
          <motion.label
            className={clsx(
              'absolute left-4 text-apple-text-secondary font-medium pointer-events-none select-none',
              {
                'top-2 text-caption': variant === 'floating' && shouldShowFloatingLabel,
                'top-1/2 -translate-y-1/2 text-body-md': variant === 'floating' && !shouldShowFloatingLabel,
                'mb-2 text-body-sm relative top-0 left-0 translate-y-0 pointer-events-auto block': variant === 'default'
              }
            )}
            initial={false}
            animate={variant === 'floating' ? {
              y: shouldShowFloatingLabel ? -8 : 0,
              scale: shouldShowFloatingLabel ? 0.875 : 1,
              color: isFocused 
                ? 'var(--apple-blue-primary)' 
                : error 
                  ? 'var(--apple-red-primary)'
                  : success
                    ? 'var(--apple-green-primary)'
                    : 'var(--apple-text-secondary)'
            } : {}}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {label}
            {required && <span className="text-apple-red-primary ml-1">*</span>}
          </motion.label>
        )}
      </AnimatePresence>

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {Icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Icon className="w-4 h-4 text-apple-text-secondary" />
          </div>
        )}

        {/* Input Field */}
        <motion.input
          ref={ref}
          type={inputType}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={variant === 'floating' ? '' : placeholder}
          className={inputClasses}
          whileFocus={{ scale: 1.005 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          {...props}
        />

        {/* Right Icon or Password Toggle */}
        {((Icon && iconPosition === 'right') || type === 'password') && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {type === 'password' && (
              <motion.button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-apple-text-secondary hover:text-apple-text-primary transition-colors duration-150"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </motion.button>
            )}
            {Icon && iconPosition === 'right' && (
              <Icon className="w-4 h-4 text-apple-text-secondary" />
            )}
          </div>
        )}

        {/* Status Icons */}
        {(error || success) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {error && <AlertCircle className="w-4 h-4 text-apple-red-primary" />}
              {success && <Check className="w-4 h-4 text-apple-green-primary" />}
            </motion.div>
          </div>
        )}
      </div>

      {/* Error/Success Messages */}
      <AnimatePresence>
        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-2"
          >
            {error && (
              <p className="text-caption text-apple-red-primary flex items-center gap-2">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {error}
              </p>
            )}
            {success && (
              <p className="text-caption text-apple-green-primary flex items-center gap-2">
                <Check className="w-3 h-3 flex-shrink-0" />
                {success}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
