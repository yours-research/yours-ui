import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BookmarkIcon,
  CheckIcon,
  ChevronDownIcon,
  CompareIcon,
  CopyIcon,
  DocumentIcon,
} from '../icons/ApertureIcon.js';

export interface DataTableColumn {
  key: string;
  label: string;
  align?: 'left' | 'right';
  numeric?: boolean;
}

export type DataTableRow = Record<string, string | number>;

export interface DataTableCardProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  columns: readonly DataTableColumn[];
  rows: readonly DataTableRow[];
  copyFormat?: 'markdown' | 'csv';
  copyLabel?: string;
  onCopy?: (formatted: string) => void;
  footerLabel?: string;
  className?: string;
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function formatTableData(
  columns: readonly DataTableColumn[],
  rows: readonly DataTableRow[],
  format: 'markdown' | 'csv' = 'markdown',
): string {
  const header = columns.map((col) => col.label);
  const body = rows.map((row) => columns.map((col) => String(row[col.key] ?? '')));

  if (format === 'csv') {
    return [header, ...body]
      .map((line) => line.map(escapeCsvCell).join(','))
      .join('\n');
  }

  const headLine = `| ${header.join(' | ')} |`;
  const divider = `| ${columns.map((col) => (col.align === 'right' || col.numeric ? '---:' : ':---')).join(' | ')} |`;
  const rowLines = body.map((line) => `| ${line.join(' | ')} |`);
  return [headLine, divider, ...rowLines].join('\n');
}

/**
 * Clean hairline-ruled table card with `tabular-nums`, dynamic horizontal scroll
 * edge fade at narrow `340px` widths, and quiet one-click Markdown/CSV copy.
 */
export function DataTableCard({
  title,
  subtitle,
  badge,
  columns,
  rows,
  copyFormat = 'markdown',
  copyLabel = 'Copy',
  onCopy,
  footerLabel,
  className,
}: DataTableCardProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copied, setCopied] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const syncHorizontalFade = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const next = el.scrollWidth - el.clientWidth - el.scrollLeft > 2;
    setCanScrollRight((prev) => (prev === next ? prev : next));
  }, []);

  useEffect(() => {
    syncHorizontalFade();
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => syncHorizontalFade();
    el.addEventListener('scroll', onScroll, { passive: true });

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => syncHorizontalFade());
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
  }, [syncHorizontalFade, columns, rows]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = () => {
    const formatted = formatTableData(columns, rows, copyFormat);
    void navigator.clipboard?.writeText(formatted).catch(() => {});
    onCopy?.(formatted);
    setCopied(true);
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 1600);
  };

  const cardClass = ['yui-data-card', className].filter(Boolean).join(' ');
  const scrollWrapClass = [
    'yui-data-scroll-wrap',
    canScrollRight ? 'is-scrollable-right' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section
      data-slot="data-table-card"
      className={cardClass}
      aria-label={title ?? 'Data table'}
    >
      {title || subtitle || badge ? (
        <div className="yui-genui-head">
          <div className="yui-col-min">
            <div className="yui-genui-title-row">
              <CompareIcon size={13} />
              {title ? <span className="yui-genui-title">{title}</span> : null}
              {badge ? <span className="yui-badge">{badge}</span> : null}
            </div>
            {subtitle ? <div className="yui-genui-muted">{subtitle}</div> : null}
          </div>
          <button
            type="button"
            className="yui-micro-pill"
            aria-label={copied ? 'Copied table' : `${copyLabel} ${copyFormat}`}
            onClick={handleCopy}
          >
            {copied ? <CheckIcon size={11} /> : <CopyIcon size={11} />}
            <span>{copied ? 'Copied' : copyLabel}</span>
          </button>
        </div>
      ) : null}

      <div
        className={scrollWrapClass}
        data-scrollable-right={canScrollRight ? 'true' : 'false'}
      >
        <div ref={scrollRef} className="yui-data-scroll">
          <table className="yui-data-table">
            <thead>
              <tr>
                {columns.map((col) => {
                  const thClass = [
                    'yui-data-th',
                    col.align === 'right' || col.numeric ? 'is-right' : '',
                  ]
                    .filter(Boolean)
                    .join(' ');
                  return (
                    <th key={col.key} scope="col" className={thClass}>
                      {col.label}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="yui-data-tr">
                  {columns.map((col) => {
                    const tdClass = [
                      'yui-data-td',
                      col.align === 'right' || col.numeric ? 'is-right' : '',
                      col.numeric ? 'is-numeric' : '',
                    ]
                      .filter(Boolean)
                      .join(' ');
                    return (
                      <td key={col.key} className={tdClass}>
                        {String(row[col.key] ?? '')}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {footerLabel || (!title && !subtitle && !badge) ? (
        <div className="yui-genui-foot">
          <span className="yui-genui-muted">{footerLabel ?? ''}</span>
          {!title && !subtitle && !badge ? (
            <button
              type="button"
              className="yui-micro-pill"
              aria-label={copied ? 'Copied table' : `${copyLabel} ${copyFormat}`}
              onClick={handleCopy}
            >
              {copied ? <CheckIcon size={11} /> : <CopyIcon size={11} />}
              <span>{copied ? 'Copied' : copyLabel}</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export interface ArtifactPreviewCardProps {
  title: string;
  fileType: string;
  meta?: string;
  preview: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onCopy?: (content: string) => void;
  onSave?: () => void;
  saveLabel?: string;
  copyLabel?: string;
  className?: string;
}

/**
 * Minimalist local artifact/note/snippet preview card with file-type badge,
 * tabular metadata line, collapsible CSS grid body, and quiet copy/save actions.
 */
export function ArtifactPreviewCard({
  title,
  fileType,
  meta,
  preview,
  collapsible = true,
  defaultExpanded = true,
  expanded: controlledExpanded,
  onExpandedChange,
  onCopy,
  onSave,
  saveLabel = 'Save',
  copyLabel = 'Copy',
  className,
}: ArtifactPreviewCardProps) {
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isExpanded = controlledExpanded ?? uncontrolledExpanded;

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, []);

  const toggleExpanded = () => {
    if (!collapsible) return;
    const next = !isExpanded;
    if (controlledExpanded === undefined) {
      setUncontrolledExpanded(next);
    }
    onExpandedChange?.(next);
  };

  const handleCopy = () => {
    void navigator.clipboard?.writeText(preview).catch(() => {});
    onCopy?.(preview);
    setCopied(true);
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 1600);
  };

  const cardClass = ['yui-artifact-card', className].filter(Boolean).join(' ');
  const disclosureClass = [
    'yui-disclosure',
    isExpanded ? 'is-open' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const chevronClass = [
    'yui-artifact-chevron',
    isExpanded ? 'is-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      data-slot="artifact-preview-card"
      data-expanded={isExpanded ? 'true' : 'false'}
      className={cardClass}
    >
      <div className="yui-genui-head">
        <div className="yui-col-min">
          <div className="yui-genui-title-row">
            <DocumentIcon size={13} />
            <span className="yui-genui-title">{title}</span>
            <span className="yui-artifact-type">{fileType}</span>
          </div>
          {meta ? <div className="yui-artifact-meta">{meta}</div> : null}
        </div>
        {collapsible ? (
          <button
            type="button"
            className="yui-icon-btn"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? `Collapse ${title}` : `Expand ${title}`}
            onClick={toggleExpanded}
          >
            <ChevronDownIcon size={13} className={chevronClass} />
          </button>
        ) : null}
      </div>

      <div className={disclosureClass} aria-hidden={!isExpanded}>
        <div className="yui-disclosure-inner">
          <pre className="yui-artifact-pre">{preview}</pre>
        </div>
      </div>

      <div className="yui-genui-foot">
        <span className="yui-genui-muted">Local artifact</span>
        <div className="yui-action-group">
          <button
            type="button"
            className="yui-micro-pill"
            aria-label={copied ? 'Copied artifact' : `${copyLabel} artifact`}
            onClick={handleCopy}
          >
            {copied ? <CheckIcon size={11} /> : <CopyIcon size={11} />}
            <span>{copied ? 'Copied' : copyLabel}</span>
          </button>
          {onSave ? (
            <button type="button" className="yui-micro-pill" onClick={onSave}>
              <BookmarkIcon size={11} />
              <span>{saveLabel}</span>
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
