import { ArrowDownIcon, ShieldIcon, TrashIcon } from '../icons/ApertureIcon.js';
import { StatusBadge } from './StatusBadge.js';

export type NetworkAuditDecision = 'blocked' | 'allowed-once' | 'local';

export interface NetworkAuditMetric {
  id: string;
  label: string;
  value: string;
}

export interface NetworkAuditEvent {
  id: string;
  target: string;
  detail?: string;
  decision: NetworkAuditDecision;
  decisionLabel?: string;
  timestamp: string;
}

export interface NetworkAuditCardProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  metrics?: readonly NetworkAuditMetric[];
  events: readonly NetworkAuditEvent[];
  emptyLabel?: string;
  privacyNote?: string;
  onClearLog?: () => void;
  clearLogLabel?: string;
  onExportJson?: (events: readonly NetworkAuditEvent[]) => void;
  exportJsonLabel?: string;
  className?: string;
}

const DEFAULT_METRICS: readonly NetworkAuditMetric[] = [
  { id: 'egress', label: 'Model egress', value: '0 bytes' },
  { id: 'runtime', label: 'Inference', value: 'Local WebGPU' },
  { id: 'csp', label: 'Policy', value: "CSP 'self'" },
];

const DECISION_LABELS: Record<NetworkAuditDecision, string> = {
  blocked: 'Blocked',
  'allowed-once': 'Allowed once',
  local: 'Local only',
};

/**
 * Zero-trust local privacy & network audit card showing isolation summary
 * metrics, timestamped tool/domain decisions (`Blocked`, `Allowed once`,
 * `Local only`), optional `Clear log` / `Export JSON` actions, and zero inline styles.
 */
export function NetworkAuditCard({
  title = 'Network & privacy audit',
  subtitle = 'Zero-trust runtime monitor',
  badge = 'Isolated',
  metrics = DEFAULT_METRICS,
  events,
  emptyLabel = 'No network events recorded this session',
  privacyNote = 'Strict MV3 CSP · Zero telemetry',
  onClearLog,
  clearLogLabel = 'Clear log',
  onExportJson,
  exportJsonLabel = 'Export JSON',
  className,
}: NetworkAuditCardProps) {
  const cardClass = ['yui-audit-card', className].filter(Boolean).join(' ');

  return (
    <section data-slot="network-audit-card" className={cardClass} aria-label={title}>
      <header className="yui-params-head">
        <div className="yui-col-min">
          <div className="yui-setting-title-row">
            <ShieldIcon size={13} className="yui-privacy-icon" />
            <h3 className="yui-genui-title">{title}</h3>
          </div>
          {subtitle ? <p className="yui-genui-muted">{subtitle}</p> : null}
        </div>
        {badge ? (
          <StatusBadge tone="local" dot>
            {badge}
          </StatusBadge>
        ) : null}
      </header>

      {metrics.length > 0 ? (
        <div className="yui-audit-metrics" role="list" aria-label="Isolation summary">
          {metrics.map((metric) => (
            <div key={metric.id} className="yui-audit-metric-tile" role="listitem">
              <span className="yui-audit-metric-label">{metric.label}</span>
              <strong className="yui-audit-metric-val">{metric.value}</strong>
            </div>
          ))}
        </div>
      ) : null}

      {events.length === 0 ? (
        <div className="yui-audit-empty" role="status">
          {emptyLabel}
        </div>
      ) : (
        <ul className="yui-storage-list yui-audit-list" role="list">
          {events.map((ev) => (
            <li
              key={ev.id}
              className="yui-audit-row"
              data-audit-id={ev.id}
              data-decision={ev.decision}
            >
              <div className="yui-audit-row-top">
                <span className="yui-audit-target">{ev.target}</span>
                <span className={`yui-audit-pill is-${ev.decision}`}>
                  {ev.decisionLabel ?? DECISION_LABELS[ev.decision]}
                </span>
              </div>
              <div className="yui-audit-row-sub">
                <span className="yui-audit-detail">{ev.detail ?? ''}</span>
                <span className="yui-audit-time">{ev.timestamp}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <footer className="yui-storage-foot">
        <span className="yui-storage-privacy">
          <ShieldIcon size={11} className="yui-privacy-icon" />
          <span>{privacyNote}</span>
        </span>
        {onClearLog || onExportJson ? (
          <div className="yui-storage-row-actions">
            {onClearLog ? (
              <button
                type="button"
                className="yui-micro-pill yui-audit-clear-btn"
                onClick={onClearLog}
              >
                <TrashIcon size={10.5} />
                <span>{clearLogLabel}</span>
              </button>
            ) : null}
            {onExportJson ? (
              <button
                type="button"
                className="yui-micro-pill yui-audit-export-btn"
                onClick={() => onExportJson(events)}
              >
                <ArrowDownIcon size={10.5} />
                <span>{exportJsonLabel}</span>
              </button>
            ) : null}
          </div>
        ) : null}
      </footer>
    </section>
  );
}
