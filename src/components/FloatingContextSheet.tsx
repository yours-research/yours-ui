import { useEffect, useRef, type ReactNode } from 'react';
import { XIcon } from '../icons/ApertureIcon.js';
import { useFocusTrap } from '../utils/focus.js';

export interface FloatingContextSheetProps {
  open: boolean;
  title: string;
  subtitle?: string;
  badge?: string;
  onClose?: () => void;
  closeLabel?: string;
  headerRight?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Recessed monochrome bottom tray sliding cleanly above `FloatingComposer`
 * inside `SidePanelShell` for local context ingestion queues or permission stacks.
 */
export function FloatingContextSheet({
  open,
  title,
  subtitle,
  badge,
  onClose,
  closeLabel = 'Close sheet',
  headerRight,
  footer,
  children,
  className,
}: FloatingContextSheetProps) {
  const sheetRef = useRef<HTMLElement | null>(null);
  useFocusTrap(sheetRef, open);

  useEffect(() => {
    if (!open || !onClose) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const sheetClass = ['yui-ctx-sheet', className].filter(Boolean).join(' ');

  return (
    <section
      ref={sheetRef}
      data-slot="floating-context-sheet"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className={sheetClass}
    >
      <div className="yui-center-row yui-pt-2" aria-hidden="true">
        <span className="yui-sheet-grabber" />
      </div>
      <div className="yui-sheet-head">
        <div className="yui-col-min">
          <div className="yui-row">
            <span className="yui-genui-title">{title}</span>
            {badge ? <span className="yui-badge">{badge}</span> : null}
          </div>
          {subtitle ? <div className="yui-genui-muted">{subtitle}</div> : null}
        </div>
        <div className="yui-action-group">
          {headerRight}
          {onClose ? (
            <button
              type="button"
              className="yui-icon-btn"
              aria-label={closeLabel}
              onClick={onClose}
            >
              <XIcon size={13} />
            </button>
          ) : null}
        </div>
      </div>
      <div className="yui-sheet-body">{children}</div>
      {footer ? <div className="yui-sheet-foot">{footer}</div> : null}
    </section>
  );
}
