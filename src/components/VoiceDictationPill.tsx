import { CheckIcon, XIcon } from '../icons/ApertureIcon.js';

export interface VoiceDictationPillProps {
  elapsedLabel?: string;
  statusLabel?: string;
  bars?: readonly ('low' | 'mid' | 'high')[];
  onCancel?: () => void;
  onConfirm?: () => void;
}

const DEFAULT_BARS: readonly ('low' | 'mid' | 'high')[] = [
  'low',
  'high',
  'mid',
  'high',
  'mid',
  'high',
  'low',
];

/** Active voice dictation pill for `@yours/voice` local STT capture. */
export function VoiceDictationPill({
  elapsedLabel = '0:06',
  statusLabel = 'Listening',
  bars = DEFAULT_BARS,
  onCancel,
  onConfirm,
}: VoiceDictationPillProps) {
  return (
    <div className="yui-dictate-pill">
      <div className="yui-dictate-left">
        <span className="yui-dictate-dot" aria-hidden="true" />
        <div className="yui-waveform" aria-hidden="true">
          {bars.map((height, idx) => (
            <span key={idx} className={`yui-wave-bar yui-wave-bar--${height}`} />
          ))}
        </div>
        <span className="yui-dictate-label">
          {statusLabel} &middot; {elapsedLabel}
        </span>
      </div>
      <div className="yui-action-group">
        {onCancel ? (
          <button
            type="button"
            className="yui-chip-btn yui-chip-btn--icon"
            aria-label="Cancel dictation"
            onClick={onCancel}
          >
            <XIcon size={12} />
          </button>
        ) : null}
        {onConfirm ? (
          <button
            type="button"
            className="yui-send-btn"
            aria-label="Accept dictation"
            onClick={onConfirm}
          >
            <CheckIcon size={13} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
