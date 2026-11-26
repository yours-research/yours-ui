import { ArchiveIcon, PlusIcon, SearchIcon, TrashIcon } from '../icons/ApertureIcon.js';

export interface ThreadDrawerItem {
  id: string;
  title: string;
  updatedLabel?: string;
}

export interface ThreadHistoryDrawerProps {
  threads: readonly ThreadDrawerItem[];
  activeThreadId?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectThread: (id: string) => void;
  onNewThread: () => void;
  onArchiveThread?: (id: string) => void;
  onDeleteThread?: (id: string) => void;
  emptyText?: string;
}

/** Conversation search and management drawer card. */
export function ThreadHistoryDrawer({
  threads,
  activeThreadId,
  searchQuery,
  onSearchChange,
  onSelectThread,
  onNewThread,
  onArchiveThread,
  onDeleteThread,
  emptyText = 'No matching conversations',
}: ThreadHistoryDrawerProps) {
  return (
    <div className="yui-thread-drawer">
      <div className="yui-action-row">
        <div className="yui-drawer-search-left">
          <SearchIcon size={13} />
          <input
            type="text"
            className="yui-drawer-search-input"
            placeholder="Search conversations..."
            value={searchQuery}
            aria-label="Search conversations"
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <button type="button" className="yui-pill-btn yui-pill-btn--primary" onClick={onNewThread}>
          <PlusIcon size={12} />
          <span>New</span>
        </button>
      </div>

      <div className="yui-thread-list">
        {threads.length === 0 ? (
          <div className="yui-genui-muted">{emptyText}</div>
        ) : (
          threads.map((thread) => {
            const active = thread.id === activeThreadId;
            return (
              <div
                key={thread.id}
                className={active ? 'yui-thread-item is-active' : 'yui-thread-item'}
              >
                <button
                  type="button"
                  className="yui-thread-select-btn"
                  onClick={() => onSelectThread(thread.id)}
                >
                  <span className="yui-prompt-capsule-title">{thread.title}</span>
                </button>
                <div className="yui-action-group">
                {thread.updatedLabel ? (
                  <span className="yui-speed-readout">{thread.updatedLabel}</span>
                ) : null}
                {onArchiveThread ? (
                  <button
                    type="button"
                    className="yui-icon-btn"
                    aria-label={`Archive ${thread.title}`}
                    onClick={() => onArchiveThread(thread.id)}
                  >
                    <ArchiveIcon size={12} />
                  </button>
                ) : null}
                {onDeleteThread ? (
                  <button
                    type="button"
                    className="yui-icon-btn"
                    aria-label={`Delete ${thread.title}`}
                    onClick={() => onDeleteThread(thread.id)}
                  >
                    <TrashIcon size={12} />
                  </button>
                ) : null}
              </div>
            </div>
          );
        })
        )}
      </div>
    </div>
  );
}
