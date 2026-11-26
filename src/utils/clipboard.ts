import { useEffect, useRef, useState } from 'react';

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
