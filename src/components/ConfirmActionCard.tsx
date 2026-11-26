import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { AlertIcon } from '../icons/ApertureIcon.js';
import { useReducedMotion } from '../utils/spring.js';
import { CardFooterChrome, CardHeaderChrome, CardMetaScope } from './CardChrome.js';
import { StatusBadge } from './StatusBadge.js';

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

  useEffect(() => {
    if (autoFocusCancel) {
      cancelBtnRef.current?.focus();
    }
  }, [autoFocusCancel]);

  const clearHoldTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearHoldTimer(), [clearHoldTimer]);

  const stopHold = useCallback(() => {
    clearHoldTimer();
    setHolding(false);
    setHoldProgress(0);
  }, [clearHoldTimer]);

  const hasHold = typeof holdDurationMs === 'number' && holdDurationMs > 0;
  const phraseRequired = typeof confirmPhrase === 'string' && confirmPhrase.length > 0;
  const phraseMatched = !phraseRequired || typed.trim() === confirmPhrase;

  const startHold = useCallback(() => {
    if (!hasHold || !phraseMatched || timerRef.current !== null) return;
    const duration = holdDurationMs;
    holdStartRef.current = performance.now();
    setHolding(true);
    setHoldProgress(0);
    const stepMs = reducedMotion ? 160 : 40;
    timerRef.current = window.setInterval(() => {
      const elapsed = performance.now() - holdStartRef.current;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setHoldProgress(pct);
      if (elapsed >= duration) {
        clearHoldTimer();
        setHolding(false);
        setHoldProgress(0);
        onConfirm();
      }
    }, stepMs);
  }, [clearHoldTimer, hasHold, holdDurationMs, onConfirm, phraseMatched, reducedMotion]);

  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      stopHold();
      onCancel?.();
    }
  };

  const handleHoldKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!hasHold) return;
    if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) {
      event.preventDefault();
      startHold();
    }
  };

  const handleHoldKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!hasHold) return;
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      stopHold();
    }
  };

  const remainingSec = hasHold
    ? Math.max(0.1, ((100 - holdProgress) / 100) * (holdDurationMs / 1000)).toFixed(1)
    : null;

  const holdButtonText = hasHold
    ? holding
      ? reducedMotion
        ? `Hold · ${remainingSec}s left`
        : `${confirmLabel} · ${remainingSec}s`
      : (holdPromptLabel ?? `Hold to ${confirmLabel.toLowerCase()}`)
    : confirmLabel;

  const rootClass = [
    'yui-card-shell',
    'yui-confirm-card',
    tone === 'amber' ? 'is-amber' : 'is-danger',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section
      data-slot="confirm-action-card"
      data-tone={tone}
      data-holding={holding ? 'true' : 'false'}
      className={rootClass}
      aria-label={title}
      onKeyDown={handleCardKeyDown}
    >
      <CardHeaderChrome
        icon={
          <AlertIcon
            size={13}
            className={tone === 'amber' ? 'yui-handoff-icon' : 'yui-confirm-icon'}
          />
        }
        title={title}
        subtitle={description}
        right={
          badge ? (
            <StatusBadge tone={tone} dot>
              {badge}
            </StatusBadge>
          ) : null
        }
      />

      <CardMetaScope rows={rows} />

      {phraseRequired ? (
        <div className="yui-confirm-field">
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
        <div className="yui-confirm-hold-wrap">
          <progress
            className="yui-dl-progress yui-confirm-progress"
            max={100}
            value={holdProgress}
            aria-label={holding ? `Hold progress ${holdProgress}%` : `${confirmLabel} hold meter`}
          />
          {holding && reducedMotion ? (
            <span className="yui-audit-time" role="status">
              Holding · {remainingSec}s left
            </span>
          ) : null}
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
            className={
              tone === 'amber'
                ? 'yui-pill-btn yui-pill-btn--primary'
                : 'yui-pill-btn yui-pill-btn--danger'
            }
            disabled={!phraseMatched}
            onClick={hasHold ? undefined : onConfirm}
            onPointerDown={hasHold ? startHold : undefined}
            onPointerUp={hasHold ? stopHold : undefined}
            onPointerLeave={hasHold ? stopHold : undefined}
            onPointerCancel={hasHold ? stopHold : undefined}
            onBlur={hasHold ? stopHold : undefined}
            onKeyDown={hasHold ? handleHoldKeyDown : undefined}
            onKeyUp={hasHold ? handleHoldKeyUp : undefined}
          >
            {holdButtonText}
          </button>
        </div>
      </CardFooterChrome>
    </section>
  );
}
