import type { ReactNode } from 'react';
import {
  BookmarkIcon,
  CheckIcon,
  CopyIcon,
  RetryIcon,
  ThumbDownIcon,
  ThumbUpIcon,
  VolumeIcon,
} from '../icons/ApertureIcon.js';
import { useCopyFeedback } from '../utils/clipboard.js';

export interface SpeedMetricsSummary {
  tokensPerSec?: number;
  ttftMs?: number;
  outputTokens?: number;
}

export interface ActionBarProps {
  onCopy?: () => void;
  onRegenerate?: () => void;
  onSpeak?: () => void;
  onSave?: () => void;
  onThumbUp?: () => void;
  onThumbDown?: () => void;
  feedback?: 'up' | 'down' | null;
  speedMetrics?: SpeedMetricsSummary;
  rightSlot?: ReactNode;
}

/**
 * Monochrome icon action bar (`copy`, `retry`, `thumb-up`, `thumb-down`, `bookmark`,
 * `volume`) with optional tabular-nums local inference speed telemetry.
 */
export function ActionBar({
  onCopy,
  onRegenerate,
  onSpeak,
  onSave,
  onThumbUp,
  onThumbDown,
  feedback = null,
  speedMetrics,
  rightSlot,
}: ActionBarProps) {
  const { copied, triggerCopy } = useCopyFeedback(1200);

  const handleCopy = () => {
    onCopy?.();
    triggerCopy();
  };

  const parts: string[] = [];
  if (speedMetrics?.tokensPerSec !== undefined) {
    parts.push(`${speedMetrics.tokensPerSec.toFixed(1)} tok/s`);
  }
  if (speedMetrics?.ttftMs !== undefined) {
    parts.push(`${Math.round(speedMetrics.ttftMs)}ms TTFT`);
  }
  if (speedMetrics?.outputTokens !== undefined) {
    parts.push(`${speedMetrics.outputTokens} tok`);
  }

  return (
    <div className="yui-action-row">
      <div className="yui-action-group">
        {onCopy ? (
          <button
            type="button"
            className="yui-icon-btn"
            aria-label={copied ? 'Copied response' : 'Copy response'}
            onClick={handleCopy}
          >
            {copied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
          </button>
        ) : null}
        {onRegenerate ? (
          <button
            type="button"
            className="yui-icon-btn"
            aria-label="Regenerate response"
            onClick={onRegenerate}
          >
            <RetryIcon size={13} />
          </button>
        ) : null}
        {onThumbUp ? (
          <button
            type="button"
            className="yui-icon-btn"
            aria-label="Thumbs up"
            aria-pressed={feedback === 'up'}
            onClick={onThumbUp}
          >
            <ThumbUpIcon size={13} strokeWidth={feedback === 'up' ? 2.1 : 1.75} />
          </button>
        ) : null}
        {onThumbDown ? (
          <button
            type="button"
            className="yui-icon-btn"
            aria-label="Thumbs down"
            aria-pressed={feedback === 'down'}
            onClick={onThumbDown}
          >
            <ThumbDownIcon size={13} strokeWidth={feedback === 'down' ? 2.1 : 1.75} />
          </button>
        ) : null}
        {onSave ? (
          <button
            type="button"
            className="yui-icon-btn"
            aria-label="Save response"
            onClick={onSave}
          >
            <BookmarkIcon size={13} />
          </button>
        ) : null}
        {onSpeak ? (
          <button
            type="button"
            className="yui-icon-btn"
            aria-label="Read aloud"
            onClick={onSpeak}
          >
            <VolumeIcon size={13} />
          </button>
        ) : null}
      </div>

      {rightSlot ?? (parts.length > 0 ? <span className="yui-speed-readout">{parts.join(' · ')}</span> : null)}
    </div>
  );
}
