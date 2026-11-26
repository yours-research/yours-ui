import type { ReactNode } from 'react';
import { ApertureIcon, AlertIcon, CheckIcon } from '../icons/ApertureIcon.js';
import type { ApertureIconName } from '../icons/iconData.js';

export type InlineNoticeTone = 'neutral' | 'info' | 'warning' | 'success';

export interface InlineNoticeProps {
  message?: string;
  children?: ReactNode;
  tone?: InlineNoticeTone;
  icon?: ApertureIconName | false;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
  className?: string;
}

/**
 * Ultra-quiet inline system strip for in-stream compaction, privacy, or
 * checkpoint state notices with optional subtle inline action link.
 */
export function InlineNotice({
  message,
  children,
  tone = 'neutral',
  icon,
  actionLabel,
  onAction,
  compact = false,
  className,
}: InlineNoticeProps) {
  const rootClass = [
    'yui-notice',
    tone !== 'neutral' ? `yui-notice--${tone}` : '',
    compact ? 'yui-notice--compact' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const renderLeading = () => {
    if (icon === false) return null;
    if (icon) {
      return <ApertureIcon name={icon} size={12.5} className="yui-notice-icon" />;
    }
    if (tone === 'warning') {
      return <AlertIcon size={12.5} className="yui-notice-icon" />;
    }
    if (tone === 'success') {
      return <CheckIcon size={12.5} className="yui-notice-icon" />;
    }
    return <span className="yui-notice-dot" aria-hidden="true" />;
  };

  return (
    <div
      data-slot="inline-notice"
      data-tone={tone}
      role={tone === 'warning' ? 'status' : 'note'}
      className={rootClass}
    >
      <div className="yui-notice-body">
        {renderLeading()}
        <span className="yui-notice-text">{message ?? children}</span>
      </div>
      {actionLabel && onAction ? (
        <button type="button" className="yui-notice-action" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
