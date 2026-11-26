import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Copies text safely inside strict MV3/headless environments and exposes a
 * timed `copied` flag with automatic unmount timer cleanup.
 */
export function useCopyFeedback(durationMs = 1400) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const triggerCopy = (text?: string) => {
    if (text && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopied(true);
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => setCopied(false), durationMs);
  };

  return { copied, triggerCopy };
}

/** Tracks right-edge horizontal scroll overflow on `HTMLDivElement` containers. */
export function useHorizontalFade(deps: readonly unknown[]) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const sync = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const next = el.scrollWidth - el.clientWidth - el.scrollLeft > 2;
    setCanScrollRight((prev) => (prev === next ? prev : next));
  }, []);

  useEffect(() => {
    sync();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', sync, { passive: true });
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => sync());
      ro.observe(el);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', sync, { passive: true });
    }
    return () => {
      el.removeEventListener('scroll', sync);
      ro?.disconnect();
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', sync);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sync, ...deps]);

  return { scrollRef, canScrollRight };
}
