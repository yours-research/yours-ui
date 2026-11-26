import { BookmarkIcon, CompareIcon, CopyIcon } from '../icons/ApertureIcon.js';
import { GreenLed } from '../layout/NotchStatusPill.js';

export interface CompareTableRow {
  feature: string;
  leftValue: string;
  rightValue: string;
  emphasize?: boolean;
}

export interface CompareTableProps {
  title: string;
  badgeText?: string;
  leftColumnTitle: string;
  rightColumnTitle: string;
  rows: readonly CompareTableRow[];
  footerLabel?: string;
  onCopy?: () => void;
  onSave?: () => void;
}

/** Inline comparison matrix (`GenUI.CompareTable`) styled for 348px side-panel cards. */
export function CompareTable({
  title,
  badgeText,
  leftColumnTitle,
  rightColumnTitle,
  rows,
  footerLabel,
  onCopy,
  onSave,
}: CompareTableProps) {
  return (
    <div className="yui-genui-card">
      <div className="yui-genui-head">
        <div className="yui-genui-title-row">
          <CompareIcon size={14} />
          <span className="yui-genui-title">{title}</span>
        </div>
        {badgeText ? (
          <div className="yui-micro-pill">
            <GreenLed />
            <span>{badgeText}</span>
          </div>
        ) : null}
      </div>

      <div className="yui-table-col-head">
        <span className="yui-table-cell-label">Detail</span>
        <span className="yui-table-cell-val">{leftColumnTitle}</span>
        <span className="yui-table-cell-val">{rightColumnTitle}</span>
      </div>

      <div>
        {rows.map((row, idx) => (
          <div
            key={`${row.feature}-${idx}`}
            className={row.emphasize ? 'yui-table-row is-emphasized' : 'yui-table-row'}
          >
            <span className="yui-table-cell-label">{row.feature}</span>
            <span className="yui-table-cell-val">{row.leftValue}</span>
            <span className="yui-table-cell-val">{row.rightValue}</span>
          </div>
        ))}
      </div>

      {footerLabel || onCopy || onSave ? (
        <div className="yui-genui-foot">
          <span className="yui-genui-muted">{footerLabel ?? ''}</span>
          <div className="yui-action-group">
            {onCopy ? (
              <button type="button" className="yui-micro-pill" onClick={onCopy}>
                <CopyIcon size={11} />
                <span>Copy</span>
              </button>
            ) : null}
            {onSave ? (
              <button type="button" className="yui-micro-pill" onClick={onSave}>
                <BookmarkIcon size={11} />
                <span>Save</span>
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
