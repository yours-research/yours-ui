import type { KeyboardEvent } from 'react';
import { GlobeIcon, ShieldIcon } from '../icons/ApertureIcon.js';

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
  const cardClass = ['yui-card-shell', 'yui-perm-card', className].filter(Boolean).join(' ');

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
      className={cardClass}
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

      <dl className="yui-perm-scope">
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
        ) : null}
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
