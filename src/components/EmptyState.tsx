import type { ReactNode } from 'react';
import { MatrixOrb, type MatrixOrbState } from '../icons/MatrixOrb.js';

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
    <div
      data-slot="empty-state"
      className={className ? `yui-empty-state ${className}` : 'yui-empty-state'}
    >
      <div className="yui-empty-header">
        <MatrixOrb state={orbState} size={orbSize} />
        <h2 className="yui-empty-title">{title}</h2>
        {subtitle ? <p className="yui-empty-subtitle">{subtitle}</p> : null}
      </div>
      {children ? <div className="yui-empty-actions">{children}</div> : null}
    </div>
  );
}
