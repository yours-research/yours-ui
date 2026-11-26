import { HistoryIcon } from '../icons/ApertureIcon.js';

export type TimelineStepStatus = 'done' | 'active' | 'pending' | 'error';

export interface TimelineStep {
  id: string;
  label: string;
  detail?: string;
  timestamp?: string;
  status?: TimelineStepStatus;
}

export interface TimelineCardProps {
  title: string;
  subtitle?: string;
  metaLabel?: string;
  steps: readonly TimelineStep[];
  onSelectStep?: (step: TimelineStep) => void;
  className?: string;
}

/**
 * Vertical Paper Page 9 chronology card (`GenUI.TimelineCard`) for research
 * timelines, multi-step execution plans, or page history with hairline rails.
 */
export function TimelineCard({
  title,
  subtitle,
  metaLabel,
  steps,
  onSelectStep,
  className,
}: TimelineCardProps) {
  const rootClass = ['yui-genui-card', className].filter(Boolean).join(' ');

  return (
    <section
      data-slot="timeline-card"
      className={rootClass}
      aria-label={title}
    >
      <div className="yui-genui-head">
        <div className="yui-genui-title-row">
          <span className="yui-icon-badge" aria-hidden="true">
            <HistoryIcon size={14} />
          </span>
          <div className="yui-col-min">
            <h3 className="yui-genui-title">{title}</h3>
            {subtitle ? <p className="yui-genui-muted">{subtitle}</p> : null}
          </div>
        </div>
        {metaLabel ? <span className="yui-speed-readout">{metaLabel}</span> : null}
      </div>

      <div className="yui-genui-body">
        <ol className="yui-tl-list">
          {steps.map((step, idx) => {
            const status = step.status ?? 'pending';
            const hasStem = idx < steps.length - 1;
            const dotClass = ['yui-tl-dot', `is-${status}`].join(' ');
            const itemClass = ['yui-tl-item', `is-${status}`].join(' ');

            const body = (
              <>
                <div className="yui-tl-top">
                  <span className="yui-tl-label">{step.label}</span>
                  {step.timestamp ? (
                    <span className="yui-tl-time">{step.timestamp}</span>
                  ) : null}
                </div>
                {step.detail ? <p className="yui-tl-detail">{step.detail}</p> : null}
              </>
            );

            return (
              <li key={step.id} className={itemClass} data-status={status}>
                <div className="yui-tl-rail" aria-hidden="true">
                  <span className={dotClass} />
                  {hasStem ? <span className="yui-tl-stem" /> : null}
                </div>
                {onSelectStep ? (
                  <button
                    type="button"
                    className="yui-tl-btn"
                    onClick={() => onSelectStep(step)}
                  >
                    {body}
                  </button>
                ) : (
                  <div className="yui-tl-content">{body}</div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
