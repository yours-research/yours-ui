import type { ReactNode } from 'react';
import { AlertIcon, ApertureIcon, CheckIcon, UndoIcon } from '../icons/ApertureIcon.js';
import type { ApertureIconName } from '../icons/iconData.js';

export interface ErrorRecoveryBannerProps {
  title: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
}

/** Inline error recovery card with optional one-click retry action. */
export function ErrorRecoveryBanner({
  title,
  description,
  retryLabel = 'Try again',
  onRetry,
}: ErrorRecoveryBannerProps) {
  return (
    <div className="yui-error-card" role="alert">
      <div className="yui-action-group">
        <AlertIcon size={15} className="yui-error-icon" />
        <div>
          <div className="yui-prompt-capsule-title">{title}</div>
          {description ? <div className="yui-prompt-capsule-sub">{description}</div> : null}
        </div>
      </div>
      {onRetry ? (
        <button type="button" className="yui-pill-btn" onClick={onRetry}>
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}

/** Soft 3-line response loading skeleton placeholder. */
export function MessageSkeleton() {
  return (
    <div className="yui-skeleton" aria-busy="true" aria-label="Loading response">
      <div className="yui-skeleton-line yui-skeleton-line--w88" />
      <div className="yui-skeleton-line yui-skeleton-line--w72" />
      <div className="yui-skeleton-line yui-skeleton-line--w46" />
    </div>
  );
}

export interface ToastPillProps {
  message: string;
  undoLabel?: string;
  onUndo?: () => void;
}

/** High-contrast bottom confirmation capsule with optional Undo action. */
export function ToastPill({ message, undoLabel = 'Undo', onUndo }: ToastPillProps) {
  return (
    <div className="yui-toast-pill" role="status">
      <span className="yui-action-group">
        <CheckIcon size={13} />
        <span>{message}</span>
      </span>
      {onUndo ? (
        <button type="button" className="yui-icon-btn" onClick={onUndo}>
          <UndoIcon size={12} />
          <span>{undoLabel}</span>
        </button>
      ) : null}
    </div>
  );
}

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
    if (icon) return <ApertureIcon name={icon} size={12.5} className="yui-notice-icon" />;
    if (tone === 'warning') return <AlertIcon size={12.5} className="yui-notice-icon" />;
    if (tone === 'success') return <CheckIcon size={12.5} className="yui-notice-icon" />;
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

export type StatusBadgeTone = 'neutral' | 'local' | 'accent' | 'amber' | 'danger';

export interface StatusBadgeProps {
  children: ReactNode;
  tone?: StatusBadgeTone;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}

/**
 * Compact hairline status badge for hardware tiers, local model readiness,
 * guardrail labels, and capability state without inline styling.
 */
export function StatusBadge({
  children,
  tone = 'neutral',
  dot = false,
  pulse = false,
  className,
}: StatusBadgeProps) {
  const badgeClass = [
    'yui-status-badge',
    tone !== 'neutral' ? `yui-status-badge--${tone}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const dotClass = ['yui-status-badge-dot', pulse ? 'is-pulse' : ''].filter(Boolean).join(' ');

  return (
    <span data-slot="status-badge" className={badgeClass}>
      {dot ? <span className={dotClass} aria-hidden="true" /> : null}
      <span>{children}</span>
    </span>
  );
}

export interface KbdHintProps {
  /** Key or chord parts to render as hairline monospace keycaps (e.g. `'⌘K'` or `['⌘', '↵']`). */
  keys: string | readonly string[];
  size?: 'xs' | 'sm';
  className?: string;
}

/**
 * Monochrome hairline keycap primitive (`<kbd>`) using tabular monospace ink
 * across Cotton Paper light and Anodized Obsidian dark surfaces.
 */
export function KbdHint({ keys, size = 'sm', className }: KbdHintProps) {
  const parts = Array.isArray(keys) ? keys : [keys];
  const groupClass = ['yui-kbd-group', className].filter(Boolean).join(' ');
  const keyClass = size === 'xs' ? 'yui-kbd yui-kbd--xs' : 'yui-kbd';

  return (
    <span data-slot="kbd-hint" className={groupClass}>
      {parts.map((part, idx) => (
        <kbd key={`${part}-${idx}`} className={keyClass}>
          {part}
        </kbd>
      ))}
    </span>
  );
}
