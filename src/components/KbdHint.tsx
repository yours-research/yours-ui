export interface KbdHintProps {
  /** Key or chord parts to render as hairline monospace keycaps (e.g. `'⌘K'` or `['⌘', '↵']`). */
  keys: string | readonly string[];
  size?: 'xs' | 'sm';
  className?: string;
}

/**
 * Monochrome hairline keycap primitive (`<kbd>`) using tabular monospace ink
 * across Cotton Paper light and Anodized Obsidian dark surfaces.
 */
export function KbdHint({ keys, size = 'sm', className }: KbdHintProps) {
  const parts = Array.isArray(keys) ? keys : [keys];
  const groupClass = ['yui-kbd-group', className].filter(Boolean).join(' ');
  const keyClass = size === 'xs' ? 'yui-kbd yui-kbd--xs' : 'yui-kbd';

  return (
    <span data-slot="kbd-hint" className={groupClass}>
      {parts.map((part, idx) => (
        <kbd key={`${part}-${idx}`} className={keyClass}>
          {part}
        </kbd>
      ))}
    </span>
  );
}
