import type { MutableRefObject } from 'react';
import { HeroScene } from './HeroScene';
import { Scene3D } from './Scene3D';
import type { QualityProfile } from '@/hooks/useQualityTier';

type Props = {
  quality: QualityProfile;
  reducedMotion: boolean;
  scroll: MutableRefObject<number>;
  onFailure: () => void;
};

/**
 * Lazy entry point for the hero's 3D layer. Everything that pulls in three.js
 * sits behind this module so the readable page ships without it.
 */
export default function HeroLayer({ quality, reducedMotion, scroll, onFailure }: Props) {
  return (
    <Scene3D quality={quality} reducedMotion={reducedMotion} onFailure={onFailure} ariaLabel="Analytics core visualisation">
      <HeroScene quality={quality} reducedMotion={reducedMotion} scroll={scroll} />
    </Scene3D>
  );
}
