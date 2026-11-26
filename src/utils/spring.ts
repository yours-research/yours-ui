import { useEffect, useState } from 'react';

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function roundPx(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Evaluates normalized damped-spring progress `p(t)` starting from rest toward `1`. */
export function sampleDampedSpring(
  tSec: number,
  stiffness = 420,
  damping = 34,
  mass = 0.7,
): number {
  if (tSec <= 0) return 0;
  const omega0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  if (zeta < 1) {
    const sqrtOneMinusZetaSq = Math.sqrt(1 - zeta * zeta);
    const omegaD = omega0 * sqrtOneMinusZetaSq;
    const envelope = Math.exp(-zeta * omega0 * tSec);
    return 1 - envelope * (Math.cos(omegaD * tSec) + (zeta / sqrtOneMinusZetaSq) * Math.sin(omegaD * tSec));
  }
  if (zeta === 1) {
    const envelope = Math.exp(-omega0 * tSec);
    return 1 - envelope * (1 + omega0 * tSec);
  }
  const sqrtZetaSqMinusOne = Math.sqrt(zeta * zeta - 1);
  const gamma = omega0 * sqrtZetaSqMinusOne;
  const envelope = Math.exp(-zeta * omega0 * tSec);
  return 1 - envelope * (Math.cosh(gamma * tSec) + (zeta / sqrtZetaSqMinusOne) * Math.sinh(gamma * tSec));
}

function getPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return Boolean(window.matchMedia('(prefers-reduced-motion: reduce)')?.matches);
}

/** Tracks `prefers-reduced-motion: reduce` cleanly across SSR and jsdom. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(getPrefersReducedMotion);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    setReduced(Boolean(mq.matches));
    const onChange = (event: MediaQueryListEvent) => setReduced(Boolean(event.matches));
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    }
    mq.addListener?.(onChange);
    return () => mq.removeListener?.(onChange);
  }, []);

  return reduced;
}
