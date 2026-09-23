import { ControlledVariations, OverlayElementConfig } from '../types';

/**
 * Deterministic pseudo-random number generator (Mulberry32).
 * Returns a value in [0, 1) strictly reproducible from seed.
 */
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface AppliedElementGeometry extends OverlayElementConfig {
  deltaX: number;
  deltaY: number;
  deltaRot: number;
  deltaScale: number;
  effectiveX: number;
  effectiveY: number;
  effectiveWidth: number;
  effectiveRotation: number;
}

/**
 * Computes deterministic variation for a page and element.
 * Page 3 will ALWAYS yield the exact same offsets whether in preview or final export.
 */
export function computeEffectiveGeometry(
  pageNumber: number,
  elementType: 'signature' | 'cachet',
  base: OverlayElementConfig,
  variations: ControlledVariations
): AppliedElementGeometry {
  if (!variations.enabled) {
    return {
      ...base,
      deltaX: 0,
      deltaY: 0,
      deltaRot: 0,
      deltaScale: 0,
      effectiveX: base.x,
      effectiveY: base.y,
      effectiveWidth: base.width,
      effectiveRotation: base.rotation,
    };
  }

  // Create a unique deterministic seed for this page & element combination
  const elementSalt = elementType === 'signature' ? 7919 : 3571;
  const seed = (pageNumber * 104729 + elementSalt) >>> 0;
  const rng = mulberry32(seed);

  // Each call consumes the deterministic PRNG sequence
  // Random values in [-1, +1]
  const rPosX = rng() * 2 - 1;
  const rPosY = rng() * 2 - 1;
  const rRot = rng() * 2 - 1;
  const rScale = rng() * 2 - 1;

  const deltaX = rPosX * (variations.positionAmplitude || 0);
  const deltaY = rPosY * (variations.positionAmplitude || 0);
  const deltaRot = rRot * (variations.rotationAmplitude || 0);
  const deltaScale = (rScale * (variations.sizeAmplitude || 0)) / 100;

  const effectiveX = Math.min(95, Math.max(0, base.x + deltaX));
  const effectiveY = Math.min(95, Math.max(0, base.y + deltaY));
  const effectiveWidth = Math.min(80, Math.max(5, base.width * (1 + deltaScale)));
  
  let effectiveRotation = (base.rotation + deltaRot) % 360;
  if (effectiveRotation > 180) effectiveRotation -= 360;
  if (effectiveRotation < -180) effectiveRotation += 360;

  return {
    ...base,
    deltaX: Math.round(deltaX * 100) / 100,
    deltaY: Math.round(deltaY * 100) / 100,
    deltaRot: Math.round(deltaRot * 100) / 100,
    deltaScale: Math.round(deltaScale * 1000) / 1000,
    effectiveX: Math.round(effectiveX * 100) / 100,
    effectiveY: Math.round(effectiveY * 100) / 100,
    effectiveWidth: Math.round(effectiveWidth * 100) / 100,
    effectiveRotation: Math.round(effectiveRotation * 10) / 10,
  };
}
