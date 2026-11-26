import { useEffect, useRef, type RefObject } from 'react';

const FOCUS_SEL =
  'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

const focusQuiet = (el: HTMLElement | null | undefined) => el?.focus({ preventScroll: true });

/** Returns keyboard-focusable descendants inside `root`, skipping disabled/hidden subtrees. */
export function getFocusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUS_SEL)).filter(
    (el) => !el.hasAttribute('disabled') && el.tabIndex !== -1 && !el.closest('[hidden],[aria-hidden="true"],[inert]'),
  );
}

/**
 * Traps Tab/Shift+Tab inside `containerRef` while `active` is true and restores
 * focus to the previously focused trigger when closed or unmounted.
 */
export function useFocusTrap(containerRef: RefObject<HTMLElement | null>, active: boolean): void {
  const prevRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const prev = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    prevRef.current = prev;
    const box = containerRef.current;
    if (box) {
      const items = getFocusableElements(box);
      if (items.length > 0 && !box.contains(prev)) focusQuiet(items[0]);
    }
    const onKey = (e: KeyboardEvent) => {
      const node = containerRef.current;
      if (e.key !== 'Tab' || !node) return;
      const items = getFocusableElements(node);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const cur = document.activeElement;
      if (e.shiftKey ? !node.contains(cur) || cur === first : !node.contains(cur) || cur === last) {
        e.preventDefault();
        focusQuiet(e.shiftKey ? last : first);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      const target = prevRef.current;
      prevRef.current = null;
      if (target?.isConnected) focusQuiet(target);
    };
  }, [active, containerRef]);
}
