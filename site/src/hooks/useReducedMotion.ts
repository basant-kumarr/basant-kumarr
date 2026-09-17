import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Reactive `prefers-reduced-motion`. Reactive rather than read-once because a
 * visitor can toggle the OS setting while the page is open, and a 3D scene
 * that keeps moving after they ask it to stop is exactly the failure this is
 * meant to prevent.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && 'matchMedia' in window
      ? window.matchMedia(QUERY).matches
      : false,
  );

  useEffect(() => {
    if (!('matchMedia' in window)) return;
    const mql = window.matchMedia(QUERY);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
