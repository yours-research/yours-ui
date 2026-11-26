import { LocalDeviceIcon, ShieldIcon, XIcon } from '../icons/ApertureIcon.js';
import { StatusBadge, type StatusBadgeTone } from './FeedbackPrimitives.js';

export type HardwareTierStatus = 'ready' | 'probing' | 'fallback' | 'unsupported';

export interface HardwareStatusStripProps {
  tierLabel: string;
  adapterLabel?: string;
  memoryLabel?: string;
  status?: HardwareTierStatus;
  sha256Verified?: boolean;
  /** Speculative decoding speedup multiplier or label (e.g. `1.58` or `"1.58x spec"`). */
  speedupLabel?: string | number;
  /** Accepted tokens per speculative step (e.g. `3.4` or `"3.4 tok/step"`). */
  acceptedTokLabel?: string | number;
  /** Quantized VRAM footprint delta label (e.g. `"-254 MiB"`). */
  vramDeltaLabel?: string;
  /** Additional compact telemetry pill labels rendered at the trailing edge. */
  telemetryChips?: readonly string[];
  className?: string;
}

const HARDWARE_TONE: Record<HardwareTierStatus, StatusBadgeTone> = {
  ready: 'local',
  probing: 'accent',
  fallback: 'amber',
  unsupported: 'danger',
};

function formatSpecChip(value: string | number | undefined, suffix: string, digits: number): string | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? `${value.toFixed(digits)}${suffix}` : undefined;
  }
  return value || undefined;
}

/**
 * Compact monochrome hardware readiness strip displaying WebGPU probe tier,
 * adapter/VRAM info, optional speculative/quantized telemetry pills, and OPFS
 * SHA-256 verification status for `@yours/models`.
 */
export function HardwareStatusStrip({
  tierLabel,
  adapterLabel,
  memoryLabel,
  status = 'ready',
  sha256Verified = false,
  speedupLabel,
  acceptedTokLabel,
  vramDeltaLabel,
  telemetryChips,
  className,
}: HardwareStatusStripProps) {
  const stripClass = ['yui-hw-strip', className].filter(Boolean).join(' ');
  const speedupText = formatSpecChip(speedupLabel, 'x', 2);
  const acceptedText = formatSpecChip(acceptedTokLabel, ' tok/step', 1);

  return (
    <div data-slot="hardware-status-strip" data-status={status} className={stripClass}>
      <div className="yui-hw-left">
        <LocalDeviceIcon size={13} className="yui-hw-icon" />
        <StatusBadge tone={HARDWARE_TONE[status]} dot pulse={status === 'probing'}>
          {tierLabel}
        </StatusBadge>
        {adapterLabel ? <span className="yui-ellipsis yui-hw-adapter">{adapterLabel}</span> : null}
      </div>
      <div className="yui-hw-right">
        {memoryLabel ? <span className="yui-hw-metric">{memoryLabel}</span> : null}
        {speedupText ? <span className="yui-telem-chip is-spec">{speedupText}</span> : null}
        {acceptedText ? <span className="yui-telem-chip">{acceptedText}</span> : null}
        {vramDeltaLabel ? <span className="yui-telem-chip">{vramDeltaLabel}</span> : null}
        {telemetryChips?.map((chip, idx) =>
          chip ? (
            <span key={`${chip}-${idx}`} className="yui-telem-chip">
              {chip}
            </span>
          ) : null,
        )}
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
      <div className="yui-row-between">
        <div className="yui-dl-title-wrap">
          <span className="yui-ellipsis yui-dl-title">{modelLabel}</span>
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

      <div className="yui-row-between yui-dl-foot">
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
