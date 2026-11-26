import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { BookmarkIcon, SearchIcon, XIcon } from '../icons/ApertureIcon.js';
import { KbdHint } from './KbdHint.js';

export interface PromptTemplateItem {
  id: string;
  command: string;
  title: string;
  description?: string;
  category?: string;
  pinned?: boolean;
  shortcut?: string | readonly string[];
}

export interface PromptTemplateListProps {
  items: readonly PromptTemplateItem[];
  onSelect: (item: PromptTemplateItem) => void;
  onTogglePin?: (id: string) => void;
  title?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  query?: string;
  onQueryChange?: (query: string) => void;
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
  emptyLabel?: string;
  className?: string;
}

/**
 * Reusable Paper Page 9 slash-command & local prompt template library with
 * category pills, optional search filter, pinned-first sorting, pin toggle,
 * and roving Up/Down/Home/End/Enter keyboard navigation.
 */
export function PromptTemplateList({
  items,
  onSelect,
  onTogglePin,
  title = 'Prompt templates',
  searchable = true,
  searchPlaceholder = 'Filter /commands or templates...',
  query: controlledQuery,
  onQueryChange,
  activeCategory: controlledCategory,
  onCategoryChange,
  emptyLabel = 'No matching templates.',
  className,
}: PromptTemplateListProps) {
  const [internalQuery, setInternalQuery] = useState('');
  const [internalCategory, setInternalCategory] = useState('All');
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const query = controlledQuery ?? internalQuery;
  const activeCategory = controlledCategory ?? internalCategory;

  const setQuery = (next: string) => {
    if (controlledQuery === undefined) setInternalQuery(next);
    onQueryChange?.(next);
  };

  const setCategory = (next: string) => {
    if (controlledCategory === undefined) setInternalCategory(next);
    onCategoryChange?.(next);
  };

  const categories = useMemo(() => {
    const found = new Set<string>();
    for (const item of items) {
      if (item.category) found.add(item.category);
    }
    return found.size > 0 ? ['All', ...Array.from(found)] : [];
  }, [items]);

  const visibleItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = items.filter((item) => {
      if (activeCategory !== 'All' && item.category !== activeCategory) return false;
      if (!needle) return true;
      return (
        item.command.toLowerCase().includes(needle) ||
        item.title.toLowerCase().includes(needle) ||
        (item.description?.toLowerCase().includes(needle) ?? false)
      );
    });
    return [...filtered].sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));
  }, [items, activeCategory, query]);

  const resolvedActiveIndex = Math.max(
    0,
    visibleItems.findIndex((item) => item.id === activeId),
  );

  const moveFocus = (nextIdx: number) => {
    const target = visibleItems[nextIdx];
    if (!target) return;
    setActiveId(target.id);
    buttonRefs.current[nextIdx]?.focus();
  };

  const handleListKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (visibleItems.length === 0) return;
    const focusedIdx =
      document.activeElement instanceof HTMLButtonElement
        ? buttonRefs.current.indexOf(document.activeElement)
        : -1;
    const baseIndex = focusedIdx >= 0 ? focusedIdx : resolvedActiveIndex;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveFocus((baseIndex + 1) % visibleItems.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveFocus((baseIndex - 1 + visibleItems.length) % visibleItems.length);
    } else if (event.key === 'Home') {
      event.preventDefault();
      moveFocus(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      moveFocus(visibleItems.length - 1);
    } else if (event.key === 'Enter' && document.activeElement instanceof HTMLElement) {
      if (document.activeElement.tagName === 'INPUT') {
        event.preventDefault();
        const item = visibleItems[baseIndex];
        if (item) onSelect(item);
      }
    }
  };

  const rootClass = ['yui-card-shell', 'yui-ptl-card', className].filter(Boolean).join(' ');

  return (
    <section
      data-slot="prompt-template-list"
      className={rootClass}
      aria-label={title}
      onKeyDown={handleListKeyDown}
    >
      <div className="yui-ptl-head">
        <span className="yui-ptl-title">{title}</span>
        <span className="yui-ptl-count">{visibleItems.length}</span>
      </div>

      {searchable ? (
        <div className="yui-row yui-well yui-ptl-search-wrap">
          <SearchIcon size={12.5} className="yui-privacy-icon" />
          <input
            type="search"
            className="yui-ptl-search"
            value={query}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query ? (
            <button
              type="button"
              className="yui-icon-btn"
              aria-label="Clear filter"
              onClick={() => setQuery('')}
            >
              <XIcon size={11} />
            </button>
          ) : null}
        </div>
      ) : null}

      {categories.length > 0 ? (
        <div className="yui-row yui-wrap" role="tablist" aria-label="Template categories">
          {categories.map((cat) => {
            const active = cat === activeCategory;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                className={active ? 'yui-micro-pill is-active' : 'yui-micro-pill'}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            );
          })}
        </div>
      ) : null}

      {visibleItems.length === 0 ? (
        <div className="yui-empty-box yui-ptl-empty" role="status">
          {emptyLabel}
        </div>
      ) : (
        <ul className="yui-list-plain yui-well yui-storage-list yui-div-list" role="listbox" aria-label={title}>
          {visibleItems.map((item, idx) => {
            const isSelected = idx === resolvedActiveIndex;
            const rowClass = ['yui-ptl-row', isSelected ? 'is-active' : '']
              .filter(Boolean)
              .join(' ');

            return (
              <li
                key={item.id}
                className={rowClass}
                data-template-id={item.id}
                data-pinned={item.pinned ? 'true' : 'false'}
              >
                <button
                  ref={(el) => {
                    buttonRefs.current[idx] = el;
                  }}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className="yui-ptl-main"
                  onFocus={() => setActiveId(item.id)}
                  onClick={() => {
                    setActiveId(item.id);
                    onSelect(item);
                  }}
                >
                  <div className="yui-row yui-wrap">
                    <span className="yui-ptl-cmd">{item.command}</span>
                    <span className="yui-ellipsis yui-ptl-item-title">{item.title}</span>
                    {item.shortcut ? (
                      <KbdHint keys={item.shortcut} size="xs" className="yui-ptl-kbd" />
                    ) : null}
                  </div>
                  {item.description ? (
                    <span className="yui-ellipsis yui-ptl-desc">{item.description}</span>
                  ) : null}
                </button>

                {onTogglePin ? (
                  <button
                    type="button"
                    className={
                      item.pinned ? 'yui-icon-btn yui-ptl-pin-btn is-pinned' : 'yui-icon-btn yui-ptl-pin-btn'
                    }
                    aria-pressed={Boolean(item.pinned)}
                    aria-label={item.pinned ? `Unpin ${item.title}` : `Pin ${item.title}`}
                    onClick={() => onTogglePin(item.id)}
                  >
                    <BookmarkIcon size={12} />
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
