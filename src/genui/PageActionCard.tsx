import { CheckIcon, ShieldIcon } from '../icons/ApertureIcon.js';

export interface PageActionField {
  label: string;
  value: string;
}

export interface PageActionCardProps {
  title: string;
  subtitle?: string;
  fields: readonly PageActionField[];
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/** DOM form-fill / page mutation preview card requiring user approval (`GenUI.PageAction`). */
export function PageActionCard({
  title,
  subtitle = 'Only applied locally — nothing submitted yet',
  fields,
  cancelLabel = 'Cancel',
  confirmLabel = 'Apply',
  onCancel,
  onConfirm,
}: PageActionCardProps) {
  return (
    <div className="yui-genui-card">
      <div className="yui-genui-head">
        <div className="yui-genui-title-row">
          <span className="yui-icon-badge">
            <ShieldIcon size={14} />
          </span>
          <div>
            <div className="yui-genui-title">{title}</div>
            {subtitle ? <div className="yui-genui-muted">{subtitle}</div> : null}
          </div>
        </div>
      </div>

      <div className="yui-drawer-body">
        <div className="yui-entity-tile">
          {fields.map((field, idx) => (
            <div key={`${field.label}-${idx}`} className="yui-table-row">
              <span className="yui-genui-muted">{field.label} &middot;</span>
              <span className="yui-prompt-capsule-title">{field.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="yui-genui-foot">
        <span />
        <div className="yui-btn-row">
          <button type="button" className="yui-pill-btn" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="yui-pill-btn yui-pill-btn--primary" onClick={onConfirm}>
            <CheckIcon size={12} />
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
