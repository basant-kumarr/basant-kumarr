import { useFrame, useThree } from '@react-three/fiber';
import { useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';

type Props = {
  /** Document scroll progress, read from a ref so this costs no re-renders. */
  scroll: MutableRefObject<number>;
  reducedMotion: boolean;
  /** How far the camera travels across the full scroll range. */
  travel?: number;
  /** Pointer parallax strength. Zero disables it. */
  parallax?: number;
};

const BASE = new THREE.Vector3(0, 0.35, 8.2);
const TARGET = new THREE.Vector3(0, 0, 0);

/**
 * The only thing in the site allowed to move the camera.
 *
 * Scroll pushes the camera back and slightly up, so the hero composition opens
 * out as the visitor reads past it. Pointer parallax is a small additive offset
 * on top. With reduced motion the camera is placed once and never animated.
 */
export function CameraRig({ scroll, reducedMotion, travel = 2.4, parallax = 0.42 }: Props) {
  const { camera, size } = useThree();
  const pointer = useRef(new THREE.Vector2(0, 0));
  const desired = useRef(new THREE.Vector3().copy(BASE));

  useFrame((state, delta) => {
    if (reducedMotion) {
      camera.position.copy(BASE);
      camera.lookAt(TARGET);
      return;
    }

    // Narrow viewports get less travel — on a phone the same displacement
    // reads as the scene sliding off screen rather than as depth.
    const scale = size.width < 760 ? 0.55 : 1;
    const t = scroll.current;

    pointer.current.set(state.pointer.x, state.pointer.y);

    desired.current.set(
      pointer.current.x * parallax * scale,
      0.35 + t * 0.9 * scale + pointer.current.y * parallax * 0.5 * scale,
      BASE.z + t * travel * scale,
    );

    // Critically damped follow: fast enough to feel connected to the input,
    // slow enough that it never overshoots and implies motion that did not
    // happen.
    const lerp = 1 - Math.pow(0.0015, delta);
    camera.position.lerp(desired.current, lerp);
    camera.lookAt(TARGET);
  });

  return null;
}
