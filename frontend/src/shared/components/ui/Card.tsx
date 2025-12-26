import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className,
    variant = 'default',
    padding = 'md',
    children,
    ...props 
  }, ref) => {
    const baseStyles = 'rounded-2xl transition-all duration-200';
    
    const variants = {
      default: 'bg-white border border-gray-200',
      elevated: 'bg-white shadow-soft hover:shadow-medium',
      outlined: 'bg-white border-2 border-gray-200 hover:border-gray-300',
      interactive: 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-soft cursor-pointer active:scale-[0.98]'
    };

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    };

    return (
      <div
        ref={ref}
        className={clsx(
          baseStyles,
          variants[variant],
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
