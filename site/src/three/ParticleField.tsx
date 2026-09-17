import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

type Props = {
  count: number;
  radius?: number;
  color?: string;
  size?: number;
  reducedMotion: boolean;
};

/**
 * Ambient data motes.
 *
 * One `Points` draw call with a static buffer — the whole field rotates as a
 * single object rather than each mote being animated on the CPU, which is what
 * keeps this affordable on a phone. Count comes from the quality tier, so a low
 * tier renders a sparser field rather than a different effect.
 */
export function ParticleField({
  count,
  radius = 9,
  color = '#5fc8f5',
  size = 0.028,
  reducedMotion,
}: Props) {
  const group = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      // Spherical shell rather than a cube: a cube of points reads as a box
      // once the camera moves, which breaks the illusion of atmosphere.
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * (0.45 + Math.random() * 0.55);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.55;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count, radius]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: new THREE.Color(color),
        size,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.58,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [color, size],
  );

  // Three.js resources are not garbage collected by the renderer; without this
  // a route change would leak a buffer and a material per mount.
  useMemo(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((_, delta) => {
    if (reducedMotion || !group.current) return;
    group.current.rotation.y += delta * 0.014;
  });

  if (count === 0) return null;

  return <points ref={group} geometry={geometry} material={material} frustumCulled={false} />;
}
