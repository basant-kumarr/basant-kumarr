import { useCallback, useEffect, useRef } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Magnetic pull on a primary control.
 *
 * Applied only to the single highest-intent CTA in a view. It is a pointer
 * affordance, so it is disabled entirely for coarse pointers (where it would
 * do nothing but cost work) and for reduced-motion visitors.
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.28) {
  const ref = useRef<T | null>(null);
  const reduced = useReducedMotion();

  const reset = useCallback(() => {
    const node = ref.current;
    if (node) node.style.transform = '';
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      node.style.transform = '';
      return;
    }

    const onMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      node.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
    };

    node.addEventListener('pointermove', onMove);
    node.addEventListener('pointerleave', reset);
    node.addEventListener('blur', reset);
    return () => {
      node.removeEventListener('pointermove', onMove);
      node.removeEventListener('pointerleave', reset);
      node.removeEventListener('blur', reset);
    };
  }, [reduced, reset, strength]);

  return ref;
}
