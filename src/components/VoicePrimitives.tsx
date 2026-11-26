import { CheckIcon, MicIcon, ShieldIcon, XIcon } from '../icons/ApertureIcon.js';
import { MatrixOrb, type MatrixOrbState } from '../icons/MatrixOrb.js';
import { cn } from '../utils/clipboard.js';
import { KbdHint } from './KbdHint.js';

export type VoiceSessionState =
  | 'idle'
  | 'listening'
  | 'speech-detected'
  | 'transcribing'
  | 'speaking';

export type AudioLevelMeterTone = 'neutral' | 'active' | 'speaking' | 'muted';

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

const ENVELOPE_WEIGHTS = [0.42, 0.64, 0.84, 0.96, 1.0, 0.92, 0.78, 0.58, 0.4];
const BAR_BREAKS = [0.2, 0.4, 0.65, 0.85];
const METER_BREAKS = [0.16, 0.34, 0.54, 0.74, 0.9];

function quantize(value: number, breaks: readonly number[]): number {
  const clamped = Math.max(0, Math.min(1, value));
  const idx = breaks.findIndex((b) => clamped < b);
  return idx === -1 ? breaks.length : idx;
}

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
  const scalar = isMuted ? 0 : Math.max(0, Math.min(1, level));

  const barSteps = Array.from({ length: count }, (_, idx) => {
    if (isMuted) return 0;
    if (levels && levels.length > 0) {
      return quantize(levels[idx % levels.length] ?? scalar, METER_BREAKS);
    }
    return quantize(scalar * (ENVELOPE_WEIGHTS[idx % ENVELOPE_WEIGHTS.length] ?? 0.6), METER_BREAKS);
  });

  const avgNormalized = isMuted
    ? 0
    : levels && levels.length > 0
      ? levels.reduce((acc, v) => acc + Math.max(0, Math.min(1, v)), 0) / levels.length
      : scalar;

  return (
    <div
      data-slot="audio-level-meter"
      data-tone={tone}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(avgNormalized * 100)}
      className={cn(
        'yui-alm',
        `yui-alm--${tone}`,
        `yui-alm--${size}`,
        animated && !isMuted && 'is-animated',
        className,
      )}
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

export interface VoiceDictationPillProps {
  elapsedLabel?: string;
  statusLabel?: string;
  bars?: readonly ('low' | 'mid' | 'high')[];
  onCancel?: () => void;
  onConfirm?: () => void;
}

const DEFAULT_DICTATION_BARS: readonly ('low' | 'mid' | 'high')[] = [
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
  bars = DEFAULT_DICTATION_BARS,
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

const DEFAULT_METER_LEVELS: Record<VoiceSessionState, readonly number[]> = {
  idle: [0.1, 0.15, 0.1, 0.15, 0.1],
  listening: [0.25, 0.45, 0.3, 0.45, 0.25],
  'speech-detected': [0.45, 0.85, 0.95, 0.75, 0.5],
  transcribing: [0.35, 0.55, 0.75, 0.55, 0.35],
  speaking: [0.55, 0.9, 0.7, 0.95, 0.6],
};

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
  const bars = Array.from({ length: 5 }, (_, idx) => quantize(rawLevels[idx] ?? 0.2, BAR_BREAKS));

  return (
    <div
      data-slot="voice-session-bar"
      data-voice-state={state}
      className={cn('yui-voice-bar', `is-${state}`, className)}
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
        <span className="yui-ellipsis yui-voice-label">{resolvedLabel}</span>
        {elapsedLabel ? <span className="yui-voice-time">{elapsedLabel}</span> : null}
      </div>

      <div className="yui-voice-actions">
        {onToggleBargeIn ? (
          <button
            type="button"
            className={cn('yui-micro-pill', bargeInEnabled && 'is-active')}
            aria-pressed={bargeInEnabled}
            onClick={onToggleBargeIn}
          >
            {bargeInLabel}
          </button>
        ) : null}
        {onToggleMute ? (
          <button
            type="button"
            className={cn('yui-icon-btn', muted && 'is-active')}
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

export interface VoiceSessionCardProps {
  state: VoiceSessionState;
  statusLabel?: string;
  elapsedLabel?: string;
  /** Committed finalized speech prose rendered in primary ink. */
  transcript?: string;
  /** Muted in-progress dictation phrase with live caret when active. */
  interimTranscript?: string;
  placeholder?: string;
  /** Normalized audio input level (0..1) or per-bar envelope levels. */
  level?: number;
  levels?: readonly number[];
  pushToTalkKey?: string;
  pushToTalkActive?: boolean;
  onPushToTalk?: () => void;
  bargeInEnabled?: boolean;
  bargeInLabel?: string;
  onToggleBargeIn?: () => void;
  muted?: boolean;
  onToggleMute?: () => void;
  onEndSession?: () => void;
  endLabel?: string;
  privacyNote?: string;
  className?: string;
}

const METER_TONE_MAP: Record<VoiceSessionState, AudioLevelMeterTone> = {
  idle: 'neutral',
  listening: 'active',
  'speech-detected': 'active',
  transcribing: 'neutral',
  speaking: 'speaking',
};

const DEFAULT_LEVEL_MAP: Record<VoiceSessionState, number> = {
  idle: 0.14,
  listening: 0.42,
  'speech-detected': 0.86,
  transcribing: 0.56,
  speaking: 0.9,
};

/**
 * Expanded local voice-session surface with committed vs. interim dictation
 * transcript, zero-inline-style `AudioLevelMeter`, push-to-talk key hint,
 * Mute / Barge-in / End controls, and on-device STT privacy footer.
 */
export function VoiceSessionCard({
  state,
  statusLabel,
  elapsedLabel,
  transcript = '',
  interimTranscript = '',
  placeholder = 'Speak naturally or hold Space to dictate locally.',
  level,
  levels,
  pushToTalkKey = 'Space',
  pushToTalkActive = false,
  onPushToTalk,
  bargeInEnabled = true,
  bargeInLabel = 'Barge-in',
  onToggleBargeIn,
  muted = false,
  onToggleMute,
  onEndSession,
  endLabel = 'End',
  privacyNote = 'On-device STT · Audio never leaves browser',
  className,
}: VoiceSessionCardProps) {
  const resolvedStatus = muted ? 'Microphone muted' : (statusLabel ?? DEFAULT_STATUS_LABEL[state]);
  const showCaret =
    !muted &&
    (state === 'listening' ||
      state === 'speech-detected' ||
      state === 'transcribing' ||
      interimTranscript.length > 0);
  const hasProse = transcript.trim().length > 0 || interimTranscript.trim().length > 0;

  return (
    <section
      data-slot="voice-session-card"
      data-voice-state={state}
      className={cn('yui-card-shell yui-voice-card', `is-${state}`, muted && 'is-muted', className)}
      aria-label="Local voice session"
    >
      <div className="yui-voice-card-head">
        <div className="yui-voice-card-status">
          <MatrixOrb state={muted ? 'idle' : ORB_STATE_MAP[state]} size={18} />
          <span className="yui-ellipsis yui-voice-card-title">{resolvedStatus}</span>
          {elapsedLabel ? <span className="yui-voice-time">{elapsedLabel}</span> : null}
        </div>
        <AudioLevelMeter
          level={level ?? DEFAULT_LEVEL_MAP[state]}
          levels={levels}
          tone={muted ? 'muted' : METER_TONE_MAP[state]}
          size="md"
          animated={!muted && (state === 'speech-detected' || state === 'speaking' || state === 'transcribing')}
          label="Live voice level"
        />
      </div>

      <div className="yui-well yui-voice-transcript" aria-live="polite">
        {hasProse ? (
          <p className="yui-prose-12">
            {transcript ? <span className="yui-voice-committed">{transcript}</span> : null}
            {transcript && interimTranscript ? ' ' : null}
            {interimTranscript ? (
              <span className="yui-voice-interim">{interimTranscript}</span>
            ) : null}
            {showCaret ? <span className="yui-voice-caret" aria-hidden="true" /> : null}
          </p>
        ) : (
          <p className="yui-prose-12 yui-voice-placeholder">
            <span>{placeholder}</span>
            {showCaret ? <span className="yui-voice-caret" aria-hidden="true" /> : null}
          </p>
        )}
      </div>

      <div className="yui-voice-card-controls">
        <div className="yui-voice-card-btns">
          <div className="yui-action-group">
            {onToggleBargeIn ? (
              <button
                type="button"
                className={cn('yui-micro-pill', bargeInEnabled && 'is-active')}
                aria-pressed={bargeInEnabled}
                onClick={onToggleBargeIn}
              >
                {bargeInLabel}
              </button>
            ) : null}
          </div>
          <div className="yui-action-group">
            {onToggleMute ? (
              <button
                type="button"
                className={cn('yui-micro-pill', muted ? 'is-active' : 'yui-voice-mute-pill')}
                aria-pressed={muted}
                onClick={onToggleMute}
              >
                <MicIcon size={11.5} />
                <span>{muted ? 'Muted' : 'Mute'}</span>
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

        <div className="yui-center-row">
          {onPushToTalk ? (
            <button
              type="button"
              className={cn('yui-voice-ptt-btn', pushToTalkActive && 'is-active')}
              aria-pressed={pushToTalkActive}
              onClick={onPushToTalk}
            >
              <span>Hold</span>
              <KbdHint keys={pushToTalkKey} size="xs" />
              <span>to talk</span>
            </button>
          ) : (
            <span className="yui-voice-ptt-hint">
              <span>Hold</span>
              <KbdHint keys={pushToTalkKey} size="xs" />
              <span>to talk</span>
            </span>
          )}
        </div>
      </div>

      <div className="yui-storage-privacy yui-privacy-foot yui-voice-privacy">
        <ShieldIcon size={11.5} className="yui-privacy-icon" />
        <span>{privacyNote}</span>
      </div>
    </section>
  );
}
