import React from 'react';

export const MinimalPageLoader = () => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
      style={{
        animation: 'fadeIn 0.1s ease-out'
      }}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Minimal spinner */}
        <div className="relative w-12 h-12">
          <div 
            className="absolute inset-0 border-4 border-blue-200 rounded-full"
            style={{ borderTopColor: '#3b82f6', animation: 'spin 0.8s linear infinite' }}
          />
        </div>
        <p className="text-sm font-medium text-gray-600">Loading...</p>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MinimalPageLoader;
