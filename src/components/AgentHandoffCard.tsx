import { AlertIcon, GlobeIcon } from '../icons/ApertureIcon.js';
import { CardFooterChrome, CardHeaderChrome, CardMetaScope } from './CardChrome.js';
import { StatusBadge } from './StatusBadge.js';

export type AgentHandoffState = 'waiting' | 'user-active';

export interface AgentHandoffCardProps {
  title: string;
  reason: string;
  origin: string;
  progressLabel?: string;
  badge?: string;
  state?: AgentHandoffState;
  originLabel?: string;
  progressTitle?: string;
  takeOverLabel?: string;
  resumeLabel?: string;
  cancelLabel?: string;
  onTakeOver?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  privacyNote?: string;
  className?: string;
}

/**
 * Tactile human-in-the-loop pause/takeover card for login walls, CAPTCHAs,
 * checkout confirmations, and sensitive browser forms where execution yields
 * cleanly to the user before resuming.
 */
export function AgentHandoffCard({
  title,
  reason,
  origin,
  progressLabel,
  badge,
  state = 'waiting',
  originLabel = 'Origin',
  progressTitle = 'Step',
  takeOverLabel = 'Take over tab',
  resumeLabel = 'Resume',
  cancelLabel = 'Cancel',
  onTakeOver,
  onResume,
  onCancel,
  privacyNote = 'Credentials stay local in your tab',
  className,
}: AgentHandoffCardProps) {
  const badgeText =
    badge !== undefined
      ? badge
      : state === 'user-active'
        ? 'Tab yours'
        : 'Human input needed';
  const cardClass = ['yui-card-shell', 'yui-handoff-card', className].filter(Boolean).join(' ');

  const metaRows = [
    {
      label: originLabel,
      value: (
        <span className="yui-sperm-origin">
          <GlobeIcon size={11} className="yui-privacy-icon" />
          <span className="yui-sperm-host">{origin}</span>
        </span>
      ),
    },
    ...(progressLabel ? [{ label: progressTitle, value: progressLabel }] : []),
  ];

  return (
    <section
      data-slot="agent-handoff-card"
      data-state={state}
      className={cardClass}
      aria-label={title}
    >
      <CardHeaderChrome
        icon={<AlertIcon size={13} className="yui-handoff-icon" />}
        title={title}
        subtitle={reason}
        right={
          badgeText ? (
            <StatusBadge tone="amber" dot pulse={state === 'waiting'}>
              {badgeText}
            </StatusBadge>
          ) : null
        }
      />

      <CardMetaScope rows={metaRows} />

      <CardFooterChrome privacyNote={privacyNote}>
        <div className="yui-btn-row">
          {onTakeOver && state === 'waiting' ? (
            <button
              type="button"
              className="yui-pill-btn yui-pill-btn--primary"
              onClick={onTakeOver}
            >
              {takeOverLabel}
            </button>
          ) : null}
          {onResume ? (
            <button
              type="button"
              className={
                state === 'user-active' || !onTakeOver
                  ? 'yui-pill-btn yui-pill-btn--primary'
                  : 'yui-pill-btn'
              }
              onClick={onResume}
            >
              {resumeLabel}
            </button>
          ) : null}
          {onCancel ? (
            <button type="button" className="yui-pill-btn" onClick={onCancel}>
              {cancelLabel}
            </button>
          ) : null}
        </div>
      </CardFooterChrome>
    </section>
  );
}
