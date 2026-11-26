import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { GlobeIcon, ShieldIcon, TrashIcon, XIcon } from '../icons/ApertureIcon.js';
import { CardFooterChrome, CardHeaderChrome } from './CardChrome.js';
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
  confirmRevokeAll?: boolean;
  revokeAllConfirmLabel?: string;
  cancelLabel?: string;
  emptyLabel?: string;
  revokeLabel?: string;
  revokeAllLabel?: string;
  privacyNote?: string;
  className?: string;
}

/**
 * Local revocable per-origin permission ledger for Chrome side panels.
 * Stacks each origin cleanly above its `Off` / `Once` / `Site` segmented
 * controls across all widths and supports optional inline confirmation for `Revoke all`.
 */
export function SitePermissionsList({
  title = 'Site permissions',
  subtitle = 'Per-origin access ledger',
  badge,
  items,
  onModeChange,
  onRevoke,
  onRevokeAll,
  confirmRevokeAll = false,
  revokeAllConfirmLabel = 'Confirm revoke',
  cancelLabel = 'Cancel',
  emptyLabel = 'No sites approved — all requests ask first',
  revokeLabel = 'Revoke',
  revokeAllLabel = 'Revoke all',
  privacyNote = 'Local ledger only · Instant revoke',
  className,
}: SitePermissionsListProps) {
  const [confirmingAll, setConfirmingAll] = useState(false);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const revokeAllRef = useRef<HTMLButtonElement | null>(null);
  const returnFocusRef = useRef(false);

  useEffect(() => {
    if (confirmingAll) {
      cancelRef.current?.focus();
    } else if (returnFocusRef.current) {
      returnFocusRef.current = false;
      revokeAllRef.current?.focus();
    }
  }, [confirmingAll]);

  useEffect(() => {
    if (items.length === 0) setConfirmingAll(false);
  }, [items.length]);

  const dismissConfirm = () => {
    returnFocusRef.current = true;
    setConfirmingAll(false);
  };

  const handleConfirmKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      dismissConfirm();
    }
  };

  const activeCount = items.filter((item) => item.mode !== 'off').length;
  const badgeText = badge !== undefined ? badge : `${activeCount} active`;
  const cardClass = ['yui-card-shell', 'yui-sperm-card', className].filter(Boolean).join(' ');

  return (
    <section data-slot="site-permissions-list" className={cardClass} aria-label={title}>
      <CardHeaderChrome
        icon={<ShieldIcon size={13} className="yui-privacy-icon" />}
        title={title}
        subtitle={subtitle}
        right={
          badgeText ? (
            <StatusBadge tone={activeCount > 0 ? 'local' : 'neutral'} dot>
              {badgeText}
            </StatusBadge>
          ) : null
        }
      />

      {items.length === 0 ? (
        <div className="yui-empty-box" role="status">
          {emptyLabel}
        </div>
      ) : (
        <ul className="yui-list-plain yui-well yui-storage-list yui-div-list" role="list">
          {items.map((item) => (
            <li
              key={item.id}
              className="yui-col yui-audit-row"
              data-permission-id={item.id}
              data-mode={item.mode}
            >
              <div className="yui-sperm-top">
                <span className="yui-audit-target yui-sperm-origin">
                  <GlobeIcon size={11.5} className="yui-privacy-icon" />
                  <span className="yui-sperm-host">{item.origin}</span>
                </span>
                <div className="yui-row-between yui-wrap yui-w-full">
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

              <div className="yui-row-between yui-wrap">
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

      <CardFooterChrome privacyNote={privacyNote}>
        {onRevokeAll && items.length > 0 ? (
          confirmingAll ? (
            <div
              className="yui-action-group"
              role="group"
              aria-label={`Confirm ${revokeAllLabel}`}
              onKeyDown={handleConfirmKeyDown}
            >
              <button
                ref={cancelRef}
                type="button"
                className="yui-micro-pill"
                onClick={dismissConfirm}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                className="yui-micro-pill yui-micro-pill--danger"
                onClick={() => {
                  setConfirmingAll(false);
                  onRevokeAll();
                }}
              >
                <TrashIcon size={10.5} />
                <span>{revokeAllConfirmLabel}</span>
              </button>
            </div>
          ) : (
            <button
              ref={revokeAllRef}
              type="button"
              className="yui-micro-pill yui-storage-clear-btn"
              onClick={() => (confirmRevokeAll ? setConfirmingAll(true) : onRevokeAll())}
            >
              <TrashIcon size={10.5} />
              <span>{revokeAllLabel}</span>
            </button>
          )
        ) : null}
      </CardFooterChrome>
    </section>
  );
}
