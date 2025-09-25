import React from 'react';

// Simple toast placeholder - will be replaced with actual implementation
export const Toaster: React.FC<{
  position?: string;
  toastOptions?: {
    duration?: number;
    style?: React.CSSProperties;
  };
}> = ({ position, toastOptions }) => {
  return null; // This will be implemented later
};

export const toast = {
  success: (message: string) => console.log('Success:', message),
  error: (message: string) => console.log('Error:', message),
  info: (message: string) => console.log('Info:', message),
  warning: (message: string) => console.log('Warning:', message),
};
