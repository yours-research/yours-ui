import { ApertureIcon, CheckIcon } from '../icons/ApertureIcon.js';
import type { ApertureIconName } from '../icons/iconData.js';

export interface NotchOptionRowProps {
  title: string;
  subtitle?: string;
  meta?: string;
  icon?: ApertureIconName;
  selected?: boolean;
  dotTone?: 'green' | 'amber' | 'none';
  dotPulse?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Minimal selectable row for `TopNotch` `Tabs` and `Model` drawers with optional
 * hardware LED dot, metadata readout, and monochrome active check mark.
 */
export function NotchOptionRow({
  title,
  subtitle,
  meta,
  icon,
  selected = false,
  dotTone = 'none',
  dotPulse = false,
  disabled = false,
  onClick,
  className,
}: NotchOptionRowProps) {
  const rowClass = [
    'yui-notch-opt-row',
    selected ? 'is-selected' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const dotClass = [
    'yui-status-dot',
    'yui-status-dot--sm',
    dotTone === 'amber' ? 'yui-status-dot--amber' : '',
    dotPulse ? 'yui-status-dot--pulse' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      data-slot="notch-option-row"
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      data-selected={selected ? 'true' : 'false'}
      className={rowClass}
      onClick={onClick}
    >
      <span className="yui-notch-opt-left">
        {dotTone !== 'none' ? <span className={dotClass} aria-hidden="true" /> : null}
        {icon ? <ApertureIcon name={icon} size={13.5} className="yui-notch-opt-icon" /> : null}
        <span className="yui-col-min">
          <span className="yui-notch-opt-title">{title}</span>
          {subtitle ? <span className="yui-notch-opt-sub">{subtitle}</span> : null}
        </span>
      </span>
      <span className="yui-notch-opt-right">
        {meta ? <span className="yui-notch-opt-meta">{meta}</span> : null}
        {selected ? <CheckIcon size={12} className="yui-notch-opt-check" /> : null}
      </span>
    </button>
  );
}
