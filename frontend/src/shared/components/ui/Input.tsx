import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className,
    type,
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    disabled,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const baseInputStyles = clsx(
      'w-full px-4 py-3 text-gray-900 bg-white border rounded-xl',
      'placeholder:text-gray-400 focus:outline-none transition-all duration-200',
      'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
      leftIcon && 'pl-11',
      (rightIcon || isPassword) && 'pr-11',
      error 
        ? 'border-error-300 focus:border-error-500 focus:ring-2 focus:ring-error-500/20' 
        : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
      className
    );

    return (
      <div className="space-y-2">
        {label && (
          <motion.label
            className={clsx(
              'block text-sm font-medium transition-colors duration-200',
              error ? 'text-error-700' : 'text-gray-700'
            )}
            animate={{ 
              color: isFocused 
                ? error ? '#b91c1c' : '#2563eb'
                : error ? '#b91c1c' : '#374151'
            }}
          >
            {label}
          </motion.label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5">
              {leftIcon}
            </div>
          )}
          
          <motion.input
            ref={ref}
            type={inputType}
            className={baseInputStyles}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            whileFocus={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            {...props}
          />
          
          {isPassword && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 h-5 w-5"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
          
          {rightIcon && !isPassword && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5">
              {rightIcon}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <motion.div
            className="flex items-start gap-1.5"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {error && <AlertCircle className="h-4 w-4 text-error-500 mt-0.5 flex-shrink-0" />}
            <p className={clsx(
              'text-sm',
              error ? 'text-error-600' : 'text-gray-600'
            )}>
              {error || helperText}
            </p>
          </motion.div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
