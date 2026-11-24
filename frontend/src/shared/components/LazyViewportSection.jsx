import { useState, useEffect, useRef } from 'react';

/**
 * Delays mounting heavy below-the-fold widgets (like interactive Leaflet maps) until
 * the viewport nears the element, avoiding main-thread & network contention on initial page load.
 */
export function LazyViewportSection({
  children,
  fallback = null,
  rootMargin = '400px 0px',
  eager = false,
}) {
  const [shouldRender, setShouldRender] = useState(Boolean(eager));
  const containerRef = useRef(null);

  useEffect(() => {
    if (shouldRender || eager) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setShouldRender(true);
      return undefined;
    }

    const node = containerRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldRender, eager, rootMargin]);

  return <div ref={containerRef}>{shouldRender ? children : fallback}</div>;
}

export default LazyViewportSection;
