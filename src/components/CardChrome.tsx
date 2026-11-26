import type { ReactNode } from 'react';
import { ShieldIcon } from '../icons/ApertureIcon.js';

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

export interface CardFooterChromeProps {
  privacyNote?: string;
  children?: ReactNode;
}

/** Shared privacy readout and action slot footer for card primitives. */
export function CardFooterChrome({ privacyNote, children }: CardFooterChromeProps) {
  return (
    <footer className="yui-storage-foot">
      {privacyNote ? (
        <span className="yui-storage-privacy">
          <ShieldIcon size={11} className="yui-privacy-icon" />
          <span>{privacyNote}</span>
        </span>
      ) : null}
      {children}
    </footer>
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
