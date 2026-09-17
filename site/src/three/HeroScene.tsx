import { useFrame, useThree } from '@react-three/fiber';
import { useRef, type MutableRefObject, type ReactNode } from 'react';
import * as THREE from 'three';
import { CameraRig } from './CameraRig';
import { DataNode } from './DataNode';
import { GlassPanel } from './GlassPanel';
import { LightingSystem } from './LightingSystem';
import { ParticleField } from './ParticleField';
import type { QualityProfile } from '@/hooks/useQualityTier';

type Props = {
  quality: QualityProfile;
  reducedMotion: boolean;
  scroll: MutableRefObject<number>;
};

/**
 * The analytics core: a faceted inner mass inside a wireframe shell, ringed by
 * orbiting data nodes and flanked by two abstract analytic panels.
 *
 * The reading is deliberate — structured intelligence at the centre, data
 * circulating around it, measurement surfaces at the edge. It is the one 3D
 * composition on the site that carries the positioning rather than decorating
 * it.
 */
function AnalyticsCore({ reducedMotion }: { reducedMotion: boolean }) {
  const shell = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (reducedMotion) return;
    if (shell.current) {
      shell.current.rotation.y += delta * 0.09;
      shell.current.rotation.x += delta * 0.03;
    }
    if (core.current) {
      core.current.rotation.y -= delta * 0.16;
      // A slow breathing scale, capped tight: this is a system at rest, not a
      // pulsing game asset.
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 0.7) * 0.018;
      core.current.scale.setScalar(breathe);
    }
  });

  return (
    <group>
      <mesh ref={shell}>
        <icosahedronGeometry args={[1.78, 1]} />
        <meshBasicMaterial color="#3d9dc4" wireframe transparent opacity={0.3} toneMapped={false} />
      </mesh>

      <mesh ref={core}>
        <icosahedronGeometry args={[0.98, 1]} />
        <meshStandardMaterial
          color="#0f2a3a"
          emissive="#0d6b8c"
          emissiveIntensity={0.3}
          roughness={0.29}
          metalness={0.55}
          flatShading
        />
      </mesh>

      {/* Inner glow. Additive and depth-write-off so it reads as light rather
          than as a solid sphere sitting inside the core. */}
      <mesh scale={1.7}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshBasicMaterial
          color="#1ea7d6"
          transparent
          opacity={0.13}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/**
 * Responsive framing.
 *
 * On a wide viewport the composition is pushed right so the hero copy sits in
 * clean space instead of on top of the geometry. On a phone it is scaled down
 * and dropped into the empty area below the copy, because the same composition
 * at desktop scale fills the screen and reads as a blob behind the text.
 */
function SceneFrame({ children }: { children: ReactNode }) {
  const { size } = useThree();
  const narrow = size.width < 760;
  const wide = size.width >= 1100;

  const offsetX = wide ? 1.85 : narrow ? 0 : 0.9;
  const offsetY = narrow ? -2.25 : 0;
  const scale = narrow ? 0.66 : wide ? 0.94 : 0.82;

  return (
    <group position={[offsetX, offsetY, 0]} scale={scale}>
      {children}
    </group>
  );
}

export function HeroScene({ quality, reducedMotion, scroll }: Props) {
  const showPanels = quality.tier !== 'low';

  return (
    <>
      <color attach="background" args={['#07090c']} />
      <fog attach="fog" args={['#07090c', 9, 21]} />

      <CameraRig scroll={scroll} reducedMotion={reducedMotion} />
      <LightingSystem shadows={quality.shadows} />

      <SceneFrame>
        <AnalyticsCore reducedMotion={reducedMotion} />
        <DataNode count={quality.nodes} reducedMotion={reducedMotion} />

        {showPanels && (
          <>
            <GlassPanel
              position={[2.2, 1.28, -1.0]}
              rotation={[0, -0.5, 0.04]}
              bars={[0.35, 0.58, 0.44, 0.82, 0.66]}
              width={1.5}
              height={0.98}
              reducedMotion={reducedMotion}
            />
            <GlassPanel
              position={[2.55, -1.4, -0.45]}
              rotation={[0, -0.58, -0.03]}
              bars={[0.72, 0.5, 0.88, 0.61]}
              width={1.4}
              height={0.92}
              accent="#f5a623"
              reducedMotion={reducedMotion}
              phase={1.8}
            />
          </>
        )}
      </SceneFrame>

      <ParticleField count={quality.particles} reducedMotion={reducedMotion} />

      {/* Ground reference. Fog does the fading, so no shader is needed. */}
      <gridHelper args={[48, 32, '#1d4a5e', '#11303e']} position={[0, -3.1, 0]} />
    </>
  );
}
