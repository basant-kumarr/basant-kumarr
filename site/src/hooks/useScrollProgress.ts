import { useEffect, useRef, useState } from 'react';

/**
 * Document scroll progress, 0 → 1, sampled on a rAF tick.
 *
 * Read through a ref by the 3D layer (so camera work costs no React renders)
 * and through state by anything that genuinely needs to re-render.
 */
export function useScrollProgress(subscribeState = false) {
  const progress = useRef(0);
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    let queued = false;

    const measure = () => {
      queued = false;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const next = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      progress.current = next;
      if (subscribeState) setValue(next);
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [subscribeState]);

  return { progress, value };
}
