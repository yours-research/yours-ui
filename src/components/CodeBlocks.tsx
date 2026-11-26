import { useCopyFeedback, useHorizontalFade } from '../utils/clipboard.js';
import { CardCopyButton, CardScrollWrap, cn } from './CardChrome.js';

export interface CodeBlockProps {
  code: string;
  language?: string;
  onCopy?: (code: string) => void;
}

/** Clean bordered code block with header copy feedback. */
export function CodeBlock({ code, language = 'Snippet', onCopy }: CodeBlockProps) {
  const { copied, triggerCopy } = useCopyFeedback(1200);

  return (
    <div className="yui-code-block">
      <div className="yui-row-between yui-bar-head yui-muted-note">
        <span>{language}</span>
        <CardCopyButton
          copied={copied}
          className="yui-icon-btn"
          iconSize={12}
          onClick={() => {
            onCopy?.(code);
            triggerCopy(code);
          }}
        />
      </div>
      <pre className="yui-code-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

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

  const lines = code.split('\n');
  const langLabel = (language || 'text').trim() || 'text';
  const langAria = langLabel.toUpperCase();

  return (
    <div data-slot="code-block-card" className={cn('yui-card-shell yui-codecard', className)}>
      <div className="yui-row-between yui-codecard-head">
        <div className="yui-codecard-head-left">
          {title ? <span className="yui-ellipsis yui-codecard-title">{title}</span> : null}
          <span className="yui-codecard-lang">{langLabel}</span>
        </div>
        <CardCopyButton
          copied={copied}
          copyLabel={copyLabel}
          copiedLabel={copiedLabel}
          className="yui-sr-code-copy"
          iconSize={12}
          iconSwap
          ariaLabel={copied ? `${copiedLabel} ${langAria}` : `${copyLabel} ${langAria}`}
          onClick={() => {
            triggerCopy(code);
            onCopy?.(code);
          }}
        />
      </div>

      <CardScrollWrap scrollRef={scrollRef} canScrollRight={canScrollRight} fadeClass="has-right-fade">
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
      </CardScrollWrap>
    </div>
  );
}
