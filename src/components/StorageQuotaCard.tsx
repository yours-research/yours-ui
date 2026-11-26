import { CheckIcon, ShieldIcon, TrashIcon } from '../icons/ApertureIcon.js';
import { CardFooterChrome, CardHeaderChrome, CardSegmentBar, cn } from './CardChrome.js';

export type StorageEntryTone = 'weights' | 'vault' | 'history' | 'other';
export type StorageEntryStatus = 'idle' | 'verified' | 'verifying' | 'error';

export interface StorageQuotaEntry {
  id: string;
  label: string;
  detail?: string;
  sizeLabel: string;
  /** Percentage of total quota (`0`–`100`) represented in the SVG segment bar. */
  percent: number;
  tone?: StorageEntryTone;
  status?: StorageEntryStatus;
  statusLabel?: string;
  onVerify?: () => void;
  verifyLabel?: string;
  onClear?: () => void;
  clearLabel?: string;
}

export interface StorageQuotaCardProps {
  title?: string;
  subtitle?: string;
  usedLabel: string;
  quotaLabel: string;
  entries: readonly StorageQuotaEntry[];
  privacyNote?: string;
  onClearAll?: () => void;
  clearAllLabel?: string;
  className?: string;
}

/**
 * Tactile OPFS / IndexedDB storage quota card showing aggregate browser usage,
 * a zero-inline-style SVG segmented capacity bar, per-entry breakdown rows with
 * optional `Verify SHA-256` and `Clear` actions, and a local-only privacy footer.
 */
export function StorageQuotaCard({
  title = 'Browser storage',
  subtitle = 'OPFS & IndexedDB quota',
  usedLabel,
  quotaLabel,
  entries,
  privacyNote = '100% local browser storage',
  onClearAll,
  clearAllLabel = 'Clear cache',
  className,
}: StorageQuotaCardProps) {
  let cursor = 0;
  const segments = entries.map((entry) => {
    const width = Math.max(0, Math.min(100 - cursor, entry.percent));
    const segment = {
      id: entry.id,
      tone: entry.tone ?? 'other',
      x: cursor,
      width,
    };
    cursor += width;
    return segment;
  });

  const rootClass = cn('yui-card-shell yui-storage-card', className);

  return (
    <section data-slot="storage-quota-card" className={rootClass} aria-label={title}>
      <CardHeaderChrome
        title={title}
        subtitle={subtitle}
        right={
          <span className="yui-storage-quota-readout">
            <strong className="yui-storage-used">{usedLabel}</strong>
            <span className="yui-storage-total"> / {quotaLabel}</span>
          </span>
        }
      />

      <CardSegmentBar
        ariaLabel={`${title}: ${usedLabel} of ${quotaLabel}`}
        segments={segments.map((seg) => ({
          id: seg.id,
          x: seg.x,
          width: seg.width,
          className: `yui-storage-seg yui-storage-seg--${seg.tone}`,
        }))}
      />

      {entries.length > 0 ? (
        <ul className="yui-list-plain yui-well yui-storage-list yui-div-list" role="list">
          {entries.map((entry) => {
            const tone = entry.tone ?? 'other';
            const status = entry.status ?? 'idle';
            const verifyText =
              entry.verifyLabel ?? (status === 'verified' ? 'SHA-256 OK' : 'Verify SHA-256');
            const badgeText =
              entry.statusLabel ?? (status === 'verified' ? 'Verified' : undefined);

            return (
              <li
                key={entry.id}
                className="yui-col-5 yui-storage-row"
                data-storage-id={entry.id}
                data-status={status}
              >
                <div className="yui-storage-row-top">
                  <div className="yui-storage-row-lead">
                    <span
                      className={`yui-storage-dot yui-storage-dot--${tone}`}
                      aria-hidden="true"
                    />
                    <span className="yui-row yui-wrap yui-flex-1 yui-storage-row-title-wrap">
                      <span className="yui-storage-row-label">{entry.label}</span>
                      {badgeText ? (
                        <span
                          className={
                            status === 'verified'
                              ? 'yui-badge yui-storage-status is-verified'
                              : 'yui-badge yui-storage-status'
                          }
                        >
                          {status === 'verified' ? <CheckIcon size={10} /> : null}
                          <span>{badgeText}</span>
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <span className="yui-storage-row-size">{entry.sizeLabel}</span>
                </div>

                {entry.detail || entry.onVerify || entry.onClear ? (
                  <div className="yui-row yui-storage-row-sub">
                    {entry.detail ? (
                      <span className="yui-storage-row-detail">{entry.detail}</span>
                    ) : (
                      <span />
                    )}
                    {entry.onVerify || entry.onClear ? (
                      <div className="yui-action-group">
                        {entry.onVerify ? (
                          <button
                            type="button"
                            className={
                              status === 'verified'
                                ? 'yui-micro-pill yui-storage-action-btn is-active'
                                : 'yui-micro-pill yui-storage-action-btn'
                            }
                            onClick={entry.onVerify}
                          >
                            {status === 'verified' ? (
                              <CheckIcon size={10.5} />
                            ) : (
                              <ShieldIcon size={10.5} />
                            )}
                            <span>{verifyText}</span>
                          </button>
                        ) : null}
                        {entry.onClear ? (
                          <button
                            type="button"
                            className="yui-micro-pill yui-storage-clear-btn"
                            aria-label={`${entry.clearLabel ?? 'Clear'} ${entry.label}`}
                            onClick={entry.onClear}
                          >
                            <TrashIcon size={10.5} />
                            <span>{entry.clearLabel ?? 'Clear'}</span>
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}

      <CardFooterChrome privacyNote={privacyNote}>
        {onClearAll ? (
          <button type="button" className="yui-micro-pill yui-storage-clear-all" onClick={onClearAll}>
            <TrashIcon size={10.5} />
            <span>{clearAllLabel}</span>
          </button>
        ) : null}
      </CardFooterChrome>
    </section>
  );
}
