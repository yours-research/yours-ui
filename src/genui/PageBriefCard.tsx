import { useState } from 'react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon,
  PageScanIcon,
  QuoteIcon,
} from '../icons/ApertureIcon.js';

export interface PageBriefCardProps {
  title: string;
  subtitle?: string;
  originLabel?: string;
  bullets: readonly string[];
  highlightsCount?: number;
  highlightsContent?: string;
  onCopy?: () => void;
}

/** Structured webpage or document summary card (`GenUI.PageBrief`). */
export function PageBriefCard({
  title,
  subtitle,
  originLabel = 'This tab',
  bullets,
  highlightsCount,
  highlightsContent,
  onCopy,
}: PageBriefCardProps) {
  const [showHighlights, setShowHighlights] = useState(false);

  return (
    <div className="yui-genui-card">
      <div className="yui-genui-head">
        <div className="yui-genui-title-row">
          <span className="yui-icon-badge">
            <PageScanIcon size={14} />
          </span>
          <div className="yui-col-min">
            <div className="yui-genui-title">{title}</div>
            {subtitle ? <div className="yui-genui-muted">{subtitle}</div> : null}
          </div>
        </div>
        <span className="yui-speed-readout">{originLabel}</span>
      </div>

      <div className="yui-genui-body">
        <ul className="yui-brief-list">
          {bullets.map((bullet, idx) => (
            <li key={idx}>{bullet}</li>
          ))}
        </ul>
        {showHighlights && highlightsContent ? (
          <div className="yui-draft-well">{highlightsContent}</div>
        ) : null}
      </div>

      <div className="yui-genui-foot">
        {highlightsCount !== undefined ? (
          <button
            type="button"
            className="yui-micro-pill"
            aria-expanded={showHighlights}
            onClick={() => setShowHighlights((prev) => !prev)}
          >
            <QuoteIcon size={11} />
            <span>
              {highlightsCount} highlight{highlightsCount === 1 ? '' : 's'}
            </span>
            {showHighlights ? <ChevronUpIcon size={11} /> : <ChevronDownIcon size={11} />}
          </button>
        ) : (
          <span />
        )}
        {onCopy ? (
          <button type="button" className="yui-micro-pill" onClick={onCopy}>
            <CopyIcon size={11} />
            <span>Copy brief</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
