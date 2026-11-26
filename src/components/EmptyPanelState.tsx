import { ApertureIcon, ArrowRightIcon, ShieldIcon } from '../icons/ApertureIcon.js';
import type { ApertureIconName } from '../icons/iconData.js';
import { YoursMark } from '../icons/YoursMark.js';

export interface EmptyPanelStarter {
  id: string;
  label: string;
  icon?: ApertureIconName;
  prompt?: string;
}

export interface EmptyPanelStateProps {
  title?: string;
  subtitle?: string;
  starters?: readonly EmptyPanelStarter[];
  onSelectStarter?: (starter: EmptyPanelStarter) => void;
  privacyLabel?: string;
  className?: string;
}

/**
 * Ultra-quiet zero-conversation welcome state for side panels combining the
 * geometric Aperture monogram, concise headline, wrap-safe starter chips,
 * and subtle local-first privacy footer without inline styles.
 */
export function EmptyPanelState({
  title = 'Ask locally on this page.',
  subtitle = 'Private WebGPU inference stays inside your browser.',
  starters = [],
  onSelectStarter,
  privacyLabel = 'On-device WebGPU · Zero telemetry',
  className,
}: EmptyPanelStateProps) {
  const rootClass = ['yui-empty-panel', className].filter(Boolean).join(' ');

  return (
    <section data-slot="empty-panel-state" className={rootClass} aria-label={title}>
      <div className="yui-empty-panel-hero">
        <span className="yui-empty-panel-mark" aria-hidden="true">
          <YoursMark size={24} />
        </span>
        <h2 className="yui-empty-panel-title">{title}</h2>
        {subtitle ? <p className="yui-empty-panel-sub">{subtitle}</p> : null}
      </div>

      {starters.length > 0 ? (
        <div className="yui-empty-panel-chips" role="list" aria-label="Starter prompts">
          {starters.map((starter) => (
            <button
              key={starter.id}
              type="button"
              role="listitem"
              className="yui-empty-panel-chip"
              onClick={() => onSelectStarter?.(starter)}
            >
              {starter.icon ? (
                <ApertureIcon name={starter.icon} size={12.5} className="yui-empty-panel-chip-icon" />
              ) : null}
              <span>{starter.label}</span>
              <ArrowRightIcon size={11} className="yui-empty-panel-chip-arrow" />
            </button>
          ))}
        </div>
      ) : null}

      {privacyLabel ? (
        <footer className="yui-empty-panel-foot">
          <ShieldIcon size={11.5} />
          <span>{privacyLabel}</span>
        </footer>
      ) : null}
    </section>
  );
}
