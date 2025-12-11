import React from 'react';
import { Skeleton as BaseSkeleton } from './skeleton';

// Enhanced Skeleton with shimmer effect
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <BaseSkeleton className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] ${className}`} 
       style={{ animation: 'shimmer 1.5s infinite' }} />
);

// Card Skeleton for grid layouts
export const CardSkeleton: React.FC = () => (
  <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
    <Skeleton className="h-48 w-full rounded-lg" />
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <div className="flex gap-2 pt-2">
      <Skeleton className="h-10 w-24 rounded" />
      <Skeleton className="h-10 w-24 rounded" />
    </div>
  </div>
);

// Text Content Skeleton
export const TextSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        className={`h-4 ${i === lines - 1 ? 'w-4/5' : 'w-full'}`} 
      />
    ))}
  </div>
);

// Feature Item Skeleton
export const FeatureSkeleton: React.FC = () => (
  <div className="flex items-start p-4 bg-slate-50 rounded-lg border border-slate-200 space-x-3">
    <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-full" />
    </div>
  </div>
);

// Add shimmer animation to global CSS if not already present
if (typeof document !== 'undefined') {
  const styleId = 'skeleton-shimmer-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `;
    document.head.appendChild(style);
  }
}
