import type { ReactNode } from 'react';
import { ApertureIcon, ArrowRightIcon, ShieldIcon } from '../icons/ApertureIcon.js';
import type { ApertureIconName } from '../icons/iconData.js';
import { MatrixOrb, type MatrixOrbState } from '../icons/MatrixOrb.js';
import { YoursMark } from '../icons/YoursMark.js';
import { cn } from '../utils/clipboard.js';

export interface EmptyStateProps {
  title: string;
  subtitle?: string;
  orbState?: MatrixOrbState;
  orbSize?: number;
  children?: ReactNode;
  className?: string;
}

/**
 * Minimalist Page 9 resting zero-state centered on the recessed stage,
 * combining the 21-dot MatrixOrb with calm typography and optional starter actions.
 */
export function EmptyState({
  title,
  subtitle,
  orbState = 'idle',
  orbSize = 28,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div data-slot="empty-state" className={cn('yui-empty-state', className)}>
      <div className="yui-empty-header">
        <MatrixOrb state={orbState} size={orbSize} />
        <h2 className="yui-empty-title">{title}</h2>
        {subtitle ? <p className="yui-empty-subtitle">{subtitle}</p> : null}
      </div>
      {children ? <div className="yui-empty-actions">{children}</div> : null}
    </div>
  );
}

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
  return (
    <section data-slot="empty-panel-state" className={cn('yui-empty-panel', className)} aria-label={title}>
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
