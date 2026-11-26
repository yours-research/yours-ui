import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
} from 'react';

export interface HookSidebarItem {
  id: string;
  title: string;
  meta?: string;
  hasLiveDot?: boolean;
}

export interface HookSidebarListProps {
  items: readonly HookSidebarItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  rowHeight?: number;
  gap?: number;
  emptyText?: string;
  label?: string;
  dashed?: boolean;
  color?: string;
  className?: string;
}

const CORNER = 6;
const SPRING_STIFFNESS = 420;
const SPRING_DAMPING = 34;
const SPRING_MASS = 0.7;
const SPRING_DURATION_MS = 360;
const SPRING_STEPS = 24;
const OPACITY_DURATION_MS = 200;

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

function nowMs(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

function roundPx(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Evaluates normalized damped-spring progress `p(t)` starting from rest
 * toward `1` for `stiffness = 420`, `damping = 34`, `mass = 0.7`.
 */
function sampleDampedSpring(
  tSec: number,
  stiffness = SPRING_STIFFNESS,
  damping = SPRING_DAMPING,
  mass = SPRING_MASS,
): number {
  if (tSec <= 0) return 0;
  const omega0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  if (zeta < 1) {
    const sqrtOneMinusZetaSq = Math.sqrt(1 - zeta * zeta);
    const omegaD = omega0 * sqrtOneMinusZetaSq;
    const envelope = Math.exp(-zeta * omega0 * tSec);
    return (
      1 -
      envelope *
        (Math.cos(omegaD * tSec) + (zeta / sqrtOneMinusZetaSq) * Math.sin(omegaD * tSec))
    );
  }
  if (zeta === 1) {
    const envelope = Math.exp(-omega0 * tSec);
    return 1 - envelope * (1 + omega0 * tSec);
  }
  const sqrtZetaSqMinusOne = Math.sqrt(zeta * zeta - 1);
  const gamma = omega0 * sqrtZetaSqMinusOne;
  const envelope = Math.exp(-zeta * omega0 * tSec);
  return (
    1 -
    envelope *
      (Math.cosh(gamma * tSec) + (zeta / sqrtZetaSqMinusOne) * Math.sinh(gamma * tSec))
  );
}

const SPRING_PROGRESS: readonly number[] = Array.from(
  { length: SPRING_STEPS + 1 },
  (_, index) => {
    if (index === 0) return 0;
    if (index === SPRING_STEPS) return 1;
    return sampleDampedSpring((index / SPRING_STEPS) * (SPRING_DURATION_MS / 1000));
  },
);

function getPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Tracks `prefers-reduced-motion: reduce` safely across SSR and jsdom. */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(getPrefersReducedMotion);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (event: MediaQueryListEvent) => {
      setReduced(event.matches);
    };
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    }
    mq.addListener?.(onChange);
    return () => mq.removeListener?.(onChange);
  }, []);

  return reduced;
}

interface ScalarTrack {
  from: number;
  target: number;
  startedAt: number;
  duration: number;
  easing: 'spring' | 'linear';
}

function evalScalarTrack(track: ScalarTrack, atMs: number): number {
  if (track.duration <= 0) return track.target;
  const elapsed = atMs - track.startedAt;
  if (elapsed <= 0) return track.from;
  if (elapsed >= track.duration) return track.target;
  const progress =
    track.easing === 'spring'
      ? sampleDampedSpring(elapsed / 1000)
      : elapsed / track.duration;
  return lerp(track.from, track.target, progress);
}

function readCurrentScalar(
  el: Element,
  prop: 'top' | 'height' | 'opacity',
  track: ScalarTrack | undefined,
  anim: Animation | undefined,
  fallback: number,
  atMs: number,
): number {
  if (anim && typeof anim.playState === 'string' && typeof getComputedStyle === 'function') {
    const raw = getComputedStyle(el).getPropertyValue(prop);
    const parsed = Number.parseFloat(raw);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  if (track) {
    return evalScalarTrack(track, atMs);
  }
  return fallback;
}

interface StemTrackState {
  anim?: Animation;
  top: ScalarTrack;
  height: ScalarTrack;
}

interface CornerTrackState {
  anim?: Animation;
  top: ScalarTrack;
}

interface OpacityTrackState {
  anim?: Animation;
  opacity: ScalarTrack;
}

interface RailProps {
  from: number;
  y: number | null;
  visible: boolean;
  dashed: boolean;
  color?: string;
  reducedMotion: boolean;
  className: string;
}

/**
 * Single animated L-hook rail layer consisting of a 1px vertical stem and a
 * 12x7 rounded corner SVG, driven entirely via Web Animations API.
 */
function Rail({
  from,
  y,
  visible,
  dashed,
  color,
  reducedMotion,
  className,
}: RailProps) {
  const layerRef = useRef<HTMLSpanElement | null>(null);
  const stemRef = useRef<HTMLSpanElement | null>(null);
  const cornerRef = useRef<SVGSVGElement | null>(null);

  const prevVisibleRef = useRef<boolean | null>(null);
  const opacityStateRef = useRef<OpacityTrackState | null>(null);
  const stemStateRef = useRef<StemTrackState | null>(null);
  const cornerStateRef = useRef<CornerTrackState | null>(null);

  const stemTop = from;
  const stemHeight = Math.max(0, (y ?? 0) - CORNER - from);
  const cornerTop = (y ?? 0) - CORNER;

  // Clean up any in-flight WAAPI animations on unmount.
  useEffect(() => {
    return () => {
      opacityStateRef.current?.anim?.cancel();
      stemStateRef.current?.anim?.cancel();
      cornerStateRef.current?.anim?.cancel();
    };
  }, []);

  // Apply custom active accent color via 0ms forwards WAAPI animation.
  useLayoutEffect(() => {
    const el = layerRef.current;
    if (!el || !color || typeof el.animate !== 'function') return;
    const anim = el.animate([{ color }, { color }], {
      duration: 0,
      fill: 'forwards',
    });
    return () => anim?.cancel();
  }, [color]);

  // Animate rail layer opacity smoothly between 0 and 1 over 200ms.
  useLayoutEffect(() => {
    const el = layerRef.current;
    const targetOpacity = visible ? 1 : 0;
    const prev = opacityStateRef.current;
    const now = nowMs();

    if (!el) return;

    if (!prev) {
      let anim: Animation | undefined;
      if (typeof el.animate === 'function') {
        anim = el.animate([{ opacity: targetOpacity }, { opacity: targetOpacity }], {
          duration: 0,
          fill: 'forwards',
        });
      }
      opacityStateRef.current = {
        anim,
        opacity: {
          from: targetOpacity,
          target: targetOpacity,
          startedAt: now,
          duration: 0,
          easing: 'linear',
        },
      };
      return;
    }

    const opacityInFlight =
      reducedMotion &&
      prev.opacity.duration > 0 &&
      now < prev.opacity.startedAt + prev.opacity.duration;
    if (prev.opacity.target === targetOpacity && !opacityInFlight) {
      return;
    }

    const currentOpacity = readCurrentScalar(
      el,
      'opacity',
      prev.opacity,
      prev.anim,
      prev.opacity.target,
      now,
    );
    prev.anim?.cancel();

    const duration = reducedMotion ? 0 : OPACITY_DURATION_MS;
    let anim: Animation | undefined;
    if (typeof el.animate === 'function') {
      const keyframes =
        duration === 0
          ? [{ opacity: targetOpacity }, { opacity: targetOpacity }]
          : [{ opacity: currentOpacity }, { opacity: targetOpacity }];
      anim = el.animate(keyframes, {
        duration,
        easing: 'ease-out',
        fill: 'forwards',
      });
    }

    opacityStateRef.current = {
      anim,
      opacity: {
        from: currentOpacity,
        target: targetOpacity,
        startedAt: now,
        duration,
        easing: 'linear',
      },
    };
  }, [visible, reducedMotion]);

  // Animate stem (top, height) and corner SVG (top) with damped spring physics.
  useLayoutEffect(() => {
    const wasVisible = prevVisibleRef.current;
    prevVisibleRef.current = visible;

    const stemEl = stemRef.current;
    const cornerEl = cornerRef.current;
    if (!stemEl || !cornerEl) return;

    const prevStem = stemStateRef.current;
    const prevCorner = cornerStateRef.current;
    const now = nowMs();

    const isInitial = wasVisible === null || !prevStem || !prevCorner;
    // Keep faded-out rail parked at its last geometry until it becomes visible again.
    if (!isInitial && !visible) {
      return;
    }

    const wasJustShown = !wasVisible && visible;
    const shouldSnap = isInitial || wasJustShown || reducedMotion;

    const stemChanged =
      !prevStem || prevStem.top.target !== stemTop || prevStem.height.target !== stemHeight;
    const stemInFlight =
      Boolean(
        reducedMotion &&
          prevStem &&
          (prevStem.top.duration > 0 || prevStem.height.duration > 0) &&
          now < prevStem.height.startedAt + prevStem.height.duration,
      );
    if (isInitial || wasJustShown || stemChanged || stemInFlight) {
      const currentTop = shouldSnap
        ? stemTop
        : readCurrentScalar(stemEl, 'top', prevStem.top, prevStem.anim, stemTop, now);
      const currentHeight = shouldSnap
        ? stemHeight
        : readCurrentScalar(
            stemEl,
            'height',
            prevStem.height,
            prevStem.anim,
            stemHeight,
            now,
          );

      prevStem?.anim?.cancel();

      const duration = shouldSnap || (currentTop === stemTop && currentHeight === stemHeight)
        ? 0
        : SPRING_DURATION_MS;

      let anim: Animation | undefined;
      if (typeof stemEl.animate === 'function') {
        const keyframes: Keyframe[] =
          duration === 0
            ? [
                { top: `${roundPx(stemTop)}px`, height: `${roundPx(stemHeight)}px` },
                { top: `${roundPx(stemTop)}px`, height: `${roundPx(stemHeight)}px` },
              ]
            : SPRING_PROGRESS.map((p) => ({
                top: `${roundPx(lerp(currentTop, stemTop, p))}px`,
                height: `${Math.max(0, roundPx(lerp(currentHeight, stemHeight, p)))}px`,
              }));
        anim = stemEl.animate(keyframes, {
          duration,
          easing: 'linear',
          fill: 'forwards',
        });
      }

      stemStateRef.current = {
        anim,
        top: {
          from: currentTop,
          target: stemTop,
          startedAt: now,
          duration,
          easing: 'spring',
        },
        height: {
          from: currentHeight,
          target: stemHeight,
          startedAt: now,
          duration,
          easing: 'spring',
        },
      };
    }

    const cornerChanged = !prevCorner || prevCorner.top.target !== cornerTop;
    const cornerInFlight =
      Boolean(
        reducedMotion &&
          prevCorner &&
          prevCorner.top.duration > 0 &&
          now < prevCorner.top.startedAt + prevCorner.top.duration,
      );
    if (isInitial || wasJustShown || cornerChanged || cornerInFlight) {
      const currentCornerTop = shouldSnap
        ? cornerTop
        : readCurrentScalar(
            cornerEl,
            'top',
            prevCorner.top,
            prevCorner.anim,
            cornerTop,
            now,
          );

      prevCorner?.anim?.cancel();

      const duration = shouldSnap || currentCornerTop === cornerTop ? 0 : SPRING_DURATION_MS;

      let anim: Animation | undefined;
      if (typeof cornerEl.animate === 'function') {
        const keyframes: Keyframe[] =
          duration === 0
            ? [{ top: `${roundPx(cornerTop)}px` }, { top: `${roundPx(cornerTop)}px` }]
            : SPRING_PROGRESS.map((p) => ({
                top: `${roundPx(lerp(currentCornerTop, cornerTop, p))}px`,
              }));
        anim = cornerEl.animate(keyframes, {
          duration,
          easing: 'linear',
          fill: 'forwards',
        });
      }

      cornerStateRef.current = {
        anim,
        top: {
          from: currentCornerTop,
          target: cornerTop,
          startedAt: now,
          duration,
          easing: 'spring',
        },
      };
    }
  }, [stemTop, stemHeight, cornerTop, visible, reducedMotion]);

  return (
    <span
      ref={layerRef}
      aria-hidden="true"
      data-visible={visible ? 'true' : 'false'}
      data-from={String(from)}
      data-y={y !== null ? String(y) : undefined}
      data-color={color || undefined}
      className={cx('yui-hook-rail-layer', className)}
    >
      <span
        ref={stemRef}
        data-top={String(stemTop)}
        data-height={String(stemHeight)}
        className={cx('yui-hook-stem', dashed ? 'yui-hook-stem--dashed' : 'yui-hook-stem--solid')}
      />
      <svg
        ref={cornerRef}
        width="12"
        height="7"
        viewBox="0 0 12 7"
        fill="none"
        data-top={String(cornerTop)}
        className="yui-hook-corner"
      >
        <path
          d="M0.5 0a6 6 0 0 0 6 6H12"
          stroke="currentColor"
          strokeDasharray={dashed ? '2 2' : undefined}
        />
      </svg>
    </span>
  );
}

/**
 * Compact hierarchical sidebar list with dual spring-animated L-hook rails
 * tracking active selection and pointer hover or keyboard focus.
 */
export function HookSidebarList({
  items,
  activeId,
  onSelect,
  rowHeight = 30,
  gap = 2,
  emptyText = 'No items',
  label,
  dashed = true,
  color,
  className,
}: HookSidebarListProps) {
  const reducedMotion = useReducedMotion();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [pointerInside, setPointerInside] = useState(false);
  const [focusInside, setFocusInside] = useState(false);
  const [centers, setCenters] = useState<number[]>(() =>
    items.map((_, idx) => idx * (rowHeight + gap) + rowHeight / 2),
  );

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const focusedIndexRef = useRef<number | null>(null);
  rowRefs.current.length = items.length;

  const measureCenters = useCallback(() => {
    const next = items.map((_, idx) => {
      const el = rowRefs.current[idx];
      if (el && el.offsetHeight > 0) {
        return el.offsetTop + el.offsetHeight / 2;
      }
      return idx * (rowHeight + gap) + rowHeight / 2;
    });
    setCenters((prev) =>
      prev.length === next.length && prev.every((value, i) => value === next[i])
        ? prev
        : next,
    );
  }, [items, rowHeight, gap]);

  useLayoutEffect(() => {
    measureCenters();
    const wrap = wrapRef.current;
    if (!wrap || typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver(() => {
      measureCenters();
    });
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [measureCenters]);

  const handleWrapBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      focusedIndexRef.current = null;
      setFocusInside(false);
    }
  };

  const handleWrapMouseLeave = () => {
    setPointerInside(false);
    if (focusInside && focusedIndexRef.current !== null) {
      setHoverIndex(focusedIndexRef.current);
    }
  };

  if (items.length === 0) {
    return (
      <nav
        data-slot="hook-sidebar"
        aria-label={label ?? 'Threads'}
        className={cx('yui-hook-nav', className)}
      >
        {label ? (
          <span data-slot="hook-sidebar-label" className="yui-hook-label">
            {label}
          </span>
        ) : null}
        <div className="yui-genui-muted">{emptyText}</div>
      </nav>
    );
  }

  const resolvedCenters = items.map(
    (_, idx) => centers[idx] ?? idx * (rowHeight + gap) + rowHeight / 2,
  );
  const activeIdx = activeId ? items.findIndex((item) => item.id === activeId) : 0;
  const activeY = activeIdx === -1 ? null : (resolvedCenters[activeIdx] ?? null);
  const hoverY = hoverIndex === null ? null : (resolvedCenters[hoverIndex] ?? null);
  const hoverFrom =
    activeY !== null && hoverY !== null && hoverY <= activeY
      ? Math.max(0, hoverY - CORNER)
      : (activeY ?? 0);

  return (
    <nav
      data-slot="hook-sidebar"
      aria-label={label ?? 'Threads'}
      className={cx('yui-hook-nav', className)}
    >
      {label ? (
        <span data-slot="hook-sidebar-label" className="yui-hook-label">
          {label}
        </span>
      ) : null}
      <div
        ref={wrapRef}
        className="yui-hook-wrap"
        onMouseLeave={handleWrapMouseLeave}
        onBlur={handleWrapBlur}
      >
        <Rail
          from={hoverFrom}
          y={hoverY}
          visible={(pointerInside || focusInside) && hoverIndex !== activeIdx && hoverY !== null}
          dashed={dashed}
          reducedMotion={reducedMotion}
          className="yui-hook-rail-layer--hover"
        />
        <Rail
          from={0}
          y={activeY}
          visible={activeY !== null}
          color={color}
          dashed={dashed}
          reducedMotion={reducedMotion}
          className="yui-hook-rail-layer--active"
        />
        {items.map((item, idx) => {
          const isActive = idx === activeIdx;
          return (
            <button
              key={item.id}
              ref={(el) => {
                rowRefs.current[idx] = el;
              }}
              type="button"
              data-slot="hook-sidebar-item"
              data-active={isActive ? 'true' : 'false'}
              aria-current={isActive ? 'true' : undefined}
              className={isActive ? 'yui-hook-row is-active' : 'yui-hook-row'}
              onMouseEnter={() => {
                setHoverIndex(idx);
                setPointerInside(true);
              }}
              onFocus={() => {
                focusedIndexRef.current = idx;
                setHoverIndex(idx);
                setFocusInside(true);
              }}
              onClick={() => onSelect?.(item.id)}
            >
              <span className="yui-hook-row-left">
                {item.hasLiveDot ? <span className="yui-status-dot yui-status-dot--sm" /> : null}
                <span className="yui-hook-row-title">{item.title}</span>
              </span>
              {item.meta ? <span className="yui-hook-row-meta">{item.meta}</span> : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
