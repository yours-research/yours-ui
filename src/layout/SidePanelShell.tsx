import type { ReactNode } from 'react';

export interface SidePanelShellProps {
  theme?: 'system' | 'light' | 'dark';
  bleed?: boolean;
  notch?: ReactNode;
  veilOpen?: boolean;
  onVeilClick?: () => void;
  sheet?: ReactNode;
  footer?: ReactNode;
  scrollEdgeFade?: boolean;
  children?: ReactNode;
  className?: string;
}

/**
 * Cotton Paper / Anodized Obsidian side-panel bezel wrapping a recessed stage,
 * sculpted top-center notch slot, optional focus veil, scrollable stream,
 * floating context sheet slot, and floating bottom composer slot.
 */
export function SidePanelShell({
  theme = 'system',
  bleed = false,
  notch,
  veilOpen = false,
  onVeilClick,
  sheet,
  footer,
  scrollEdgeFade = true,
  children,
  className,
}: SidePanelShellProps) {
  const dataTheme = theme === 'system' ? undefined : theme;
  const shellClassName = ['yui-shell', bleed ? 'yui-shell--bleed' : '', className]
    .filter(Boolean)
    .join(' ');
  const scrollWrapClassName = scrollEdgeFade
    ? 'yui-scroll-wrap yui-scroll-wrap--fade'
    : 'yui-scroll-wrap';
  return (
    <div
      className={shellClassName}
      data-theme={dataTheme}
    >
      <div className="yui-stage">
        <div
          className={veilOpen ? 'yui-veil is-open' : 'yui-veil'}
          aria-hidden="true"
          onClick={veilOpen ? onVeilClick : undefined}
        />
        {notch}
        <div className={scrollWrapClassName}>
          <div className="yui-scroll-stage">{children}</div>
        </div>
        {sheet ? <div className="yui-sheet-region">{sheet}</div> : null}
        {footer ? <div className="yui-composer-region">{footer}</div> : null}
      </div>
    </div>
  );
}
