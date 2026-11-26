import { LocalDeviceIcon, ShieldIcon, XIcon } from '../icons/ApertureIcon.js';
import { StatusBadge, type StatusBadgeTone } from './StatusBadge.js';

export type HardwareTierStatus = 'ready' | 'probing' | 'fallback' | 'unsupported';

export interface HardwareStatusStripProps {
  tierLabel: string;
  adapterLabel?: string;
  memoryLabel?: string;
  status?: HardwareTierStatus;
  sha256Verified?: boolean;
  className?: string;
}

const HARDWARE_TONE: Record<HardwareTierStatus, StatusBadgeTone> = {
  ready: 'local',
  probing: 'accent',
  fallback: 'amber',
  unsupported: 'danger',
};

/**
 * Compact monochrome hardware readiness strip displaying WebGPU probe tier,
 * adapter/VRAM info, and OPFS SHA-256 verification status for `@yours/models`.
 */
export function HardwareStatusStrip({
  tierLabel,
  adapterLabel,
  memoryLabel,
  status = 'ready',
  sha256Verified = false,
  className,
}: HardwareStatusStripProps) {
  const stripClass = ['yui-hw-strip', className].filter(Boolean).join(' ');

  return (
    <div data-slot="hardware-status-strip" data-status={status} className={stripClass}>
      <div className="yui-hw-left">
        <LocalDeviceIcon size={13} className="yui-hw-icon" />
        <StatusBadge tone={HARDWARE_TONE[status]} dot pulse={status === 'probing'}>
          {tierLabel}
        </StatusBadge>
        {adapterLabel ? <span className="yui-hw-adapter">{adapterLabel}</span> : null}
      </div>
      <div className="yui-hw-right">
        {memoryLabel ? <span className="yui-hw-metric">{memoryLabel}</span> : null}
        {sha256Verified ? (
          <span className="yui-hw-sha" title="SHA-256 checksum verified">
            <ShieldIcon size={11} />
            <span>SHA-256</span>
          </span>
        ) : null}
      </div>
    </div>
  );
}

export type ModelDownloadState = 'downloading' | 'verifying' | 'paused' | 'ready' | 'error';

export interface ModelDownloadProgressBarProps {
  modelLabel: string;
  percent: number;
  state?: ModelDownloadState;
  hardwareLabel?: string;
  speedLabel?: string;
  etaLabel?: string;
  loadedLabel?: string;
  totalLabel?: string;
  sha256Verified?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  pauseLabel?: string;
  resumeLabel?: string;
  cancelLabel?: string;
  className?: string;
}

/**
 * Deterministic OPFS weight download and checksum verification progress bar
 * built on native `<progress>` with zero inline CSS styles and `tabular-nums` telemetry.
 */
export function ModelDownloadProgressBar({
  modelLabel,
  percent,
  state = 'downloading',
  hardwareLabel,
  speedLabel,
  etaLabel,
  loadedLabel,
  totalLabel,
  sha256Verified = false,
  onPause,
  onResume,
  onCancel,
  pauseLabel = 'Pause',
  resumeLabel = 'Resume',
  cancelLabel = 'Cancel download',
  className,
}: ModelDownloadProgressBarProps) {
  const clampedPercent = Math.max(0, Math.min(100, Math.round(percent)));
  const cardClass = ['yui-dl-bar-card', `is-${state}`, className].filter(Boolean).join(' ');
  const sizeTelemetry =
    loadedLabel && totalLabel ? `${loadedLabel} / ${totalLabel}` : loadedLabel ?? totalLabel;
  const telemetryItems = [sizeTelemetry, speedLabel, etaLabel].filter(
    (item): item is string => Boolean(item),
  );

  return (
    <section
      data-slot="model-download-progress-bar"
      data-state={state}
      className={cardClass}
      aria-label={`${modelLabel} download status`}
      aria-live="polite"
    >
      <div className="yui-dl-top">
        <div className="yui-dl-title-wrap">
          <span className="yui-dl-title">{modelLabel}</span>
          {hardwareLabel ? <StatusBadge tone="neutral">{hardwareLabel}</StatusBadge> : null}
        </div>
        <div className="yui-action-group">
          {sha256Verified ? (
            <StatusBadge tone="local" dot>
              SHA-256
            </StatusBadge>
          ) : state === 'verifying' ? (
            <StatusBadge tone="accent" dot pulse>
              Verifying
            </StatusBadge>
          ) : state === 'paused' ? (
            <StatusBadge tone="amber" dot>
              Paused
            </StatusBadge>
          ) : state === 'error' ? (
            <StatusBadge tone="danger" dot>
              Error
            </StatusBadge>
          ) : null}
          <span className="yui-dl-pct">{clampedPercent}%</span>
        </div>
      </div>

      <progress
        className="yui-dl-progress"
        max={100}
        value={clampedPercent}
        aria-label={`${modelLabel} download progress`}
      />

      <div className="yui-dl-foot">
        <div className="yui-dl-telemetry">
          {telemetryItems.map((item, idx) => (
            <span key={`${item}-${idx}`} className="yui-dl-telemetry-item">
              {idx > 0 ? (
                <span className="yui-dl-sep" aria-hidden="true">
                  &middot;
                </span>
              ) : null}
              <span>{item}</span>
            </span>
          ))}
        </div>
        {onPause || onResume || onCancel ? (
          <div className="yui-action-group">
            {state === 'paused' && onResume ? (
              <button type="button" className="yui-micro-pill" onClick={onResume}>
                {resumeLabel}
              </button>
            ) : null}
            {state === 'downloading' && onPause ? (
              <button type="button" className="yui-micro-pill" onClick={onPause}>
                {pauseLabel}
              </button>
            ) : null}
            {onCancel && state !== 'ready' ? (
              <button
                type="button"
                className="yui-icon-btn"
                aria-label={cancelLabel}
                onClick={onCancel}
              >
                <XIcon size={12} />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
