import { GlobeIcon, PageIcon, XIcon } from '../icons/ApertureIcon.js';

export type TabContextKind = 'tab' | 'snippet';

export interface TabContextItem {
  id: string;
  domain: string;
  title: string;
  tokenLabel: string;
  kind?: TabContextKind;
  muted?: boolean;
}

export interface TabContextListProps {
  items: readonly TabContextItem[];
  onToggleMute?: (id: string) => void;
  onDetach?: (id: string) => void;
  onSelect?: (item: TabContextItem) => void;
  emptyLabel?: string;
  className?: string;
}

/**
 * Minimalist Paper Page 9 row list for attached browser tabs and page snippets
 * inside `FloatingContextSheet`, showing origin icon, domain + truncated title,
 * `tabular-nums` token budget, and quiet mute/detach actions.
 */
export function TabContextList({
  items,
  onToggleMute,
  onDetach,
  onSelect,
  emptyLabel = 'No tabs or snippets attached.',
  className,
}: TabContextListProps) {
  const listClass = ['yui-tabctx-list', className].filter(Boolean).join(' ');

  if (items.length === 0) {
    return (
      <div data-slot="tab-context-list" className={listClass} role="status">
        <div className="yui-tabctx-empty">{emptyLabel}</div>
      </div>
    );
  }

  return (
    <ul data-slot="tab-context-list" className={listClass} role="list">
      {items.map((item) => {
        const isSnippet = item.kind === 'snippet';
        const rowClass = ['yui-tabctx-row', item.muted ? 'is-muted' : '']
          .filter(Boolean)
          .join(' ');

        const body = (
          <span className="yui-tabctx-left">
            <span className="yui-tabctx-icon" aria-hidden="true">
              {isSnippet ? <PageIcon size={13} /> : <GlobeIcon size={13} />}
            </span>
            <span className="yui-col-min">
              <span className="yui-tabctx-domain-row">
                <span className="yui-tabctx-domain">{item.domain}</span>
                {isSnippet ? <span className="yui-tabctx-kind">Snippet</span> : null}
              </span>
              <span className="yui-tabctx-title">{item.title}</span>
            </span>
          </span>
        );

        return (
          <li
            key={item.id}
            className={rowClass}
            data-tab-id={item.id}
            data-muted={item.muted ? 'true' : 'false'}
          >
            {onSelect ? (
              <button
                type="button"
                className="yui-tabctx-main-btn"
                onClick={() => onSelect(item)}
              >
                {body}
              </button>
            ) : (
              <div className="yui-tabctx-main">{body}</div>
            )}

            <div className="yui-tabctx-right">
              <span className="yui-tabctx-tok">{item.tokenLabel}</span>
              {onToggleMute ? (
                <button
                  type="button"
                  className={item.muted ? 'yui-tabctx-mute-btn is-muted' : 'yui-tabctx-mute-btn'}
                  aria-pressed={Boolean(item.muted)}
                  aria-label={item.muted ? `Unmute ${item.domain}` : `Mute ${item.domain}`}
                  onClick={() => onToggleMute(item.id)}
                >
                  {item.muted ? 'Muted' : 'Mute'}
                </button>
              ) : null}
              {onDetach ? (
                <button
                  type="button"
                  className="yui-icon-btn"
                  aria-label={`Detach ${item.domain}`}
                  onClick={() => onDetach(item.id)}
                >
                  <XIcon size={11.5} />
                </button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
