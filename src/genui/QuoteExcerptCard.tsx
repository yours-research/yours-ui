import { CheckIcon, CopyIcon, ExternalLinkIcon, QuoteIcon } from '../icons/ApertureIcon.js';
import { useCopyFeedback } from '../utils/clipboard.js';

export interface QuoteExcerptCardProps {
  quote: string;
  sourceTitle: string;
  sourceDomain?: string;
  sourceUrl?: string;
  locator?: string;
  onJumpToSource?: () => void;
  onCopyQuote?: (quote: string) => void;
  jumpLabel?: string;
  copyLabel?: string;
  className?: string;
}

function isSafeHttpUrl(url?: string): boolean {
  if (!url) return false;
  return /^https?:\/\//i.test(url.trim());
}

/**
 * Tactile editorial quote card (`GenUI.QuoteExcerptCard`) for cited passages
 * from local tabs/documents with hairline left accent bar and source actions.
 */
export function QuoteExcerptCard({
  quote,
  sourceTitle,
  sourceDomain,
  sourceUrl,
  locator,
  onJumpToSource,
  onCopyQuote,
  jumpLabel = 'Jump to source',
  copyLabel = 'Copy quote',
  className,
}: QuoteExcerptCardProps) {
  const { copied, triggerCopy } = useCopyFeedback();
  const rootClass = ['yui-genui-card', className].filter(Boolean).join(' ');
  const safeHref = isSafeHttpUrl(sourceUrl) ? sourceUrl : undefined;
  const hasFooter = Boolean(onJumpToSource || safeHref || onCopyQuote);

  return (
    <section
      data-slot="quote-excerpt-card"
      className={rootClass}
      aria-label={sourceTitle}
    >
      <div className="yui-genui-head">
        <div className="yui-genui-title-row">
          <span className="yui-icon-badge" aria-hidden="true">
            <QuoteIcon size={13.5} />
          </span>
          <div className="yui-col-min">
            <h3 className="yui-genui-title">{sourceTitle}</h3>
            {sourceDomain ? <p className="yui-genui-muted">{sourceDomain}</p> : null}
          </div>
        </div>
        {locator ? <span className="yui-qec-locator">{locator}</span> : null}
      </div>

      <div className="yui-genui-body">
        <blockquote className="yui-qec-quote">{quote}</blockquote>
      </div>

      {hasFooter ? (
        <div className="yui-genui-foot">
          {onJumpToSource ? (
            <button type="button" className="yui-micro-pill" onClick={onJumpToSource}>
              <ExternalLinkIcon size={11} />
              <span>{jumpLabel}</span>
            </button>
          ) : safeHref ? (
            <a
              className="yui-micro-pill yui-qec-link"
              href={safeHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLinkIcon size={11} />
              <span>{jumpLabel}</span>
            </a>
          ) : (
            <span />
          )}

          {onCopyQuote ? (
            <button
              type="button"
              className="yui-micro-pill yui-qec-copy"
              onClick={() => {
                triggerCopy(quote);
                onCopyQuote(quote);
              }}
            >
              {copied ? <CheckIcon size={11} /> : <CopyIcon size={11} />}
              <span>{copied ? 'Copied' : copyLabel}</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
