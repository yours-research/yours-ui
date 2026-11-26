import type { SVGProps } from 'react';

export type ToolStatusKind =
  | 'thinking'
  | 'reading'
  | 'searching'
  | 'researching'
  | 'tabs'
  | 'analyzing'
  | 'calculating'
  | 'writing'
  | 'memory'
  | 'done'
  | 'blocked'
  | 'error';

export interface ToolStatusIconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  kind: ToolStatusKind;
  size?: number | string;
  /** Enables continuous SVG micro-motion on active/running states (respects reduced motion). */
  active?: boolean;
}

/**
 * Clean-room, CSS-animated 24x24 Aperture-matched monochrome status glyphs for
 * tool chains and inline AI activity with zero inline styles and static
 * `prefers-reduced-motion: reduce` fallbacks.
 */
export function ToolStatusIcon({
  kind,
  size = 16,
  active = true,
  className,
  ...rest
}: ToolStatusIconProps) {
  const cls = [
    'yui-icon',
    'yui-tsi',
    `yui-tsi--${kind}`,
    active ? 'is-active' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={rest['aria-label'] ? undefined : true}
      data-slot="tool-status-icon"
      data-kind={kind}
      className={cls}
      {...rest}
    >
      {kind === 'thinking' ? (
        <>
          <path
            className="yui-tsi-spin"
            d="M12 3C12.9 8.1 15.9 11.1 21 12C15.9 12.9 12.9 15.9 12 21C11.1 15.9 8.1 12.9 3 12C8.1 11.1 11.1 8.1 12 3Z"
          />
          <path className="yui-tsi-twinkle" d="M18.5 3.5V6.5M17 5H20" />
        </>
      ) : null}

      {kind === 'reading' ? (
        <>
          <path d="M10 3H14.2L19 7.8V19A2 2 0 0 1 17 21H7A2 2 0 0 1 5 19V5A2 2 0 0 1 7 3Z" />
          <line x1="8.5" y1="12" x2="15.5" y2="12" />
          <line x1="8.5" y1="16" x2="13" y2="16" />
          <line className="yui-tsi-scan" x1="8" y1="8.5" x2="16" y2="8.5" />
        </>
      ) : null}

      {kind === 'searching' || kind === 'researching' ? (
        <>
          <circle cx="11" cy="11" r="6.5" />
          <line x1="15.8" y1="15.8" x2="20" y2="20" />
          <path className="yui-tsi-orbit" d="M11 6.5A4.5 4.5 0 0 1 15.5 11" />
        </>
      ) : null}

      {kind === 'tabs' ? (
        <>
          <path
            className="yui-tsi-tab-back"
            d="M6.5 4H16.5L21 8.5V15.5"
          />
          <rect className="yui-tsi-tab-front" x="3" y="8" width="14.5" height="12" rx="2" />
          <line x1="3" y1="12.5" x2="17.5" y2="12.5" />
        </>
      ) : null}

      {kind === 'analyzing' || kind === 'calculating' ? (
        <>
          <line className="yui-tsi-eq yui-tsi-eq--1" x1="7" y1="7" x2="7" y2="17" />
          <line className="yui-tsi-eq yui-tsi-eq--2" x1="12" y1="5" x2="12" y2="19" />
          <line className="yui-tsi-eq yui-tsi-eq--3" x1="17" y1="9" x2="17" y2="17" />
        </>
      ) : null}

      {kind === 'writing' ? (
        <>
          <path d="M14.5 4.5L19.5 9.5L9.5 19.5H4.5V14.5L14.5 4.5Z" />
          <line className="yui-tsi-write" x1="13" y1="20" x2="20.5" y2="20" />
        </>
      ) : null}

      {kind === 'memory' ? (
        <>
          <ellipse cx="12" cy="6.5" rx="7" ry="2.8" />
          <path d="M5 6.5V12C5 13.5 8.1 14.8 12 14.8C15.9 14.8 19 13.5 19 12V6.5" />
          <path
            className="yui-tsi-mem"
            d="M5 12V17.5C5 19 8.1 20.3 12 20.3C15.9 20.3 19 19 19 17.5V12"
          />
        </>
      ) : null}

      {kind === 'done' ? (
        <path
          className="yui-tsi-check"
          pathLength={100}
          d="M4.5 12.5L9.5 17.5L19.5 7"
        />
      ) : null}

      {kind === 'blocked' ? (
        <>
          <path d="M12 3.5L19 6.5V11.8C19 16 15.9 19.2 12 20.5C8.1 19.2 5 16 5 11.8V6.5L12 3.5Z" />
          <line x1="9" y1="12" x2="15" y2="12" />
        </>
      ) : null}

      {kind === 'error' ? (
        <g className="yui-tsi-shake">
          <circle cx="12" cy="12" r="8.5" />
          <line x1="9" y1="9" x2="15" y2="15" />
          <line x1="15" y1="9" x2="9" y2="15" />
        </g>
      ) : null}
    </svg>
  );
}
