import { useEffect, useRef, type ReactNode } from 'react';
import { ApertureIcon } from '../icons/ApertureIcon.js';
import type { ApertureIconName } from '../icons/iconData.js';
import { NotchEar } from '../icons/NotchEar.js';
import { useFocusTrap } from '../utils/focusTrap.js';

export interface TopNotchItem {
  id: string;
  icon: ApertureIconName;
  label: string;
  title?: string;
  badgeDot?: 'green' | 'amber' | 'none';
  badgePulse?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export interface TopNotchProps {
  items: readonly TopNotchItem[];
  expandedId: string | null;
  onSelectItem?: (id: string) => void;
  onClose?: () => void;
  drawerContent?: ReactNode;
  className?: string;
}

/**
 * Top-center sculpted Dynamic Island notch that sits compactly with pure icons
 * at rest, blooms on pointer hover/focus to reveal labels, and expands down into
 * a unified drawer when clicked.
 */
export function TopNotch({
  items,
  expandedId,
  onSelectItem,
  onClose,
  drawerContent,
  className,
}: TopNotchProps) {
  const isExpanded = expandedId !== null;
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const trapActive = isExpanded && Boolean(drawerContent);

  useFocusTrap(drawerRef, trapActive);

  const housingClassName = [
    'yui-notch-housing',
    items.length >= 5 ? 'yui-notch-housing--wide' : '',
    isExpanded ? 'is-expanded' : '',
  ]
    .filter(Boolean)
    .join(' ');

  useEffect(() => {
    if (!isExpanded || !onClose) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isExpanded, onClose]);

  return (
    <div className={className ? `yui-notch-overlay ${className}` : 'yui-notch-overlay'}>
      <div className="yui-notch-assembly">
        <NotchEar side="left" />
        <div className={housingClassName}>
          <nav className="yui-notch-bar" aria-label="Panel controls">
            {items.map((item) => {
              const active = expandedId === item.id;
              const dotTone = item.badgeDot ?? 'none';
              const dotClass = [
                'yui-notch-dot',
                dotTone === 'amber' ? 'is-amber' : '',
                item.badgePulse ? 'is-pulse' : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={item.disabled}
                  className={active ? 'yui-notch-btn is-active' : 'yui-notch-btn'}
                  title={item.title ?? item.label}
                  aria-label={item.label}
                  aria-expanded={active}
                  onClick={() => {
                    if (item.disabled) return;
                    item.onClick?.();
                    onSelectItem?.(item.id);
                  }}
                >
                  <span className="yui-notch-icon-wrap">
                    <ApertureIcon name={item.icon} size={item.icon === 'x' ? 13.5 : 14.5} />
                    {dotTone !== 'none' ? <span className={dotClass} aria-hidden="true" /> : null}
                  </span>
                  <span className="yui-notch-label">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div ref={drawerRef} className="yui-notch-drawer" aria-hidden={!isExpanded}>
            <div className="yui-notch-drawer-inner">
              {isExpanded && drawerContent ? (
                <>
                  <div className="yui-drawer-hairline-wrap">
                    <div className="yui-drawer-hairline" />
                  </div>
                  <div className="yui-drawer-body">{drawerContent}</div>
                </>
              ) : null}
            </div>
          </div>
        </div>
        <NotchEar side="right" />
      </div>
    </div>
  );
}
