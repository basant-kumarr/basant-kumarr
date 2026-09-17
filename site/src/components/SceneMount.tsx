import { Suspense, lazy, useEffect, useState, type MutableRefObject } from 'react';
import { SceneBackdrop } from './SceneBackdrop';
import { SceneBoundary } from './SceneBoundary';
import { useQualityTier } from '@/hooks/useQualityTier';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const HeroLayer = lazy(() => import('@/three/HeroLayer'));
const BeyondLayer = lazy(() => import('@/three/BeyondLayer'));

type Props = {
  scene: 'hero' | 'beyond';
  scroll: MutableRefObject<number>;
};

/**
 * Mounts a 3D layer, or does not.
 *
 * The scene is only requested once the device has been graded and the browser
 * has gone idle, so the 3D chunk never competes with the content for the first
 * paint. Devices graded `off` (no WebGL) never download it at all.
 */
export function SceneMount({ scene, scroll }: Props) {
  const quality = useQualityTier();
  const reducedMotion = useReducedMotion();
  const [armed, setArmed] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (quality.tier === 'off') return;

    const idle = (
      window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }
    ).requestIdleCallback;

    if (idle) {
      const handle = idle(() => setArmed(true), { timeout: 1200 });
      return () => {
        (
          window as Window & { cancelIdleCallback?: (h: number) => void }
        ).cancelIdleCallback?.(handle);
      };
    }

    const timer = window.setTimeout(() => setArmed(true), 400);
    return () => window.clearTimeout(timer);
  }, [quality.tier]);

  const variant = scene === 'beyond' ? 'beyond' : 'core';

  if (quality.tier === 'off' || failed || !armed) {
    return <SceneBackdrop variant={variant} />;
  }

  const Layer = scene === 'beyond' ? BeyondLayer : HeroLayer;

  return (
    <SceneBoundary fallback={<SceneBackdrop variant={variant} />} onError={() => setFailed(true)}>
      <Suspense fallback={<SceneBackdrop variant={variant} />}>
        <Layer
          quality={quality}
          reducedMotion={reducedMotion}
          scroll={scroll}
          onFailure={() => setFailed(true)}
        />
      </Suspense>
    </SceneBoundary>
  );
}
