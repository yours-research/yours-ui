import { useState } from 'react';
import { CheckIcon, CopyIcon } from '../icons/ApertureIcon.js';

export interface CodeBlockProps {
  code: string;
  language?: string;
  onCopy?: (code: string) => void;
}

/** Clean bordered code block with header copy feedback. */
export function CodeBlock({ code, language = 'Snippet', onCopy }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy?.(code);
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="yui-code-block">
      <div className="yui-code-head">
        <span>{language}</span>
        <button type="button" className="yui-icon-btn" onClick={handleCopy}>
          {copied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="yui-code-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}
