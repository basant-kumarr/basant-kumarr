import { useEffect, useState } from 'react';

export type QualityTier = 'high' | 'medium' | 'low' | 'off';

export type QualityProfile = {
  tier: QualityTier;
  /** Device pixel ratio ceiling handed to the renderer. */
  dpr: [number, number];
  /** Particle count for the ambient field. */
  particles: number;
  /** Data nodes orbiting the hero core. */
  nodes: number;
  /** Whether shadow maps are worth their cost on this device. */
  shadows: boolean;
};

const PROFILES: Record<QualityTier, QualityProfile> = {
  high: { tier: 'high', dpr: [1, 1.9], particles: 900, nodes: 14, shadows: true },
  medium: { tier: 'medium', dpr: [1, 1.5], particles: 420, nodes: 10, shadows: false },
  low: { tier: 'low', dpr: [1, 1.15], particles: 160, nodes: 6, shadows: false },
  off: { tier: 'off', dpr: [1, 1], particles: 0, nodes: 0, shadows: false },
};

/**
 * Probes for a WebGL context once and grades the device. The probe canvas is
 * disposed immediately — leaving it alive would hold a GL context the real
 * scene may need on memory-constrained mobile GPUs.
 */
function detectTier(): QualityTier {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 'off';

  let gl: WebGLRenderingContext | null = null;
  const canvas = document.createElement('canvas');
  try {
    gl = (canvas.getContext('webgl2') ??
      canvas.getContext('webgl')) as WebGLRenderingContext | null;
  } catch {
    gl = null;
  }

  if (!gl) return 'off';

  const maxTexture = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  canvas.width = 0;
  canvas.height = 0;

  if (maxTexture < 4096) return 'low';

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const narrow = window.innerWidth < 900;

  // A phone is graded down regardless of core count: the constraint there is
  // thermal and battery, not raw capability.
  if (coarse || narrow) return cores >= 6 && memory >= 4 ? 'medium' : 'low';
  if (cores <= 4 || memory <= 4) return 'medium';
  return 'high';
}

/**
 * Device-appropriate 3D budget. Resolves after mount so the first paint is
 * never blocked by the probe.
 */
export function useQualityTier(): QualityProfile {
  const [tier, setTier] = useState<QualityTier>('off');

  useEffect(() => {
    setTier(detectTier());
  }, []);

  return PROFILES[tier];
}
