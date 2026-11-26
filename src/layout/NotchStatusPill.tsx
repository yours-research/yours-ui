import {
  ChevronDownIcon,
  HistoryIcon,
  MicIcon,
  PlusIcon,
  StopIcon,
  XIcon,
} from '../icons/ApertureIcon.js';
import { MatrixOrb } from '../icons/MatrixOrb.js';
import { NotchEar } from '../icons/NotchEar.js';

export type NotchStatusMode = 'idle' | 'thinking' | 'streaming' | 'voice' | 'drawer';

export interface NotchStatusPillProps {
  mode: NotchStatusMode;
  label?: string;
  metric?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
}

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
  const defaultLabels: Record<NotchStatusMode, string> = {
    idle: 'Ready',
    thinking: 'Thinking',
    streaming: 'Writing',
    voice: 'Listening',
    drawer: 'History',
  };
  const resolvedLabel = label ?? defaultLabels[mode];

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
