import React from 'react';
import { Minimize2, Square, X } from 'lucide-react';

declare global {
  interface Window {
    windowAPI: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      isMaximized: () => Promise<boolean>;
    };
  }
}

export const Titlebar: React.FC = () => {
  const isMac = navigator.platform.toLowerCase().includes('mac');

  const handleMinimize = () => {
    window.windowAPI?.minimize();
  };

  const handleMaximize = () => {
    window.windowAPI?.maximize();
  };

  const handleClose = () => {
    window.windowAPI?.close();
  };

  return (
    <div
      className="h-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-2 select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left side - Mac traffic lights space or app title */}
      <div className="flex items-center gap-2">
        {isMac ? (
          <div className="w-20" /> // Space for macOS traffic lights
        ) : (
          <div className="flex items-center gap-2 px-2">
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded flex items-center justify-center text-white font-bold text-xs">
              K
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Krubles Asset Manager</span>
          </div>
        )}
      </div>

      {/* Center - Title (Mac only) */}
      {isMac && (
        <div className="absolute left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Krubles Asset Manager
        </div>
      )}

      {/* Right side - Window controls (Windows only) */}
      {!isMac && (
        <div className="flex items-center" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <button
            onClick={handleMinimize}
            className="h-8 w-12 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Minimize"
          >
            <Minimize2 size={14} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={handleMaximize}
            className="h-8 w-12 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Maximize"
          >
            <Square size={14} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={handleClose}
            className="h-8 w-12 flex items-center justify-center hover:bg-red-500 transition-colors group"
            aria-label="Close"
          >
            <X size={16} className="text-gray-600 dark:text-gray-400 group-hover:text-white" />
          </button>
        </div>
      )}
    </div>
  );
};
