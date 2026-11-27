import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type RefObject,
} from 'react';
import {
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  DocumentIcon,
  ExternalLinkIcon,
  GlobeIcon,
} from '../icons/ApertureIcon.js';
import { CardCopyButton, cn } from './CardChrome.js';

function isSafeHttpUrl(url?: string): url is string {
  return typeof url === 'string' && /^https?:\/\//i.test(url.trim());
}

function getSourceHost(domain?: string, url?: string): string {
  if (domain?.trim()) return domain.trim().replace(/^www\./i, '');
  if (url) {
    try {
      return new URL(url).hostname.replace(/^www\./i, '');
    } catch {
      return url.replace(/^https?:\/\//i, '').split('/')[0] || 'source';
    }
  }
  return 'source';
}

function getFaviconUrl(source: { faviconUrl?: string }): string | undefined {
  const raw = source.faviconUrl?.trim();
  if (!raw) return undefined;
  if (isSafeHttpUrl(raw) || /^data:image\/(png|jpeg|webp|gif|svg\+xml|x-icon|vnd\.microsoft\.icon)[;,]/i.test(raw)) {
    return raw;
  }
  return undefined;
}

function useDismissOnOutsideAndEscape(
  wrapRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  onClose: () => void,
) {
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [wrapRef, isOpen, onClose]);
}

function usePopoverEdgeAlign(cardRef: RefObject<HTMLElement | null>, isOpen: boolean, dep?: unknown) {
  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!isOpen || !card) return;
    const rect = card.getBoundingClientRect();
    const vw = typeof window !== 'undefined' ? window.innerWidth : 380;
    card.dataset.align = rect.right > vw - 12 ? 'end' : 'start';
  }, [cardRef, isOpen, dep]);
}

export interface InlineCitationPillProps
  extends Omit<ComponentProps<'span'>, 'children' | 'onClick'> {
  index?: number | string;
  label: string;
  href?: string;
  title?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Compact editorial inline citation / footnote pill (`[1] · yours.sh`) for
 * grounded active-tab and web references.
 */
export function InlineCitationPill({
  index,
  label,
  href,
  title,
  active = false,
  onClick,
  className,
  ...rest
}: InlineCitationPillProps) {
  const pillClass = cn('yui-citation-pill', active && 'is-active', className);

  const content = (
    <>
      {index !== undefined ? <span className="yui-citation-index">{index}</span> : null}
      <span className="yui-ellipsis">{label}</span>
    </>
  );

  if (href) {
    const external = /^https?:/i.test(href);
    return (
      <a
        data-slot="inline-citation-pill"
        className={pillClass}
        href={href}
        title={title ?? label}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        onClick={onClick}
        aria-expanded={rest['aria-expanded']}
        aria-controls={rest['aria-controls']}
      >
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        data-slot="inline-citation-pill"
        type="button"
        className={pillClass}
        title={title ?? label}
        aria-pressed={rest['aria-expanded'] !== undefined ? undefined : active}
        aria-expanded={rest['aria-expanded']}
        aria-controls={rest['aria-controls']}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <span data-slot="inline-citation-pill" className={pillClass} title={title ?? label} {...rest}>
      {content}
    </span>
  );
}

export interface SourceCitation {
  id: string;
  title: string;
  subtitle?: string;
  url?: string;
}

export interface SourcesDrawerProps {
  sources: readonly SourceCitation[];
  defaultExpanded?: boolean;
  variant?: 'pill' | 'inline';
  className?: string;
}

/** Expandable citation capsule or inline trigger displaying numbered verified source attributions. */
export function SourcesDrawer({
  sources,
  defaultExpanded = false,
  variant = 'pill',
  className,
}: SourcesDrawerProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const panelId = useId();
  if (sources.length === 0) return null;

  const isInline = variant === 'inline';

  return (
    <div data-variant={variant} className={cn('yui-col', className)}>
      <div>
        <button
          type="button"
          className={isInline ? 'yui-wss-trigger' : 'yui-suggestion-pill'}
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpanded((prev) => !prev)}
        >
          <GlobeIcon size={12} />
          <span>
            {sources.length} source{sources.length === 1 ? '' : 's'}
          </span>
          {expanded ? <ChevronUpIcon size={11} /> : <ChevronDownIcon size={11} />}
        </button>
      </div>
      <div
        id={panelId}
        className={cn('yui-disclosure yui-disclosure--sources', expanded && 'is-open')}
        aria-hidden={!expanded}
        inert={!expanded ? true : undefined}
      >
        <div className="yui-disclosure-inner">
          <div className="yui-sources-list">
            {sources.map((src, idx) => (
              <a
                key={src.id}
                className="yui-source-row"
                href={src.url ?? '#'}
                target={src.url ? '_blank' : undefined}
                rel={src.url ? 'noopener noreferrer' : undefined}
              >
                <div className="yui-row yui-flex-1 yui-gap-8">
                  <span className="yui-source-index">{idx + 1}</span>
                  <div className="yui-col-min">
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
        </div>
      </div>
    </div>
  );
}

export interface WebSearchSourceItem {
  id?: string;
  title: string;
  url?: string;
  domain?: string;
  faviconUrl?: string;
  snippet?: string;
}

export interface WebSearchSourcesStripProps {
  sources: readonly WebSearchSourceItem[];
  label?: string;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  initialVisibleCount?: number;
  onSelectSource?: (source: WebSearchSourceItem) => void;
  className?: string;
}

/**
 * Borderless inline web-search citation strip (`Searched N sites`) with stacked domain
 * favicons, CSS-only broken-image fallbacks, responsive disclosure grid, and `+N more` reveal.
 */
export function WebSearchSourcesStrip({
  sources,
  label,
  defaultExpanded = false,
  expanded: controlledExpanded,
  onExpandedChange,
  initialVisibleCount = 4,
  onSelectSource,
  className,
}: WebSearchSourcesStripProps) {
  const panelId = useId();
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);
  const [showAll, setShowAll] = useState(false);
  const [brokenFavicons, setBrokenFavicons] = useState<Record<string, boolean>>({});

  if (sources.length === 0) return null;

  const isExpanded = controlledExpanded ?? uncontrolledExpanded;
  const triggerLabel = label ?? `Searched ${sources.length} ${sources.length === 1 ? 'site' : 'sites'}`;
  const previewSources = sources.slice(0, 3);
  const limit = Math.max(1, initialVisibleCount);
  const visibleSources = showAll ? sources : sources.slice(0, limit);
  const hiddenCount = sources.length - visibleSources.length;

  const toggleExpanded = () => {
    const next = !isExpanded;
    if (controlledExpanded === undefined) {
      setUncontrolledExpanded(next);
    }
    onExpandedChange?.(next);
  };

  const renderFavicon = (src: WebSearchSourceItem, idx: number, stacked: boolean) => {
    const host = getSourceHost(src.domain, src.url);
    const key = src.id ?? `${host}-${idx}`;
    const isBroken = Boolean(brokenFavicons[key]);
    const showFallback = !src.faviconUrl || isBroken;
    const monogram = (host.charAt(0) || '?').toUpperCase();

    return (
      <span key={key} className="yui-wss-fav" aria-hidden={stacked ? true : undefined}>
        {src.faviconUrl ? (
          <img
            src={src.faviconUrl}
            alt=""
            className={isBroken ? 'yui-wss-fav-img is-hidden' : 'yui-wss-fav-img'}
            onError={() =>
              setBrokenFavicons((prev) => (prev[key] ? prev : { ...prev, [key]: true }))
            }
          />
        ) : null}
        {showFallback ? <span>{monogram}</span> : null}
      </span>
    );
  };

  return (
    <div
      data-slot="web-search-sources-strip"
      data-expanded={isExpanded ? 'true' : 'false'}
      className={cn('yui-col yui-wss', className)}
    >
      <button
        type="button"
        className="yui-wss-trigger"
        aria-expanded={isExpanded}
        aria-controls={panelId}
        onClick={toggleExpanded}
      >
        <span className="yui-wss-favicons" aria-hidden="true">
          {previewSources.map((src, idx) => renderFavicon(src, idx, true))}
        </span>
        <span className="yui-ellipsis">{triggerLabel}</span>
        <ChevronDownIcon size={12} className={cn('yui-wss-chevron', isExpanded && 'is-open')} />
      </button>

      <div
        id={panelId}
        className={cn('yui-disclosure', isExpanded && 'is-open')}
        aria-hidden={!isExpanded}
        inert={!isExpanded ? true : undefined}
      >
        <div className="yui-disclosure-inner">
          <div className="yui-col-8">
            <div className="yui-wss-grid">
              {visibleSources.map((src, idx) => {
                const host = getSourceHost(src.domain, src.url);
                const key = src.id ?? `${host}-${idx}`;
                const safeHref = isSafeHttpUrl(src.url) ? src.url : undefined;
                const inner = (
                  <>
                    <div className="yui-row yui-gap-5">
                      {renderFavicon(src, idx, false)}
                      <span className="yui-ellipsis yui-flex-1 yui-wss-host">{host}</span>
                      {safeHref ? <ExternalLinkIcon size={10} className="yui-muted-note yui-shrink-0" /> : null}
                    </div>
                    <div className="yui-wss-title">{src.title}</div>
                    {src.snippet ? <p className="yui-wss-snippet">{src.snippet}</p> : null}
                  </>
                );

                if (safeHref) {
                  return (
                    <a
                      key={key}
                      className="yui-card-shell yui-wss-card"
                      href={safeHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onSelectSource?.(src)}
                    >
                      {inner}
                    </a>
                  );
                }

                if (onSelectSource) {
                  return (
                    <button
                      key={key}
                      type="button"
                      className="yui-card-shell yui-wss-card"
                      onClick={() => onSelectSource(src)}
                    >
                      {inner}
                    </button>
                  );
                }

                return (
                  <div key={key} className="yui-card-shell yui-wss-card">
                    {inner}
                  </div>
                );
              })}
            </div>

            {hiddenCount > 0 ? (
              <div>
                <button
                  type="button"
                  className="yui-micro-pill"
                  onClick={() => setShowAll(true)}
                >
                  +{hiddenCount} more
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export interface InlineCitationSource {
  id?: string;
  index?: number | string;
  label: string;
  title: string;
  domain?: string;
  snippet: string;
  url?: string;
  timestampLabel?: string;
}

export interface InlineCitationPopoverProps {
  source: InlineCitationSource;
  open?: boolean;
  defaultOpen?: boolean;
  hoverOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onJumpToSource?: (source: InlineCitationSource) => void;
  jumpLabel?: string;
  className?: string;
}

/**
 * Grounded inline citation pill + hover/click preview card showing domain monogram,
 * quoted excerpt, and jump-to-source action in Cotton Paper & Obsidian dark.
 */
export function InlineCitationPopover({
  source,
  open: controlledOpen,
  defaultOpen = false,
  hoverOpen = true,
  onOpenChange,
  onJumpToSource,
  jumpLabel = 'Jump to source',
  className,
}: InlineCitationPopoverProps) {
  const cardId = useId();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = controlledOpen ?? uncontrolledOpen;

  const wrapRef = useRef<HTMLSpanElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(next);
    }
    onOpenChange?.(next);
  };

  const clearHoverTimer = () => {
    if (hoverTimerRef.current !== null) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  useEffect(() => clearHoverTimer, []);

  useDismissOnOutsideAndEscape(wrapRef, isOpen, () => setOpen(false));
  usePopoverEdgeAlign(cardRef, isOpen);

  const domainText = getSourceHost(source.domain, source.url);
  const monogram = (domainText.charAt(0) || '?').toUpperCase();
  const isExternal = isSafeHttpUrl(source.url);

  return (
    <span
      ref={wrapRef}
      data-slot="inline-citation-popover"
      data-open={isOpen ? 'true' : 'false'}
      className={cn('yui-cite-wrap', className)}
      onMouseEnter={() => {
        if (!hoverOpen) return;
        clearHoverTimer();
        hoverTimerRef.current = setTimeout(() => setOpen(true), 120);
      }}
      onMouseLeave={() => {
        if (!hoverOpen) return;
        clearHoverTimer();
        hoverTimerRef.current = setTimeout(() => setOpen(false), 180);
      }}
    >
      <InlineCitationPill
        index={source.index}
        label={source.label}
        active={isOpen}
        aria-expanded={isOpen}
        aria-controls={isOpen ? cardId : undefined}
        onClick={() => {
          clearHoverTimer();
          setOpen(!isOpen);
        }}
      />
      {isOpen ? (
        <div
          ref={cardRef}
          id={cardId}
          role="dialog"
          aria-label={source.title}
          className="yui-cite-card"
        >
          <div className="yui-row yui-gap-8">
            <span className="yui-cite-monogram" aria-hidden="true">
              {monogram}
            </span>
            <div className="yui-col-min">
              <div className="yui-cite-title">{source.title}</div>
              <div className="yui-cite-meta">
                {domainText}
                {source.timestampLabel ? ` · ${source.timestampLabel}` : ''}
              </div>
            </div>
          </div>

          <blockquote className="yui-cite-snippet">{source.snippet}</blockquote>

          {onJumpToSource || source.url ? (
            <div className="yui-actions-end yui-pt-2">
              {onJumpToSource ? (
                <button
                  type="button"
                  className="yui-micro-pill"
                  onClick={() => {
                    onJumpToSource(source);
                    setOpen(false);
                  }}
                >
                  <span>{jumpLabel}</span>
                  <ArrowRightIcon size={11} />
                </button>
              ) : (
                <a
                  className="yui-micro-pill"
                  href={source.url}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                >
                  <span>{jumpLabel}</span>
                  <ExternalLinkIcon size={11} />
                </a>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </span>
  );
}

export interface CitationFootnoteItem {
  id: string;
  index: number | string;
  title: string;
  domain?: string;
  locator?: string;
  excerpt: string;
  url?: string;
  highlight?: 'mono' | 'warm';
  source?: InlineCitationSource;
}

export interface CitationFootnoteListProps {
  citations: readonly CitationFootnoteItem[];
  title?: string;
  activeIndex?: number | string;
  onShowOnPage?: (citation: CitationFootnoteItem) => void;
  onCopyQuote?: (citation: CitationFootnoteItem) => void;
  showOnPageLabel?: string;
  copyLabel?: string;
  copiedLabel?: string;
  className?: string;
}

/**
 * Minimalist Paper Page 9 numbered quotation ledger pairing natively with
 * `InlineCitationPopover`, rendering subtle monochrome or warm highlight washes,
 * verbatim excerpts, section/paragraph locators, and `Show on page` / `Copy quote` actions.
 */
export function CitationFootnoteList({
  citations,
  title = 'Citations',
  activeIndex,
  onShowOnPage,
  onCopyQuote,
  showOnPageLabel = 'Show on page',
  copyLabel = 'Copy quote',
  copiedLabel = 'Copied',
  className,
}: CitationFootnoteListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = (citation: CitationFootnoteItem) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(citation.excerpt).catch(() => {});
    }
    setCopiedId(citation.id);
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setCopiedId((current) => (current === citation.id ? null : current));
    }, 1400);
    onCopyQuote?.(citation);
  };

  return (
    <section
      data-slot="citation-footnote-list"
      className={cn('yui-card-shell yui-fn-card', className)}
      aria-label={title}
    >
      <div className="yui-params-head yui-fn-head">
        <span className="yui-fn-head-title">{title}</span>
        <span className="yui-badge">{citations.length}</span>
      </div>

      <ol className="yui-list-plain yui-div-list">
        {citations.map((item) => {
          const isActive =
            activeIndex !== undefined && String(activeIndex) === String(item.index);
          const isCopied = copiedId === item.id;
          const isWarm = item.highlight === 'warm';
          const metaParts = [item.domain, item.locator].filter(Boolean);

          return (
            <li
              key={item.id}
              className={cn('yui-fn-row', isActive && 'is-active')}
              data-citation-id={item.id}
              data-citation-index={String(item.index)}
            >
              <div className="yui-row-start">
                <span className="yui-sq-22 yui-fn-num">{item.index}</span>
                <div className="yui-col-min">
                  <div className="yui-fn-title">{item.title}</div>
                  {metaParts.length > 0 ? (
                    <div className="yui-fn-meta">{metaParts.join(' · ')}</div>
                  ) : null}
                </div>
              </div>

              <blockquote className={isWarm ? 'yui-fn-quote is-warm' : 'yui-fn-quote'}>
                {item.excerpt}
              </blockquote>

              <div className="yui-actions-end">
                {onShowOnPage ? (
                  <button
                    type="button"
                    className="yui-micro-pill yui-fn-btn"
                    onClick={() => onShowOnPage(item)}
                  >
                    <span>{showOnPageLabel}</span>
                    <ExternalLinkIcon size={11} />
                  </button>
                ) : item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="yui-micro-pill yui-fn-btn"
                  >
                    <span>{showOnPageLabel}</span>
                    <ExternalLinkIcon size={11} />
                  </a>
                ) : null}

                <CardCopyButton
                  copied={isCopied}
                  copyLabel={copyLabel}
                  copiedLabel={copiedLabel}
                  className="yui-micro-pill yui-fn-btn"
                  ariaLabel={`${copyLabel} ${item.index}`}
                  onClick={() => handleCopy(item)}
                />
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export interface SourceFaviconSource {
  url?: string;
  domain?: string;
  faviconUrl?: string;
}

export interface SourceFaviconProps {
  source: SourceFaviconSource;
  className?: string;
}

/**
 * Compact 16px circular domain favicon with CSP-safe `https?:` loading and
 * graceful monogram / document fallback when offline or blocked.
 */
export function SourceFavicon({ source, className }: SourceFaviconProps) {
  const iconUrl = getFaviconUrl(source);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const isBroken = Boolean(iconUrl && failedUrl === iconUrl);
  const host = source.domain?.trim() || (source.url ? getSourceHost(undefined, source.url) : '');

  return (
    <span data-slot="source-favicon" aria-hidden="true" className={cn('yui-wss-fav yui-src-fav', className)}>
      {iconUrl ? (
        <img
          src={iconUrl}
          alt=""
          referrerPolicy="no-referrer"
          loading="lazy"
          className={cn('yui-wss-fav-img', isBroken && 'is-hidden')}
          onError={() => setFailedUrl(iconUrl)}
        />
      ) : null}
      {!iconUrl || isBroken ? (
        host ? <span>{host.charAt(0).toUpperCase()}</span> : <DocumentIcon size={10} />
      ) : null}
    </span>
  );
}

export interface SourcePreviewItem {
  id?: string;
  title: string;
  url?: string;
  domain?: string;
  faviconUrl?: string;
  snippet?: string;
}

export type ResponseSource = SourcePreviewItem;

export interface SourcePreviewPopoverProps {
  id?: string;
  source?: SourcePreviewItem;
  sources?: readonly SourcePreviewItem[];
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number, source: SourcePreviewItem) => void;
  onSelectSource?: (source: SourcePreviewItem) => void;
  onClose?: () => void;
  compact?: boolean;
  label?: string;
  className?: string;
}

/**
 * Single clean source preview dialog supporting `< 1 / N >` cycling, `ArrowLeft`/`ArrowRight`
 * keyboard navigation, external `noopener noreferrer` links, truncated URL, and 3-line snippet.
 */
export function SourcePreviewPopover({
  id,
  source,
  sources,
  index: controlledIndex,
  defaultIndex = 0,
  onIndexChange,
  onSelectSource,
  onClose,
  compact = false,
  label,
  className,
}: SourcePreviewPopoverProps) {
  const list = sources && sources.length > 0 ? sources : source ? [source] : [];
  const [uncontrolledIndex, setUncontrolledIndex] = useState(defaultIndex);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const current = Math.max(0, Math.min(controlledIndex ?? uncontrolledIndex, Math.max(0, list.length - 1)));
  const active = list[current];

  usePopoverEdgeAlign(cardRef, Boolean(active), current);
  if (!active) return null;

  const move = (delta: number) => {
    if (list.length <= 1) return;
    const next = (current + delta + list.length) % list.length;
    if (controlledIndex === undefined) setUncontrolledIndex(next);
    onIndexChange?.(next, list[next]);
  };

  const host = active.domain?.trim() || (active.url ? getSourceHost(undefined, active.url) : 'Saved on this device');
  const safeHref = isSafeHttpUrl(active.url) ? active.url.trim() : undefined;

  return (
    <span
      ref={cardRef}
      id={id}
      role="dialog"
      aria-label={label ?? (list.length > 1 ? 'Answer sources' : active.title)}
      className={cn('yui-cite-card yui-src-popover', compact && 'is-compact', className)}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          move(event.key === 'ArrowRight' ? 1 : -1);
        }
      }}
    >
      {list.length > 1 ? (
        <span className="yui-cmd-head">
          <button
            type="button"
            className="yui-icon-btn"
            aria-label="Previous source"
            onClick={() => move(-1)}
          >
            <ChevronLeftIcon size={13} />
          </button>
          <span className="yui-its-elapsed" aria-live="polite">
            {current + 1} / {list.length}
          </span>
          <button
            type="button"
            className="yui-icon-btn"
            aria-label="Next source"
            onClick={() => move(1)}
          >
            <ChevronRightIcon size={13} />
          </button>
        </span>
      ) : null}

      <span className="yui-col yui-col-5 yui-card-pad">
        <span className="yui-row yui-gap-5">
          <SourceFavicon source={active} />
          <span className="yui-ellipsis yui-wss-host">{host}</span>
        </span>

        {safeHref ? (
          <a
            href={safeHref}
            target="_blank"
            rel="noopener noreferrer"
            className="yui-src-title"
            aria-label={`Open source: ${active.title}`}
            onClick={() => {
              onSelectSource?.(active);
              onClose?.();
            }}
          >
            {active.title}
          </a>
        ) : onSelectSource ? (
          <button
            type="button"
            className="yui-src-title"
            aria-label={`Open source: ${active.title}`}
            onClick={() => {
              onSelectSource(active);
              onClose?.();
            }}
          >
            {active.title}
          </button>
        ) : (
          <span className="yui-src-title">{active.title}</span>
        )}

        {active.url ? <span className="yui-ellipsis yui-muted-note">{active.url}</span> : null}
        {active.snippet ? <span className="yui-src-snippet">{active.snippet}</span> : null}
      </span>
    </span>
  );
}

export interface MessageSourcesPillProps {
  sources: readonly SourcePreviewItem[];
  label?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onPreview?: (index: number, source: SourcePreviewItem) => void;
  onSelectSource?: (source: SourcePreviewItem) => void;
  className?: string;
}

export type MessageSourcesProps = MessageSourcesPillProps;

/**
 * Compact `trueforge`-style sources capsule with overlapping stacked favicons, CSS hover/open
 * fan-out animation, and a single `< 1 / N >` `SourcePreviewPopover`.
 */
export function MessageSourcesPill({
  sources,
  label,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  onPreview,
  onSelectSource,
  className,
}: MessageSourcesPillProps) {
  const popoverId = useId();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [index, setIndex] = useState(0);

  const isOpen = controlledOpen ?? uncontrolledOpen;
  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    if (next) {
      setIndex(0);
      if (sources[0]) onPreview?.(0, sources[0]);
    }
    onOpenChange?.(next);
  };

  useDismissOnOutsideAndEscape(wrapRef, isOpen, () => setOpen(false));
  if (sources.length === 0) return null;

  const icons = sources
    .filter(
      (item, pos, list) =>
        list.findIndex((other) => getSourceHost(other.domain, other.url) === getSourceHost(item.domain, item.url)) === pos,
    )
    .slice(0, 3);
  const pillText = label ?? `${sources.length} ${sources.length === 1 ? 'source' : 'sources'}`;

  return (
    <div
      ref={wrapRef}
      data-slot="message-sources"
      data-open={isOpen ? 'true' : 'false'}
      className={cn('yui-cite-wrap yui-src-wrap', className)}
    >
      <button
        type="button"
        data-slot="sources"
        aria-label={pillText}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? popoverId : undefined}
        className="yui-src-pill"
        onClick={() => setOpen(!isOpen)}
      >
        <span className="yui-src-stack" aria-hidden="true">
          {icons.map((item, pos) => (
            <span key={item.id ?? item.url ?? pos} className="yui-src-mark">
              <SourceFavicon source={item} />
            </span>
          ))}
        </span>
        <span className="yui-src-pill-label">{pillText}</span>
      </button>

      {isOpen ? (
        <SourcePreviewPopover
          id={popoverId}
          sources={sources}
          index={index}
          onIndexChange={(next, src) => {
            setIndex(next);
            onPreview?.(next, src);
          }}
          onSelectSource={onSelectSource}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}

export const MessageSources = MessageSourcesPill;

export interface CitationChipProps {
  source: SourcePreviewItem;
  /** Zero-based citation index rendered as 1-based badge (e.g. `0` -> `"1"`). */
  index: number;
  label?: number | string;
  hoverOpen?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onPreview?: (index: number, source: SourcePreviewItem) => void;
  onSelectSource?: (source: SourcePreviewItem) => void;
  className?: string;
}

/** Quiet 16px inline monospace citation badge (`1`, `2`) opening `SourcePreviewPopover`. */
export function CitationChip({
  source,
  index,
  label,
  hoverOpen = true,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  onPreview,
  onSelectSource,
  className,
}: CitationChipProps) {
  const cardId = useId();
  const wrapRef = useRef<HTMLSpanElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = controlledOpen ?? uncontrolledOpen;

  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    if (next) onPreview?.(index, source);
    onOpenChange?.(next);
  };

  const clearHover = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => clearHover, []);
  useDismissOnOutsideAndEscape(wrapRef, isOpen, () => setOpen(false));

  const display = label ?? index + 1;

  return (
    <span
      ref={wrapRef}
      data-slot="inline-citation-chip"
      data-open={isOpen ? 'true' : 'false'}
      className={cn('yui-cite-wrap', className)}
      onMouseEnter={() => {
        if (!hoverOpen) return;
        clearHover();
        timerRef.current = setTimeout(() => setOpen(true), 100);
      }}
      onMouseLeave={() => {
        if (!hoverOpen) return;
        clearHover();
        timerRef.current = setTimeout(() => setOpen(false), 160);
      }}
    >
      <button
        type="button"
        data-slot="inline-citation"
        aria-label={`Citation ${display}: ${source.title}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? cardId : undefined}
        className={cn('yui-cite-chip', isOpen && 'is-open')}
        onClick={() => {
          clearHover();
          setOpen(!isOpen);
        }}
      >
        {display}
      </button>

      {isOpen ? (
        <SourcePreviewPopover
          id={cardId}
          source={source}
          compact
          label={`Citation ${display} preview`}
          onSelectSource={onSelectSource}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </span>
  );
}
