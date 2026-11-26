import type { ReactNode } from 'react';

export type StatusBadgeTone = 'neutral' | 'local' | 'accent' | 'amber' | 'danger';

export interface StatusBadgeProps {
  children: ReactNode;
  tone?: StatusBadgeTone;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}

/**
 * Compact hairline status badge for hardware tiers, local model readiness,
 * guardrail labels, and capability state without inline styling.
 */
export function StatusBadge({
  children,
  tone = 'neutral',
  dot = false,
  pulse = false,
  className,
}: StatusBadgeProps) {
  const badgeClass = [
    'yui-status-badge',
    tone !== 'neutral' ? `yui-status-badge--${tone}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const dotClass = ['yui-status-badge-dot', pulse ? 'is-pulse' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <span data-slot="status-badge" className={badgeClass}>
      {dot ? <span className={dotClass} aria-hidden="true" /> : null}
      <span>{children}</span>
    </span>
  );
}
