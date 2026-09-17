import type { CSSProperties, ElementType, ReactNode } from 'react';
import { useInView } from '@/hooks/useInView';

type Props = {
  children: ReactNode;
  as?: ElementType;
  /** Stagger index. Capped so a long list never leaves its tail waiting. */
  index?: number;
  className?: string;
  style?: CSSProperties;
};

const STEP_MS = 65;
const MAX_STEPS = 6;

/**
 * Section entrance.
 *
 * A single transform-and-opacity transition, triggered once on first
 * intersection. The reduced-motion rule in global.css collapses the duration
 * to nothing, which leaves the content in its final state rather than hidden —
 * the failure mode a JS-gated entrance usually has.
 */
export function Reveal({ children, as, index = 0, className = '', style }: Props) {
  const Tag = (as ?? 'div') as ElementType;
  const { ref, inView } = useInView<HTMLElement>();
  const delay = Math.min(index, MAX_STEPS) * STEP_MS;

  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? 'is-in' : ''} ${className}`.trim()}
      style={{ ...style, transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
