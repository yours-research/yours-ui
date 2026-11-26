import { CheckIcon, ChecklistIcon, ComposeIcon, CopyIcon } from '../icons/ApertureIcon.js';

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface ChecklistCardProps {
  title: string;
  items: readonly ChecklistItem[];
  onToggleItem?: (id: string) => void;
  onCopy?: () => void;
  onDraftAction?: () => void;
  draftActionLabel?: string;
}

/** Interactive task checklist (`GenUI.Checklist`) with live completion progress bar. */
export function ChecklistCard({
  title,
  items,
  onToggleItem,
  onCopy,
  onDraftAction,
  draftActionLabel = 'Draft follow-up',
}: ChecklistCardProps) {
  const doneCount = items.filter((item) => item.done).length;
  const remaining = Math.max(0, items.length - doneCount);

  return (
    <div className="yui-genui-card">
      <div className="yui-genui-head">
        <div className="yui-genui-title-row">
          <ChecklistIcon size={14} />
          <span className="yui-genui-title">{title}</span>
        </div>
        <span className="yui-speed-readout">
          {doneCount} of {items.length}
        </span>
      </div>

      <progress
        className="yui-check-progress-track"
        max={Math.max(1, items.length)}
        value={doneCount}
      />

      <div className="yui-drawer-body">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="yui-check-item-row"
            aria-pressed={item.done}
            onClick={() => onToggleItem?.(item.id)}
          >
            <span className={item.done ? 'yui-check-circle is-done' : 'yui-check-circle'}>
              {item.done ? <CheckIcon size={10} /> : null}
            </span>
            <span className={item.done ? 'yui-genui-muted' : 'yui-prompt-capsule-title'}>
              {item.label}
            </span>
          </button>
        ))}
      </div>

      <div className="yui-genui-foot">
        <span className="yui-genui-muted">
          {remaining} item{remaining === 1 ? '' : 's'} remaining
        </span>
        <div className="yui-action-group">
          {onCopy ? (
            <button type="button" className="yui-micro-pill" onClick={onCopy}>
              <CopyIcon size={11} />
              <span>Copy</span>
            </button>
          ) : null}
          {onDraftAction ? (
            <button type="button" className="yui-micro-pill" onClick={onDraftAction}>
              <ComposeIcon size={11} />
              <span>{draftActionLabel}</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
