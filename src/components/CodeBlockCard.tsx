import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckIcon, CopyIcon } from '../icons/ApertureIcon.js';

export interface CodeBlockCardProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  onCopy?: (code: string) => void;
  copyLabel?: string;
  copiedLabel?: string;
  className?: string;
}

/**
 * Upgraded Paper Page 9 fenced code card with header language pill (`TS`, `WGSL`,
 * `JSON`, `BASH`), one-click `Copy` -> `Copied` swap, optional `tabular-nums`
 * line numbers, and dynamic horizontal scroll right-edge fade at `340px`.
 */
export function CodeBlockCard({
  code,
  language = 'text',
  title,
  showLineNumbers = true,
  onCopy,
  copyLabel = 'Copy',
  copiedLabel = 'Copied',
  className,
}: CodeBlockCardProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copied, setCopied] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const syncFade = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const next = el.scrollWidth - el.clientWidth - el.scrollLeft > 2;
    setCanScrollRight((prev) => (prev === next ? prev : next));
  }, []);

  useEffect(() => {
    syncFade();
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => syncFade();
    el.addEventListener('scroll', onScroll, { passive: true });

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => syncFade());
      ro.observe(el);
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', onScroll, { passive: true });
    }

    return () => {
      el.removeEventListener('scroll', onScroll);
      ro?.disconnect();
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', onScroll);
      }
    };
  }, [syncFade, code]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(code).catch(() => {});
    }
    onCopy?.(code);
    setCopied(true);
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 1400);
  };

  const lines = code.split('\n');
  const langLabel = (language || 'text').trim() || 'text';
  const langAria = langLabel.toUpperCase();
  const rootClass = ['yui-codecard', className].filter(Boolean).join(' ');

  return (
    <div data-slot="code-block-card" className={rootClass}>
      <div className="yui-codecard-head">
        <div className="yui-codecard-head-left">
          {title ? <span className="yui-codecard-title">{title}</span> : null}
          <span className="yui-codecard-lang">{langLabel}</span>
        </div>
        <button
          type="button"
          className="yui-sr-code-copy"
          aria-label={copied ? `${copiedLabel} ${langAria}` : `${copyLabel} ${langAria}`}
          onClick={handleCopy}
        >
          <span key={copied ? 'check' : 'copy'} className="yui-sr-icon-swap">
            {copied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
          </span>
          <span>{copied ? copiedLabel : copyLabel}</span>
        </button>
      </div>

      <div
        className={['yui-data-scroll-wrap', canScrollRight ? 'has-right-fade' : '']
          .filter(Boolean)
          .join(' ')}
        data-scrollable-right={canScrollRight ? 'true' : 'false'}
      >
        <div ref={scrollRef} className="yui-codecard-scroll">
          <pre className="yui-codecard-pre">
            <code>
              {lines.map((line, idx) => (
                <span key={idx} className="yui-codecard-line">
                  {showLineNumbers ? (
                    <span className="yui-codecard-ln" aria-hidden="true">
                      {idx + 1}
                    </span>
                  ) : null}
                  <span className="yui-codecard-code">
                    {line}
                    {idx < lines.length - 1 ? '\n' : null}
                  </span>
                </span>
              ))}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
