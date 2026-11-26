import { ApertureIcon } from '../icons/ApertureIcon.js';
import type { ApertureIconName } from '../icons/iconData.js';

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

/**
 * Minimalist hairline segmented selector (`Max · Balanced · Smooth` or
 * `Auto · Think · Fast`) with keyboard Left/Right navigation.
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
      data-slot="segmented-control"
      role="radiogroup"
      aria-label={ariaLabel}
      className={trackClass}
    >
      {options.map((opt, idx) => {
        const active = opt.value === value;
        const btnClass = ['yui-seg-btn', active ? 'is-active' : '']
          .filter(Boolean)
          .join(' ');

        return (
          <button
            key={opt.value}
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
