import { useState } from 'react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  GlobeIcon,
} from '../icons/ApertureIcon.js';

export interface SourceCitation {
  id: string;
  title: string;
  subtitle?: string;
  url?: string;
}

export interface SourcesDrawerProps {
  sources: readonly SourceCitation[];
  defaultExpanded?: boolean;
}

/** Expandable citation capsule displaying numbered verified source attributions. */
export function SourcesDrawer({ sources, defaultExpanded = false }: SourcesDrawerProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  if (sources.length === 0) return null;

  return (
    <div className="yui-sources-wrap">
      <div>
        <button
          type="button"
          className="yui-suggestion-pill"
          aria-expanded={expanded}
          onClick={() => setExpanded((prev) => !prev)}
        >
          <GlobeIcon size={12} />
          <span>
            {sources.length} source{sources.length === 1 ? '' : 's'}
          </span>
          {expanded ? <ChevronUpIcon size={11} /> : <ChevronDownIcon size={11} />}
        </button>
      </div>
      {expanded ? (
        <div className="yui-sources-list">
          {sources.map((src, idx) => (
            <a
              key={src.id}
              className="yui-source-row"
              href={src.url ?? '#'}
              target={src.url ? '_blank' : undefined}
              rel={src.url ? 'noopener noreferrer' : undefined}
            >
              <div className="yui-action-group">
                <span className="yui-source-index">{idx + 1}</span>
                <div>
                  <div className="yui-prompt-capsule-title">{src.title}</div>
                  {src.subtitle ? (
                    <div className="yui-prompt-capsule-sub">{src.subtitle}</div>
                  ) : null}
                </div>
              </div>
              <ExternalLinkIcon size={12} />
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
