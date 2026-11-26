import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { AlertIcon } from '../icons/ApertureIcon.js';
import { useReducedMotion } from '../utils/spring.js';
import { CardFooterChrome, CardHeaderChrome, CardMetaScope, cn } from './CardChrome.js';
import { StatusBadge } from './FeedbackPrimitives.js';

export interface ConfirmActionSummaryRow {
  label: string;
  value: string;
}

export type ConfirmActionTone = 'danger' | 'amber';

export interface ConfirmActionCardProps {
  title: string;
  description: string;
  rows?: readonly ConfirmActionSummaryRow[];
  tone?: ConfirmActionTone;
  badge?: string;
  confirmPhrase?: string;
  confirmInputLabel?: string;
  confirmPlaceholder?: string;
  holdDurationMs?: number;
  confirmLabel?: string;
  holdPromptLabel?: string;
  holdHintLabel?: string;
  cancelLabel?: string;
  privacyNote?: string;
  autoFocusCancel?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * High-stakes / destructive local confirmation card with key-value impact summary,
 * optional typed confirmation phrase OR pointer/keyboard hold-to-confirm with
 * `prefers-reduced-motion` fallback, `Esc` dismissal, and `Cancel` default focus.
 */
export function ConfirmActionCard({
  title,
  description,
  rows = [],
  tone = 'danger',
  badge = 'Confirm action',
  confirmPhrase,
  confirmInputLabel,
  confirmPlaceholder,
  holdDurationMs,
  confirmLabel = 'Confirm',
  holdPromptLabel,
  holdHintLabel,
  cancelLabel = 'Cancel',
  privacyNote = 'Local action · Cannot be undone',
  autoFocusCancel = true,
  onConfirm,
  onCancel,
  className,
}: ConfirmActionCardProps) {
  const reducedMotion = useReducedMotion();
  const inputId = useId();
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const holdStartRef = useRef<number>(0);

  const [typed, setTyped] = useState('');
  const [holding, setHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);

  const clearHoldTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (autoFocusCancel) cancelBtnRef.current?.focus();
    return clearHoldTimer;
  }, [autoFocusCancel]);

  const stopHold = () => {
    clearHoldTimer();
    setHolding(false);
    setHoldProgress(0);
  };

  const hasHold = typeof holdDurationMs === 'number' && holdDurationMs > 0;
  const phraseRequired = typeof confirmPhrase === 'string' && confirmPhrase.length > 0;
  const phraseMatched = !phraseRequired || typed.trim() === confirmPhrase;

  const startHold = () => {
    if (!hasHold || !phraseMatched || timerRef.current !== null) return;
    holdStartRef.current = performance.now();
    setHolding(true);
    setHoldProgress(0);
    timerRef.current = window.setInterval(() => {
      const elapsed = performance.now() - holdStartRef.current;
      setHoldProgress(Math.min(100, Math.round((elapsed / holdDurationMs) * 100)));
      if (elapsed >= holdDurationMs) {
        stopHold();
        onConfirm();
      }
    }, reducedMotion ? 160 : 40);
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      stopHold();
      onCancel?.();
    }
  };

  const remainingSec = hasHold
    ? Math.max(0.1, ((100 - holdProgress) / 100) * (holdDurationMs / 1000)).toFixed(1)
    : null;

  const holdButtonText = hasHold
    ? holding
      ? `${confirmLabel} · ${remainingSec}s`
      : (holdPromptLabel ?? `Hold to ${confirmLabel.toLowerCase()}`)
    : confirmLabel;

  return (
    <section
      data-slot="confirm-action-card"
      data-tone={tone}
      data-holding={holding ? 'true' : 'false'}
      className={cn('yui-card-shell yui-card-pad yui-confirm-card', tone === 'amber' ? 'is-amber' : 'is-danger', className)}
      aria-label={title}
      onKeyDown={handleCardKeyDown}
    >
      <CardHeaderChrome
        icon={<AlertIcon size={13} className={tone === 'amber' ? 'yui-handoff-icon' : 'yui-confirm-icon'} />}
        title={title}
        subtitle={description}
        right={badge ? <StatusBadge tone={tone} dot>{badge}</StatusBadge> : null}
      />

      <CardMetaScope rows={rows} />

      {phraseRequired ? (
        <div className="yui-col-5">
          <label htmlFor={inputId} className="yui-params-label">
            {confirmInputLabel ?? `Type "${confirmPhrase}" to confirm`}
          </label>
          <input
            id={inputId}
            type="text"
            className="yui-vault-input"
            value={typed}
            placeholder={confirmPlaceholder ?? confirmPhrase}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => setTyped(e.target.value)}
          />
        </div>
      ) : null}

      {hasHold ? (
        <div className="yui-col-5">
          <div className="yui-row-between yui-wrap">
            <span className="yui-audit-detail">
              {holdHintLabel ?? `Hold ${Number((holdDurationMs / 1000).toFixed(1))}s or Space to confirm`}
            </span>
            {holding ? (
              <span className="yui-audit-time" role={reducedMotion ? 'status' : undefined}>
                {reducedMotion ? `Holding · ${remainingSec}s left` : `${holdProgress}%`}
              </span>
            ) : null}
          </div>
          <progress
            className="yui-dl-progress yui-confirm-progress"
            max={100}
            value={holdProgress}
            aria-label={holding ? `Hold progress ${holdProgress}%` : `${confirmLabel} hold meter`}
          />
        </div>
      ) : null}

      <CardFooterChrome privacyNote={privacyNote}>
        <div className="yui-action-group">
          <button
            ref={cancelBtnRef}
            type="button"
            className="yui-pill-btn"
            onClick={() => {
              stopHold();
              onCancel?.();
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={tone === 'amber' ? 'yui-pill-btn yui-pill-btn--primary' : 'yui-pill-btn yui-pill-btn--danger'}
            disabled={!phraseMatched}
            onClick={hasHold ? undefined : onConfirm}
            onPointerDown={hasHold ? startHold : undefined}
            onPointerUp={hasHold ? stopHold : undefined}
            onPointerLeave={hasHold ? stopHold : undefined}
            onPointerCancel={hasHold ? stopHold : undefined}
            onBlur={hasHold ? stopHold : undefined}
            onKeyDown={
              hasHold
                ? (e) => {
                    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
                      e.preventDefault();
                      startHold();
                    }
                  }
                : undefined
            }
            onKeyUp={
              hasHold
                ? (e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      stopHold();
                    }
                  }
                : undefined
            }
          >
            {holdButtonText}
          </button>
        </div>
      </CardFooterChrome>
    </section>
  );
}
