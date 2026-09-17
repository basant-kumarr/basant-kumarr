import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

type Props = {
  count: number;
  reducedMotion: boolean;
  color?: string;
  accentColor?: string;
  radius?: number;
};

const dummy = new THREE.Object3D();

/**
 * Orbiting data nodes.
 *
 * Every node is one instance of a single low-poly octahedron, so N nodes cost
 * one draw call instead of N. The orbits are on three tilted rings rather than
 * scattered randomly — the structure is the point; random floating objects
 * would be decoration.
 */
export function DataNode({
  count,
  reducedMotion,
  color = '#7dd8ff',
  accentColor = '#f5a623',
  radius = 3.1,
}: Props) {
  const mesh = useRef<THREE.InstancedMesh>(null);

  const orbits = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const ring = i % 3;
        return {
          ring,
          radius: radius * (0.72 + ring * 0.22),
          speed: (0.16 + ring * 0.05) * (ring === 1 ? -1 : 1),
          phase: (i / count) * Math.PI * 2 + ring * 0.7,
          tilt: (ring - 1) * 0.42,
          scale: 0.1 + (i % 4) * 0.026,
        };
      }),
    [count, radius],
  );

  const colors = useMemo(() => {
    const array = new Float32Array(count * 3);
    const cool = new THREE.Color(color);
    const warm = new THREE.Color(accentColor);
    for (let i = 0; i < count; i += 1) {
      // One node in five carries the warm accent so the ring has a read order.
      const c = i % 5 === 2 ? warm : cool;
      array[i * 3] = c.r;
      array[i * 3 + 1] = c.g;
      array[i * 3 + 2] = c.b;
    }
    return array;
  }, [count, color, accentColor]);

  const place = (time: number) => {
    if (!mesh.current) return;
    for (let i = 0; i < orbits.length; i += 1) {
      const o = orbits[i];
      const angle = o.phase + time * o.speed;
      dummy.position.set(
        Math.cos(angle) * o.radius,
        Math.sin(angle) * o.radius * Math.sin(o.tilt) + Math.sin(angle * 2) * 0.12,
        Math.sin(angle) * o.radius * Math.cos(o.tilt),
      );
      dummy.rotation.set(angle * 0.6, angle * 0.9, 0);
      dummy.scale.setScalar(o.scale);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  };

  // Static placement first, so a reduced-motion visitor still gets the
  // composition rather than a pile of instances at the origin.
  useLayoutEffect(() => {
    place(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orbits]);

  useFrame((state) => {
    if (reducedMotion) return;
    place(state.clock.elapsedTime);
  });

  if (count === 0) return null;

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <octahedronGeometry args={[1, 0]}>
        <instancedBufferAttribute attach="attributes-color" args={[colors, 3]} />
      </octahedronGeometry>
      <meshStandardMaterial
        vertexColors
        roughness={0.24}
        metalness={0.1}
        emissive="#1b4a63"
        emissiveIntensity={0.7}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
