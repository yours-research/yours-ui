import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

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
 * sculpted top-center notch slot, optional focus veil, scrollable stream with
 * overflow-gated edge fades, floating context sheet slot, and composer slot.
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
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [fadeState, setFadeState] = useState<{ top: boolean; bottom: boolean }>({
    top: false,
    bottom: false,
  });

  const syncScrollFades = useCallback(() => {
    const el = scrollRef.current;
    if (!scrollEdgeFade || !el) {
      setFadeState((prev) => (prev.top || prev.bottom ? { top: false, bottom: false } : prev));
      return;
    }
    const nextTop = el.scrollTop > 2;
    const nextBottom = el.scrollHeight - el.clientHeight - el.scrollTop > 2;
    setFadeState((prev) =>
      prev.top === nextTop && prev.bottom === nextBottom
        ? prev
        : { top: nextTop, bottom: nextBottom },
    );
  }, [scrollEdgeFade]);

  useEffect(() => {
    syncScrollFades();
    const el = scrollRef.current;
    if (!el || !scrollEdgeFade) return;

    const onScroll = () => syncScrollFades();
    el.addEventListener('scroll', onScroll, { passive: true });

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => syncScrollFades());
      ro.observe(el);
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', onScroll, { passive: true });
    }

    return () => {
      el.removeEventListener('scroll', onScroll);
      ro?.disconnect();
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', onScroll);
      }
    };
  }, [scrollEdgeFade, syncScrollFades, children, sheet, footer]);

  const dataTheme = theme === 'system' ? undefined : theme;
  const shellClassName = ['yui-shell', bleed ? 'yui-shell--bleed' : '', className]
    .filter(Boolean)
    .join(' ');
  const scrollWrapClassName = [
    'yui-scroll-wrap',
    scrollEdgeFade ? 'yui-scroll-wrap--fade' : '',
    scrollEdgeFade && fadeState.top ? 'yui-scroll-wrap--fade-top' : '',
    scrollEdgeFade && fadeState.bottom ? 'yui-scroll-wrap--fade-bottom' : '',
  ]
    .filter(Boolean)
    .join(' ');

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
        <div
          className={scrollWrapClassName}
          data-fade-top={fadeState.top ? 'true' : 'false'}
          data-fade-bottom={fadeState.bottom ? 'true' : 'false'}
        >
          <div ref={scrollRef} className="yui-scroll-stage">
            {children}
          </div>
        </div>
        {sheet ? <div className="yui-sheet-region">{sheet}</div> : null}
        {footer ? <div className="yui-composer-region">{footer}</div> : null}
      </div>
    </div>
  );
}
