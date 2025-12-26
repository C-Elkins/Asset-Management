import React from 'react';
import { ExecutiveLoader } from './ExecutiveLoader.jsx';

export const LoadingSpinner = ({ size = 'medium', message = 'Loading...', color = 'primary' }) => (
  <div role="status" aria-live="polite" className="flex flex-col items-center justify-center p-8">
    <ExecutiveLoader size={size} color={color} />
    {message && (
      <p className="mt-4 text-sm font-medium text-slate-600 tracking-wide">
        {message}
      </p>
    )}
  </div>
);
