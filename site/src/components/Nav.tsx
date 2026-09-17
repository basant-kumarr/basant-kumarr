import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { profile } from '@/data/profile';

export const SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'track-record', label: 'Track record' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'beyond', label: 'BeBeyond' },
  { id: 'work', label: 'Work' },
  { id: 'contact', label: 'Contact' },
] as const;

type Props = {
  /** 'home' shows section navigation; 'case-study' shows the route out. */
  variant?: 'home' | 'case-study';
};

/**
 * Site navigation.
 *
 * Desktop is a single glass bar that gains its border and blur only once the
 * page has scrolled, so the hero is not framed by a box. Mobile is a real
 * panel — Escape closes it, focus returns to the trigger, and background
 * scrolling is locked while it is open.
 */
export function Nav({ variant = 'home' }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>('hero');
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll spy. Uses the observer rather than scroll maths so it stays correct
  // when sections change height at different breakpoints.
  useEffect(() => {
    if (variant !== 'home') return;
    const targets = SECTIONS.map((section) => document.getElementById(section.id)).filter(
      (node): node is HTMLElement => Boolean(node),
    );
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5] },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [variant]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const brand = (
    <Link to="/" className="nav__brand" onClick={() => setOpen(false)}>
      <span className="nav__mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="nav__brand-text">
        <strong>{profile.name}</strong>
        <em>Business Analytics · Data · AI</em>
      </span>
    </Link>
  );

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="nav__inner shell">
        {brand}

        {variant === 'home' ? (
          <>
            <nav className="nav__links" aria-label="Sections">
              <ul>
                {SECTIONS.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className={active === section.id ? 'is-active' : undefined}
                      aria-current={active === section.id ? 'true' : undefined}
                    >
                      {section.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <button
              ref={toggleRef}
              type="button"
              className="nav__toggle"
              aria-expanded={open}
              aria-controls="nav-panel"
              onClick={() => setOpen((value) => !value)}
            >
              <span className="nav__toggle-bars" aria-hidden="true" data-open={open} />
              <span>{open ? 'Close' : 'Menu'}</span>
            </button>
          </>
        ) : (
          <Link to="/" className="nav__back">
            <span aria-hidden="true">←</span> Back to portfolio
          </Link>
        )}
      </div>

      {variant === 'home' && (
        <div id="nav-panel" className="nav__panel" data-open={open} hidden={!open}>
          <nav aria-label="Sections, mobile">
            <ul>
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} onClick={() => setOpen(false)}>
                    <span className="mono">{String(SECTIONS.indexOf(section) + 1).padStart(2, '0')}</span>
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
