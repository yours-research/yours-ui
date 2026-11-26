import { ArrowDownIcon, LocalDeviceIcon, ShieldIcon } from '../icons/ApertureIcon.js';
import { MatrixOrb } from '../icons/MatrixOrb.js';
import { YoursMark } from '../icons/YoursMark.js';
import { StatusBadge } from './StatusBadge.js';

export interface OnboardingCardProps {
  title?: string;
  subtitle?: string;
  checkpointLabel: string;
  cacheSizeLabel: string;
  adapterLabel?: string;
  adapterReady?: boolean;
  ctaLabel?: string;
  secondaryLabel?: string;
  privacyNote?: string;
  loading?: boolean;
  disabled?: boolean;
  onInitialize: () => void;
  onSecondaryAction?: () => void;
  className?: string;
}

/**
 * Minimalist Paper Page 9 first-run local WebGPU setup card featuring `YoursMark`,
 * checkpoint & OPFS cache readout, WebGPU adapter readiness chip, primary action,
 * and calm local-first privacy guarantee.
 */
export function OnboardingCard({
  title = 'Initialize local GPU runtime',
  subtitle = 'Download verified weights once into private browser OPFS storage.',
  checkpointLabel,
  cacheSizeLabel,
  adapterLabel = 'WebGPU ready',
  adapterReady = true,
  ctaLabel = 'Download & initialize locally',
  secondaryLabel,
  privacyNote = 'Zero cloud API keys · Runs 100% on your GPU',
  loading = false,
  disabled = false,
  onInitialize,
  onSecondaryAction,
  className,
}: OnboardingCardProps) {
  const rootClass = ['yui-onb-card', className].filter(Boolean).join(' ');

  return (
    <section
      data-slot="onboarding-card"
      className={rootClass}
      aria-label={title}
    >
      <div className="yui-onb-hero">
        <div className="yui-onb-mark" aria-hidden="true">
          <YoursMark size={20} />
        </div>
        <div className="yui-col-min">
          <h2 className="yui-onb-title">{title}</h2>
          <p className="yui-onb-sub">{subtitle}</p>
        </div>
      </div>

      <div className="yui-onb-spec">
        <div className="yui-onb-ckpt">
          <LocalDeviceIcon size={13.5} className="yui-onb-device-icon" />
          <span className="yui-onb-ckpt-label">{checkpointLabel}</span>
        </div>
        <div className="yui-onb-chips">
          <StatusBadge tone={adapterReady ? 'local' : 'amber'} dot>
            {adapterLabel}
          </StatusBadge>
          <span className="yui-onb-cache">{cacheSizeLabel}</span>
        </div>
      </div>

      <div className="yui-onb-actions">
        <button
          type="button"
          className="yui-onb-cta"
          disabled={disabled || loading}
          onClick={onInitialize}
        >
          {loading ? <MatrixOrb state="streaming" size={14} /> : <ArrowDownIcon size={13} />}
          <span>{ctaLabel}</span>
        </button>

        {secondaryLabel && onSecondaryAction ? (
          <button
            type="button"
            className="yui-onb-secondary"
            disabled={disabled}
            onClick={onSecondaryAction}
          >
            {secondaryLabel}
          </button>
        ) : null}
      </div>

      <div className="yui-onb-privacy">
        <ShieldIcon size={12} className="yui-onb-shield" />
        <span>{privacyNote}</span>
      </div>
    </section>
  );
}
