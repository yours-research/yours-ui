import {
  ApertureIcon,
  CheckIcon,
  ChevronDownIcon,
  HistoryIcon,
  MicIcon,
  PlusIcon,
  SearchIcon,
  StopIcon,
  XIcon,
} from '../icons/ApertureIcon.js';
import type { ApertureIconName } from '../icons/iconData.js';
import { MatrixOrb } from '../icons/MatrixOrb.js';
import { NotchEar } from '../icons/NotchEar.js';
import { cn } from '../utils/clipboard.js';

export interface NotchDrawerSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  count?: number;
}

/**
 * Compact headerless filter input with hairline count badge designed to sit
 * directly inside the expanded TopNotch drawer.
 */
export function NotchDrawerSearch({
  value,
  onChange,
  placeholder = 'Search...',
  count,
}: NotchDrawerSearchProps) {
  return (
    <div className="yui-row-between">
      <div className="yui-row yui-flex-1 yui-muted-note">
        <SearchIcon size={12} />
        <input
          type="text"
          className="yui-drawer-search-input"
          placeholder={placeholder}
          value={value}
          aria-label={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {count !== undefined ? <span className="yui-drawer-count">{count}</span> : null}
    </div>
  );
}

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
  return (
    <button
      data-slot="notch-option-row"
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      data-selected={selected ? 'true' : 'false'}
      className={cn('yui-notch-opt-row', selected && 'is-selected', className)}
      onClick={onClick}
    >
      <span className="yui-notch-opt-left">
        {dotTone !== 'none' ? (
          <span
            className={cn(
              'yui-status-dot yui-status-dot--sm',
              dotTone === 'amber' && 'yui-status-dot--amber',
              dotPulse && 'yui-status-dot--pulse',
            )}
            aria-hidden="true"
          />
        ) : null}
        {icon ? <ApertureIcon name={icon} size={13.5} className="yui-notch-opt-icon" /> : null}
        <span className="yui-col-min">
          <span className="yui-notch-opt-title">{title}</span>
          {subtitle ? <span className="yui-notch-opt-sub">{subtitle}</span> : null}
        </span>
      </span>
      <span className="yui-action-group">
        {meta ? <span className="yui-notch-opt-meta">{meta}</span> : null}
        {selected ? <CheckIcon size={12} className="yui-notch-opt-check" /> : null}
      </span>
    </button>
  );
}

export type NotchStatusMode = 'idle' | 'thinking' | 'streaming' | 'voice' | 'drawer';

export interface NotchStatusPillProps {
  mode: NotchStatusMode;
  label?: string;
  metric?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
}

const DEFAULT_NOTCH_LABELS: Record<NotchStatusMode, string> = {
  idle: 'Ready',
  thinking: 'Thinking',
  streaming: 'Writing',
  voice: 'Listening',
  drawer: 'History',
};

/** Ambient green LED indicator halo used across idle/active local status controls. */
export function GreenLed() {
  return (
    <span className="yui-green-led-halo" aria-hidden="true">
      <span className="yui-green-led-core" />
    </span>
  );
}

/**
 * Compact 5-state top-center status notch (`idle`, `thinking`, `streaming`, `voice`, `drawer`)
 * suitable for minimalist non-tabbed Chrome extension headers.
 */
export function NotchStatusPill({
  mode,
  label,
  metric,
  onPrimaryAction,
  onSecondaryAction,
}: NotchStatusPillProps) {
  const resolvedLabel = label ?? DEFAULT_NOTCH_LABELS[mode];

  return (
    <div className="yui-status-notch-wrap">
      <NotchEar side="left" className="yui-status-notch-ear" />
      <div className="yui-status-notch-pill">
        <button
          type="button"
          className="yui-icon-btn"
          onClick={onPrimaryAction}
          aria-label={resolvedLabel}
        >
          {mode === 'idle' ? <GreenLed /> : null}
          {mode === 'thinking' ? <MatrixOrb state="thinking" size={13} /> : null}
          {mode === 'streaming' ? <MatrixOrb state="streaming" size={13} /> : null}
          {mode === 'voice' ? <MicIcon size={12} /> : null}
          {mode === 'drawer' ? <HistoryIcon size={12} /> : null}
          <span>{resolvedLabel}</span>
          {mode === 'idle' ? <ChevronDownIcon size={11} /> : null}
        </button>
        {metric ? <span className="yui-status-notch-meta">{metric}</span> : null}
        {mode === 'idle' && onSecondaryAction ? (
          <button
            type="button"
            className="yui-icon-btn"
            aria-label="New thread"
            onClick={onSecondaryAction}
          >
            <PlusIcon size={12} />
          </button>
        ) : null}
        {mode === 'voice' && onSecondaryAction ? (
          <button
            type="button"
            className="yui-icon-btn"
            aria-label="Stop listening"
            onClick={onSecondaryAction}
          >
            <StopIcon size={10} />
          </button>
        ) : null}
        {mode === 'drawer' && onSecondaryAction ? (
          <button
            type="button"
            className="yui-icon-btn"
            aria-label="Close drawer"
            onClick={onSecondaryAction}
          >
            <XIcon size={11} />
          </button>
        ) : null}
      </div>
      <NotchEar side="right" className="yui-status-notch-ear" />
    </div>
  );
}
