import type { KeyboardEvent } from 'react';
import { GlobeIcon, ShieldIcon } from '../icons/ApertureIcon.js';
import { cn } from '../utils/clipboard.js';

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
      <div className="yui-row-start yui-gap-8">
        <div className="yui-icon-badge">
          <ShieldIcon size={14} />
        </div>
        <div className="yui-col-min">
          <div className="yui-prompt-capsule-title">{title}</div>
          <div className="yui-prompt-capsule-sub">{description}</div>
          {ruleBadge ? (
            <div className="yui-pt-2">
              <span className="yui-badge">{ruleBadge}</span>
            </div>
          ) : null}
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

export interface PermissionCardProps {
  title: string;
  domain: string;
  scope: string;
  reason?: string;
  ruleLabel?: string;
  allowOnceLabel?: string;
  denyLabel?: string;
  alwaysSiteLabel?: string;
  onAllowOnce: () => void;
  onDeny: () => void;
  onAlwaysSite?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Calm, non-modal Paper Page 9 inline approval slip for `@yours/guard` /
 * Lethal Trifecta capability confirmations (`Allow once`, `Deny`, and optional
 * quiet `Always for this site` tertiary option). Supports Enter/Escape keyboard flow.
 */
export function PermissionCard({
  title,
  domain,
  scope,
  reason,
  ruleLabel,
  allowOnceLabel = 'Allow once',
  denyLabel = 'Deny',
  alwaysSiteLabel = 'Always for this site',
  onAllowOnce,
  onDeny,
  onAlwaysSite,
  disabled = false,
  className,
}: PermissionCardProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (disabled) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      onDeny();
      return;
    }
    if (event.key === 'Enter' && event.target === event.currentTarget) {
      event.preventDefault();
      onAllowOnce();
    }
  };

  return (
    <section
      data-slot="permission-card"
      role="region"
      aria-label={title}
      tabIndex={disabled ? -1 : 0}
      className={cn('yui-card-shell yui-perm-card', className)}
      onKeyDown={handleKeyDown}
    >
      <div className="yui-perm-head">
        <span className="yui-perm-icon" aria-hidden="true">
          <ShieldIcon size={14} />
        </span>
        <div className="yui-col-min">
          <div className="yui-row yui-wrap">
            <h3 className="yui-perm-title">{title}</h3>
            {ruleLabel ? <span className="yui-perm-rule">{ruleLabel}</span> : null}
          </div>
          {reason ? <p className="yui-perm-reason">{reason}</p> : null}
        </div>
      </div>

      <dl className="yui-well yui-col-5 yui-m-0">
        <div className="yui-perm-meta-row">
          <dt className="yui-perm-meta-label">Domain</dt>
          <dd className="yui-perm-meta-val yui-perm-domain">
            <GlobeIcon size={11.5} className="yui-privacy-icon" />
            <span>{domain}</span>
          </dd>
        </div>
        <div className="yui-perm-meta-row">
          <dt className="yui-perm-meta-label">Scope</dt>
          <dd className="yui-perm-meta-val">{scope}</dd>
        </div>
      </dl>

      <div className="yui-row-between yui-wrap">
        {onAlwaysSite ? (
          <button
            type="button"
            className="yui-perm-tertiary"
            disabled={disabled}
            onClick={onAlwaysSite}
          >
            {alwaysSiteLabel}
          </button>
        ) : (
          <span />
        )}
        <div className="yui-action-group">
          <button
            type="button"
            className="yui-pill-btn yui-perm-deny-btn"
            disabled={disabled}
            onClick={onDeny}
          >
            {denyLabel}
          </button>
          <button
            type="button"
            className="yui-pill-btn yui-pill-btn--primary"
            disabled={disabled}
            onClick={onAllowOnce}
          >
            {allowOnceLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
