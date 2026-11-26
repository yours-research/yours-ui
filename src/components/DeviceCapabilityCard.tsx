import { AlertIcon, CheckIcon, LocalDeviceIcon, RetryIcon, XIcon } from '../icons/ApertureIcon.js';
import { CardFooterChrome, CardHeaderChrome, CardSegmentBar, cn } from './CardChrome.js';
import { StatusBadge, type StatusBadgeTone } from './FeedbackPrimitives.js';

export type DeviceCapabilityStatus = 'ready' | 'tight' | 'unsupported';

export interface DeviceCapabilityRow {
  id: string;
  label: string;
  value: string;
  status?: DeviceCapabilityStatus;
  statusLabel?: string;
}

export interface DeviceCapabilityHeadroom {
  usedGb: number;
  freeGb: number;
  neededGb: number;
  totalGb?: number;
  unitLabel?: string;
}

export interface DeviceCapabilityTierOption {
  id: string;
  label: string;
  detail?: string;
  recommended?: boolean;
  disabled?: boolean;
}

export interface DeviceCapabilityCardProps {
  title?: string;
  subtitle?: string;
  status?: DeviceCapabilityStatus;
  statusLabel?: string;
  adapterName?: string;
  vramLabel?: string;
  ramLabel?: string;
  diskLabel?: string;
  rows?: readonly DeviceCapabilityRow[];
  headroom?: DeviceCapabilityHeadroom;
  tiers?: readonly DeviceCapabilityTierOption[];
  selectedTierId?: string;
  privacyNote?: string;
  recheckLabel?: string;
  rechecking?: boolean;
  onSelectTier?: (tierId: string) => void;
  onRecheck?: () => void;
  className?: string;
}

const META: Record<
  DeviceCapabilityStatus,
  readonly [StatusBadgeTone, string, string, typeof CheckIcon]
> = {
  ready: ['local', 'is-local', 'Ready', CheckIcon],
  tight: ['amber', 'is-allowed-once', 'Tight fit', AlertIcon],
  unsupported: ['danger', 'is-blocked', 'Unsupported', XIcon],
};

/**
 * Compact local WebGPU hardware readiness and model-fit preflight card displaying
 * adapter/VRAM/RAM/OPFS disk metrics paired with non-color-only status indicators,
 * optional GPU headroom meter, recommended tier quick actions, and `Re-check`.
 */
export function DeviceCapabilityCard({
  title = 'Local WebGPU readiness',
  subtitle = 'On-device adapter & storage preflight',
  status = 'ready',
  statusLabel,
  adapterName,
  vramLabel,
  ramLabel,
  diskLabel,
  rows,
  headroom,
  tiers,
  selectedTierId,
  privacyNote = 'Local WebGPU probe · Zero telemetry',
  recheckLabel = 'Re-check',
  rechecking = false,
  onSelectTier,
  onRecheck,
  className,
}: DeviceCapabilityCardProps) {
  const specs: Array<[string, string, string | undefined, DeviceCapabilityStatus?]> = [
    ['adapter', 'WebGPU adapter', adapterName, status],
    ['vram', 'VRAM / GPU', vramLabel],
    ['ram', 'System RAM', ramLabel],
    ['disk', 'OPFS free disk', diskLabel],
  ];
  const resolvedRows: readonly DeviceCapabilityRow[] =
    rows && rows.length > 0
      ? rows
      : specs
          .filter((s): s is [string, string, string, DeviceCapabilityStatus?] => Boolean(s[2]))
          .map(([id, label, value, st]) => ({ id, label, value, status: st }));

  const [tone, , defaultLabel, StatusGlyph] = META[status];
  const cardClass = cn('yui-card-shell yui-card-pad yui-devcap-card', `is-${status}`, className);

  const unit = headroom?.unitLabel ?? 'GB';
  const total = headroom ? Math.max(0.1, headroom.totalGb ?? headroom.usedGb + headroom.freeGb) : 1;
  const usedW = headroom ? Math.max(0, Math.min(100, (headroom.usedGb / total) * 100)) : 0;
  const needW = headroom
    ? Math.max(0, Math.min(100 - usedW, (Math.min(headroom.neededGb, Math.max(0, total - headroom.usedGb)) / total) * 100))
    : 0;
  const fits = headroom ? headroom.neededGb <= headroom.freeGb : true;

  return (
    <section data-slot="device-capability-card" data-status={status} className={cardClass} aria-label={title}>
      <CardHeaderChrome
        icon={<LocalDeviceIcon size={13} className="yui-privacy-icon" />}
        title={title}
        subtitle={subtitle}
        right={
          <StatusBadge tone={tone}>
            <span className="yui-row yui-gap-4">
              <StatusGlyph size={10.5} />
              <span>{statusLabel ?? defaultLabel}</span>
            </span>
          </StatusBadge>
        }
      />

      {resolvedRows.length > 0 ? (
        <ul className="yui-list-plain yui-well yui-storage-list yui-div-list" role="list">
          {resolvedRows.map((row) => {
            const rMeta = row.status ? META[row.status] : null;
            const RowIcon = rMeta?.[3];
            return (
              <li key={row.id} className="yui-row-between yui-wrap yui-devcap-row">
                <span className="yui-params-label">{row.label}</span>
                <span className="yui-row yui-wrap yui-end">
                  <span className="yui-storage-row-size">{row.value}</span>
                  {rMeta && RowIcon ? (
                    <span className={`yui-badge yui-audit-pill ${rMeta[1]}`}>
                      <RowIcon size={10} />
                      <span>{row.statusLabel ?? rMeta[2]}</span>
                    </span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}

      {headroom ? (
        <div className="yui-col yui-well yui-devcap-meter-box">
          <div className="yui-row-between yui-wrap">
            <span className="yui-perm-meta-label">GPU headroom</span>
            <span className="yui-storage-quota-readout">
              <strong className="yui-storage-used">{headroom.usedGb.toFixed(1)} {unit}</strong>
              <span className="yui-storage-total">
                {` used · need ${headroom.neededGb.toFixed(1)} / ${headroom.freeGb.toFixed(1)} ${unit} free`}
              </span>
            </span>
          </div>
          <CardSegmentBar
            ariaLabel={`GPU headroom: ${headroom.usedGb} ${unit} used, ${headroom.neededGb} ${unit} needed, ${headroom.freeGb} ${unit} free`}
            segments={[
              { id: 'u', x: 0, width: usedW, className: 'yui-storage-seg yui-storage-seg--other' },
              {
                id: 'n',
                x: usedW,
                width: needW,
                className: fits
                  ? status === 'tight'
                    ? 'yui-storage-seg yui-storage-seg--history'
                    : 'yui-storage-seg yui-storage-seg--weights'
                  : 'yui-storage-seg yui-devcap-seg--over',
              },
            ]}
          />
        </div>
      ) : null}

      {tiers && tiers.length > 0 ? (
        <div className="yui-col-5">
          <span className="yui-perm-meta-label">Recommended tier</span>
          <div className="yui-row yui-wrap" role="group" aria-label="Recommended model tiers">
            {tiers.map((t) => {
              const active = t.id === selectedTierId;
              return (
                <button
                  key={t.id}
                  type="button"
                  disabled={t.disabled}
                  aria-pressed={active}
                  className={active ? 'yui-micro-pill is-active' : 'yui-micro-pill'}
                  onClick={() => onSelectTier?.(t.id)}
                >
                  {t.recommended ? <CheckIcon size={10} /> : null}
                  <span>{t.label}</span>
                  {t.detail ? <span className="yui-devcap-tier-detail">{t.detail}</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <CardFooterChrome privacyNote={privacyNote}>
        {onRecheck ? (
          <button type="button" className="yui-micro-pill" disabled={rechecking} aria-busy={rechecking || undefined} onClick={onRecheck}>
            <RetryIcon size={10.5} />
            <span>{recheckLabel}</span>
          </button>
        ) : null}
      </CardFooterChrome>
    </section>
  );
}
