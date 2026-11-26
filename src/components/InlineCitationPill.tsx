import type { ComponentProps } from 'react';

export interface InlineCitationPillProps
  extends Omit<ComponentProps<'span'>, 'children' | 'onClick'> {
  index?: number | string;
  label: string;
  href?: string;
  title?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Compact editorial inline citation / footnote pill (`[1] · yours.sh`) for
 * grounded active-tab and web references.
 */
export function InlineCitationPill({
  index,
  label,
  href,
  title,
  active = false,
  onClick,
  className,
  ...rest
}: InlineCitationPillProps) {
  const pillClass = ['yui-citation-pill', active ? 'is-active' : '', className]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {index !== undefined ? <span className="yui-citation-index">{index}</span> : null}
      <span className="yui-citation-label">{label}</span>
    </>
  );

  if (href) {
    const external = /^https?:/i.test(href);
    return (
      <a
        data-slot="inline-citation-pill"
        className={pillClass}
        href={href}
        title={title ?? label}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        onClick={onClick}
        aria-expanded={rest['aria-expanded']}
        aria-controls={rest['aria-controls']}
      >
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        data-slot="inline-citation-pill"
        type="button"
        className={pillClass}
        title={title ?? label}
        aria-pressed={rest['aria-expanded'] !== undefined ? undefined : active}
        aria-expanded={rest['aria-expanded']}
        aria-controls={rest['aria-controls']}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <span data-slot="inline-citation-pill" className={pillClass} title={title ?? label} {...rest}>
      {content}
    </span>
  );
}
