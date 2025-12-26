// Type declarations for JSX components
declare module '*/ExecutiveButton' {
  import { ComponentType } from 'react';
  
  interface ExecutiveButtonProps {
    onClick?: () => void;
    children?: React.ReactNode;
    className?: string;
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    size?: 'sm' | 'md' | 'lg' | string;
    loading?: boolean;
  }
  
  const ExecutiveButton: ComponentType<ExecutiveButtonProps>;
  export default ExecutiveButton;
}
