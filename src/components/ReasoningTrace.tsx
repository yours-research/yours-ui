import { useState } from 'react';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '../icons/ApertureIcon.js';
import { MatrixOrb } from '../icons/MatrixOrb.js';

export interface ReasoningTraceProps {
  status: 'thinking' | 'done';
  durationLabel?: string;
  content?: string;
  defaultExpanded?: boolean;
}

/**
 * Collapsible reasoning trace displaying an active MatrixOrb while thinking
 * and a dotted vertical guide rail when expanded.
 */
export function ReasoningTrace({
  status,
  durationLabel,
  content,
  defaultExpanded = false,
}: ReasoningTraceProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasContent = Boolean(content && content.trim().length > 0);
  const isThinking = status === 'thinking';

  if (isThinking && !hasContent) {
    return (
      <div className="yui-reasoning">
        <div className="yui-reasoning-trigger">
          <MatrixOrb state="thinking" size={15} />
          <span>Thinking</span>
          {durationLabel ? <span className="yui-speed-readout">{durationLabel}</span> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="yui-reasoning">
      <button
        type="button"
        className="yui-reasoning-trigger"
        aria-expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
      >
        {isThinking ? (
          <>
            <MatrixOrb state="thinking" size={15} />
            <span>Thinking</span>
            {durationLabel ? <span className="yui-speed-readout">{durationLabel}</span> : null}
          </>
        ) : (
          <>
            <CheckIcon size={13} />
            <span>Thought{durationLabel ? ` for ${durationLabel}` : ''}</span>
          </>
        )}
        {expanded ? <ChevronUpIcon size={12} /> : <ChevronDownIcon size={12} />}
      </button>
      {expanded && hasContent ? (
        <div className="yui-reasoning-body">
          <div className="yui-reasoning-rail" aria-hidden="true" />
          <div className="yui-reasoning-text">{content}</div>
        </div>
      ) : null}
    </div>
  );
}
