import { useEffect, useId, useLayoutEffect, useRef, useState, type ComponentProps } from 'react';
import {
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  GlobeIcon,
} from '../icons/ApertureIcon.js';

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
  const pillClass = ['yui-citation-pill', active ? 'is-active' : '', className]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {index !== undefined ? <span className="yui-citation-index">{index}</span> : null}
      <span className="yui-citation-label">{label}</span>
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
      <div
        className={
          expanded
            ? 'yui-disclosure yui-disclosure--sources is-open'
            : 'yui-disclosure yui-disclosure--sources'
        }
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
                <div className="yui-source-row-main">
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
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nudgeAnimRef = useRef<Animation | undefined>(undefined);

  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(next);
    }
    onOpenChange?.(next);
  };

  const clearHoverTimer = () => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearHoverTimer();
      nudgeAnimRef.current?.cancel();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [isOpen]);

  // Keep grounded card inside narrow 340px-380px side panels without inline styles.
  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!isOpen || !card || typeof card.animate !== 'function') return;
    nudgeAnimRef.current?.cancel();
    const container = card.closest('.yui-shell, .yui-scroll-stage');
    const containerRect = container?.getBoundingClientRect();
    const minLeft = containerRect ? containerRect.left + 14 : 14;
    const maxRight = containerRect
      ? containerRect.right - 14
      : (typeof window !== 'undefined' && window.innerWidth > 0 ? window.innerWidth : 380) - 14;
    const rect = card.getBoundingClientRect();
    let dx = 0;
    if (rect.right > maxRight) {
      dx = maxRight - rect.right;
    } else if (rect.left < minLeft) {
      dx = minLeft - rect.left;
    }
    if (dx !== 0) {
      const shift = Math.round(dx);
      nudgeAnimRef.current = card.animate(
        [{ transform: `translateX(${shift}px)` }, { transform: `translateX(${shift}px)` }],
        { duration: 0, fill: 'forwards' },
      );
    }
  }, [isOpen]);

  const domainText = source.domain ?? source.label;
  const monogram = (domainText.trim()[0] || 'S').toUpperCase();
  const isExternal = Boolean(source.url && /^https?:/i.test(source.url));
  const wrapClass = ['yui-cite-wrap', className].filter(Boolean).join(' ');

  return (
    <span
      ref={wrapRef}
      data-slot="inline-citation-popover"
      className={wrapClass}
      onMouseEnter={() => {
        if (!hoverOpen) return;
        clearHoverTimer();
        if (controlledOpen === undefined) {
          setOpen(true);
        }
      }}
      onMouseLeave={() => {
        if (!hoverOpen || controlledOpen !== undefined) return;
        clearHoverTimer();
        closeTimerRef.current = setTimeout(() => setOpen(false), 120);
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
          <div className="yui-cite-head">
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
            <div className="yui-cite-foot">
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
