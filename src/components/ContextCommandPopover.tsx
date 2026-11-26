import { useEffect, useId, useState } from 'react';
import { ApertureIcon } from '../icons/ApertureIcon.js';
import type { ApertureIconName } from '../icons/iconData.js';
import { KbdHint } from './FeedbackPrimitives.js';

export interface ContextCommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: ApertureIconName;
  badge?: string;
  shortcut?: string | readonly string[];
  hasLiveDot?: boolean;
  disabled?: boolean;
}

export interface ContextCommandPopoverProps {
  open: boolean;
  items: readonly ContextCommandItem[];
  title?: string;
  trigger?: string;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  onSelect: (item: ContextCommandItem) => void;
  onClose?: () => void;
  floating?: boolean;
  emptyText?: string;
  className?: string;
}

function findNextEnabledIndex(
  items: readonly ContextCommandItem[],
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
 * Minimalist `@` context / `/` slash-command upward popover sheet designed
 * for `FloatingComposer` with keyboard navigation and `KbdHint` affordances.
 */
export function ContextCommandPopover({
  open,
  items,
  title = 'Context & commands',
  trigger,
  activeIndex: controlledIndex,
  onActiveIndexChange,
  onSelect,
  onClose,
  floating = false,
  emptyText = 'No matching commands',
  className,
}: ContextCommandPopoverProps) {
  const listboxId = useId();
  const [internalIndex, setInternalIndex] = useState<number>(() =>
    items.findIndex((item) => !item.disabled),
  );

  const rawIndex = controlledIndex ?? internalIndex;
  const resolvedIndex =
    rawIndex >= 0 && rawIndex < items.length && !items[rawIndex]?.disabled
      ? rawIndex
      : items.findIndex((item) => !item.disabled);

  const setHighlight = (nextIndex: number) => {
    if (controlledIndex === undefined) {
      setInternalIndex(nextIndex);
    }
    onActiveIndexChange?.(nextIndex);
  };

  useEffect(() => {
    if (!open) return;
    const firstValid = items.findIndex((item) => !item.disabled);
    if (controlledIndex === undefined) {
      setInternalIndex(firstValid);
    }
  }, [open, items.length, controlledIndex]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const next = findNextEnabledIndex(items, resolvedIndex < 0 ? -1 : resolvedIndex, 1);
        if (next !== -1) setHighlight(next);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const next = findNextEnabledIndex(items, resolvedIndex < 0 ? 0 : resolvedIndex, -1);
        if (next !== -1) setHighlight(next);
      } else if (event.key === 'Enter') {
        if (resolvedIndex >= 0 && items[resolvedIndex] && !items[resolvedIndex].disabled) {
          event.preventDefault();
          onSelect(items[resolvedIndex]);
        }
      } else if (event.key === 'Escape') {
        event.preventDefault();
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, items, resolvedIndex, onSelect, onClose]);

  if (!open) return null;

  const popoverClass = [
    'yui-cmd-popover',
    floating ? 'yui-cmd-popover--floating' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const activeItem = resolvedIndex >= 0 ? items[resolvedIndex] : undefined;

  return (
    <div
      data-slot="context-command-popover"
      className={popoverClass}
      role="dialog"
      aria-label={title}
    >
      <div className="yui-cmd-head">
        <span className="yui-cmd-head-title">
          {trigger ? <span className="yui-cmd-trigger-glyph">{trigger}</span> : null}
          <span>{title}</span>
        </span>
        <span className="yui-drawer-count">{items.length}</span>
      </div>

      {items.length === 0 ? (
        <div className="yui-cmd-empty">{emptyText}</div>
      ) : (
        <div
          id={listboxId}
          role="listbox"
          aria-label={title}
          aria-activedescendant={activeItem ? `${listboxId}-${activeItem.id}` : undefined}
          className="yui-cmd-list"
        >
          {items.map((item, idx) => {
            const active = idx === resolvedIndex && !item.disabled;
            const rowClass = [
              'yui-cmd-item',
              active ? 'is-active' : '',
              item.disabled ? 'is-disabled' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <button
                key={item.id}
                id={`${listboxId}-${item.id}`}
                type="button"
                role="option"
                aria-selected={active}
                aria-disabled={item.disabled || undefined}
                disabled={item.disabled}
                className={rowClass}
                onMouseEnter={() => {
                  if (!item.disabled) setHighlight(idx);
                }}
                onClick={() => {
                  if (!item.disabled) onSelect(item);
                }}
              >
                <span className="yui-cmd-item-left">
                  {item.hasLiveDot ? (
                    <span className="yui-status-dot yui-status-dot--sm" aria-hidden="true" />
                  ) : null}
                  {item.icon ? (
                    <ApertureIcon name={item.icon} size={13.5} className="yui-cmd-item-icon" />
                  ) : null}
                  <span className="yui-col-min">
                    <span className="yui-cmd-item-label">{item.label}</span>
                    {item.description ? (
                      <span className="yui-cmd-item-desc">{item.description}</span>
                    ) : null}
                  </span>
                </span>
                <span className="yui-action-group">
                  {item.badge ? <span className="yui-badge">{item.badge}</span> : null}
                  {item.shortcut ? <KbdHint keys={item.shortcut} size="xs" /> : null}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="yui-cmd-foot">
        <span className="yui-action-group">
          <KbdHint keys="↑↓" size="xs" />
          <span>Move</span>
        </span>
        <span className="yui-action-group">
          <KbdHint keys="↵" size="xs" />
          <span>Select</span>
        </span>
        <span className="yui-action-group">
          <KbdHint keys="Esc" size="xs" />
          <span>Close</span>
        </span>
      </div>
    </div>
  );
}
