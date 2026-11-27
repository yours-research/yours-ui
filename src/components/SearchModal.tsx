import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { ApertureIcon, SearchIcon } from '../icons/ApertureIcon.js';
import type { ApertureIconName } from '../icons/iconData.js';
import { YoursMark } from '../icons/YoursMark.js';
import { useFocusTrap } from '../utils/focus.js';
import { cn } from './CardChrome.js';
import { KbdHint } from './FeedbackPrimitives.js';

export interface SearchModalItem {
  id: string;
  label: string;
  description?: string;
  group?: string;
  icon?: ApertureIconName;
  preview?: ReactNode;
  keywords?: readonly string[];
  disabled?: boolean;
  onSelect?: () => void;
}

export interface SearchModalProps {
  open: boolean;
  items: readonly SearchModalItem[];
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  placeholder?: string;
  title?: string;
  emptyTitle?: string;
  emptySubtitle?: string;
  onSelectItem?: (item: SearchModalItem) => void;
  onClose?: () => void;
  className?: string;
}

function findNextEnabledItemIndex(
  items: readonly SearchModalItem[],
  startIndex: number,
  step: 1 | -1,
): number {
  if (items.length === 0) return -1;
  for (let offset = 1; offset <= items.length; offset++) {
    const idx = (startIndex + step * offset + items.length) % items.length;
    if (!items[idx]?.disabled) return idx;
  }
  return -1;
}

/**
 * Split-preview search modal (`⌘K`) matching Rare-UI visual hierarchy in Cotton Paper &
 * Obsidian: blurred scrim backdrop, live search input + `esc` pill, left grouped listbox
 * with `↗` active indicator, right recessed preview stage + details, and footer bar with
 * keycap hints and `YoursMark` result count. Zero inline styles.
 */
export function SearchModal({
  open,
  items,
  query: controlledQuery,
  defaultQuery = '',
  onQueryChange,
  placeholder = 'Search components',
  title = 'Search components',
  emptyTitle = 'No matching items',
  emptySubtitle = 'Try another keyword or clear the filter.',
  onSelectItem,
  onClose,
  className,
}: SearchModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const listboxId = useId();
  const [uncontrolledQuery, setUncontrolledQuery] = useState(defaultQuery);
  const [activeIndex, setActiveIndex] = useState(0);

  const resolvedQuery = controlledQuery ?? uncontrolledQuery;
  const setQuery = (next: string) => {
    if (controlledQuery === undefined) setUncontrolledQuery(next);
    onQueryChange?.(next);
  };

  useFocusTrap(dialogRef, open);

  const filteredItems = useMemo(() => {
    const q = resolvedQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      if (item.label.toLowerCase().includes(q)) return true;
      if (item.description?.toLowerCase().includes(q)) return true;
      if (item.group?.toLowerCase().includes(q)) return true;
      if (item.keywords?.some((kw) => kw.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [items, resolvedQuery]);

  const groupedSections = useMemo(() => {
    const map = new Map<string, { index: number; item: SearchModalItem }[]>();
    filteredItems.forEach((item, index) => {
      const groupName = item.group ?? '';
      const bucket = map.get(groupName);
      if (bucket) {
        bucket.push({ index, item });
      } else {
        map.set(groupName, [{ index, item }]);
      }
    });
    return Array.from(map.entries()).map(([group, entries]) => ({ group, entries }));
  }, [filteredItems]);

  const firstEnabledIdx = filteredItems.findIndex((item) => !item.disabled);
  const resolvedIndex =
    activeIndex >= 0 &&
    activeIndex < filteredItems.length &&
    !filteredItems[activeIndex]?.disabled
      ? activeIndex
      : firstEnabledIdx;

  const activeItem = resolvedIndex >= 0 ? filteredItems[resolvedIndex] : undefined;

  useEffect(() => {
    setActiveIndex(firstEnabledIdx);
  }, [resolvedQuery, open, firstEnabledIdx]);

  useEffect(() => {
    if (!open || !onClose) return;
    const onDocKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onDocKeyDown);
    return () => document.removeEventListener('keydown', onDocKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const triggerSelect = (item: SearchModalItem) => {
    if (item.disabled) return;
    item.onSelect?.();
    onSelectItem?.(item);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const next = findNextEnabledItemIndex(filteredItems, resolvedIndex < 0 ? -1 : resolvedIndex, 1);
      if (next !== -1) setActiveIndex(next);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const next = findNextEnabledItemIndex(filteredItems, resolvedIndex < 0 ? 0 : resolvedIndex, -1);
      if (next !== -1) setActiveIndex(next);
    } else if (event.key === 'Enter' && activeItem) {
      event.preventDefault();
      triggerSelect(activeItem);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onClose?.();
    }
  };

  return (
    <div
      data-slot="search-modal-scrim"
      className="yui-sm-scrim"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        ref={dialogRef}
        data-slot="search-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn('yui-sm-dialog', className)}
        onKeyDown={handleKeyDown}
      >
        <div className="yui-sm-search-row">
          <SearchIcon size={15} className="yui-palette-search-icon" />
          <input
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeItem ? `${listboxId}-${activeItem.id}` : undefined}
            aria-label={placeholder}
            placeholder={placeholder}
            value={resolvedQuery}
            className="yui-sm-input"
            onChange={(event) => setQuery(event.target.value)}
          />
          <button
            type="button"
            className="yui-sm-esc-btn"
            aria-label="Close search modal"
            onClick={onClose}
          >
            esc
          </button>
        </div>

        <div className="yui-sm-body">
          <div id={listboxId} role="listbox" aria-label={title} className="yui-sm-list">
            {filteredItems.length === 0 ? (
              <div className="yui-palette-empty" role="status">
                <div className="yui-palette-empty-title">{emptyTitle}</div>
                {emptySubtitle ? <div className="yui-palette-empty-sub">{emptySubtitle}</div> : null}
              </div>
            ) : (
              groupedSections.map(({ group, entries }) => (
                <div key={group || 'default'} className="yui-palette-group">
                  {group ? <div className="yui-sm-group-title">{group}</div> : null}
                  {entries.map(({ index, item }) => {
                    const isActive = index === resolvedIndex && !item.disabled;
                    return (
                      <button
                        key={item.id}
                        id={`${listboxId}-${item.id}`}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        aria-disabled={item.disabled || undefined}
                        disabled={item.disabled}
                        className={cn('yui-sm-row', isActive && 'is-active', item.disabled && 'is-disabled')}
                        onMouseEnter={() => {
                          if (!item.disabled) setActiveIndex(index);
                        }}
                        onClick={() => triggerSelect(item)}
                      >
                        <span className="yui-ellipsis yui-sm-row-label">{item.label}</span>
                        {isActive ? (
                          <span className="yui-sm-arrow" aria-hidden="true">
                            ↗
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          <div className="yui-sm-preview" aria-live="polite">
            {activeItem ? (
              <>
                <div className="yui-sm-stage">
                  {activeItem.preview ?? (
                    <ApertureIcon
                      name={activeItem.icon ?? 'search'}
                      size={36}
                      className="yui-sm-stage-icon"
                    />
                  )}
                </div>
                <div className="yui-col yui-col-5">
                  <div className="yui-sm-preview-title">{activeItem.label}</div>
                  {activeItem.description ? (
                    <p className="yui-sm-preview-desc">{activeItem.description}</p>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="yui-sm-stage">
                <SearchIcon size={28} className="yui-sm-stage-icon" />
              </div>
            )}
          </div>
        </div>

        <div className="yui-sm-foot">
          <span className="yui-row yui-gap-8 yui-wrap">
            <span className="yui-action-group">
              <KbdHint keys={['↑', '↓']} size="xs" />
              <span>navigate</span>
            </span>
            <span className="yui-action-group">
              <KbdHint keys="↵" size="xs" />
              <span>open</span>
            </span>
          </span>
          <span className="yui-row yui-gap-5 yui-sm-count">
            <YoursMark size={13} className="yui-sm-brand" />
            <span>{`${filteredItems.length} of ${items.length}`}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
