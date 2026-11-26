import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { HistoryIcon, UndoIcon } from '../icons/ApertureIcon.js';
import { CardFooterChrome, CardHeaderChrome, CardMetaScope, cn, type CardMetaRow } from './CardChrome.js';
import { StatusBadge } from './StatusBadge.js';

export interface SessionCheckpointCardProps {
  title?: string;
  summary?: string;
  timestamp: string;
  turnCount: number;
  pinnedTabCount?: number;
  contextSnapshot?: string;
  checkpointLabel?: string;
  confirmRestore?: boolean;
  restoreLabel?: string;
  confirmRestoreLabel?: string;
  cancelLabel?: string;
  branchLabel?: string;
  privacyNote?: string;
  onRestore?: () => void;
  onBranch?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Compact Paper Page 9 conversation checkpoint & rewind card showing saved
 * timestamp, turn count, pinned-tab count, context-budget snapshot, inline
 * confirmed `Restore checkpoint`, and `Branch from here`.
 */
export function SessionCheckpointCard({
  title = 'Session checkpoint',
  summary,
  timestamp,
  turnCount,
  pinnedTabCount,
  contextSnapshot,
  checkpointLabel,
  confirmRestore = true,
  restoreLabel = 'Restore checkpoint',
  confirmRestoreLabel = 'Confirm restore',
  cancelLabel = 'Cancel',
  branchLabel = 'Branch from here',
  privacyNote = 'Local OPFS snapshot · Nothing uploaded',
  onRestore,
  onBranch,
  disabled = false,
  className,
}: SessionCheckpointCardProps) {
  const [confirming, setConfirming] = useState(false);
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);
  const restoreBtnRef = useRef<HTMLButtonElement | null>(null);
  const restoreFocusRef = useRef(false);

  useEffect(() => {
    if (confirming) {
      cancelBtnRef.current?.focus();
    } else if (restoreFocusRef.current) {
      restoreFocusRef.current = false;
      restoreBtnRef.current?.focus();
    }
  }, [confirming]);

  const dismissConfirm = () => {
    restoreFocusRef.current = true;
    setConfirming(false);
  };

  const handleConfirmKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      dismissConfirm();
    }
  };

  const rows: CardMetaRow[] = [
    { label: 'Saved', value: timestamp },
    { label: 'Turns', value: `${turnCount} ${turnCount === 1 ? 'turn' : 'turns'}` },
    ...(pinnedTabCount !== undefined
      ? [{ label: 'Tabs', value: `${pinnedTabCount} pinned` }]
      : []),
    ...(contextSnapshot ? [{ label: 'Context', value: contextSnapshot }] : []),
  ];

  return (
    <section
      data-slot="session-checkpoint-card"
      data-confirming={confirming ? 'true' : 'false'}
      className={cn('yui-card-shell yui-ckpt-card', className)}
      aria-label={title}
    >
      <CardHeaderChrome
        icon={<HistoryIcon size={13} className="yui-privacy-icon" />}
        title={title}
        subtitle={summary}
        right={<StatusBadge tone="neutral">{checkpointLabel ?? timestamp}</StatusBadge>}
      />

      <CardMetaScope rows={rows} />

      <CardFooterChrome privacyNote={privacyNote}>
        {onRestore || onBranch ? (
          confirming && onRestore ? (
            <div
              className="yui-action-group"
              role="group"
              aria-label="Confirm restore checkpoint"
              onKeyDown={handleConfirmKeyDown}
            >
              <button
                ref={cancelBtnRef}
                type="button"
                className="yui-micro-pill"
                disabled={disabled}
                onClick={dismissConfirm}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                className="yui-micro-pill yui-micro-pill--danger"
                disabled={disabled}
                onClick={() => {
                  setConfirming(false);
                  onRestore();
                }}
              >
                <UndoIcon size={10.5} />
                <span>{confirmRestoreLabel}</span>
              </button>
            </div>
          ) : (
            <div className="yui-btn-row">
              {onBranch ? (
                <button
                  type="button"
                  className="yui-pill-btn"
                  disabled={disabled}
                  onClick={onBranch}
                >
                  {branchLabel}
                </button>
              ) : null}
              {onRestore ? (
                <button
                  ref={restoreBtnRef}
                  type="button"
                  className="yui-pill-btn yui-pill-btn--primary"
                  disabled={disabled}
                  onClick={() => (confirmRestore ? setConfirming(true) : onRestore())}
                >
                  <UndoIcon size={11.5} />
                  <span>{restoreLabel}</span>
                </button>
              ) : null}
            </div>
          )
        ) : null}
      </CardFooterChrome>
    </section>
  );
}
