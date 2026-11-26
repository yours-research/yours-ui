import { AlertIcon, CheckIcon, UndoIcon } from '../icons/ApertureIcon.js';

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
