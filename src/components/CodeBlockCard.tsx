import { CheckIcon, CopyIcon } from '../icons/ApertureIcon.js';
import { useCopyFeedback, useHorizontalFade } from '../utils/clipboard.js';

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
  const { scrollRef, canScrollRight } = useHorizontalFade([code]);
  const { copied, triggerCopy } = useCopyFeedback();

  const handleCopy = () => {
    triggerCopy(code);
    onCopy?.(code);
  };

  const lines = code.split('\n');
  const langLabel = (language || 'text').trim() || 'text';
  const langAria = langLabel.toUpperCase();
  const rootClass = ['yui-card-shell', 'yui-codecard', className].filter(Boolean).join(' ');

  return (
    <div data-slot="code-block-card" className={rootClass}>
      <div className="yui-row-between yui-codecard-head">
        <div className="yui-codecard-head-left">
          {title ? <span className="yui-ellipsis yui-codecard-title">{title}</span> : null}
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
        <div ref={scrollRef} className="yui-x-scroll">
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
