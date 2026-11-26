import { useEffect, useRef, useState } from 'react';
import { CheckIcon, CopyIcon, ExternalLinkIcon } from '../icons/ApertureIcon.js';
import type { InlineCitationSource } from './InlineCitationPopover.js';

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

  const rootClass = ['yui-card-shell', 'yui-fn-card', className].filter(Boolean).join(' ');

  return (
    <section
      data-slot="citation-footnote-list"
      className={rootClass}
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
          const rowClass = ['yui-fn-row', isActive ? 'is-active' : ''].filter(Boolean).join(' ');
          const metaParts = [item.domain, item.locator].filter(Boolean);

          return (
            <li
              key={item.id}
              className={rowClass}
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

                <button
                  type="button"
                  className="yui-micro-pill yui-fn-btn"
                  aria-label={`${copyLabel} ${item.index}`}
                  onClick={() => handleCopy(item)}
                >
                  {isCopied ? <CheckIcon size={11} /> : <CopyIcon size={11} />}
                  <span>{isCopied ? copiedLabel : copyLabel}</span>
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
