import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useMagnetic } from '@/hooks/useMagnetic';

type Common = {
  children: ReactNode;
  className?: string;
  tone?: 'warm' | 'cool' | 'ghost';
};

type Props =
  | (Common & { href: string; external?: boolean; to?: never })
  | (Common & { to: string; href?: never; external?: never });

/**
 * The primary call to action.
 *
 * Magnetism is reserved for this component and used at most once per view —
 * it is a signal of where to click, so applying it broadly would destroy the
 * signal. External links always carry rel="noopener noreferrer".
 */
export function MagneticLink(props: Props) {
  const { children, className = '', tone = 'warm' } = props;
  const ref = useMagnetic<HTMLAnchorElement>(0.22);
  const classes = `cta cta--${tone} ${className}`.trim();

  if ('to' in props && props.to) {
    return (
      <Link to={props.to} className={classes} ref={ref}>
        <span className="cta__label">{children}</span>
      </Link>
    );
  }

  const href = props.href as string;
  const external = props.external ?? /^https?:/.test(href);

  return (
    <a
      ref={ref}
      className={classes}
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <span className="cta__label">{children}</span>
    </a>
  );
}
