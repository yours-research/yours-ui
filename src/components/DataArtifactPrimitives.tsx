import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCopyFeedback, useHorizontalFade } from '../utils/clipboard.js';
import {
  BookmarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CompareIcon,
  DocumentIcon,
} from '../icons/ApertureIcon.js';
import { CardCopyButton, CardScrollWrap, cn } from './CardChrome.js';

export interface DataTableColumn {
  key: string;
  label: string;
  align?: 'left' | 'right';
  numeric?: boolean;
  sortable?: boolean;
}

export type DataTableRow = Record<string, string | number>;

export interface DataTableSortState {
  key: string;
  direction: 'asc' | 'desc';
}

export interface DataTableCardProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  columns: readonly DataTableColumn[];
  rows: readonly DataTableRow[];
  sort?: DataTableSortState | null;
  defaultSort?: DataTableSortState | null;
  onSortChange?: (next: DataTableSortState | null) => void;
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

function compareCells(aRaw: string | number | undefined, bRaw: string | number | undefined): number {
  if (typeof aRaw === 'number' && typeof bRaw === 'number') {
    return aRaw - bRaw;
  }
  const aStr = String(aRaw ?? '');
  const bStr = String(bRaw ?? '');
  const aNumMatch = aStr.match(/^[-+]?\d+(?:\.\d+)?/);
  const bNumMatch = bStr.match(/^[-+]?\d+(?:\.\d+)?/);
  if (aNumMatch && bNumMatch && aNumMatch[0].length === aStr.replace(/[^\d.-].*$/, '').length) {
    const diff = Number(aNumMatch[0]) - Number(bNumMatch[0]);
    if (diff !== 0) return diff;
  }
  return aStr.localeCompare(bStr, undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * Clean hairline-ruled table card with `tabular-nums`, optional client-side
 * column sorting (`aria-sort`), dynamic horizontal scroll fade at `340px`,
 * and quiet one-click Markdown/CSV copy.
 */
export function DataTableCard({
  title,
  subtitle,
  badge,
  columns,
  rows,
  sort: controlledSort,
  defaultSort = null,
  onSortChange,
  copyFormat = 'markdown',
  copyLabel = 'Copy',
  onCopy,
  footerLabel,
  className,
}: DataTableCardProps) {
  const { copied, triggerCopy } = useCopyFeedback(1600);
  const [uncontrolledSort, setUncontrolledSort] = useState<DataTableSortState | null>(defaultSort);

  const activeSort = controlledSort !== undefined ? controlledSort : uncontrolledSort;

  const sortedRows = useMemo(() => {
    if (!activeSort) return rows;
    const col = columns.find((item) => item.key === activeSort.key);
    if (!col) return rows;
    const mult = activeSort.direction === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => compareCells(a[col.key], b[col.key]) * mult);
  }, [activeSort, columns, rows]);

  const { scrollRef, canScrollRight } = useHorizontalFade([columns, sortedRows]);

  const toggleSort = (key: string) => {
    let next: DataTableSortState | null;
    if (!activeSort || activeSort.key !== key) {
      next = { key, direction: 'asc' };
    } else if (activeSort.direction === 'asc') {
      next = { key, direction: 'desc' };
    } else {
      next = null;
    }
    if (controlledSort === undefined) {
      setUncontrolledSort(next);
    }
    onSortChange?.(next);
  };

  const handleCopy = () => {
    const formatted = formatTableData(columns, sortedRows, copyFormat);
    triggerCopy(formatted);
    onCopy?.(formatted);
  };

  const cardClass = cn('yui-card-shell yui-data-card', className);

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
          <CardCopyButton
            copied={copied}
            copyLabel={copyLabel}
            ariaLabel={copied ? 'Copied table' : `${copyLabel} ${copyFormat}`}
            onClick={handleCopy}
          />
        </div>
      ) : null}

      <CardScrollWrap scrollRef={scrollRef} canScrollRight={canScrollRight}>
        <table className="yui-data-table">
          <thead>
            <tr>
              {columns.map((col) => {
                const isSorted = activeSort?.key === col.key;
                const ariaSort: 'ascending' | 'descending' | 'none' | undefined = col.sortable
                  ? isSorted
                    ? activeSort.direction === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                  : undefined;
                const thClass = cn(
                  'yui-data-th',
                  (col.align === 'right' || col.numeric) && 'is-right',
                  col.sortable && 'is-sortable',
                );
                return (
                  <th key={col.key} scope="col" className={thClass} aria-sort={ariaSort}>
                    {col.sortable ? (
                      <button
                        type="button"
                        className="yui-data-sort-btn"
                        onClick={() => toggleSort(col.key)}
                      >
                        <span>{col.label}</span>
                        {isSorted && activeSort.direction === 'asc' ? (
                          <ChevronUpIcon size={11} className="yui-data-sort-icon is-active" />
                        ) : (
                          <ChevronDownIcon
                            size={11}
                            className={isSorted ? 'yui-data-sort-icon is-active' : 'yui-data-sort-icon'}
                          />
                        )}
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, rowIdx) => (
              <tr key={rowIdx} className="yui-data-tr">
                {columns.map((col) => {
                  const tdClass = cn(
                    'yui-data-td',
                    (col.align === 'right' || col.numeric) && 'is-right',
                    col.numeric && 'is-numeric',
                  );
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
      </CardScrollWrap>

      {footerLabel || (!title && !subtitle && !badge) ? (
        <div className="yui-genui-foot">
          <span className="yui-genui-muted">{footerLabel ?? ''}</span>
          {!title && !subtitle && !badge ? (
            <CardCopyButton
              copied={copied}
              copyLabel={copyLabel}
              ariaLabel={copied ? 'Copied table' : `${copyLabel} ${copyFormat}`}
              onClick={handleCopy}
            />
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
  capped?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onCopy?: (content: string) => void;
  onSave?: () => void;
  saveLabel?: string;
  copyLabel?: string;
  className?: string;
}

/**
 * Minimalist local artifact/note/snippet preview card with quick header copy,
 * file-type badge, optional capped scroll fade, and collapsible CSS grid body.
 */
export function ArtifactPreviewCard({
  title,
  fileType,
  meta,
  preview,
  collapsible = true,
  defaultExpanded = true,
  expanded: controlledExpanded,
  capped = false,
  onExpandedChange,
  onCopy,
  onSave,
  saveLabel = 'Save',
  copyLabel = 'Copy',
  className,
}: ArtifactPreviewCardProps) {
  const preRef = useRef<HTMLPreElement | null>(null);
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);
  const { copied, triggerCopy } = useCopyFeedback(1600);
  const [hasBottomFade, setHasBottomFade] = useState(false);

  const isExpanded = controlledExpanded ?? uncontrolledExpanded;

  const syncPreviewFade = useCallback(() => {
    const el = preRef.current;
    if (!capped || !isExpanded || !el) {
      setHasBottomFade(false);
      return;
    }
    setHasBottomFade(el.scrollHeight - el.clientHeight - el.scrollTop > 2);
  }, [capped, isExpanded]);

  useEffect(() => {
    syncPreviewFade();
    const el = preRef.current;
    if (!capped || !isExpanded || !el) return;
    el.addEventListener('scroll', syncPreviewFade, { passive: true });
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => syncPreviewFade());
      ro.observe(el);
    }
    return () => {
      el.removeEventListener('scroll', syncPreviewFade);
      ro?.disconnect();
    };
  }, [capped, isExpanded, preview, syncPreviewFade]);

  const toggleExpanded = () => {
    if (!collapsible) return;
    const next = !isExpanded;
    if (controlledExpanded === undefined) {
      setUncontrolledExpanded(next);
    }
    onExpandedChange?.(next);
  };

  const handleCopy = () => {
    triggerCopy(preview);
    onCopy?.(preview);
  };

  const cardClass = cn('yui-card-shell yui-artifact-card', className);
  const disclosureClass = cn('yui-disclosure', isExpanded && 'is-open');
  const chevronClass = cn('yui-artifact-chevron', isExpanded && 'is-open');
  const scrollWrapClass = cn('yui-artifact-scroll-wrap', hasBottomFade && 'has-bottom-fade');
  const preClass = cn('yui-artifact-pre', capped && 'is-capped');

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
        <div className="yui-action-group">
          <CardCopyButton
            copied={copied}
            copyLabel={copyLabel}
            dataSlot="artifact-header-copy"
            ariaLabel={copied ? 'Copied artifact' : `${copyLabel} ${title}`}
            onClick={handleCopy}
          />
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
      </div>

      <div className={disclosureClass} aria-hidden={!isExpanded}>
        <div className="yui-disclosure-inner">
          <div className={scrollWrapClass} data-bottom-fade={hasBottomFade ? 'true' : 'false'}>
            <pre ref={preRef} className={preClass}>
              {preview}
            </pre>
          </div>
        </div>
      </div>

      {onSave ? (
        <div className="yui-genui-foot">
          <span className="yui-genui-muted">Local artifact</span>
          <div className="yui-action-group">
            <button type="button" className="yui-micro-pill" onClick={onSave}>
              <BookmarkIcon size={11} />
              <span>{saveLabel}</span>
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
