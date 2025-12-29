import React from 'react';

interface ActionButtonProps {
  icon: React.ReactNode;
  label?: string;
  onClick: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  title?: string;
  className?: string;
}

const variantClasses = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  warning: 'bg-orange-600 hover:bg-orange-700 text-white',
  info: 'bg-indigo-600 hover:bg-indigo-700 text-white',
};

const sizeClasses = {
  sm: 'p-1.5 text-xs',
  md: 'p-2',
  lg: 'p-2.5 text-lg',
};

const sizeClassesWithLabel = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2.5',
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  title,
  className = '',
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const sizeClass = label ? sizeClassesWithLabel[size] : sizeClasses[size];
  const variantClass = variantClasses[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title || label}
      className={`${baseClasses} ${sizeClass} ${variantClass} ${className}`}
    >
      {icon}
      {label && <span>{label}</span>}
    </button>
  );
};
