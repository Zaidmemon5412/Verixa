import React, { Suspense } from 'react';
import { FullPageLoader } from './Loader';

/**
 * Reusable AppSuspense Component.
 * Wraps dynamic React.lazy imports with standardized loading fallbacks.
 *
 * @param {React.ReactNode} children - Dynamic component to render
 * @param {React.ReactNode} fallback - Custom loader fallback UI (optional)
 */
export const AppSuspense = ({ children, fallback }) => {
  const defaultFallback = <FullPageLoader message="Loading module workspace..." />;

  return <Suspense fallback={fallback || defaultFallback}>{children}</Suspense>;
};

export default AppSuspense;
