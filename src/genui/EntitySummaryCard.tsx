import { BookmarkIcon, ExternalLinkIcon } from '../icons/ApertureIcon.js';

export interface EntityField {
  label: string;
  value: string;
}

export interface EntitySummaryCardProps {
  title: string;
  subtitle?: string;
  tag?: string;
  fields: readonly EntityField[];
  onSave?: () => void;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
}

/** Structured entity summary card (`GenUI.EntitySummary`) with 2x2 metadata tiles. */
export function EntitySummaryCard({
  title,
  subtitle,
  tag,
  fields,
  onSave,
  primaryActionLabel = 'Open link',
  onPrimaryAction,
}: EntitySummaryCardProps) {
  return (
    <div className="yui-genui-card">
      <div className="yui-genui-head">
        <div className="yui-col-min">
          <div className="yui-genui-title">{title}</div>
          {subtitle ? <div className="yui-genui-muted">{subtitle}</div> : null}
        </div>
        {tag ? <span className="yui-badge">{tag}</span> : null}
      </div>

      <div className="yui-genui-body">
        <div className="yui-entity-grid">
          {fields.map((field, idx) => (
            <div key={`${field.label}-${idx}`} className="yui-entity-tile">
              <span className="yui-genui-muted">{field.label}</span>
              <strong className="yui-entity-val">{field.value}</strong>
            </div>
          ))}
        </div>
      </div>

      {onSave || onPrimaryAction ? (
        <div className="yui-genui-foot">
          {onSave ? (
            <button type="button" className="yui-micro-pill" onClick={onSave}>
              <BookmarkIcon size={11} />
              <span>Save</span>
            </button>
          ) : (
            <span />
          )}
          {onPrimaryAction ? (
            <button type="button" className="yui-pill-btn yui-pill-btn--primary" onClick={onPrimaryAction}>
              <span>{primaryActionLabel}</span>
              <ExternalLinkIcon size={11} />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
