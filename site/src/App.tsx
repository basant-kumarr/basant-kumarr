import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from '@/routes/Home';

// Only the home route is in the initial bundle. The case study and the 404
// page are fetched when they are actually navigated to.
const BeyondCaseStudy = lazy(() => import('@/routes/BeyondCaseStudy'));
const NotFound = lazy(() => import('@/routes/NotFound'));

/**
 * React Router does not act on the hash fragment itself. Without this, a link
 * such as `/#work` from the case study lands on the home route at scroll
 * position zero and looks broken.
 */
function HashScroll() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    // One frame, so the target section exists before it is measured.
    const frame = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
        block: 'start',
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [hash, pathname]);

  return null;
}

/** Shown only while a route chunk is in flight — never a blank screen. */
function RouteFallback() {
  return (
    <div className="route-fallback" role="status" aria-live="polite">
      <span className="route-fallback__mark" aria-hidden="true" />
      <span className="mono">Loading</span>
    </div>
  );
}

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <HashScroll />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bebeyond" element={<BeyondCaseStudy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
