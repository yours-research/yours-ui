import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ApertureIcon, SearchIcon, XIcon } from '../icons/ApertureIcon.js';
import type { ApertureIconName } from '../icons/iconData.js';
import { useFocusTrap } from '../utils/focusTrap.js';
import { KbdHint } from './KbdHint.js';

export interface CommandPaletteAction {
  id: string;
  label: string;
  description?: string;
  group?: string;
  icon?: ApertureIconName;
  shortcut?: string | readonly string[];
  keywords?: readonly string[];
  badge?: string;
  disabled?: boolean;
  onSelect?: () => void;
}

export interface CommandPaletteProps {
  open: boolean;
  actions: readonly CommandPaletteAction[];
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  placeholder?: string;
  title?: string;
  emptyTitle?: string;
  emptySubtitle?: string;
  onSelectAction?: (action: CommandPaletteAction) => void;
  onClose?: () => void;
  className?: string;
}

function findNextEnabledIndex(
  items: readonly CommandPaletteAction[],
  startIndex: number,
  step: 1 | -1,
): number {
  if (items.length === 0) return -1;
  for (let offset = 1; offset <= items.length; offset++) {
    const idx = (startIndex + step * offset + items.length) % items.length;
    if (!items[idx]?.disabled) {
      return idx;
    }
  }
  return -1;
}

/**
 * Minimalist Paper Page 9 command palette overlay with grouped action rows,
 * live filtering, keyboard focus trap (`aria-activedescendant`, Arrow/Enter/Esc),
 * and right-aligned `KbdHint` shortcuts without inline styles.
 */
export function CommandPalette({
  open,
  actions,
  query: controlledQuery,
  defaultQuery = '',
  onQueryChange,
  placeholder = 'Search commands, tabs, or local models...',
  title = 'Command palette',
  emptyTitle = 'No matching commands',
  emptySubtitle = 'Try searching for a model, tab, or local action.',
  onSelectAction,
  onClose,
  className,
}: CommandPaletteProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const listboxId = useId();
  const [uncontrolledQuery, setUncontrolledQuery] = useState(defaultQuery);
  const [activeIndex, setActiveIndex] = useState(0);

  const resolvedQuery = controlledQuery ?? uncontrolledQuery;

  const setQuery = (next: string) => {
    if (controlledQuery === undefined) {
      setUncontrolledQuery(next);
    }
    onQueryChange?.(next);
  };

  useFocusTrap(dialogRef, open);

  const filteredActions = useMemo(() => {
    const q = resolvedQuery.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter((item) => {
      if (item.label.toLowerCase().includes(q)) return true;
      if (item.description?.toLowerCase().includes(q)) return true;
      if (item.group?.toLowerCase().includes(q)) return true;
      if (item.keywords?.some((kw) => kw.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [actions, resolvedQuery]);

  const groupedSections = useMemo(() => {
    const map = new Map<string, { index: number; action: CommandPaletteAction }[]>();
    filteredActions.forEach((action, idx) => {
      const groupName = action.group ?? '';
      const bucket = map.get(groupName);
      if (bucket) {
        bucket.push({ index: idx, action });
      } else {
        map.set(groupName, [{ index: idx, action }]);
      }
    });
    return Array.from(map.entries()).map(([group, entries]) => ({ group, entries }));
  }, [filteredActions]);

  const firstEnabledIdx = filteredActions.findIndex((item) => !item.disabled);
  const resolvedIndex =
    activeIndex >= 0 &&
    activeIndex < filteredActions.length &&
    !filteredActions[activeIndex]?.disabled
      ? activeIndex
      : firstEnabledIdx;

  const activeAction = resolvedIndex >= 0 ? filteredActions[resolvedIndex] : undefined;

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

  const triggerSelect = (action: CommandPaletteAction) => {
    if (action.disabled) return;
    action.onSelect?.();
    onSelectAction?.(action);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const next = findNextEnabledIndex(
        filteredActions,
        resolvedIndex < 0 ? -1 : resolvedIndex,
        1,
      );
      if (next !== -1) setActiveIndex(next);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const next = findNextEnabledIndex(
        filteredActions,
        resolvedIndex < 0 ? 0 : resolvedIndex,
        -1,
      );
      if (next !== -1) setActiveIndex(next);
    } else if (event.key === 'Enter' && activeAction) {
      event.preventDefault();
      triggerSelect(activeAction);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onClose?.();
    }
  };

  const cardClass = ['yui-cmd-panel', 'yui-palette-card', className].filter(Boolean).join(' ');

  return (
    <div
      ref={dialogRef}
      data-slot="command-palette"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className={cardClass}
      onKeyDown={handleKeyDown}
    >
      <div className="yui-palette-search-row">
        <SearchIcon size={13.5} className="yui-palette-search-icon" />
        <input
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeAction ? `${listboxId}-${activeAction.id}` : undefined
          }
          aria-label={placeholder}
          placeholder={placeholder}
          value={resolvedQuery}
          className="yui-palette-input"
          onChange={(event) => setQuery(event.target.value)}
        />
        {resolvedQuery ? (
          <button
            type="button"
            className="yui-icon-btn"
            aria-label="Clear search query"
            onClick={() => setQuery('')}
          >
            <XIcon size={12} />
          </button>
        ) : onClose ? (
          <button
            type="button"
            className="yui-icon-btn"
            aria-label="Close command palette"
            onClick={onClose}
          >
            <XIcon size={12} />
          </button>
        ) : null}
      </div>

      {filteredActions.length === 0 ? (
        <div className="yui-palette-empty" role="status">
          <div className="yui-palette-empty-title">{emptyTitle}</div>
          {emptySubtitle ? <div className="yui-palette-empty-sub">{emptySubtitle}</div> : null}
        </div>
      ) : (
        <div id={listboxId} role="listbox" aria-label={title} className="yui-palette-list">
          {groupedSections.map(({ group, entries }) => (
            <div key={group || 'default'} className="yui-palette-group">
              {group ? <div className="yui-palette-group-title">{group}</div> : null}
              {entries.map(({ index, action }) => {
                const isActive = index === resolvedIndex && !action.disabled;
                const rowClass = [
                  'yui-cmd-item',
                  isActive ? 'is-active' : '',
                  action.disabled ? 'is-disabled' : '',
                ]
                  .filter(Boolean)
                  .join(' ');
                return (
                  <button
                    key={action.id}
                    id={`${listboxId}-${action.id}`}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    aria-disabled={action.disabled || undefined}
                    disabled={action.disabled}
                    className={rowClass}
                    onMouseEnter={() => {
                      if (!action.disabled) setActiveIndex(index);
                    }}
                    onClick={() => triggerSelect(action)}
                  >
                    <span className="yui-cmd-item-left">
                      {action.icon ? (
                        <ApertureIcon
                          name={action.icon}
                          size={13.5}
                          className="yui-cmd-item-icon"
                        />
                      ) : null}
                      <span className="yui-col-min">
                        <span className="yui-cmd-item-label">{action.label}</span>
                        {action.description ? (
                          <span className="yui-cmd-item-desc">{action.description}</span>
                        ) : null}
                      </span>
                    </span>
                    <span className="yui-cmd-item-right">
                      {action.badge ? <span className="yui-badge">{action.badge}</span> : null}
                      {action.shortcut ? <KbdHint keys={action.shortcut} /> : null}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      <div className="yui-cmd-foot">
        <span className="yui-cmd-foot-hint">
          <KbdHint keys={['↑', '↓']} />
          <span>Navigate</span>
        </span>
        <span className="yui-cmd-foot-hint">
          <KbdHint keys="↵" />
          <span>Run</span>
        </span>
        <span className="yui-cmd-foot-hint">
          <KbdHint keys="Esc" />
          <span>Close</span>
        </span>
      </div>
    </div>
  );
}
