import type { SVGProps } from 'react';

export interface NotchEarProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  side: 'left' | 'right';
}

/**
 * 14x14 inverted quarter-circle curve connecting the outer bezel cleanly
 * to the sculpted top-center icon notch.
 */
export function NotchEar({ side, className, ...rest }: NotchEarProps) {
  const d =
    side === 'left'
      ? 'M0 0H14V14C14 6.268 7.732 0 0 0Z'
      : 'M14 0H0V14C0 6.268 6.268 0 14 0Z';
  const baseClass = `yui-notch-ear yui-notch-ear--${side}`;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={14}
      height={14}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className={className ? `${baseClass} ${className}` : baseClass}
      {...rest}
    >
      <path d={d} fill="currentColor" />
    </svg>
  );
}
