import React, { Suspense, lazy } from 'react';
import { Skeleton } from '../components/ui/Progress';

// Lazy load the ComponentShowcase for better performance
const ComponentShowcaseComponent = lazy(() => import('./ComponentShowcase'));

// Premium loading fallback
const ShowcaseFallback = () => (
  <div className="min-h-screen bg-apple-gray-50 p-4 sm:p-6 lg:p-8 safe-area-top safe-area-bottom">
    <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">
      {/* Header Skeleton */}
      <div className="text-center px-4 space-y-4">
        <Skeleton variant="text" width="60%" height={48} className="mx-auto" />
        <Skeleton variant="text" width="80%" height={24} className="mx-auto" />
      </div>
      
      {/* Cards Skeleton */}
      {[1, 2, 3, 4].map((index) => (
        <div key={index} className="bg-white rounded-radius-xl p-6 shadow-apple-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton variant="text" width="30%" height={28} />
              <Skeleton variant="text" width="50%" height={20} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((buttonIndex) => (
                <div key={buttonIndex} className="space-y-2">
                  <Skeleton variant="text" width="70%" height={16} />
                  <Skeleton variant="button" width="100%" />
                  <Skeleton variant="button" width="100%" />
                  <Skeleton variant="button" width="100%" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ComponentShowcase = () => (
  <Suspense fallback={<ShowcaseFallback />}>
    <ComponentShowcaseComponent />
  </Suspense>
);

export default ComponentShowcase;
