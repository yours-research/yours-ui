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
  topSlot?: ReactNode;
  leftSlot?: ReactNode;
  ariaLabel?: string;
}

/**
 * Floating monochrome Page 9 composer capsule supporting Enter-to-send,
 * Shift+Enter newlines, customizable context/model left slots, and live stop toggle.
 */
export function FloatingComposer({
  value,
  onChange,
  onSubmit,
  onStop,
  isGenerating = false,
  disabled = false,
  placeholder = 'Ask anything...',
  topSlot,
  leftSlot,
  ariaLabel = 'Message prompt',
}: FloatingComposerProps) {
  const canSend = !disabled && (isGenerating || value.trim().length > 0);

  return (
    <div className="yui-composer">
      <div className="yui-composer-top">
        {topSlot}
        <textarea
          className="yui-composer-input"
          rows={1}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          aria-label={ariaLabel}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (!disabled && !isGenerating && value.trim().length > 0) {
                onSubmit();
              }
            }
          }}
        />
      </div>
      <div className="yui-composer-toolbar">
        <div className="yui-composer-left">{leftSlot}</div>
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
  );
}
