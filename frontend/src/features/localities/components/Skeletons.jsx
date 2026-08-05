import React from 'react';
import { Skeleton } from '../../../shared/components/ui/skeleton';

export function LocalityHeroSkeleton() {
  return (
    <div className="w-full h-72 md:h-80 rounded-3xl overflow-hidden relative bg-muted animate-pulse border shadow-sm">
      <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <Skeleton className="h-6 w-32 bg-white/20 rounded-full" />
          <Skeleton className="h-7 w-28 bg-white/20 rounded-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-10 w-64 bg-white/20 rounded-xl" />
          <Skeleton className="h-5 w-48 bg-white/20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function LocalityStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-5 rounded-2xl border bg-card space-y-3 shadow-sm">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-7 w-20" />
        </div>
      ))}
    </div>
  );
}

export function LocalityScorecardSkeleton() {
  return (
    <div className="p-6 rounded-3xl border bg-card space-y-6 shadow-sm">
      <div className="space-y-2">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-2.5 w-full rounded-full" />
          </div>
        ))}
      </div>
      <Skeleton className="h-20 w-full rounded-2xl" />
    </div>
  );
}

export function LocalityChartSkeleton() {
  return (
    <div className="p-6 rounded-3xl border bg-card space-y-4 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-40 rounded-xl" />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}

export function LocalityProjectsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="border rounded-2xl p-4 space-y-3 bg-card shadow-sm">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

