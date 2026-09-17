import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

type Props = {
  position: [number, number, number];
  rotation?: [number, number, number];
  /** Bar heights, 0 → 1. These are shapes, not data — kept abstract on purpose. */
  bars: number[];
  width?: number;
  height?: number;
  color?: string;
  accent?: string;
  reducedMotion: boolean;
  /** Drift phase so two panels never bob in lockstep. */
  phase?: number;
};

/**
 * A floating analytics panel.
 *
 * Real glass (transmission) costs a render target per panel, which is not worth
 * it at this size — a lightly emissive, low-opacity surface with a bright edge
 * reads the same at this scale for a fraction of the budget.
 */
export function GlassPanel({
  position,
  rotation = [0, 0, 0],
  bars,
  width = 1.65,
  height = 1.05,
  color = '#123044',
  accent = '#38bdf8',
  reducedMotion,
  phase = 0,
}: Props) {
  const group = useRef<THREE.Group>(null);

  const edge = useMemo(() => {
    const shape = new THREE.Shape();
    const w = width / 2;
    const h = height / 2;
    shape.moveTo(-w, -h);
    shape.lineTo(w, -h);
    shape.lineTo(w, h);
    shape.lineTo(-w, h);
    shape.lineTo(-w, -h);
    return new THREE.BufferGeometry().setFromPoints(shape.getPoints());
  }, [width, height]);

  useFrame((state) => {
    if (reducedMotion || !group.current) return;
    const t = state.clock.elapsedTime;
    group.current.position.y = position[1] + Math.sin(t * 0.45 + phase) * 0.075;
    group.current.rotation.z = rotation[2] + Math.sin(t * 0.3 + phase) * 0.014;
  });

  const barWidth = (width * 0.74) / (bars.length * 1.6);
  const barSpan = width * 0.74;

  return (
    <group ref={group} position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.5}
          roughness={0.35}
          metalness={0.3}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <lineLoop geometry={edge}>
        <lineBasicMaterial color={accent} transparent opacity={0.72} toneMapped={false} />
      </lineLoop>

      {/* Header rule: gives the panel a top edge so it reads as an interface
          surface rather than as a floating rectangle. */}
      <mesh position={[-width * 0.13, height * 0.34, 0.012]}>
        <planeGeometry args={[width * 0.48, 0.022]} />
        <meshBasicMaterial color={accent} transparent opacity={0.65} toneMapped={false} />
      </mesh>
      <mesh position={[width * 0.38, height * 0.34, 0.012]}>
        <planeGeometry args={[width * 0.14, 0.022]} />
        <meshBasicMaterial color={accent} transparent opacity={0.3} toneMapped={false} />
      </mesh>

      {bars.map((value, index) => {
        const barHeight = Math.max(0.06, value * height * 0.58);
        const x = -barSpan / 2 + (index + 0.5) * (barSpan / bars.length);
        return (
          <mesh key={index} position={[x, -height * 0.32 + barHeight / 2, 0.012]}>
            <boxGeometry args={[barWidth, barHeight, 0.02]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={0.45 + value * 0.5}
              roughness={0.3}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}
