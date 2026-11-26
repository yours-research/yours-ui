import { AlertIcon, CheckIcon, LocalDeviceIcon, RetryIcon, ShieldIcon } from '../icons/ApertureIcon.js';
import { cn } from '../utils/clipboard.js';
import { StatusBadge, type StatusBadgeTone } from './StatusBadge.js';

export type OfflineStatus = 'online' | 'offline-ready' | 'offline-degraded' | 'sync-paused';

export interface OfflineStatusBannerProps {
  status: OfflineStatus;
  title?: string;
  detail?: string;
  badge?: string;
  retryLabel?: string;
  localOnlyLabel?: string;
  retrying?: boolean;
  localOnlyActive?: boolean;
  onRetry?: () => void;
  onLocalOnly?: () => void;
  className?: string;
}

const META: Record<
  OfflineStatus,
  readonly [StatusBadgeTone, string, string, string, typeof CheckIcon]
> = {
  online: [
    'local',
    'Online',
    'Online · All tools ready',
    '100% local WebGPU inference & web-search tools active.',
    CheckIcon,
  ],
  'offline-ready': [
    'local',
    'Offline ready',
    'Offline · Local WebGPU active',
    '100% local WebGPU inference stays available · Web-search tools paused.',
    LocalDeviceIcon,
  ],
  'offline-degraded': [
    'amber',
    'Local only',
    'Offline · Web tools paused',
    '100% local WebGPU inference stays available · Web search & sync paused.',
    AlertIcon,
  ],
  'sync-paused': [
    'amber',
    'Sync paused',
    'Sync paused · Local active',
    '100% local WebGPU inference stays available · Cloud sync & web tools paused.',
    ShieldIcon,
  ],
};

/**
 * Compact Paper Page 9 local-first connectivity banner confirming that 100%
 * on-device WebGPU inference remains available when offline or when web tools pause.
 */
export function OfflineStatusBanner({
  status,
  title,
  detail,
  badge,
  retryLabel = 'Retry',
  localOnlyLabel = 'Local-only',
  retrying = false,
  localOnlyActive = false,
  onRetry,
  onLocalOnly,
  className,
}: OfflineStatusBannerProps) {
  const [tone, defaultBadge, defaultTitle, defaultDetail, Icon] = META[status];
  const resolvedBadge = badge ?? defaultBadge;

  return (
    <section
      data-slot="offline-status-banner"
      data-status={status}
      role="status"
      aria-live="polite"
      aria-label={title ?? defaultTitle}
      className={cn('yui-card-shell yui-offline-banner', `is-${status}`, className)}
    >
      <div className="yui-row-between yui-wrap">
        <div className="yui-setting-title-row">
          <Icon size={13} className="yui-privacy-icon" />
          <span className="yui-setting-title yui-ellipsis">{title ?? defaultTitle}</span>
        </div>
        {resolvedBadge ? (
          <StatusBadge tone={tone} dot={status !== 'online'} pulse={retrying}>
            {resolvedBadge}
          </StatusBadge>
        ) : null}
      </div>

      <div className="yui-row-between yui-wrap yui-offline-foot">
        <p className="yui-audit-detail yui-m-0">{detail ?? defaultDetail}</p>
        {onRetry || onLocalOnly ? (
          <div className="yui-action-group">
            {onLocalOnly ? (
              <button
                type="button"
                className={cn('yui-micro-pill', localOnlyActive && 'is-active')}
                aria-pressed={localOnlyActive}
                onClick={onLocalOnly}
              >
                <LocalDeviceIcon size={10.5} />
                <span>{localOnlyLabel}</span>
              </button>
            ) : null}
            {onRetry ? (
              <button
                type="button"
                className="yui-micro-pill"
                disabled={retrying}
                aria-busy={retrying || undefined}
                onClick={onRetry}
              >
                <RetryIcon size={10.5} />
                <span>{retryLabel}</span>
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
