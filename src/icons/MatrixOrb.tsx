import type { SVGProps } from 'react';

export type MatrixOrbState = 'idle' | 'thinking' | 'streaming';

export interface MatrixOrbProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  state?: MatrixOrbState;
  size?: number;
}

interface OrbCell {
  key: string;
  cx: number;
  cy: number;
  r: number;
  fillOpacity: number;
  toneClass: 'yui-orb-ink' | 'yui-orb-cobalt' | 'yui-orb-green' | 'yui-orb-muted';
}

function buildOrbCells(state: MatrixOrbState): OrbCell[] {
  const cells: OrbCell[] = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if ((r === 0 || r === 4) && (c === 0 || c === 4)) continue;
      const cx = 4 + c * 6;
      const cy = 4 + r * 6;
      const dist = Math.hypot(r - 2, c - 2);
      let toneClass: OrbCell['toneClass'] = 'yui-orb-ink';
      let fillOpacity = 0.25;
      let rad = 1.45;

      if (state === 'idle') {
        fillOpacity = dist === 0 ? 0.9 : dist <= 1.1 ? 0.52 : dist <= 1.6 ? 0.28 : 0.15;
        rad = dist === 0 ? 1.85 : dist <= 1.1 ? 1.55 : 1.3;
      } else if (state === 'thinking') {
        const w = r + c;
        if (w === 4) {
          toneClass = 'yui-orb-cobalt';
          fillOpacity = 1;
          rad = 1.8;
        } else if (w === 3 || w === 5) {
          toneClass = 'yui-orb-cobalt';
          fillOpacity = 0.55;
          rad = 1.55;
        } else {
          toneClass = 'yui-orb-muted';
          fillOpacity = 0.22;
          rad = 1.25;
        }
      } else {
        if (dist === 0) {
          toneClass = 'yui-orb-green';
          fillOpacity = 1;
          rad = 2.05;
        } else if (dist <= 1.1) {
          toneClass = 'yui-orb-cobalt';
          fillOpacity = 0.85;
          rad = 1.65;
        } else if (dist <= 1.6) {
          toneClass = 'yui-orb-ink';
          fillOpacity = 0.42;
          rad = 1.35;
        } else {
          toneClass = 'yui-orb-muted';
          fillOpacity = 0.18;
          rad = 1.2;
        }
      }

      cells.push({ key: `${r}-${c}`, cx, cy, r: rad, fillOpacity, toneClass });
    }
  }
  return cells;
}

/**
 * 21-dot corner-trimmed presence matrix orb used across resting states,
 * reasoning traces, and live streaming feedback.
 */
export function MatrixOrb({ state = 'idle', size = 28, className, ...rest }: MatrixOrbProps) {
  const cells = buildOrbCells(state);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className ? `yui-matrix-orb yui-matrix-orb--${state} ${className}` : `yui-matrix-orb yui-matrix-orb--${state}`}
      {...rest}
    >
      {cells.map((cell) => (
        <circle
          key={cell.key}
          cx={cell.cx}
          cy={cell.cy}
          r={cell.r}
          fillOpacity={cell.fillOpacity}
          className={cell.toneClass}
        />
      ))}
    </svg>
  );
}
