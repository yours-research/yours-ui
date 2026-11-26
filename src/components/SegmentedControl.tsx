import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ApertureIcon } from '../icons/ApertureIcon.js';
import type { ApertureIconName } from '../icons/iconData.js';
import { lerp, roundPx, sampleDampedSpring, useReducedMotion } from '../utils/spring.js';

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: string;
  icon?: ApertureIconName;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string = string> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  ariaLabel?: string;
  className?: string;
}

const SPRING_STIFFNESS = 420;
const SPRING_DAMPING = 34;
const SPRING_MASS = 0.7;
const SPRING_DURATION_MS = 320;
const SPRING_STEPS = 20;

const SPRING_PROGRESS: readonly number[] = Array.from(
  { length: SPRING_STEPS + 1 },
  (_, index) => {
    if (index === 0) return 0;
    if (index === SPRING_STEPS) return 1;
    return sampleDampedSpring((index / SPRING_STEPS) * (SPRING_DURATION_MS / 1000));
  },
);

/**
 * Minimalist hairline segmented selector (`Max · Balanced · Smooth` or
 * `Auto · Think · Fast`) with a spring-animated WAAPI sliding pill thumb
 * and keyboard Left/Right navigation.
 */
export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  size = 'sm',
  fullWidth = false,
  ariaLabel = 'Mode selector',
  className,
}: SegmentedControlProps<T>) {
  const reducedMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const thumbRef = useRef<HTMLSpanElement | null>(null);
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);
  btnRefs.current.length = options.length;

  const prevThumbRef = useRef<{ x: number; width: number } | null>(null);
  const activeAnimRef = useRef<Animation | undefined>(undefined);
  const [thumbAnimated, setThumbAnimated] = useState(false);

  const activeIdx = Math.max(
    0,
    options.findIndex((opt) => opt.value === value),
  );

  const syncThumb = useCallback(
    (allowAnimate: boolean) => {
      const thumbEl = thumbRef.current;
      const activeBtn = btnRefs.current[activeIdx];
      if (!thumbEl || !activeBtn) return;

      const width = activeBtn.offsetWidth;
      if (width <= 0 || typeof thumbEl.animate !== 'function') {
        setThumbAnimated(false);
        return;
      }

      const targetX = Math.max(0, activeBtn.offsetLeft - 2);
      const prev = prevThumbRef.current;
      setThumbAnimated(true);

      const unchanged =
        prev !== null &&
        Math.abs(prev.x - targetX) < 0.5 &&
        Math.abs(prev.width - width) < 0.5;
      if (unchanged) {
        return;
      }

      const snap = !allowAnimate || prev === null || reducedMotion;
      activeAnimRef.current?.cancel();

      const keyframes: Keyframe[] = snap
        ? [
            { transform: `translateX(${roundPx(targetX)}px)`, width: `${roundPx(width)}px` },
            { transform: `translateX(${roundPx(targetX)}px)`, width: `${roundPx(width)}px` },
          ]
        : SPRING_PROGRESS.map((p) => ({
            transform: `translateX(${roundPx(lerp(prev.x, targetX, p))}px)`,
            width: `${roundPx(lerp(prev.width, width, p))}px`,
          }));

      activeAnimRef.current = thumbEl.animate(keyframes, {
        duration: snap ? 0 : SPRING_DURATION_MS,
        easing: 'linear',
        fill: 'forwards',
      });
      prevThumbRef.current = { x: targetX, width };
    },
    [activeIdx, reducedMotion],
  );

  useLayoutEffect(() => {
    syncThumb(true);
  }, [syncThumb, options.length, size, fullWidth]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver(() => {
      syncThumb(false);
    });
    observer.observe(track);
    return () => observer.disconnect();
  }, [syncThumb]);

  useEffect(() => {
    return () => activeAnimRef.current?.cancel();
  }, []);

  const trackClass = [
    'yui-seg',
    size === 'md' ? 'yui-seg--md' : '',
    fullWidth ? 'yui-seg--full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const stepSelection = (currentIdx: number, delta: 1 | -1) => {
    if (options.length === 0) return;
    for (let offset = 1; offset <= options.length; offset++) {
      const idx = (currentIdx + delta * offset + options.length) % options.length;
      const candidate = options[idx];
      if (candidate && !candidate.disabled) {
        onChange(candidate.value);
        return;
      }
    }
  };

  return (
    <div
      ref={trackRef}
      data-slot="segmented-control"
      data-thumb={thumbAnimated ? 'animated' : 'static'}
      role="radiogroup"
      aria-label={ariaLabel}
      className={trackClass}
    >
      <span ref={thumbRef} aria-hidden="true" className="yui-seg-thumb" />
      {options.map((opt, idx) => {
        const active = opt.value === value;
        const btnClass = ['yui-seg-btn', active ? 'is-active' : '']
          .filter(Boolean)
          .join(' ');

        return (
          <button
            key={opt.value}
            ref={(el) => {
              btnRefs.current[idx] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            disabled={opt.disabled}
            className={btnClass}
            onClick={() => {
              if (!opt.disabled) onChange(opt.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                stepSelection(idx, 1);
              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                stepSelection(idx, -1);
              }
            }}
          >
            {opt.icon ? <ApertureIcon name={opt.icon} size={size === 'md' ? 12.5 : 11.5} /> : null}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
