import { useState } from 'react';
import { ArrowDownIcon, CheckIcon, CopyIcon } from '../icons/ApertureIcon.js';
import { useCopyFeedback } from '../utils/clipboard.js';
import { CardPrivacyNote, cn } from './CardChrome.js';
import { SegmentedControl, type SegmentedOption } from './SegmentedControl.js';

export type ExportSessionFormat = 'markdown' | 'json' | 'text';

export interface ExportSessionOptions {
  format: ExportSessionFormat;
  includeToolTraces: boolean;
  includeCitations: boolean;
}

export interface ExportSessionCardProps {
  title?: string;
  subtitle?: string;
  metaLabel?: string;
  format?: ExportSessionFormat;
  defaultFormat?: ExportSessionFormat;
  onFormatChange?: (format: ExportSessionFormat) => void;
  includeToolTraces?: boolean;
  defaultIncludeToolTraces?: boolean;
  onToggleToolTraces?: (next: boolean) => void;
  showToolTracesToggle?: boolean;
  includeCitations?: boolean;
  defaultIncludeCitations?: boolean;
  onToggleCitations?: (next: boolean) => void;
  showCitationsToggle?: boolean;
  previewText?: string;
  copyLabel?: string;
  downloadLabel?: string;
  privacyNote?: string;
  onCopy?: (options: ExportSessionOptions) => void;
  onDownload?: (options: ExportSessionOptions) => void;
  disabled?: boolean;
  className?: string;
}

const FORMAT_OPTIONS: readonly SegmentedOption<ExportSessionFormat>[] = [
  { value: 'markdown', label: 'Markdown' },
  { value: 'json', label: 'JSON' },
  { value: 'text', label: 'Plain text' },
];

/**
 * Minimalist Paper Page 9 local conversation & artifact export card with
 * Markdown / JSON / Plain text format selector, optional trace & citation toggles,
 * size/count readout, Copy & Download actions, and calm local-only notice.
 */
export function ExportSessionCard({
  title = 'Export conversation',
  subtitle = 'Save transcript locally without leaving your browser.',
  metaLabel,
  format: controlledFormat,
  defaultFormat = 'markdown',
  onFormatChange,
  includeToolTraces: controlledTraces,
  defaultIncludeToolTraces = true,
  onToggleToolTraces,
  showToolTracesToggle = true,
  includeCitations: controlledCitations,
  defaultIncludeCitations = true,
  onToggleCitations,
  showCitationsToggle = true,
  previewText,
  copyLabel = 'Copy',
  downloadLabel = 'Download',
  privacyNote = 'Local file · Nothing uploaded',
  onCopy,
  onDownload,
  disabled = false,
  className,
}: ExportSessionCardProps) {
  const [internalFormat, setInternalFormat] = useState<ExportSessionFormat>(defaultFormat);
  const [internalTraces, setInternalTraces] = useState(defaultIncludeToolTraces);
  const [internalCitations, setInternalCitations] = useState(defaultIncludeCitations);
  const { copied, triggerCopy } = useCopyFeedback();

  const format = controlledFormat ?? internalFormat;
  const includeToolTraces = controlledTraces ?? internalTraces;
  const includeCitations = controlledCitations ?? internalCitations;

  const currentOptions: ExportSessionOptions = {
    format,
    includeToolTraces,
    includeCitations,
  };

  const handleFormatChange = (next: ExportSessionFormat) => {
    if (controlledFormat === undefined) setInternalFormat(next);
    onFormatChange?.(next);
  };

  const handleToggleTraces = () => {
    const next = !includeToolTraces;
    if (controlledTraces === undefined) setInternalTraces(next);
    onToggleToolTraces?.(next);
  };

  const handleToggleCitations = () => {
    const next = !includeCitations;
    if (controlledCitations === undefined) setInternalCitations(next);
    onToggleCitations?.(next);
  };

  const handleCopy = () => {
    triggerCopy(previewText);
    onCopy?.(currentOptions);
  };

  const rootClass = cn('yui-card-shell yui-export-card', className);

  return (
    <section
      data-slot="export-session-card"
      data-format={format}
      className={rootClass}
      aria-label={title}
    >
      <div className="yui-col yui-export-head">
        <div className="yui-export-title-row">
          <h3 className="yui-export-title">{title}</h3>
          {metaLabel ? <span className="yui-export-meta">{metaLabel}</span> : null}
        </div>
        {subtitle ? <p className="yui-export-sub">{subtitle}</p> : null}
      </div>

      <SegmentedControl
        options={FORMAT_OPTIONS}
        value={format}
        onChange={handleFormatChange}
        size="sm"
        fullWidth
        ariaLabel="Export format"
      />

      {showToolTracesToggle || showCitationsToggle ? (
        <div className="yui-list-plain yui-well yui-storage-list yui-div-list">
          {showToolTracesToggle ? (
            <div className="yui-row-between yui-export-toggle-row">
              <span className="yui-export-toggle-label">Include tool traces</span>
              <button
                type="button"
                role="switch"
                aria-checked={includeToolTraces}
                aria-label="Include tool traces"
                disabled={disabled}
                className={includeToolTraces ? 'yui-switch is-checked' : 'yui-switch'}
                onClick={handleToggleTraces}
              >
                <span className="yui-switch-thumb" aria-hidden="true" />
              </button>
            </div>
          ) : null}
          {showCitationsToggle ? (
            <div className="yui-row-between yui-export-toggle-row">
              <span className="yui-export-toggle-label">Include citations</span>
              <button
                type="button"
                role="switch"
                aria-checked={includeCitations}
                aria-label="Include citations"
                disabled={disabled}
                className={includeCitations ? 'yui-switch is-checked' : 'yui-switch'}
                onClick={handleToggleCitations}
              >
                <span className="yui-switch-thumb" aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="yui-actions-end">
        {onCopy ? (
          <button
            type="button"
            className="yui-pill-btn yui-export-copy-btn"
            disabled={disabled}
            onClick={handleCopy}
          >
            {copied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
            <span>{copied ? 'Copied' : copyLabel}</span>
          </button>
        ) : null}
        {onDownload ? (
          <button
            type="button"
            className="yui-pill-btn yui-pill-btn--primary yui-export-dl-btn"
            disabled={disabled}
            onClick={() => onDownload(currentOptions)}
          >
            <ArrowDownIcon size={12} />
            <span>{downloadLabel}</span>
          </button>
        ) : null}
      </div>

      <CardPrivacyNote className="yui-storage-privacy yui-privacy-foot yui-export-privacy" privacyNote={privacyNote} />
    </section>
  );
}
