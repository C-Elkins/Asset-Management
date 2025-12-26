import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

/**
 * Premium Card Component - $1M Apple-Grade Quality
 * 
 * Features:
 * - Glass morphism design with perfect shadows
 * - Smooth hover animations with Framer Motion
 * - Multiple variants and sizes
 * - Responsive design
 * - Perfect whitespace and typography
 * - Accessible interactions
 */

const Card = ({
  children,
  variant = 'default',
  size = 'md',
  interactive = false,
  hoverable = true,
  className,
  onClick,
  ...props
}) => {
  const baseClasses = `
    relative overflow-hidden
    transition-all duration-300 ease-apple
  `;

  const variants = {
    default: `
      bg-apple-glass-light border border-border-light
      backdrop-filter-lg shadow-md
    `,
    elevated: `
      bg-apple-glass-ultra-light border border-border-ultra-light
      backdrop-filter-xl shadow-lg
    `,
    floating: `
      bg-apple-glass-light border border-border-light
      backdrop-filter-xl shadow-2xl
    `,
    ghost: `
      bg-transparent border border-border-ultra-light
      hover:bg-apple-glass-ultra-light
    `
  };

  const sizes = {
    xs: 'p-3 rounded-radius-sm',
    sm: 'p-4 rounded-radius-md', 
    md: 'p-6 rounded-radius-lg',
    lg: 'p-8 rounded-radius-xl',
    xl: 'p-10 rounded-radius-2xl'
  };

  const cardClasses = clsx(
    baseClasses,
    variants[variant],
    sizes[size],
    {
      'cursor-pointer': interactive || onClick,
      'hover:shadow-xl hover:border-border-medium hover:-translate-y-0.5': hoverable,
      'focus:outline-none focus:ring-2 focus:ring-apple-blue-light focus:ring-offset-2': interactive || onClick
    },
    className
  );

  const motionProps = {
    whileHover: (hoverable && !onClick) ? {
      y: -2,
      transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
    } : {},
    whileTap: (interactive || onClick) ? {
      scale: 0.995,
      transition: { duration: 0.1, ease: [0.16, 1, 0.3, 1] }
    } : {},
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  };

  const Component = onClick ? 'button' : 'div';

  return (
    <motion.div {...motionProps}>
      <Component
        className={cardClasses}
        onClick={onClick}
        {...props}
      >
        {/* Subtle border glow on hover */}
        <div 
          className={clsx(
            "absolute inset-0 rounded-inherit opacity-0 transition-opacity duration-300",
            "bg-gradient-to-br from-apple-blue-light via-transparent to-apple-blue-light",
            { "hover:opacity-100": hoverable }
          )} 
        />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </Component>
    </motion.div>
  );
};

// Card subcomponents for better composition
Card.Header = ({ children, className, ...props }) => (
  <div 
    className={clsx(
      "mb-4 pb-4 border-b border-border-ultra-light",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

Card.Body = ({ children, className, ...props }) => (
  <div className={clsx("space-y-4", className)} {...props}>
    {children}
  </div>
);

Card.Footer = ({ children, className, ...props }) => (
  <div 
    className={clsx(
      "mt-6 pt-4 border-t border-border-ultra-light flex items-center justify-between",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

Card.Title = ({ children, className, ...props }) => (
  <h3 
    className={clsx(
      "text-heading-sm text-apple-text-primary font-semibold",
      className
    )}
    {...props}
  >
    {children}
  </h3>
);

Card.Description = ({ children, className, ...props }) => (
  <p 
    className={clsx(
      "text-body-md text-apple-text-secondary",
      className
    )}
    {...props}
  >
    {children}
  </p>
);

export default Card;
