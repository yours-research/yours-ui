import { ShieldIcon } from '../icons/ApertureIcon.js';

export interface PermissionApprovalCardProps {
  title: string;
  description: string;
  ruleBadge?: string;
  approveLabel?: string;
  denyLabel?: string;
  onApprove: () => void;
  onDeny: () => void;
}

/**
 * Capability confirmation gate matching `@yours/guard` policy decisions
 * (`require_approval`, Lethal Trifecta breaker, and origin confirmations).
 */
export function PermissionApprovalCard({
  title,
  description,
  ruleBadge,
  approveLabel = 'Allow once',
  denyLabel = 'Decline',
  onApprove,
  onDeny,
}: PermissionApprovalCardProps) {
  return (
    <div className="yui-approval-card" role="alert">
      <div className="yui-approval-head">
        <div className="yui-icon-badge">
          <ShieldIcon size={14} />
        </div>
        <div>
          <div className="yui-prompt-capsule-title">{title}</div>
          <div className="yui-prompt-capsule-sub">{description}</div>
          {ruleBadge ? <span className="yui-badge">{ruleBadge}</span> : null}
        </div>
      </div>
      <div className="yui-btn-row">
        <button type="button" className="yui-pill-btn yui-pill-btn--ghost" onClick={onDeny}>
          {denyLabel}
        </button>
        <button type="button" className="yui-pill-btn yui-pill-btn--primary" onClick={onApprove}>
          {approveLabel}
        </button>
      </div>
    </div>
  );
}
