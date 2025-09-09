import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'card' | 'text' | 'circle' | 'button' | 'chart';
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  className,
  variant = 'text'
}) => {
  const baseClasses = "animate-pulse bg-muted rounded";

  const variantClasses = {
    card: "w-full h-32 rounded-xl",
    text: "h-4 w-full",
    circle: "w-12 h-12 rounded-full",
    button: "h-10 w-24 rounded-lg",
    chart: "w-full h-48 rounded-lg"
  };

  return (
    <div 
      className={cn(baseClasses, variantClasses[variant], className)}
      role="status"
      aria-label="Carregando..."
    />
  );
};

// Skeleton components for specific use cases
export const CardSkeleton = () => (
  <div className="card-nexus space-y-4 animate-fade-in">
    <div className="flex items-center space-x-3">
      <SkeletonLoader variant="circle" />
      <div className="space-y-2 flex-1">
        <SkeletonLoader className="h-5 w-3/4" />
        <SkeletonLoader className="h-3 w-1/2" />
      </div>
    </div>
    <SkeletonLoader className="h-8 w-full" />
    <div className="flex justify-between">
      <SkeletonLoader className="h-4 w-20" />
      <SkeletonLoader className="h-4 w-20" />
    </div>
  </div>
);

export const TransactionSkeleton = () => (
  <div className="flex items-center justify-between p-4 animate-fade-in">
    <div className="flex items-center space-x-3">
      <SkeletonLoader variant="circle" className="w-10 h-10" />
      <div className="space-y-2">
        <SkeletonLoader className="h-4 w-32" />
        <SkeletonLoader className="h-3 w-20" />
      </div>
    </div>
    <div className="text-right space-y-2">
      <SkeletonLoader className="h-4 w-16" />
      <SkeletonLoader className="h-3 w-12" />
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6 p-6">
    {/* Header Skeleton */}
    <div className="space-y-3">
      <SkeletonLoader className="h-8 w-48" />
      <SkeletonLoader className="h-4 w-32" />
    </div>

    {/* Balance Card Skeleton */}
    <CardSkeleton />

    {/* Goal Card Skeleton */}
    <CardSkeleton />

    {/* Transactions Skeleton */}
    <div className="card-nexus space-y-4">
      <div className="flex justify-between items-center">
        <SkeletonLoader className="h-6 w-40" />
        <SkeletonLoader variant="button" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <TransactionSkeleton key={i} />
      ))}
    </div>
  </div>
);