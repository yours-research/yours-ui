import { useId, useState } from 'react';
import { ChevronDownIcon, ExternalLinkIcon, GlobeIcon } from '../icons/ApertureIcon.js';
import { cn } from './CardChrome.js';
import { getSourceHost, isSafeHttpUrl, SourceFavicon } from './InlineCitationPopover.js';
import { ShimmerText } from './InlineToolStatus.js';

export type WebSearchStatus = 'searching' | 'done';

export interface WebSearchSource {
  id: string;
  title: string;
  url: string;
  domain?: string;
  snippet?: string;
  faviconUrl?: string;
}

export interface WebSearchProps {
  sources: readonly WebSearchSource[];
  status: WebSearchStatus;
  query?: string;
  label?: string;
  progress?: number;
  linked?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelectSource?: (source: WebSearchSource) => void;
  className?: string;
}

const RING_RADIUS = 7;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function SearchProgressOrb({ progress }: { progress?: number }) {
  const isDeterminate = typeof progress === 'number' && !Number.isNaN(progress);
  const clamped = isDeterminate ? Math.max(0, Math.min(1, progress)) : 0;
  const dashOffset = RING_CIRCUMFERENCE * (1 - clamped);

  return (
    <span className="yui-ws-orb" aria-hidden="true">
      <svg viewBox="0 0 18 18" className={cn('yui-ws-ring', !isDeterminate && 'is-spin')}>
        <circle cx="9" cy="9" r={RING_RADIUS} className="yui-ws-ring-track" />
        <circle
          cx="9"
          cy="9"
          r={RING_RADIUS}
          className="yui-ws-ring-arc"
          strokeDasharray={isDeterminate ? RING_CIRCUMFERENCE : '15 30'}
          strokeDashoffset={isDeterminate ? dashOffset : undefined}
        />
      </svg>
      <GlobeIcon size={10} className="yui-ws-globe" />
    </span>
  );
}

/**
 * Clean-room Rare-UI WebSearch parity primitive: animated progress-ring pill while
 * searching (`status="searching"`), transitioning cleanly to stacked fan-out favicons
 * and staggered source cards once complete (`status="done"`), with zero inline styles.
 */
export function WebSearch({
  sources,
  status,
  query,
  label,
  progress,
  linked = true,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  onSelectSource,
  className,
}: WebSearchProps) {
  const panelId = useId();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = controlledOpen ?? uncontrolledOpen;
  const isSearching = status === 'searching';

  if (!isSearching && sources.length === 0) return null;

  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  const uniqueDomains: WebSearchSource[] = [];
  for (const src of sources) {
    const host = getSourceHost(src.domain, src.url);
    if (!uniqueDomains.some((existing) => getSourceHost(existing.domain, existing.url) === host)) {
      uniqueDomains.push(src);
      if (uniqueDomains.length === 4) break;
    }
  }

  const resolvedLabel =
    label ??
    (isSearching
      ? 'Searching the web'
      : `Searched ${sources.length} ${sources.length === 1 ? 'site' : 'sites'}`);

  return (
    <section
      data-slot="web-search"
      data-status={status}
      data-open={isOpen ? 'true' : 'false'}
      aria-label={resolvedLabel}
      className={cn('yui-col yui-ws-root', className)}
    >
      <button
        type="button"
        className="yui-src-pill yui-ws-pill"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setOpen(!isOpen)}
      >
        {isSearching ? (
          <SearchProgressOrb progress={progress} />
        ) : (
          <span className="yui-src-stack" aria-hidden="true">
            {uniqueDomains.map((item, idx) => (
              <span key={item.id ?? item.url ?? idx} className={cn('yui-src-mark yui-ws-mark', `yui-ws-tone-${idx % 4}`)}>
                <SourceFavicon source={item} className="yui-ws-fav" />
              </span>
            ))}
          </span>
        )}

        <ShimmerText active={isSearching} className="yui-ws-label">
          {resolvedLabel}
        </ShimmerText>

        {query ? <span className="yui-ellipsis yui-ws-query">{query}</span> : null}

        <ChevronDownIcon
          size={12}
          className={cn('yui-wss-chevron', isOpen && 'is-open')}
        />
      </button>

      <div
        id={panelId}
        className={cn('yui-disclosure', isOpen && 'is-open')}
        aria-hidden={!isOpen}
        inert={!isOpen ? true : undefined}
      >
        <div className="yui-disclosure-inner">
          <div className="yui-wss-grid yui-ws-grid">
            {sources.map((src, idx) => {
              const host = getSourceHost(src.domain, src.url);
              const safeHref = linked && isSafeHttpUrl(src.url) ? src.url.trim() : undefined;
              const inner = (
                <>
                  <div className="yui-row-between">
                    <span className="yui-row yui-gap-5 yui-col-min">
                      <span className={cn('yui-ws-card-fav', `yui-ws-tone-${idx % 4}`)}>
                        <SourceFavicon source={src} className="yui-ws-fav" />
                      </span>
                      <span className="yui-ellipsis yui-wss-host">{host}</span>
                    </span>
                    {safeHref || onSelectSource ? (
                      <ExternalLinkIcon size={11} className="yui-trace-label" />
                    ) : null}
                  </div>
                  <div className="yui-wss-title">{src.title}</div>
                  {src.snippet ? <p className="yui-wss-snippet">{src.snippet}</p> : null}
                </>
              );

              const cardClass = cn('yui-card-shell yui-wss-card yui-ws-card', `yui-ws-stagger-${Math.min(idx, 5)}`);

              if (safeHref) {
                return (
                  <a
                    key={src.id}
                    href={safeHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cardClass}
                    onClick={() => onSelectSource?.(src)}
                  >
                    {inner}
                  </a>
                );
              }

              if (onSelectSource) {
                return (
                  <button
                    key={src.id}
                    type="button"
                    className={cardClass}
                    onClick={() => onSelectSource(src)}
                  >
                    {inner}
                  </button>
                );
              }

              return (
                <div key={src.id} className={cardClass}>
                  {inner}
                </div>
              );
            })}

            {isSearching && sources.length === 0 ? (
              <>
                <div className="yui-card-shell yui-wss-card yui-ws-skel-card" aria-hidden="true">
                  <div className="yui-ws-skel-line is-short" />
                  <div className="yui-ws-skel-line" />
                  <div className="yui-ws-skel-line is-mid" />
                </div>
                <div className="yui-card-shell yui-wss-card yui-ws-skel-card" aria-hidden="true">
                  <div className="yui-ws-skel-line is-short" />
                  <div className="yui-ws-skel-line" />
                  <div className="yui-ws-skel-line is-mid" />
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export const WebSearchActivity = WebSearch;
