import { useState } from 'react';
import {
  AlertIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '../icons/ApertureIcon.js';
import { MatrixOrb } from '../icons/MatrixOrb.js';

export interface ToolStepCardProps {
  status: 'running' | 'done' | 'error';
  title: string;
  durationLabel?: string;
  summary?: string;
  details?: string;
  defaultExpanded?: boolean;
}

/** Tool execution status capsule supporting running, done, error, and detail disclosure. */
export function ToolStepCard({
  status,
  title,
  durationLabel,
  summary,
  details,
  defaultExpanded = false,
}: ToolStepCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasBody = Boolean(summary || details);

  return (
    <div className="yui-tool-card">
      <div className="yui-tool-card-head">
        <div className="yui-tool-card-title-row">
          {status === 'running' ? <MatrixOrb state="streaming" size={14} /> : null}
          {status === 'done' ? <CheckIcon size={13} /> : null}
          {status === 'error' ? <AlertIcon size={13} className="yui-error-icon" /> : null}
          <span className="yui-tool-card-title">{title}</span>
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
      {hasBody && expanded ? (
        <div className="yui-tool-card-body">
          {summary ? <div>{summary}</div> : null}
          {details ? <div className="yours-telemetry">{details}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
