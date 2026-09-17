import { useFrame, useThree } from '@react-three/fiber';
import { useRef, type ReactNode, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { CameraRig } from './CameraRig';
import { LightingSystem } from './LightingSystem';
import { ParticleField } from './ParticleField';
import type { QualityProfile } from '@/hooks/useQualityTier';

type Props = {
  quality: QualityProfile;
  reducedMotion: boolean;
  scroll: MutableRefObject<number>;
};

const BEYOND = '#00f0ff';
const BEYOND_DEEP = '#7c3aed';

/**
 * Muscle-group activation points.
 *
 * Positions are anatomical in intent — chest, lats, core, quads, calves,
 * shoulders — because the product's own model attributes load per region.
 * Each point is a light source in the composition, not a floating bauble.
 */
const ACTIVATION: Array<{ pos: [number, number, number]; weight: number }> = [
  { pos: [-0.2, 0.8, 0.33], weight: 0.9 },   // chest
  { pos: [0.2, 0.8, 0.33], weight: 0.9 },
  { pos: [-0.35, 0.58, -0.3], weight: 0.62 }, // lats
  { pos: [0.35, 0.58, -0.3], weight: 0.62 },
  { pos: [0, 0.18, 0.29], weight: 0.48 },     // core
  { pos: [-0.46, 1.02, 0.1], weight: 0.7 },   // shoulders
  { pos: [0.46, 1.02, 0.1], weight: 0.7 },
  { pos: [-0.21, -0.72, 0.17], weight: 0.85 }, // quads
  { pos: [0.21, -0.72, 0.17], weight: 0.85 },
  { pos: [-0.23, -1.45, -0.14], weight: 0.42 }, // calves
  { pos: [0.23, -1.45, -0.14], weight: 0.42 },
];

/** Primitive segments making up the silhouette. Proportions are tapered —
 *  wider chest, narrower waist — so it reads as a body rather than a stack. */
type Segment =
  | { kind: 'sphere'; key: string; r: number; pos: [number, number, number] }
  | { kind: 'capsule'; key: string; r: number; h: number; pos: [number, number, number] };

const BODY: Segment[] = [
  { kind: 'sphere', key: 'head', r: 0.26, pos: [0, 1.46, 0] },
  { kind: 'capsule', key: 'neck', r: 0.1, h: 0.14, pos: [0, 1.22, 0] },
  { kind: 'capsule', key: 'chest', r: 0.4, h: 0.6, pos: [0, 0.72, 0] },
  { kind: 'capsule', key: 'waist', r: 0.29, h: 0.4, pos: [0, 0.18, 0] },
  { kind: 'capsule', key: 'pelvis', r: 0.32, h: 0.24, pos: [0, -0.22, 0] },
  { kind: 'sphere', key: 'shoulderL', r: 0.17, pos: [-0.46, 1.0, 0] },
  { kind: 'sphere', key: 'shoulderR', r: 0.17, pos: [0.46, 1.0, 0] },
  { kind: 'capsule', key: 'upperArmL', r: 0.115, h: 0.54, pos: [-0.54, 0.62, 0] },
  { kind: 'capsule', key: 'upperArmR', r: 0.115, h: 0.54, pos: [0.54, 0.62, 0] },
  { kind: 'sphere', key: 'elbowL', r: 0.105, pos: [-0.56, 0.3, 0] },
  { kind: 'sphere', key: 'elbowR', r: 0.105, pos: [0.56, 0.3, 0] },
  { kind: 'capsule', key: 'forearmL', r: 0.095, h: 0.5, pos: [-0.58, 0.02, 0] },
  { kind: 'capsule', key: 'forearmR', r: 0.095, h: 0.5, pos: [0.58, 0.02, 0] },
  { kind: 'sphere', key: 'handL', r: 0.085, pos: [-0.59, -0.3, 0] },
  { kind: 'sphere', key: 'handR', r: 0.085, pos: [0.59, -0.3, 0] },
  { kind: 'capsule', key: 'thighL', r: 0.175, h: 0.64, pos: [-0.2, -0.72, 0] },
  { kind: 'capsule', key: 'thighR', r: 0.175, h: 0.64, pos: [0.2, -0.72, 0] },
  { kind: 'sphere', key: 'kneeL', r: 0.145, pos: [-0.21, -1.1, 0] },
  { kind: 'sphere', key: 'kneeR', r: 0.145, pos: [0.21, -1.1, 0] },
  { kind: 'capsule', key: 'shinL', r: 0.135, h: 0.6, pos: [-0.22, -1.48, 0] },
  { kind: 'capsule', key: 'shinR', r: 0.135, h: 0.6, pos: [0.22, -1.48, 0] },
  { kind: 'capsule', key: 'footL', r: 0.1, h: 0.16, pos: [-0.22, -1.86, 0.06] },
  { kind: 'capsule', key: 'footR', r: 0.1, h: 0.16, pos: [0.22, -1.86, 0.06] },
];

/**
 * An abstract human form built from primitives rather than a downloaded mesh.
 *
 * A real anatomical GLB is what BeBeyond itself ships, but pulling a rigged
 * écorché into a portfolio hero would cost hundreds of kilobytes to say
 * something a procedural silhouette says at this scale for nothing.
 */
function PerformanceFigure({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const points = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (reducedMotion) return;
    if (group.current) group.current.rotation.y += delta * 0.11;
    if (points.current) {
      const t = state.clock.elapsedTime;
      points.current.children.forEach((child, index) => {
        const weight = ACTIVATION[index]?.weight ?? 0.5;
        child.scale.setScalar(0.85 + Math.sin(t * 1.15 + index * 0.9) * 0.14 * weight);
      });
    }
  });

  return (
    <group ref={group} position={[0, 0.05, 0]} scale={0.92}>
      {BODY.map((part) => (
        <mesh key={part.key} position={part.pos}>
          {part.kind === 'sphere' ? (
            <sphereGeometry args={[part.r, 18, 12]} />
          ) : (
            <capsuleGeometry args={[part.r, part.h, 4, 10]} />
          )}
          <meshStandardMaterial
            color="#0a1c26"
            emissive={BEYOND}
            emissiveIntensity={0.2}
            roughness={0.38}
            metalness={0.38}
          />
        </mesh>
      ))}

      {/* Wireframe overlay: the "read" of the body as a measured system. */}
      <mesh position={[0, 0.28, 0]} scale={[1.1, 1.62, 1.1]}>
        <icosahedronGeometry args={[0.92, 1]} />
        <meshBasicMaterial color={BEYOND} wireframe transparent opacity={0.09} toneMapped={false} />
      </mesh>

      <group ref={points}>
        {ACTIVATION.map((point, index) => (
          <mesh key={index} position={point.pos}>
            <sphereGeometry args={[0.072, 12, 10]} />
            <meshBasicMaterial
              color={point.weight > 0.7 ? BEYOND : BEYOND_DEEP}
              transparent
              opacity={0.42 + point.weight * 0.5}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Readiness rings: partial tori, each a different arc, slowly counter-rotating. */
function TelemetryRings({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (reducedMotion || !group.current) return;
    group.current.rotation.z += delta * 0.07;
    group.current.children.forEach((child, index) => {
      child.rotation.z += delta * (index % 2 === 0 ? 0.13 : -0.09);
    });
  });

  return (
    <group ref={group} rotation={[-0.42, 0, 0]}>
      <mesh position={[0, -0.1, 0]}>
        <torusGeometry args={[2.35, 0.012, 6, 90, Math.PI * 1.42]} />
        <meshBasicMaterial color={BEYOND} transparent opacity={0.5} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <torusGeometry args={[2.7, 0.009, 6, 90, Math.PI * 0.88]} />
        <meshBasicMaterial color={BEYOND_DEEP} transparent opacity={0.55} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <torusGeometry args={[3.05, 0.007, 6, 90, Math.PI * 0.52]} />
        <meshBasicMaterial color="#f5a623" transparent opacity={0.4} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Mirrors the hero's framing rule so both scenes sit consistently. */
function SceneFrame({ children }: { children: ReactNode }) {
  const { size } = useThree();
  const narrow = size.width < 760;
  const wide = size.width >= 1100;

  return (
    <group
      position={[wide ? 1.9 : narrow ? 0 : 1, narrow ? -1.1 : 0, 0]}
      scale={narrow ? 0.72 : wide ? 1 : 0.86}
    >
      {children}
    </group>
  );
}

export function BeyondScene({ quality, reducedMotion, scroll }: Props) {
  return (
    <>
      <color attach="background" args={['#05080b']} />
      <fog attach="fog" args={['#05080b', 8, 19]} />

      <CameraRig scroll={scroll} reducedMotion={reducedMotion} travel={1.1} parallax={0.3} />
      <LightingSystem accent={BEYOND} rim={BEYOND_DEEP} shadows={false} intensity={0.9} />

      <SceneFrame>
        <PerformanceFigure reducedMotion={reducedMotion} />
        <TelemetryRings reducedMotion={reducedMotion} />
      </SceneFrame>
      <ParticleField
        count={Math.round(quality.particles * 0.45)}
        radius={7}
        color={BEYOND}
        size={0.022}
        reducedMotion={reducedMotion}
      />
    </>
  );
}
