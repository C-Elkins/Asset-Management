// Global ambient module declarations for JS-only components
declare module '*.jsx' {
  import type React from 'react';
  const Component: React.ComponentType<any>;
  export default Component;
}

declare module '../components/common/ExecutiveButton.jsx' {
  import type React from 'react';
  export interface ExecutiveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: string;
    size?: string;
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
  }
  export const ExecutiveButton: React.FC<ExecutiveButtonProps>;
}

// Fallback for any js module imports without types
declare module '*.js';
