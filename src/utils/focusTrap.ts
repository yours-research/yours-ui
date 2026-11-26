import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Returns keyboard-focusable elements within `container`, skipping hidden/inert
 * ancestors without relying on layout-dependent `offsetParent` checks.
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) =>
      !el.hasAttribute('disabled') &&
      el.tabIndex !== -1 &&
      !el.closest('[hidden], [aria-hidden="true"]'),
  );
}

/**
 * Traps Tab/Shift+Tab navigation inside `containerRef` while `active` is true
 * and restores focus cleanly to the previously focused trigger when deactivated.
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
): void {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const wasActiveRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (active && !wasActiveRef.current) {
      previousFocusRef.current =
        typeof document !== 'undefined' && document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;

      if (container) {
        const focusables = getFocusableElements(container);
        if (
          focusables.length > 0 &&
          !container.contains(document.activeElement)
        ) {
          focusables[0].focus({ preventScroll: true });
        }
      }
    } else if (!active && wasActiveRef.current) {
      const target = previousFocusRef.current;
      previousFocusRef.current = null;
      if (target && target.isConnected) {
        target.focus({ preventScroll: true });
      }
    }
    wasActiveRef.current = active;
  }, [active, containerRef]);

  useEffect(() => {
    if (!active) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const container = containerRef.current;
      if (!container) return;

      const focusables = getFocusableElements(container);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const current = document.activeElement;

      if (event.shiftKey) {
        if (!container.contains(current) || current === first) {
          event.preventDefault();
          last.focus({ preventScroll: true });
        }
      } else if (!container.contains(current) || current === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [active, containerRef]);
}
