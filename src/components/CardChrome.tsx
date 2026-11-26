import type { ReactNode } from 'react';
import { ShieldIcon } from '../icons/ApertureIcon.js';

/** Compact conditional class joiner shared across card primitives. */
export const cn = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(' ');

export interface CardHeaderChromeProps {
  icon?: ReactNode;
  iconClassName?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}

/** Shared minimalist Paper Page 9 header row for card primitives. */
export function CardHeaderChrome({ icon, title, subtitle, right }: CardHeaderChromeProps) {
  return (
    <header className="yui-params-head">
      <div className="yui-col-min">
        <div className="yui-setting-title-row">
          {icon}
          <h3 className="yui-genui-title">{title}</h3>
        </div>
        {subtitle ? <p className="yui-genui-muted">{subtitle}</p> : null}
      </div>
      {right}
    </header>
  );
}

export interface CardPrivacyNoteProps {
  privacyNote: string;
  className?: string;
}

/** Shared shield icon + monospace privacy caption. */
export function CardPrivacyNote({ privacyNote, className = 'yui-storage-privacy' }: CardPrivacyNoteProps) {
  return (
    <span className={className}>
      <ShieldIcon size={11} className="yui-privacy-icon" />
      <span>{privacyNote}</span>
    </span>
  );
}

export interface CardFooterChromeProps {
  privacyNote?: string;
  children?: ReactNode;
}

/** Shared privacy readout and action slot footer for card primitives. */
export function CardFooterChrome({ privacyNote, children }: CardFooterChromeProps) {
  return (
    <footer className="yui-storage-foot">
      {privacyNote ? <CardPrivacyNote privacyNote={privacyNote} /> : null}
      {children}
    </footer>
  );
}

export interface CardBarSegment {
  id: string;
  x: number;
  width: number;
  className: string;
}

/** Shared zero-inline-style SVG segmented bar used across storage & GPU headroom meters. */
export function CardSegmentBar({
  ariaLabel,
  segments,
}: {
  ariaLabel: string;
  segments: readonly CardBarSegment[];
}) {
  return (
    <div className="yui-storage-bar" role="img" aria-label={ariaLabel}>
      <svg className="yui-storage-bar-svg" viewBox="0 0 100 6" preserveAspectRatio="none" aria-hidden="true">
        {segments.map((seg) =>
          seg.width > 0 ? (
            <rect key={seg.id} x={seg.x} y={0} width={seg.width} height={6} className={seg.className} />
          ) : null,
        )}
      </svg>
    </div>
  );
}

export interface CardMetaRow {
  label: string;
  value: ReactNode;
}

/** Compact two-column metadata well shared across permission, handoff, and confirm cards. */
export function CardMetaScope({ rows }: { rows: readonly CardMetaRow[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="yui-perm-scope">
      {rows.map((row, idx) => (
        <div key={`${row.label}-${idx}`} className="yui-perm-meta-row">
          <span className="yui-perm-meta-label">{row.label}</span>
          <span className="yui-perm-meta-val">{row.value}</span>
        </div>
      ))}
    </div>
  );
}
