import type { MutableRefObject } from 'react';
import { BeyondScene } from './BeyondScene';
import { Scene3D } from './Scene3D';
import type { QualityProfile } from '@/hooks/useQualityTier';

type Props = {
  quality: QualityProfile;
  reducedMotion: boolean;
  scroll: MutableRefObject<number>;
  onFailure: () => void;
};

/** Lazy entry point for the BeBeyond identity scene. */
export default function BeyondLayer({ quality, reducedMotion, scroll, onFailure }: Props) {
  return (
    <Scene3D
      quality={quality}
      reducedMotion={reducedMotion}
      onFailure={onFailure}
      ariaLabel="BeBeyond performance intelligence visualisation"
    >
      <BeyondScene quality={quality} reducedMotion={reducedMotion} scroll={scroll} />
    </Scene3D>
  );
}
