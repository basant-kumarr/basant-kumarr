import { useEffect, useRef, useState } from 'react';

/**
 * One-shot intersection flag for section entrances. Unobserves on first hit —
 * an entrance that replays on every scroll-by reads as a glitch, not polish.
 */
export function useInView<T extends Element>(rootMargin = '-12% 0px -12% 0px') {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin, threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}
