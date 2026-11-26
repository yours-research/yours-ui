import { useEffect, useRef, useState } from 'react';
import {
  ChevronDownIcon,
  ExternalLinkIcon,
  GlobeIcon,
  QuoteIcon,
  XIcon,
} from '../icons/ApertureIcon.js';
import { CardFooterChrome, CardHeaderChrome, cn } from './CardChrome.js';
import { StatusBadge } from './StatusBadge.js';

export interface PageSelectionCardProps {
  excerpt: string;
  origin: string;
  title?: string;
  pageTitle?: string;
  locator?: string;
  tokenEstimate?: string;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  expandable?: boolean;
  privacyNote?: string;
  locateLabel?: string;
  dismissLabel?: string;
  expandLabel?: string;
  collapseLabel?: string;
  onLocate?: () => void;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Minimalist Paper Page 9 pinned selection card showing an active-tab quote,
 * optional section/heading locator, 3-line clamp with Expand/Collapse toggle,
 * token budget estimate badge, and `Show on page` / `Remove` actions.
 */
export function PageSelectionCard({
  excerpt,
  origin,
  title = 'Pinned selection',
  pageTitle,
  locator,
  tokenEstimate,
  defaultExpanded = false,
  expanded: controlledExpanded,
  onExpandedChange,
  expandable,
  privacyNote = 'Local context · Active tab selection',
  locateLabel = 'Show on page',
  dismissLabel = 'Remove',
  expandLabel = 'Expand',
  collapseLabel = 'Collapse',
  onLocate,
  onDismiss,
  className,
}: PageSelectionCardProps) {
  const quoteRef = useRef<HTMLQuoteElement | null>(null);
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const [measuredOverflow, setMeasuredOverflow] = useState(false);

  const isExpanded = controlledExpanded ?? internalExpanded;

  useEffect(() => {
    const el = quoteRef.current;
    if (!el || isExpanded) return;
    const check = () => {
      setMeasuredOverflow(el.scrollHeight > el.clientHeight + 1);
    };
    check();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(check);
      ro.observe(el);
      return () => ro.disconnect();
    }
    return undefined;
  }, [excerpt, isExpanded]);

  const canToggle =
    expandable !== undefined ? expandable : measuredOverflow || isExpanded || excerpt.length > 135;

  const handleToggle = () => {
    const next = !isExpanded;
    if (controlledExpanded === undefined) {
      setInternalExpanded(next);
    }
    onExpandedChange?.(next);
  };

  const cardClass = cn('yui-card-shell yui-sel-card', className);

  return (
    <section
      data-slot="page-selection-card"
      data-expanded={isExpanded ? 'true' : 'false'}
      className={cardClass}
      aria-label={title}
    >
      <CardHeaderChrome
        icon={<QuoteIcon size={13} className="yui-privacy-icon" />}
        title={title}
        subtitle={pageTitle ?? origin}
        right={tokenEstimate ? <StatusBadge tone="neutral">{tokenEstimate}</StatusBadge> : null}
      />

      <div className="yui-col yui-well yui-sel-box">
        <div className="yui-row-between yui-wrap">
          <span className="yui-perm-domain">
            <GlobeIcon size={11} className="yui-privacy-icon" />
            <span className="yui-ellipsis">{origin}</span>
          </span>
          {locator ? <span className="yui-perm-rule">{locator}</span> : null}
        </div>

        <blockquote
          ref={quoteRef}
          data-slot="page-selection-quote"
          className={isExpanded ? 'yui-sel-quote' : 'yui-sel-quote is-clamped'}
        >
          {excerpt}
        </blockquote>

        {canToggle ? (
          <div className="yui-row">
            <button
              type="button"
              className="yui-perm-tertiary yui-sel-toggle"
              aria-expanded={isExpanded}
              onClick={handleToggle}
            >
              <span>{isExpanded ? collapseLabel : expandLabel}</span>
              <ChevronDownIcon
                size={12}
                className={isExpanded ? 'yui-recovery-chevron is-open' : 'yui-recovery-chevron'}
              />
            </button>
          </div>
        ) : null}
      </div>

      <CardFooterChrome privacyNote={privacyNote}>
        {onLocate || onDismiss ? (
          <div className="yui-action-group">
            {onLocate ? (
              <button
                type="button"
                className="yui-micro-pill"
                onClick={onLocate}
              >
                <ExternalLinkIcon size={10.5} />
                <span>{locateLabel}</span>
              </button>
            ) : null}
            {onDismiss ? (
              <button
                type="button"
                className="yui-micro-pill yui-storage-clear-btn"
                onClick={onDismiss}
                aria-label={`${dismissLabel} selection`}
              >
                <XIcon size={10.5} />
                <span>{dismissLabel}</span>
              </button>
            ) : null}
          </div>
        ) : null}
      </CardFooterChrome>
    </section>
  );
}
