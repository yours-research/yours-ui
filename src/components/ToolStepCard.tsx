import { useState, type ReactNode } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '../icons/ApertureIcon.js';
import { ToolStatusIcon, type ToolStatusKind } from '../icons/ToolStatusIcons.js';
import { cn } from '../utils/clipboard.js';
import { ShimmerText } from './InlineToolStatus.js';

export interface ToolStepCardProps {
  status: 'running' | 'done' | 'error';
  title: string;
  state?: ToolStatusKind;
  detail?: string;
  favicon?: string | ReactNode;
  variant?: 'inline' | 'card';
  durationLabel?: string;
  summary?: string;
  details?: string;
  defaultExpanded?: boolean;
  className?: string;
}

/**
 * Clean-room inline/card tool step capsule pairing animated `ToolStatusIcon`
 * and `ShimmerText` during execution with collapsible execution details.
 */
export function ToolStepCard({
  status,
  title,
  state,
  detail,
  favicon,
  variant = 'inline',
  durationLabel,
  summary,
  details,
  defaultExpanded = false,
  className,
}: ToolStepCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [imgBroken, setImgBroken] = useState(false);
  const hasBody = Boolean(summary || details);
  const glyphKind: ToolStatusKind =
    status === 'error' ? 'error' : status === 'done' ? (state ?? 'done') : (state ?? 'thinking');

  return (
    <div
      data-slot="tool-step-card"
      data-variant={variant}
      data-status={status}
      className={cn(
        'yui-tool-card',
        variant === 'inline' && 'yui-tool-card--inline',
        className,
      )}
    >
      <div className="yui-tool-card-head">
        <div className="yui-tool-card-title-row">
          <ToolStatusIcon kind={glyphKind} size={15} active={status === 'running'} />
          <ShimmerText active={status === 'running'} className="yui-tool-card-title">
            {title}
          </ShimmerText>
          {typeof favicon === 'string' ? (
            <img
              src={favicon}
              alt=""
              aria-hidden="true"
              className={cn('yui-its-favicon', imgBroken && 'is-hidden')}
              onError={() => setImgBroken(true)}
            />
          ) : (
            favicon
          )}
          {detail ? <span className="yui-its-detail yui-ellipsis">{detail}</span> : null}
        </div>
        <div className="yui-action-group">
          {durationLabel ? <span className="yui-speed-readout">{durationLabel}</span> : null}
          {hasBody ? (
            <button
              type="button"
              className="yui-icon-btn"
              aria-label={expanded ? 'Hide tool details' : 'Show tool details'}
              aria-expanded={expanded}
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded ? <ChevronUpIcon size={12} /> : <ChevronDownIcon size={12} />}
            </button>
          ) : null}
        </div>
      </div>
      {hasBody ? (
        <div
          className={cn('yui-disclosure', expanded && 'is-open')}
          aria-hidden={!expanded}
          inert={!expanded ? true : undefined}
        >
          <div className="yui-disclosure-inner">
            <div className="yui-tool-card-body">
              {summary ? <div>{summary}</div> : null}
              {details ? <div className="yours-telemetry">{details}</div> : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
