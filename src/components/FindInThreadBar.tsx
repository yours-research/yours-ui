import { useRef, useState } from 'react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  SearchIcon,
  XIcon,
} from '../icons/ApertureIcon.js';

export interface FindInThreadBarProps {
  open?: boolean;
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  /** Total matched occurrences for the current query. */
  totalMatches?: number;
  /** 1-based active match index (`1..totalMatches`). */
  currentMatch?: number;
  onPrev?: () => void;
  onNext?: () => void;
  caseSensitive?: boolean;
  onToggleCaseSensitive?: () => void;
  onClose?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

/**
 * Compact Paper Page 9 in-thread find bar (`Ctrl+F`) with `tabular-nums` match
 * counter, case-sensitivity `Aa` toggle, Prev/Next navigation, and `Escape` close.
 */
export function FindInThreadBar({
  open = true,
  query: controlledQuery,
  defaultQuery = '',
  onQueryChange,
  totalMatches,
  currentMatch = 1,
  onPrev,
  onNext,
  caseSensitive = false,
  onToggleCaseSensitive,
  onClose,
  placeholder = 'Find in thread...',
  autoFocus = false,
  className,
}: FindInThreadBarProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uncontrolledQuery, setUncontrolledQuery] = useState(defaultQuery);

  if (!open) return null;

  const resolvedQuery = controlledQuery ?? uncontrolledQuery;
  const setQuery = (next: string) => {
    if (controlledQuery === undefined) {
      setUncontrolledQuery(next);
    }
    onQueryChange?.(next);
  };

  const hasQuery = resolvedQuery.trim().length > 0;
  const safeTotal = Math.max(0, Math.round(totalMatches ?? 0));
  const safeCurrent =
    safeTotal > 0 ? Math.min(safeTotal, Math.max(1, Math.round(currentMatch))) : 0;
  const showStatus = hasQuery || totalMatches !== undefined;
  const hasMatches = safeTotal > 0;

  const rootClass = ['yui-find-bar', className].filter(Boolean).join(' ');

  return (
    <div
      data-slot="find-in-thread-bar"
      role="search"
      aria-label="Find in thread"
      className={rootClass}
    >
      <div className="yui-row yui-flex-1">
        <SearchIcon size={12.5} className="yui-privacy-icon" />
        <input
          ref={inputRef}
          type="search"
          className="yui-find-input"
          aria-label={placeholder}
          placeholder={placeholder}
          autoFocus={autoFocus}
          value={resolvedQuery}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              if (event.shiftKey) {
                onPrev?.();
              } else {
                onNext?.();
              }
            } else if (event.key === 'Escape') {
              event.preventDefault();
              onClose?.();
            }
          }}
        />
      </div>

      {showStatus ? (
        <span
          className={hasMatches ? 'yui-find-count' : 'yui-find-count is-empty'}
          aria-live="polite"
        >
          {hasMatches ? `${safeCurrent} / ${safeTotal}` : 'No matches'}
        </span>
      ) : null}

      <div className="yui-action-group">
        {onToggleCaseSensitive ? (
          <button
            type="button"
            className={caseSensitive ? 'yui-find-case-btn is-active' : 'yui-find-case-btn'}
            aria-pressed={caseSensitive}
            aria-label="Match case"
            title="Match case"
            onClick={onToggleCaseSensitive}
          >
            Aa
          </button>
        ) : null}
        <button
          type="button"
          className="yui-icon-btn yui-find-nav-btn"
          aria-label="Previous match"
          disabled={!hasMatches || !onPrev}
          onClick={onPrev}
        >
          <ChevronUpIcon size={12.5} />
        </button>
        <button
          type="button"
          className="yui-icon-btn yui-find-nav-btn"
          aria-label="Next match"
          disabled={!hasMatches || !onNext}
          onClick={onNext}
        >
          <ChevronDownIcon size={12.5} />
        </button>
        {onClose ? (
          <button
            type="button"
            className="yui-icon-btn yui-find-close-btn"
            aria-label="Close find bar"
            onClick={onClose}
          >
            <XIcon size={12.5} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
