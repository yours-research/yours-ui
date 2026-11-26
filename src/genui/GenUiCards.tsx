import { useState } from 'react';
import {
  BookmarkIcon,
  CheckIcon,
  ChecklistIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CompareIcon,
  ComposeIcon,
  CopyIcon,
  ExternalLinkIcon,
  HistoryIcon,
  InsertPageIcon,
  PageScanIcon,
  QuoteIcon,
  ShieldIcon,
  SparkTrendIcon,
} from '../icons/ApertureIcon.js';
import { GreenLed } from '../layout/NotchPrimitives.js';

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

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface ChecklistCardProps {
  title: string;
  items: readonly ChecklistItem[];
  onToggleItem?: (id: string) => void;
  onCopy?: () => void;
  onDraftAction?: () => void;
  draftActionLabel?: string;
}

/** Interactive task checklist (`GenUI.Checklist`) with live completion progress bar. */
export function ChecklistCard({
  title,
  items,
  onToggleItem,
  onCopy,
  onDraftAction,
  draftActionLabel = 'Draft follow-up',
}: ChecklistCardProps) {
  const doneCount = items.filter((item) => item.done).length;
  const remaining = Math.max(0, items.length - doneCount);

  return (
    <div className="yui-genui-card">
      <div className="yui-genui-head">
        <div className="yui-genui-title-row">
          <ChecklistIcon size={14} />
          <span className="yui-genui-title">{title}</span>
        </div>
        <span className="yui-speed-readout">
          {doneCount} of {items.length}
        </span>
      </div>

      <progress
        className="yui-check-progress-track"
        max={Math.max(1, items.length)}
        value={doneCount}
      />

      <div className="yui-genui-body">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="yui-check-item-row"
            aria-pressed={item.done}
            onClick={() => onToggleItem?.(item.id)}
          >
            <span className={item.done ? 'yui-check-circle is-done' : 'yui-check-circle'}>
              {item.done ? <CheckIcon size={10} /> : null}
            </span>
            <span className={item.done ? 'yui-check-item-text is-done' : 'yui-check-item-text'}>
              {item.label}
            </span>
          </button>
        ))}
      </div>

      <div className="yui-genui-foot">
        <span className="yui-genui-muted">
          {remaining} item{remaining === 1 ? '' : 's'} remaining
        </span>
        <div className="yui-action-group">
          {onCopy ? (
            <button type="button" className="yui-micro-pill" onClick={onCopy}>
              <CopyIcon size={11} />
              <span>Copy</span>
            </button>
          ) : null}
          {onDraftAction ? (
            <button type="button" className="yui-micro-pill" onClick={onDraftAction}>
              <ComposeIcon size={11} />
              <span>{draftActionLabel}</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export interface PageBriefCardProps {
  title: string;
  subtitle?: string;
  originLabel?: string;
  bullets: readonly string[];
  highlightsCount?: number;
  highlightsContent?: string;
  onCopy?: () => void;
}

/** Structured webpage or document summary card (`GenUI.PageBrief`). */
export function PageBriefCard({
  title,
  subtitle,
  originLabel = 'This tab',
  bullets,
  highlightsCount,
  highlightsContent,
  onCopy,
}: PageBriefCardProps) {
  const [showHighlights, setShowHighlights] = useState(false);

  return (
    <div className="yui-genui-card">
      <div className="yui-genui-head">
        <div className="yui-genui-title-row">
          <span className="yui-icon-badge">
            <PageScanIcon size={14} />
          </span>
          <div className="yui-col-min">
            <div className="yui-genui-title">{title}</div>
            {subtitle ? <div className="yui-genui-muted">{subtitle}</div> : null}
          </div>
        </div>
        <span className="yui-speed-readout">{originLabel}</span>
      </div>

      <div className="yui-genui-body">
        <ul className="yui-brief-list">
          {bullets.map((bullet, idx) => (
            <li key={idx}>{bullet}</li>
          ))}
        </ul>
        {showHighlights && highlightsContent ? (
          <div className="yui-draft-well">{highlightsContent}</div>
        ) : null}
      </div>

      <div className="yui-genui-foot">
        {highlightsCount !== undefined ? (
          <button
            type="button"
            className="yui-micro-pill"
            aria-expanded={showHighlights}
            onClick={() => setShowHighlights((prev) => !prev)}
          >
            <QuoteIcon size={11} />
            <span>
              {highlightsCount} highlight{highlightsCount === 1 ? '' : 's'}
            </span>
            {showHighlights ? <ChevronUpIcon size={11} /> : <ChevronDownIcon size={11} />}
          </button>
        ) : (
          <span />
        )}
        {onCopy ? (
          <button type="button" className="yui-micro-pill" onClick={onCopy}>
            <CopyIcon size={11} />
            <span>Copy brief</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}

export interface DraftToneOption {
  id: string;
  label: string;
  content: string;
}

export interface DraftCardProps {
  title?: string;
  tones: readonly DraftToneOption[];
  activeToneId?: string;
  onSelectTone?: (id: string) => void;
  onCopy?: (content: string) => void;
  onPrimaryAction?: (content: string) => void;
  primaryActionLabel?: string;
}

/** Inline multi-tone reply draft composer (`GenUI.DraftCard`). */
export function DraftCard({
  title = 'Reply draft',
  tones,
  activeToneId,
  onSelectTone,
  onCopy,
  onPrimaryAction,
  primaryActionLabel = 'Insert into page',
}: DraftCardProps) {
  const [internalToneId, setInternalToneId] = useState(tones[0]?.id ?? '');
  const selectedId = activeToneId ?? internalToneId;
  const activeTone = tones.find((t) => t.id === selectedId) ?? tones[0];

  return (
    <div className="yui-genui-card">
      <div className="yui-genui-head">
        <div className="yui-genui-title-row">
          <ComposeIcon size={13} />
          <span className="yui-genui-title">{title}</span>
        </div>
        <div className="yui-tone-group" role="tablist" aria-label="Draft tone">
          {tones.map((tone) => {
            const active = tone.id === activeTone?.id;
            return (
              <button
                key={tone.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={active ? 'yui-tone-btn is-active' : 'yui-tone-btn'}
                onClick={() => {
                  setInternalToneId(tone.id);
                  onSelectTone?.(tone.id);
                }}
              >
                {tone.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="yui-genui-body">
        <div className="yui-draft-well">{activeTone?.content ?? ''}</div>
      </div>

      <div className="yui-genui-foot">
        {onCopy ? (
          <button
            type="button"
            className="yui-micro-pill"
            onClick={() => activeTone && onCopy(activeTone.content)}
          >
            <CopyIcon size={11} />
            <span>Copy</span>
          </button>
        ) : (
          <span />
        )}
        {onPrimaryAction ? (
          <button
            type="button"
            className="yui-pill-btn yui-pill-btn--primary"
            onClick={() => activeTone && onPrimaryAction(activeTone.content)}
          >
            <InsertPageIcon size={12} />
            <span>{primaryActionLabel}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}

export interface EntityField {
  label: string;
  value: string;
}

export interface EntitySummaryCardProps {
  title: string;
  subtitle?: string;
  tag?: string;
  fields: readonly EntityField[];
  onSave?: () => void;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
}

/** Structured entity summary card (`GenUI.EntitySummary`) with 2x2 metadata tiles. */
export function EntitySummaryCard({
  title,
  subtitle,
  tag,
  fields,
  onSave,
  primaryActionLabel = 'Open link',
  onPrimaryAction,
}: EntitySummaryCardProps) {
  return (
    <div className="yui-genui-card">
      <div className="yui-genui-head">
        <div className="yui-col-min">
          <div className="yui-genui-title">{title}</div>
          {subtitle ? <div className="yui-genui-muted">{subtitle}</div> : null}
        </div>
        {tag ? <span className="yui-badge">{tag}</span> : null}
      </div>

      <div className="yui-genui-body">
        <div className="yui-entity-grid">
          {fields.map((field, idx) => (
            <div key={`${field.label}-${idx}`} className="yui-entity-tile">
              <span className="yui-genui-muted">{field.label}</span>
              <strong className="yui-entity-val">{field.value}</strong>
            </div>
          ))}
        </div>
      </div>

      {onSave || onPrimaryAction ? (
        <div className="yui-genui-foot">
          {onSave ? (
            <button type="button" className="yui-micro-pill" onClick={onSave}>
              <BookmarkIcon size={11} />
              <span>Save</span>
            </button>
          ) : (
            <span />
          )}
          {onPrimaryAction ? (
            <button type="button" className="yui-pill-btn yui-pill-btn--primary" onClick={onPrimaryAction}>
              <span>{primaryActionLabel}</span>
              <ExternalLinkIcon size={11} />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export interface ChoiceOption {
  id: string;
  title: string;
  description?: string;
}

export interface ChoicePromptCardProps {
  question: string;
  hint?: string;
  options: readonly ChoiceOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

/** Inline multiple-choice disambiguation card (`GenUI.ChoicePrompt`). */
export function ChoicePromptCard({
  question,
  hint = 'Choose one option to continue',
  options,
  selectedId,
  onSelect,
}: ChoicePromptCardProps) {
  return (
    <div className="yui-genui-card">
      <div className="yui-genui-body">
        <div>
          <div className="yui-genui-title">{question}</div>
          {hint ? <div className="yui-genui-muted">{hint}</div> : null}
        </div>
        <div className="yui-w-full yui-col-8" role="radiogroup" aria-label={question}>
          {options.map((opt) => {
            const selected = opt.id === selectedId;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className={selected ? 'yui-choice-row is-selected' : 'yui-choice-row'}
                onClick={() => onSelect(opt.id)}
              >
                <div className="yui-col-min">
                  <div className="yui-prompt-capsule-title">{opt.title}</div>
                  {opt.description ? (
                    <div className="yui-genui-muted">{opt.description}</div>
                  ) : null}
                </div>
                <span className={selected ? 'yui-radio-ring is-checked' : 'yui-radio-ring'} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export interface MetricStripCardProps {
  label: string;
  averageLabel?: string;
  primaryValue: string;
  unitLabel?: string;
  deltaLabel?: string;
  values: readonly number[];
  lowLabel?: string;
  highLabel?: string;
  footnote?: string;
}

function buildSparklineGeometry(values: readonly number[], width = 318, height = 56) {
  if (values.length === 0) {
    return { pathD: 'M 4 28 L 314 28', areaD: '', avgY: 28, lastX: 314, lastY: 28 };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const padX = 4;
  const padY = 8;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const points = values.map((val, idx) => {
    const x = values.length === 1 ? width / 2 : padX + (idx / (values.length - 1)) * innerW;
    const norm = (val - min) / span;
    const y = padY + (1 - norm) * innerH;
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  });

  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const avgY = Math.round((padY + (1 - (avg - min) / span) * innerH) * 10) / 10;

  const pathD = points.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');
  const first = points[0] ?? { x: width / 2, y: height / 2 };
  const last = points[points.length - 1] ?? { x: width / 2, y: height / 2 };
  const areaD = points.length >= 2 ? `${pathD} L ${last.x} ${height - 4} L ${first.x} ${height - 4} Z` : '';

  return { pathD, areaD, avgY, lastX: last.x, lastY: last.y };
}

/**
 * Sparkline and metric strip (`GenUI.MetricStrip`) for tracking throughput,
 * latency, pricing history, or token budgets inline in the side panel.
 */
export function MetricStripCard({
  label,
  averageLabel,
  primaryValue,
  unitLabel,
  deltaLabel,
  values,
  lowLabel,
  highLabel,
  footnote,
}: MetricStripCardProps) {
  const { pathD, areaD, avgY, lastX, lastY } = buildSparklineGeometry(values);
  const rangeText = [lowLabel ? `Low ${lowLabel}` : '', highLabel ? `High ${highLabel}` : '']
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="yui-genui-card">
      <div className="yui-genui-head">
        <div className="yui-genui-title-row">
          <SparkTrendIcon size={14} />
          <span className="yui-genui-title">{label}</span>
        </div>
        {averageLabel ? <span className="yui-speed-readout">{averageLabel}</span> : null}
      </div>

      <div className="yui-genui-body">
        <div className="yui-action-row">
          <div className="yui-action-group">
            <strong className="yui-metric-primary">{primaryValue}</strong>
            {unitLabel ? <span className="yui-genui-muted">{unitLabel}</span> : null}
          </div>
          {deltaLabel ? <span className="yui-delta-pill">{deltaLabel}</span> : null}
        </div>

        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height={56} viewBox="0 0 318 56" fill="none" aria-hidden="true">
          {areaD ? <path d={areaD} className="yui-spark-area" /> : null}
          <line x1="4" y1={avgY} x2="314" y2={avgY} className="yui-spark-ref-line" strokeWidth="1" strokeDasharray="3 3" />
          <path d={pathD} className="yui-spark-path" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={lastX} cy={lastY} r="3.5" className="yui-spark-marker" strokeWidth="1.75" />
        </svg>
      </div>

      {rangeText || footnote ? (
        <div className="yui-genui-foot">
          <span className="yui-speed-readout">{rangeText}</span>
          {footnote ? <span className="yui-genui-muted">{footnote}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

export interface PageActionField {
  label: string;
  value: string;
}

export interface PageActionCardProps {
  title: string;
  subtitle?: string;
  fields: readonly PageActionField[];
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/** DOM form-fill / page mutation preview card requiring user approval (`GenUI.PageAction`). */
export function PageActionCard({
  title,
  subtitle = 'Only applied locally — nothing submitted yet',
  fields,
  cancelLabel = 'Cancel',
  confirmLabel = 'Apply',
  onCancel,
  onConfirm,
}: PageActionCardProps) {
  return (
    <div className="yui-genui-card">
      <div className="yui-genui-head">
        <div className="yui-genui-title-row">
          <span className="yui-icon-badge">
            <ShieldIcon size={14} />
          </span>
          <div className="yui-col-min">
            <div className="yui-genui-title">{title}</div>
            {subtitle ? <div className="yui-genui-muted">{subtitle}</div> : null}
          </div>
        </div>
      </div>

      <div className="yui-genui-body">
        <div className="yui-kv-list">
          {fields.map((field, idx) => (
            <div key={`${field.label}-${idx}`} className="yui-kv-row">
              <span className="yui-kv-key">{field.label}</span>
              <span className="yui-kv-val">{field.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="yui-genui-foot">
        <span />
        <div className="yui-btn-row">
          <button type="button" className="yui-pill-btn" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="yui-pill-btn yui-pill-btn--primary" onClick={onConfirm}>
            <CheckIcon size={12} />
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export type TimelineStepStatus = 'done' | 'active' | 'pending' | 'error';

export interface TimelineStep {
  id: string;
  label: string;
  detail?: string;
  timestamp?: string;
  status?: TimelineStepStatus;
}

export interface TimelineCardProps {
  title: string;
  subtitle?: string;
  metaLabel?: string;
  steps: readonly TimelineStep[];
  onSelectStep?: (step: TimelineStep) => void;
  className?: string;
}

/**
 * Vertical Paper Page 9 chronology card (`GenUI.TimelineCard`) for research
 * timelines, multi-step execution plans, or page history with hairline rails.
 */
export function TimelineCard({
  title,
  subtitle,
  metaLabel,
  steps,
  onSelectStep,
  className,
}: TimelineCardProps) {
  const rootClass = ['yui-genui-card', className].filter(Boolean).join(' ');

  return (
    <section data-slot="timeline-card" className={rootClass} aria-label={title}>
      <div className="yui-genui-head">
        <div className="yui-genui-title-row">
          <span className="yui-icon-badge" aria-hidden="true">
            <HistoryIcon size={14} />
          </span>
          <div className="yui-col-min">
            <h3 className="yui-genui-title">{title}</h3>
            {subtitle ? <p className="yui-genui-muted">{subtitle}</p> : null}
          </div>
        </div>
        {metaLabel ? <span className="yui-speed-readout">{metaLabel}</span> : null}
      </div>

      <div className="yui-genui-body">
        <ol className="yui-list-plain yui-col">
          {steps.map((step, idx) => {
            const status = step.status ?? 'pending';
            const hasStem = idx < steps.length - 1;
            const dotClass = ['yui-tl-dot', `is-${status}`].join(' ');
            const itemClass = ['yui-tl-item', `is-${status}`].join(' ');

            const body = (
              <>
                <div className="yui-row-between">
                  <span className="yui-tl-label">{step.label}</span>
                  {step.timestamp ? <span className="yui-tl-time">{step.timestamp}</span> : null}
                </div>
                {step.detail ? <p className="yui-tl-detail">{step.detail}</p> : null}
              </>
            );

            return (
              <li key={step.id} className={itemClass} data-status={status}>
                <div className="yui-tl-rail" aria-hidden="true">
                  <span className={dotClass} />
                  {hasStem ? <span className="yui-tl-stem" /> : null}
                </div>
                {onSelectStep ? (
                  <button type="button" className="yui-tl-btn" onClick={() => onSelectStep(step)}>
                    {body}
                  </button>
                ) : (
                  <div className="yui-tl-content">{body}</div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
