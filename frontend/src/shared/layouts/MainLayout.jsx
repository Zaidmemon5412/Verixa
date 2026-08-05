import React, { Suspense } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Skeleton } from '../components/ui/skeleton';

function PageLoadingFallback() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-6 animate-pulse">
      <Skeleton className="h-10 w-1/3 rounded-lg" />
      <Skeleton className="h-64 w-full rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}

export function MainLayout({ children, activeTab, onNavigate, wishlistCount, isDark, toggleDarkMode }) {
  return (
    <div className={`min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200 ${isDark ? 'dark' : ''}`}>
      <Navbar
        activeTab={activeTab}
        onNavigate={onNavigate}
        wishlistCount={wishlistCount}
        isDark={isDark}
        toggleDarkMode={toggleDarkMode}
      />
      
      <main className="flex-1">
        <Suspense fallback={<PageLoadingFallback />}>
          {children}
        </Suspense>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
