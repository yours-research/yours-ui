import { MicIcon, XIcon } from '../icons/ApertureIcon.js';
import { MatrixOrb, type MatrixOrbState } from '../icons/MatrixOrb.js';

export type VoiceSessionState =
  | 'idle'
  | 'listening'
  | 'speech-detected'
  | 'transcribing'
  | 'speaking';

export interface VoiceSessionBarProps {
  state: VoiceSessionState;
  statusLabel?: string;
  elapsedLabel?: string;
  /** Five normalized audio envelope levels (0..1) quantized to crisp CSS bars. */
  levels?: readonly number[];
  bargeInEnabled?: boolean;
  onToggleBargeIn?: () => void;
  bargeInLabel?: string;
  muted?: boolean;
  onToggleMute?: () => void;
  onEndSession?: () => void;
  endLabel?: string;
  className?: string;
}

const DEFAULT_STATUS_LABEL: Record<VoiceSessionState, string> = {
  idle: 'Voice ready',
  listening: 'Listening',
  'speech-detected': 'Speech detected',
  transcribing: 'Transcribing',
  speaking: 'Speaking',
};

const ORB_STATE_MAP: Record<VoiceSessionState, MatrixOrbState> = {
  idle: 'idle',
  listening: 'idle',
  'speech-detected': 'streaming',
  transcribing: 'thinking',
  speaking: 'streaming',
};

const DEFAULT_METER_LEVELS: Record<VoiceSessionState, readonly number[]> = {
  idle: [0.1, 0.15, 0.1, 0.15, 0.1],
  listening: [0.25, 0.45, 0.3, 0.45, 0.25],
  'speech-detected': [0.45, 0.85, 0.95, 0.75, 0.5],
  transcribing: [0.35, 0.55, 0.75, 0.55, 0.35],
  speaking: [0.55, 0.9, 0.7, 0.95, 0.6],
};

function quantizeLevel(value: number): number {
  const clamped = Math.max(0, Math.min(1, value));
  if (clamped < 0.2) return 0;
  if (clamped < 0.4) return 1;
  if (clamped < 0.65) return 2;
  if (clamped < 0.85) return 3;
  return 4;
}

/**
 * Compact Page 9 voice session strip synchronized to `@yours/voice` `VoiceState`
 * with a pure-CSS 5-bar monochrome level meter, barge-in toggle, and end control.
 */
export function VoiceSessionBar({
  state,
  statusLabel,
  elapsedLabel,
  levels,
  bargeInEnabled = true,
  onToggleBargeIn,
  bargeInLabel = 'Barge-in',
  muted = false,
  onToggleMute,
  onEndSession,
  endLabel = 'End',
  className,
}: VoiceSessionBarProps) {
  const resolvedLabel = statusLabel ?? DEFAULT_STATUS_LABEL[state];
  const rawLevels = levels && levels.length > 0 ? levels : DEFAULT_METER_LEVELS[state];
  const bars = Array.from({ length: 5 }, (_, idx) => quantizeLevel(rawLevels[idx] ?? 0.2));
  const barClass = ['yui-voice-bar', `is-${state}`, className].filter(Boolean).join(' ');

  return (
    <div
      data-slot="voice-session-bar"
      data-voice-state={state}
      className={barClass}
      role="status"
      aria-live="polite"
    >
      <div className="yui-voice-left">
        <MatrixOrb state={ORB_STATE_MAP[state]} size={16} />
        <div className="yui-voice-meter" aria-hidden="true">
          {bars.map((step, idx) => (
            <span key={idx} className={`yui-vm-bar yui-vm-bar--${step}`} />
          ))}
        </div>
        <span className="yui-voice-label">{resolvedLabel}</span>
        {elapsedLabel ? <span className="yui-voice-time">{elapsedLabel}</span> : null}
      </div>

      <div className="yui-voice-actions">
        {onToggleBargeIn ? (
          <button
            type="button"
            className={bargeInEnabled ? 'yui-micro-pill is-active' : 'yui-micro-pill'}
            aria-pressed={bargeInEnabled}
            onClick={onToggleBargeIn}
          >
            {bargeInLabel}
          </button>
        ) : null}
        {onToggleMute ? (
          <button
            type="button"
            className={muted ? 'yui-icon-btn is-active' : 'yui-icon-btn'}
            aria-pressed={muted}
            aria-label={muted ? 'Unmute microphone' : 'Mute microphone'}
            onClick={onToggleMute}
          >
            <MicIcon size={12} />
          </button>
        ) : null}
        {onEndSession ? (
          <button
            type="button"
            className="yui-micro-pill yui-voice-end-btn"
            aria-label={endLabel === 'End' ? 'End voice session' : endLabel}
            onClick={onEndSession}
          >
            <XIcon size={11} />
            <span>{endLabel}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
