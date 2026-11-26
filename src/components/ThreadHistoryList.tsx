import { useMemo, useState } from 'react';
import { BookmarkIcon, TrashIcon, XIcon } from '../icons/ApertureIcon.js';

export interface ThreadHistoryItem {
  id: string;
  title: string;
  preview?: string;
  timestamp: string;
  turnCount?: number;
  groupLabel?: string;
  pinned?: boolean;
  badge?: string;
}

export interface ThreadHistoryListProps {
  items: readonly ThreadHistoryItem[];
  activeId?: string;
  onSelect: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onDelete?: (id: string) => void;
  emptyTitle?: string;
  emptySubtitle?: string;
  className?: string;
}

/**
 * Minimalist Paper Page 9 saved-conversations list for the History notch drawer,
 * supporting optional sticky date dividers (`Today`, `Yesterday`, `Earlier`),
 * active indicator, truncated preview, `tabular-nums` metadata, pin toggle, and
 * two-step inline delete confirmation.
 */
export function ThreadHistoryList({
  items,
  activeId,
  onSelect,
  onTogglePin,
  onDelete,
  emptyTitle = 'No saved conversations',
  emptySubtitle = 'Local threads will appear here as you ask on pages.',
  className,
}: ThreadHistoryListProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const sections = useMemo(() => {
    const groups: { label: string; entries: ThreadHistoryItem[] }[] = [];
    const byLabel = new Map<string, ThreadHistoryItem[]>();
    for (const item of items) {
      const label = item.groupLabel ?? '';
      const existing = byLabel.get(label);
      if (existing) {
        existing.push(item);
      } else {
        const bucket = [item];
        byLabel.set(label, bucket);
        groups.push({ label, entries: bucket });
      }
    }
    return groups;
  }, [items]);

  const rootClass = ['yui-th-root', className].filter(Boolean).join(' ');

  if (items.length === 0) {
    return (
      <div data-slot="thread-history-list" className={rootClass}>
        <div className="yui-th-empty" role="status">
          <div className="yui-th-empty-title">{emptyTitle}</div>
          <div className="yui-th-empty-sub">{emptySubtitle}</div>
        </div>
      </div>
    );
  }

  return (
    <div data-slot="thread-history-list" className={rootClass}>
      {sections.map((section) => (
        <div key={section.label || 'default'} className="yui-col-5 yui-th-group" data-slot="thread-history-group">
          {section.label ? (
            <div className="yui-th-group-head">
              <span className="yui-th-group-title">{section.label}</span>
              <span className="yui-th-group-count">{section.entries.length}</span>
            </div>
          ) : null}
          <ul className="yui-list-plain yui-th-list yui-div-list" role="list">
            {section.entries.map((item) => {
              const isActive = item.id === activeId;
              const isConfirming = confirmDeleteId === item.id;
              const rowClass = ['yui-th-row', isActive ? 'is-active' : ''].filter(Boolean).join(' ');
              const metaParts = [
                item.turnCount !== undefined
                  ? `${item.turnCount} ${item.turnCount === 1 ? 'turn' : 'turns'}`
                  : null,
                item.timestamp,
              ].filter(Boolean);

              return (
                <li
                  key={item.id}
                  className={rowClass}
                  data-thread-id={item.id}
                  data-active={isActive ? 'true' : 'false'}
                >
                  <button
                    type="button"
                    className="yui-th-main"
                    aria-current={isActive ? 'true' : undefined}
                    onClick={() => {
                      setConfirmDeleteId(null);
                      onSelect(item.id);
                    }}
                  >
                    <span className="yui-th-indicator" aria-hidden="true" />
                    <span className="yui-col-min">
                      <span className="yui-th-title-row">
                        <span className="yui-ellipsis yui-th-title">{item.title}</span>
                        {item.badge ? <span className="yui-th-badge">{item.badge}</span> : null}
                      </span>
                      {item.preview ? <span className="yui-ellipsis yui-th-preview">{item.preview}</span> : null}
                      <span className="yui-th-meta">{metaParts.join(' · ')}</span>
                    </span>
                  </button>

                  {(onTogglePin || onDelete) ? (
                    <div className="yui-action-group">
                      {isConfirming && onDelete ? (
                        <div className="yui-action-group" role="group" aria-label={`Delete options for ${item.title}`}>
                          <button
                            type="button"
                            className="yui-micro-pill yui-th-confirm-btn"
                            aria-label={`Confirm delete ${item.title}`}
                            onClick={() => {
                              setConfirmDeleteId(null);
                              onDelete(item.id);
                            }}
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            className="yui-icon-btn"
                            aria-label={`Cancel delete ${item.title}`}
                            onClick={() => setConfirmDeleteId(null)}
                          >
                            <XIcon size={11.5} />
                          </button>
                        </div>
                      ) : (
                        <>
                          {onTogglePin ? (
                            <button
                              type="button"
                              className={item.pinned ? 'yui-icon-btn yui-th-pin-btn is-pinned' : 'yui-icon-btn yui-th-pin-btn'}
                              aria-label={item.pinned ? `Unpin ${item.title}` : `Pin ${item.title}`}
                              aria-pressed={Boolean(item.pinned)}
                              onClick={() => {
                                setConfirmDeleteId(null);
                                onTogglePin(item.id);
                              }}
                            >
                              <BookmarkIcon size={12} />
                            </button>
                          ) : null}
                          {onDelete ? (
                            <button
                              type="button"
                              className="yui-icon-btn"
                              aria-label={`Delete ${item.title}`}
                              onClick={() => setConfirmDeleteId(item.id)}
                            >
                              <TrashIcon size={12} />
                            </button>
                          ) : null}
                        </>
                      )}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
