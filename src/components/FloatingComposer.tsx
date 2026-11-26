import type { ReactNode } from 'react';
import { SendIcon, StopIcon } from '../icons/ApertureIcon.js';

export interface FloatingComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  isGenerating?: boolean;
  disabled?: boolean;
  placeholder?: string;
  popoverSlot?: ReactNode;
  topSlot?: ReactNode;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  /** Optional slash-command palette trigger button on the left toolbar. */
  onOpenCommands?: () => void;
  commandsLabel?: string;
  /** Optional compact context budget readout on the right toolbar (e.g. `3.2k / 8k`). */
  contextUsageLabel?: string;
  contextUsageTone?: 'neutral' | 'warning' | 'critical';
  ariaLabel?: string;
}

/**
 * Floating monochrome Page 9 composer capsule supporting Enter-to-send,
 * Shift+Enter newlines, customizable context/model left slots, optional `/`
 * command trigger & token counter badge, and live stop toggle.
 */
export function FloatingComposer({
  value,
  onChange,
  onSubmit,
  onStop,
  isGenerating = false,
  disabled = false,
  placeholder = 'Ask anything...',
  popoverSlot,
  topSlot,
  leftSlot,
  rightSlot,
  onOpenCommands,
  commandsLabel = 'Open commands',
  contextUsageLabel,
  contextUsageTone = 'neutral',
  ariaLabel = 'Message prompt',
}: FloatingComposerProps) {
  const canSend = !disabled && (isGenerating || value.trim().length > 0);
  const autoRows = Math.min(5, Math.max(1, value.split('\n').length));
  const usageClass = [
    'yui-composer-usage',
    contextUsageTone !== 'neutral' ? `is-${contextUsageTone}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="yui-composer" aria-busy={isGenerating || undefined}>
      {popoverSlot}
      <div className="yui-composer-top">
        {topSlot}
        <textarea
          className="yui-composer-input"
          rows={autoRows}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          aria-label={ariaLabel}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              if (!disabled && !isGenerating && value.trim().length > 0) {
                onSubmit();
              }
            }
          }}
        />
      </div>
      <div className="yui-composer-toolbar">
        <div className="yui-composer-left">
          {leftSlot}
          {onOpenCommands ? (
            <button
              type="button"
              className="yui-composer-cmd-btn"
              disabled={disabled}
              aria-label={commandsLabel}
              title={commandsLabel}
              onClick={onOpenCommands}
            >
              <span>/</span>
            </button>
          ) : null}
        </div>
        <div className="yui-composer-right">
          {contextUsageLabel ? (
            <span className={usageClass} data-tone={contextUsageTone}>
              {contextUsageLabel}
            </span>
          ) : null}
          {rightSlot}
          <button
            type="button"
            className="yui-send-btn"
            disabled={!canSend}
            aria-label={isGenerating ? 'Stop generating' : 'Send message'}
            onClick={() => {
              if (isGenerating) {
                onStop?.();
              } else if (value.trim().length > 0) {
                onSubmit();
              }
            }}
          >
            {isGenerating ? <StopIcon size={11.5} /> : <SendIcon size={13.5} />}
          </button>
        </div>
      </div>
    </div>
  );
}
