/**
 * The static environment.
 *
 * Shown before the 3D chunk arrives, on devices without usable WebGL, and if
 * the scene fails at runtime. It is CSS only, so it costs nothing and is
 * always the thing behind the hero at first paint — the page is never blank.
 */
export function SceneBackdrop({ variant = 'core' }: { variant?: 'core' | 'beyond' }) {
  return <div className={`scene-backdrop scene-backdrop--${variant}`} aria-hidden="true" />;
}
