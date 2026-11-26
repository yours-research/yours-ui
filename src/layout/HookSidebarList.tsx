import { useState } from 'react';

export interface HookSidebarItem {
  id: string;
  title: string;
  meta?: string;
  hasLiveDot?: boolean;
}

export interface HookSidebarListProps {
  items: readonly HookSidebarItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  rowHeight?: number;
  gap?: number;
  emptyText?: string;
}

/**
 * Compact hierarchical sidebar list with dashed cobalt active L-hook and
 * muted dashed pointer-hover guide line.
 */
export function HookSidebarList({
  items,
  activeId,
  onSelect,
  rowHeight = 30,
  gap = 2,
  emptyText = 'No items',
}: HookSidebarListProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (items.length === 0) {
    return <div className="yui-genui-muted">{emptyText}</div>;
  }

  const foundIdx = activeId ? items.findIndex((item) => item.id === activeId) : 0;
  const activeIdx = foundIdx >= 0 ? foundIdx : 0;
  const pitch = rowHeight + gap;
  const listHeight = items.length * rowHeight + (items.length - 1) * gap;
  const corner = 6;
  const yActive = activeIdx * pitch + rowHeight / 2;
  const yHover = hoverIndex !== null ? hoverIndex * pitch + rowHeight / 2 : null;

  let hoverPath = '';
  if (hoverIndex !== null && hoverIndex !== activeIdx && yHover !== null) {
    hoverPath =
      hoverIndex > activeIdx
        ? `M 1.5 ${Math.max(0, yActive - corner)} V ${yHover - corner} A ${corner} ${corner} 0 0 0 ${1.5 + corner} ${yHover} H 13.5`
        : `M 1.5 ${Math.max(0, yHover - corner)} A ${corner} ${corner} 0 0 0 ${1.5 + corner} ${yHover} H 13.5`;
  }

  const activePath = `M 1.5 0 V ${yActive - corner} A ${corner} ${corner} 0 0 0 ${1.5 + corner} ${yActive} H 13.5`;

  return (
    <div className="yui-hook-wrap" onMouseLeave={() => setHoverIndex(null)}>
      <div className="yui-hook-rail">
        <svg
          className="yui-hook-svg"
          width={14}
          height={listHeight}
          viewBox={`0 0 14 ${listHeight}`}
          fill="none"
          aria-hidden="true"
        >
          {hoverPath ? (
            <path
              className="yui-hook-hover"
              d={hoverPath}
              strokeWidth="1.25"
              strokeDasharray="2 2"
            />
          ) : null}
          <path
            className="yui-hook-active"
            d={activePath}
            strokeWidth="1.25"
            strokeDasharray="2 2"
          />
        </svg>
      </div>
      {items.map((item, idx) => {
        const isActive = item.id === activeId || (activeId === undefined && idx === 0);
        return (
          <button
            key={item.id}
            type="button"
            className={isActive ? 'yui-hook-row is-active' : 'yui-hook-row'}
            onMouseEnter={() => setHoverIndex(idx)}
            onClick={() => onSelect?.(item.id)}
          >
            <span className="yui-hook-row-left">
              {item.hasLiveDot ? <span className="yui-status-dot yui-status-dot--sm" /> : null}
              <span className="yui-hook-row-title">{item.title}</span>
            </span>
            {item.meta ? <span className="yui-hook-row-meta">{item.meta}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
