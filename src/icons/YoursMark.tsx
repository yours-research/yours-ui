import type { SVGProps } from 'react';

export interface YoursMarkProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  size?: number;
}

/**
 * Geometric Aperture "Y" monogram mark for Yours Research (`yours.sh`).
 */
export function YoursMark({ size = 24, className, ...rest }: YoursMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 72 72"
      fill="none"
      aria-hidden={rest['aria-label'] ? undefined : true}
      className={className ? `yui-brand-mark ${className}` : 'yui-brand-mark'}
      {...rest}
    >
      <path
        d="M 8 8 L 21 21 H 44 M 21 21 V 44"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="butt"
        strokeLinejoin="miter"
        strokeMiterlimit="2"
      />
      <path
        d="M 64 64 L 51 51 H 28 M 51 51 V 28"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="butt"
        strokeLinejoin="miter"
        strokeMiterlimit="2"
      />
    </svg>
  );
}
