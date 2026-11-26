import { XIcon } from '../icons/ApertureIcon.js';

export interface QuotedContextBannerProps {
  quote: string;
  onDismiss?: () => void;
}

/** Selected text quote block anchored at the top of the composer. */
export function QuotedContextBanner({ quote, onDismiss }: QuotedContextBannerProps) {
  return (
    <div className="yui-quote-banner">
      <div className="yui-quote-accent" aria-hidden="true" />
      <div className="yui-quote-text">{quote}</div>
      {onDismiss ? (
        <button
          type="button"
          className="yui-icon-btn"
          aria-label="Remove quote"
          onClick={onDismiss}
        >
          <XIcon size={12} />
        </button>
      ) : null}
    </div>
  );
}
