import { useMemo } from 'react';
import { useCopyFeedback, useHorizontalFade } from '../utils/clipboard.js';
import { CheckIcon, CopyIcon, DocumentIcon } from '../icons/ApertureIcon.js';

export type DiffLineType = 'context' | 'add' | 'remove';

export interface DiffLine {
  type: DiffLineType;
  content: string;
  oldLine?: number;
  newLine?: number;
}

export interface DiffCardProps {
  filename: string;
  language?: string;
  lines: readonly DiffLine[];
  patchedText?: string;
  additionsCount?: number;
  deletionsCount?: number;
  copyLabel?: string;
  onCopyPatched?: (patched: string) => void;
  footerLabel?: string;
  className?: string;
}

/**
 * Minimalist unified code/text diff card with `tabular-nums` line gutters,
 * `+`/`-` semantic Cotton Paper & Obsidian Dark markers, 340px horizontal scroll
 * edge fade, and Copy patched output action.
 */
export function DiffCard({
  filename,
  language,
  lines,
  patchedText,
  additionsCount,
  deletionsCount,
  copyLabel = 'Copy patched',
  onCopyPatched,
  footerLabel,
  className,
}: DiffCardProps) {
  const { scrollRef, canScrollRight } = useHorizontalFade([lines]);
  const { copied, triggerCopy } = useCopyFeedback(1600);

  const computedStats = useMemo(() => {
    let adds = 0;
    let dels = 0;
    const patched: string[] = [];
    for (const line of lines) {
      if (line.type === 'add') {
        adds += 1;
        patched.push(line.content);
      } else if (line.type === 'remove') {
        dels += 1;
      } else {
        patched.push(line.content);
      }
    }
    return {
      adds: additionsCount ?? adds,
      dels: deletionsCount ?? dels,
      patchedOutput: patchedText ?? patched.join('\n'),
    };
  }, [additionsCount, deletionsCount, lines, patchedText]);

  const handleCopy = () => {
    triggerCopy(computedStats.patchedOutput);
    onCopyPatched?.(computedStats.patchedOutput);
  };

  const cardClass = ['yui-card-shell', 'yui-diff-card', className].filter(Boolean).join(' ');
  const scrollWrapClass = [
    'yui-data-scroll-wrap',
    canScrollRight ? 'is-scrollable-right' : '',
  ]
    .filter(Boolean)
    .join(' ');

  let oldCursor = 1;
  let newCursor = 1;

  return (
    <section data-slot="diff-card" className={cardClass} aria-label={`Diff for ${filename}`}>
      <div className="yui-genui-head">
        <div className="yui-col-min">
          <div className="yui-genui-title-row">
            <DocumentIcon size={13} />
            <span className="yui-genui-title">{filename}</span>
            {language ? <span className="yui-artifact-type">{language}</span> : null}
          </div>
          <div className="yui-diff-stats" aria-label={`${computedStats.adds} additions and ${computedStats.dels} deletions`}>
            <span className="yui-diff-stat-add">+{computedStats.adds}</span>
            <span className="yui-diff-stat-sep" aria-hidden="true">/</span>
            <span className="yui-diff-stat-del">-{computedStats.dels}</span>
          </div>
        </div>
        <button
          type="button"
          className="yui-micro-pill"
          data-slot="diff-copy-btn"
          aria-label={copied ? 'Copied patched output' : copyLabel}
          onClick={handleCopy}
        >
          {copied ? <CheckIcon size={11} /> : <CopyIcon size={11} />}
          <span>{copied ? 'Copied' : copyLabel}</span>
        </button>
      </div>

      <div className={scrollWrapClass} data-scrollable-right={canScrollRight ? 'true' : 'false'}>
        <div ref={scrollRef} className="yui-data-scroll">
          <div className="yui-diff-lines" role="region" aria-label={`${filename} diff hunks`}>
            {lines.map((line, idx) => {
              const oldNum = line.type === 'add' ? '' : String(line.oldLine ?? oldCursor++);
              const newNum = line.type === 'remove' ? '' : String(line.newLine ?? newCursor++);
              const marker = line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' ';
              const lineClass = ['yui-diff-line', `yui-diff-line--${line.type}`].join(' ');

              return (
                <div key={idx} className={lineClass}>
                  <span className="yui-diff-ln" aria-hidden="true">
                    {oldNum}
                  </span>
                  <span className="yui-diff-ln" aria-hidden="true">
                    {newNum}
                  </span>
                  <span className="yui-diff-sigil" aria-hidden="true">
                    {marker}
                  </span>
                  <code className="yui-diff-code">{line.content || ' '}</code>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {footerLabel ? (
        <div className="yui-genui-foot">
          <span className="yui-genui-muted">{footerLabel}</span>
        </div>
      ) : null}
    </section>
  );
}
