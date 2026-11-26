import { GlobeIcon, ShieldIcon, TrashIcon, XIcon } from '../icons/ApertureIcon.js';
import { SegmentedControl } from './SegmentedControl.js';
import { StatusBadge } from './StatusBadge.js';

export type SitePermissionMode = 'off' | 'once' | 'site';

export interface SitePermissionItem {
  id: string;
  origin: string;
  scope: string;
  mode: SitePermissionMode;
  lastUsedLabel?: string;
  lockedReason?: string;
}

export interface SitePermissionsListProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  items: readonly SitePermissionItem[];
  onModeChange?: (id: string, mode: SitePermissionMode) => void;
  onRevoke?: (id: string) => void;
  onRevokeAll?: () => void;
  emptyLabel?: string;
  revokeLabel?: string;
  revokeAllLabel?: string;
  privacyNote?: string;
  className?: string;
}

/**
 * Local revocable per-origin permission ledger for Chrome side panels.
 * Lets users switch each origin between `Off`, `Once`, and `Site` (with
 * optional `lockedReason` disabling persistent site-wide access on sensitive flows).
 */
export function SitePermissionsList({
  title = 'Site permissions',
  subtitle = 'Per-origin access ledger',
  badge,
  items,
  onModeChange,
  onRevoke,
  onRevokeAll,
  emptyLabel = 'No sites approved — all requests ask first',
  revokeLabel = 'Revoke',
  revokeAllLabel = 'Revoke all',
  privacyNote = 'Local ledger only · Instant revoke',
  className,
}: SitePermissionsListProps) {
  const activeCount = items.filter((item) => item.mode !== 'off').length;
  const badgeText = badge !== undefined ? badge : `${activeCount} active`;
  const cardClass = ['yui-sperm-card', className].filter(Boolean).join(' ');

  return (
    <section data-slot="site-permissions-list" className={cardClass} aria-label={title}>
      <header className="yui-params-head">
        <div className="yui-col-min">
          <div className="yui-setting-title-row">
            <ShieldIcon size={13} className="yui-privacy-icon" />
            <h3 className="yui-genui-title">{title}</h3>
          </div>
          {subtitle ? <p className="yui-genui-muted">{subtitle}</p> : null}
        </div>
        {badgeText ? (
          <StatusBadge tone={activeCount > 0 ? 'local' : 'neutral'} dot>
            {badgeText}
          </StatusBadge>
        ) : null}
      </header>

      {items.length === 0 ? (
        <div className="yui-audit-empty" role="status">
          {emptyLabel}
        </div>
      ) : (
        <ul className="yui-storage-list" role="list">
          {items.map((item) => (
            <li
              key={item.id}
              className="yui-audit-row"
              data-permission-id={item.id}
              data-mode={item.mode}
            >
              <div className="yui-audit-row-top yui-sperm-top">
                <span className="yui-audit-target yui-sperm-origin">
                  <GlobeIcon size={11.5} className="yui-privacy-icon" />
                  <span className="yui-sperm-host">{item.origin}</span>
                </span>
                <div className="yui-storage-row-actions">
                  <SegmentedControl<SitePermissionMode>
                    size="sm"
                    ariaLabel={`${item.origin} permission mode`}
                    options={[
                      { value: 'off', label: 'Off' },
                      { value: 'once', label: 'Once' },
                      {
                        value: 'site',
                        label: 'Site',
                        disabled: Boolean(item.lockedReason),
                      },
                    ]}
                    value={item.mode}
                    onChange={(nextMode) => onModeChange?.(item.id, nextMode)}
                  />
                  {onRevoke ? (
                    <button
                      type="button"
                      className="yui-micro-pill yui-storage-clear-btn"
                      onClick={() => onRevoke(item.id)}
                      aria-label={`${revokeLabel} ${item.origin}`}
                    >
                      <XIcon size={10} />
                      <span>{revokeLabel}</span>
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="yui-audit-row-sub">
                <span className="yui-audit-detail">{item.scope}</span>
                {item.lastUsedLabel ? (
                  <span className="yui-audit-time">{item.lastUsedLabel}</span>
                ) : null}
              </div>

              {item.lockedReason ? (
                <p className="yui-sperm-lock" role="note">
                  {item.lockedReason}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <footer className="yui-storage-foot">
        <span className="yui-storage-privacy">
          <ShieldIcon size={11} className="yui-privacy-icon" />
          <span>{privacyNote}</span>
        </span>
        {onRevokeAll && items.length > 0 ? (
          <button
            type="button"
            className="yui-micro-pill yui-storage-clear-btn"
            onClick={onRevokeAll}
          >
            <TrashIcon size={10.5} />
            <span>{revokeAllLabel}</span>
          </button>
        ) : null}
      </footer>
    </section>
  );
}
