import { Canvas } from '@react-three/fiber';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { QualityProfile } from '@/hooks/useQualityTier';

type Props = {
  children: ReactNode;
  quality: QualityProfile;
  /** Called if the GL context is lost or the renderer fails to start. */
  onFailure: () => void;
  /** Static composition, rendered once, when the visitor asked for less motion. */
  reducedMotion: boolean;
  ariaLabel: string;
};

/**
 * Canvas host shared by every 3D layer on the site.
 *
 * Three things here are not optional:
 *
 *  1. The render loop stops when the canvas is off screen or the tab is
 *     hidden. A portfolio that keeps a GPU loop running while the visitor
 *     reads the projects section is a battery bug, not an effect.
 *  2. Context loss is handled. Mobile GPUs drop contexts under pressure, and
 *     the site has to survive that with the content intact.
 *  3. The canvas is `aria-hidden` and the surrounding section carries the
 *     meaning. Nothing here is required to understand the page.
 */
export function Scene3D({ children, quality, onFailure, ariaLabel, reducedMotion }: Props) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const node = wrapper.current;
    if (!node) return;

    let visible = true;
    let focused = !document.hidden;
    const sync = () => setActive(visible && focused);

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { rootMargin: '120px' },
    );
    observer.observe(node);

    const onVisibility = () => {
      focused = !document.hidden;
      sync();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div ref={wrapper} className="scene3d" aria-hidden="true" data-label={ariaLabel}>
      <Canvas
        // Reduced motion renders a single frame on demand rather than a loop;
        // off-screen or backgrounded stops the loop entirely.
        frameloop={reducedMotion ? 'demand' : active ? 'always' : 'never'}
        dpr={quality.dpr}
        shadows={quality.shadows}
        gl={{
          antialias: quality.tier === 'high',
          powerPreference: quality.tier === 'high' ? 'high-performance' : 'default',
          alpha: false,
          stencil: false,
          depth: true,
        }}
        camera={{ fov: 42, near: 0.1, far: 60, position: [0, 0.35, 8.2] }}
        onCreated={({ gl }) => {
          const canvas = gl.domElement;
          const onLost = (event: Event) => {
            event.preventDefault();
            onFailure();
          };
          canvas.addEventListener('webglcontextlost', onLost, { once: true });
        }}
      >
        {children}
      </Canvas>
    </div>
  );
}
