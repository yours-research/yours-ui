import { UndoIcon, XIcon } from '../icons/ApertureIcon.js';
import { KbdHint } from './KbdHint.js';
import { StatusBadge, type StatusBadgeTone } from './StatusBadge.js';

export interface ShortcutItem {
  id?: string;
  label: string;
  description?: string;
  keys: string | readonly string[];
}

export interface ShortcutGroup {
  id?: string;
  title?: string;
  items: readonly ShortcutItem[];
}

export interface ShortcutSheetProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  groups?: readonly ShortcutGroup[];
  items?: readonly ShortcutItem[];
  className?: string;
}

/**
 * Compact Paper Page 9 keyboard shortcut reference sheet with hairline rows
 * and monochrome `KbdHint` keycaps sized cleanly for `340px`–`400px` side panels.
 */
export function ShortcutSheet({
  title = 'Keyboard shortcuts',
  subtitle,
  badge,
  groups,
  items,
  className,
}: ShortcutSheetProps) {
  const resolvedGroups: readonly ShortcutGroup[] =
    groups && groups.length > 0
      ? groups
      : items && items.length > 0
        ? [{ items }]
        : [];

  const cardClass = ['yui-shortcut-sheet', className].filter(Boolean).join(' ');

  return (
    <section data-slot="shortcut-sheet" className={cardClass} aria-label={title}>
      {title || subtitle || badge ? (
        <header className="yui-shortcut-head">
          <div className="yui-col-min">
            <div className="yui-setting-title-row">
              {title ? <h3 className="yui-genui-title">{title}</h3> : null}
              {badge ? <StatusBadge tone="neutral">{badge}</StatusBadge> : null}
            </div>
            {subtitle ? <p className="yui-genui-muted">{subtitle}</p> : null}
          </div>
        </header>
      ) : null}

      <div className="yui-shortcut-groups">
        {resolvedGroups.map((group, gIdx) => (
          <div key={group.id ?? group.title ?? gIdx} className="yui-shortcut-group">
            {group.title ? <div className="yui-shortcut-group-title">{group.title}</div> : null}
            <div className="yui-shortcut-list">
              {group.items.map((item, idx) => (
                <div key={item.id ?? `${item.label}-${idx}`} className="yui-shortcut-row">
                  <div className="yui-shortcut-copy">
                    <span className="yui-shortcut-label">{item.label}</span>
                    {item.description ? (
                      <span className="yui-shortcut-desc">{item.description}</span>
                    ) : null}
                  </div>
                  <KbdHint keys={item.keys} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export interface StatusToastProps {
  open?: boolean;
  message: string;
  detail?: string;
  tone?: StatusBadgeTone;
  undoLabel?: string;
  onUndo?: () => void;
  onDismiss?: () => void;
  dismissLabel?: string;
  className?: string;
}

/**
 * Ultra-quiet floating Cotton Paper / Obsidian Dark status and undo banner with
 * `role="status"` / `aria-live="polite"`, optional Undo pill, and zero inline styles.
 */
export function StatusToast({
  open = true,
  message,
  detail,
  tone = 'local',
  undoLabel = 'Undo',
  onUndo,
  onDismiss,
  dismissLabel = 'Dismiss notification',
  className,
}: StatusToastProps) {
  if (!open) return null;

  const toastClass = ['yui-status-toast', `yui-status-toast--${tone}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      data-slot="status-toast"
      data-tone={tone}
      role="status"
      aria-live="polite"
      className={toastClass}
    >
      <div className="yui-status-toast-main">
        <span className="yui-status-toast-dot" aria-hidden="true" />
        <div className="yui-status-toast-copy">
          <span className="yui-status-toast-msg">{message}</span>
          {detail ? <span className="yui-status-toast-detail">{detail}</span> : null}
        </div>
      </div>

      {onUndo || onDismiss ? (
        <div className="yui-status-toast-actions">
          {onUndo ? (
            <button type="button" className="yui-micro-pill" onClick={onUndo}>
              <UndoIcon size={11} />
              <span>{undoLabel}</span>
            </button>
          ) : null}
          {onDismiss ? (
            <button
              type="button"
              className="yui-icon-btn"
              aria-label={dismissLabel}
              onClick={onDismiss}
            >
              <XIcon size={12} />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
