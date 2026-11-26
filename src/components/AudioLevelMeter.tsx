export type AudioLevelMeterTone = 'neutral' | 'active' | 'speaking' | 'muted';

export interface AudioLevelMeterProps {
  /** Normalized single envelope level (0..1) distributed across meter bars. */
  level?: number;
  /** Optional explicit per-bar normalized levels (0..1). Overrides `level`. */
  levels?: readonly number[];
  /** Number of discrete hairline bars (clamped 5..16, default 9). */
  bars?: number;
  tone?: AudioLevelMeterTone;
  size?: 'sm' | 'md';
  animated?: boolean;
  label?: string;
  className?: string;
}

const ENVELOPE_WEIGHTS = [0.42, 0.64, 0.84, 0.96, 1.0, 0.92, 0.78, 0.58, 0.4];

function quantizeStep(value: number): number {
  const clamped = Math.max(0, Math.min(1, value));
  if (clamped < 0.16) return 0;
  if (clamped < 0.34) return 1;
  if (clamped < 0.54) return 2;
  if (clamped < 0.74) return 3;
  if (clamped < 0.9) return 4;
  return 5;
}

/**
 * Zero-inline-style discrete hairline audio level meter driven entirely via CSS
 * step classes (`yui-alm-bar--0`..`yui-alm-bar--5`) and semantic data attributes.
 */
export function AudioLevelMeter({
  level = 0.25,
  levels,
  bars,
  tone = 'neutral',
  size = 'md',
  animated = false,
  label = 'Audio input level',
  className,
}: AudioLevelMeterProps) {
  const count = Math.max(
    5,
    Math.min(16, bars ?? (levels && levels.length > 0 ? levels.length : 9)),
  );
  const isMuted = tone === 'muted';
  const normalizedScalar = isMuted ? 0 : Math.max(0, Math.min(1, level));

  const barSteps = Array.from({ length: count }, (_, idx) => {
    if (isMuted) return 0;
    if (levels && levels.length > 0) {
      const mapped = levels[idx % levels.length] ?? normalizedScalar;
      return quantizeStep(mapped);
    }
    const weight = ENVELOPE_WEIGHTS[idx % ENVELOPE_WEIGHTS.length] ?? 0.6;
    return quantizeStep(normalizedScalar * weight);
  });

  const avgNormalized = isMuted
    ? 0
    : levels && levels.length > 0
      ? levels.reduce((acc, v) => acc + Math.max(0, Math.min(1, v)), 0) / levels.length
      : normalizedScalar;
  const ariaPercent = Math.round(avgNormalized * 100);

  const rootClass = [
    'yui-alm',
    `yui-alm--${tone}`,
    `yui-alm--${size}`,
    animated && !isMuted ? 'is-animated' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      data-slot="audio-level-meter"
      data-tone={tone}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={ariaPercent}
      className={rootClass}
    >
      {barSteps.map((step, idx) => (
        <span
          key={idx}
          aria-hidden="true"
          data-step={step}
          className={`yui-alm-bar yui-alm-bar--${step}`}
        />
      ))}
    </div>
  );
}
