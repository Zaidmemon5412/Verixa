import React from 'react';
import { Skeleton } from '../ui/skeleton';

export function LandingPageSkeleton() {
  return (
    <div className="space-y-12 pb-12 animate-pulse select-none">
      {/* Top Announcement Bar */}
      <div className="h-9 bg-primary/15 border-b border-primary/20" />

      {/* Hero Split */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-5">
            <Skeleton className="h-12 sm:h-16 w-11/12 rounded-2xl" />
            <Skeleton className="h-10 sm:h-12 w-3/4 rounded-2xl" />
            <Skeleton className="h-5 w-full max-w-xl rounded-lg" />
            <Skeleton className="h-5 w-4/5 max-w-lg rounded-lg" />
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Skeleton className="h-12 w-full sm:w-56 rounded-2xl" />
              <Skeleton className="h-12 w-full sm:w-52 rounded-2xl" />
            </div>
            <Skeleton className="h-4 w-64 rounded-lg" />
          </div>
          <div className="lg:col-span-5">
            <Skeleton className="w-full aspect-[16/11] sm:aspect-[4/3] rounded-3xl" />
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section className="border-y border-border bg-muted/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
          <Skeleton className="h-3.5 w-72 mx-auto rounded-full" />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 rounded-xl" />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-36 rounded-full" />
            <Skeleton className="h-8 w-64 rounded-xl" />
          </div>
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-3xl border border-border bg-card overflow-hidden p-4 space-y-4">
              <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
              <Skeleton className="h-5 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-1/2 rounded-lg" />
              <Skeleton className="h-10 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function PropertiesPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-6 animate-pulse select-none">
      {/* Header */}
      <div className="space-y-2.5">
        <Skeleton className="h-6 w-56 rounded-full" />
        <Skeleton className="h-9 w-72 sm:w-96 rounded-xl" />
        <Skeleton className="h-4 w-full max-w-2xl rounded-lg" />
      </div>

      {/* Filter Toolbar */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <div className="grid grid-cols-2 sm:flex gap-2.5">
            <Skeleton className="h-11 w-full sm:w-40 rounded-xl" />
            <Skeleton className="h-11 w-full sm:w-44 rounded-xl" />
          </div>
          <Skeleton className="h-11 w-full lg:w-36 rounded-xl" />
        </div>
        <div className="flex gap-2 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full shrink-0" />
          ))}
        </div>
      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <Skeleton className="h-5 w-52 rounded-lg" />
        <Skeleton className="h-4 w-24 rounded-lg" />
      </div>

      {/* 6 Property Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="border border-border bg-card rounded-2xl overflow-hidden flex flex-col justify-between">
            <div>
              <Skeleton className="aspect-[16/10] w-full rounded-none" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-2/3 rounded-lg" />
                <div className="grid grid-cols-2 gap-2 py-2 border-y border-border/60">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20 rounded" />
                  <Skeleton className="h-6 w-24 rounded" />
                </div>
              </div>
            </div>
            <div className="p-4 pt-0 grid grid-cols-3 gap-1.5">
              <Skeleton className="h-9 rounded-xl" />
              <Skeleton className="h-9 rounded-xl" />
              <Skeleton className="h-9 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PropertyDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8 animate-pulse select-none">
      {/* Top Back & Share */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-36 rounded-xl" />
        <Skeleton className="h-8 w-20 rounded-xl" />
      </div>

      {/* Header & Price Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2.5 flex-1">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-36 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-9 w-80 max-w-full rounded-xl" />
          <Skeleton className="h-4 w-64 max-w-full rounded-lg" />
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 w-full md:w-56 flex md:block items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-20 rounded" />
            <Skeleton className="h-8 w-32 rounded-xl" />
          </div>
          <Skeleton className="h-4 w-24 rounded md:mt-2" />
        </div>
      </div>

      {/* 12-Col Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <Skeleton className="aspect-[4/3] sm:aspect-[16/9] w-full rounded-3xl" />
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl shrink-0" />
            ))}
          </div>

          {/* Specifications Card */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <Skeleton className="h-6 w-60 rounded-lg" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Auditor Card */}
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <Skeleton className="h-5 w-44 rounded" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function BuildersPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8 animate-pulse select-none">
      <div className="space-y-2.5">
        <Skeleton className="h-6 w-52 rounded-full" />
        <Skeleton className="h-8 w-56 rounded-xl" />
        <Skeleton className="h-4 w-96 max-w-full rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-48 rounded-lg" />
                <Skeleton className="h-3.5 w-36 rounded-lg" />
              </div>
            </div>
            <Skeleton className="h-8 w-full rounded-lg" />
            <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/60">
              <Skeleton className="h-8 rounded" />
              <Skeleton className="h-8 rounded" />
              <Skeleton className="h-8 rounded" />
            </div>
            <Skeleton className="h-9 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BuilderDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-8 animate-pulse select-none">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-44 rounded" />
        <Skeleton className="h-8 w-28 rounded-xl" />
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col lg:flex-row justify-between gap-6">
        <div className="flex items-start gap-4 flex-1">
          <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shrink-0" />
          <div className="space-y-2.5 flex-1">
            <Skeleton className="h-8 w-64 max-w-full rounded-xl" />
            <Skeleton className="h-4 w-80 max-w-full rounded-lg" />
            <Skeleton className="h-14 w-full max-w-xl rounded-xl" />
          </div>
        </div>
        <Skeleton className="h-32 w-full lg:w-64 rounded-2xl" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>

      <Skeleton className="h-16 rounded-2xl" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-80 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function LocalitiesPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8 animate-pulse select-none">
      <div className="space-y-2.5">
        <Skeleton className="h-6 w-64 rounded-full" />
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-4 w-96 max-w-full rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="border border-border bg-card rounded-2xl overflow-hidden flex flex-col justify-between">
            <div>
              <Skeleton className="aspect-[16/9] w-full rounded-none" />
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-3 gap-2 pb-3 border-b border-border/60">
                  <Skeleton className="h-9 rounded" />
                  <Skeleton className="h-9 rounded" />
                  <Skeleton className="h-9 rounded" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-4 w-16 rounded" />
                </div>
              </div>
            </div>
            <div className="px-4 pb-4">
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LocalityDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8 animate-pulse select-none">
      <div className="flex gap-2 overflow-hidden">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-10 w-28 rounded-xl shrink-0" />
        ))}
      </div>

      <Skeleton className="w-full aspect-[16/10] sm:aspect-[21/9] min-h-[210px] rounded-2xl sm:rounded-3xl" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-36 rounded-2xl" />
            <Skeleton className="h-36 rounded-2xl" />
          </div>
          <Skeleton className="h-72 rounded-3xl" />
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-44 rounded-lg" />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-6 w-full rounded-lg" />
          ))}
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function MarketTrendsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8 animate-pulse select-none">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2.5 flex-1">
          <Skeleton className="h-6 w-48 rounded-full" />
          <Skeleton className="h-9 w-80 max-w-full rounded-xl" />
          <Skeleton className="h-4 w-96 max-w-full rounded-lg" />
        </div>
        <Skeleton className="h-24 w-full lg:w-72 rounded-2xl" />
      </div>

      <Skeleton className="h-24 w-full rounded-2xl" />

      <div className="rounded-2xl border border-border bg-card p-4 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 rounded-xl" />
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-80 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function ComparisonPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8 animate-pulse select-none">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-52 rounded-full" />
          <Skeleton className="h-9 w-72 max-w-full rounded-xl" />
          <Skeleton className="h-4 w-96 max-w-full rounded-lg" />
        </div>
        <Skeleton className="h-8 w-40 rounded-xl" />
      </div>

      <div className="rounded-2xl sm:rounded-3xl border border-border bg-card p-4 sm:p-6 space-y-3">
        <Skeleton className="h-4 w-48 rounded" />
        <Skeleton className="h-11 w-full max-w-2xl rounded-2xl" />
      </div>

      <div className="rounded-2xl sm:rounded-3xl border border-border bg-card p-4 space-y-4 overflow-hidden">
        <div className="grid grid-cols-4 gap-4 pb-4 border-b border-border">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
        </div>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((r) => (
          <div key={r} className="grid grid-cols-4 gap-4 py-2">
            <Skeleton className="h-4 rounded" />
            <Skeleton className="h-4 rounded" />
            <Skeleton className="h-4 rounded" />
            <Skeleton className="h-4 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GuidesPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-8 animate-pulse select-none">
      <div className="space-y-2.5">
        <Skeleton className="h-6 w-64 rounded-full" />
        <Skeleton className="h-10 w-96 max-w-full rounded-xl" />
        <Skeleton className="h-4 w-full max-w-2xl rounded-lg" />
      </div>

      <div className="rounded-3xl border border-border bg-card overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <Skeleton className="lg:col-span-5 aspect-[16/10] lg:h-64 rounded-none" />
        <div className="lg:col-span-7 p-6 space-y-4">
          <Skeleton className="h-4 w-48 rounded" />
          <Skeleton className="h-8 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-5 w-40 rounded" />
        </div>
      </div>

      <div className="flex gap-2 overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-9 w-36 rounded-xl shrink-0" />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden p-4 space-y-3">
            <Skeleton className="aspect-[16/10] w-full rounded-xl" />
            <Skeleton className="h-5 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-9 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GuideDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8 animate-pulse select-none">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-48 rounded" />
        <Skeleton className="h-8 w-24 rounded-xl" />
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-36 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-10 w-4/5 rounded-xl" />
        <Skeleton className="h-5 w-2/3 rounded-lg" />
      </div>

      <Skeleton className="aspect-[16/9] sm:aspect-[21/9] w-full rounded-3xl" />

      <Skeleton className="h-32 w-full rounded-2xl" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <Skeleton className="h-7 w-72 rounded-lg" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
        <div className="lg:col-span-4 space-y-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8 animate-pulse select-none">
      <div className="space-y-2.5">
        <Skeleton className="h-6 w-48 rounded-full" />
        <Skeleton className="h-9 w-72 rounded-xl" />
        <Skeleton className="h-4 w-80 max-w-full rounded-lg" />
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-border">
          <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-44 rounded-lg" />
            <Skeleton className="h-3.5 w-28 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-72 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
