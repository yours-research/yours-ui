import { MicIcon, ShieldIcon, XIcon } from '../icons/ApertureIcon.js';
import { MatrixOrb, type MatrixOrbState } from '../icons/MatrixOrb.js';
import { AudioLevelMeter, type AudioLevelMeterTone } from './AudioLevelMeter.js';
import { KbdHint } from './KbdHint.js';
import type { VoiceSessionState } from './VoiceSessionBar.js';

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
  const meterTone: AudioLevelMeterTone = muted ? 'muted' : METER_TONE_MAP[state];
  const resolvedLevel = level ?? DEFAULT_LEVEL_MAP[state];
  const meterAnimated =
    !muted && (state === 'speech-detected' || state === 'speaking' || state === 'transcribing');
  const showCaret =
    !muted &&
    (state === 'listening' ||
      state === 'speech-detected' ||
      state === 'transcribing' ||
      interimTranscript.length > 0);
  const hasProse = transcript.trim().length > 0 || interimTranscript.trim().length > 0;

  const rootClass = ['yui-voice-card', `is-${state}`, muted ? 'is-muted' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <section
      data-slot="voice-session-card"
      data-voice-state={state}
      className={rootClass}
      aria-label="Local voice session"
    >
      <div className="yui-voice-card-head">
        <div className="yui-voice-card-status">
          <MatrixOrb state={muted ? 'idle' : ORB_STATE_MAP[state]} size={18} />
          <span className="yui-voice-card-title">{resolvedStatus}</span>
          {elapsedLabel ? <span className="yui-voice-time">{elapsedLabel}</span> : null}
        </div>
        <AudioLevelMeter
          level={resolvedLevel}
          levels={levels}
          tone={meterTone}
          size="md"
          animated={meterAnimated}
          label="Live voice level"
        />
      </div>

      <div className="yui-voice-transcript" aria-live="polite">
        {hasProse ? (
          <p className="yui-voice-prose">
            {transcript ? <span className="yui-voice-committed">{transcript}</span> : null}
            {transcript && interimTranscript ? ' ' : null}
            {interimTranscript ? (
              <span className="yui-voice-interim">{interimTranscript}</span>
            ) : null}
            {showCaret ? <span className="yui-voice-caret" aria-hidden="true" /> : null}
          </p>
        ) : (
          <p className="yui-voice-placeholder">
            <span>{placeholder}</span>
            {showCaret ? <span className="yui-voice-caret" aria-hidden="true" /> : null}
          </p>
        )}
      </div>

      <div className="yui-voice-card-controls">
        {onPushToTalk ? (
          <button
            type="button"
            className={pushToTalkActive ? 'yui-voice-ptt-btn is-active' : 'yui-voice-ptt-btn'}
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

        <div className="yui-voice-card-btns">
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
              className={muted ? 'yui-micro-pill is-active' : 'yui-micro-pill yui-voice-mute-pill'}
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

      <div className="yui-voice-privacy">
        <ShieldIcon size={11.5} className="yui-voice-privacy-icon" />
        <span>{privacyNote}</span>
      </div>
    </section>
  );
}
