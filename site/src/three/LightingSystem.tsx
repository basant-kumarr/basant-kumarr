import { useMemo } from 'react';
import * as THREE from 'three';

type Props = {
  /** Cool key colour for the technology environment. */
  accent?: string;
  /** Warm rim so the geometry does not read as a single flat hue. */
  rim?: string;
  shadows?: boolean;
  intensity?: number;
};

/**
 * Three-point lighting for every scene in the site.
 *
 * One directional key (the only light allowed to cast), one cool fill from the
 * opposite side, one warm rim behind the subject. Ambient is kept low so the
 * environment stays graphite rather than washing out to grey.
 */
export function LightingSystem({
  accent = '#38bdf8',
  rim = '#f5a623',
  shadows = false,
  intensity = 1,
}: Props) {
  const keyColour = useMemo(() => new THREE.Color('#dce9f7'), []);

  return (
    <>
      <ambientLight intensity={0.34 * intensity} color="#8fa6bd" />
      <directionalLight
        position={[4.5, 6.5, 5]}
        intensity={1.15 * intensity}
        color={keyColour}
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={24}
      />
      <pointLight position={[-6, 1.5, 3]} intensity={19 * intensity} color={accent} distance={20} decay={2} />
      <pointLight position={[3, -2.5, -5]} intensity={14 * intensity} color={rim} distance={18} decay={2} />
    </>
  );
}
