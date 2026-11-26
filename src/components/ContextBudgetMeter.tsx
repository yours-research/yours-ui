import { useId, useState } from 'react';
import { ChevronDownIcon, SlidersIcon } from '../icons/ApertureIcon.js';

export type ContextBudgetLevel = 'normal' | 'warning' | 'critical';

export interface ContextBudgetSegment {
  id: string;
  label: string;
  tokensLabel: string;
  percent?: number;
}

export interface ContextBudgetMeterProps {
  usedTokens: number;
  maxTokens: number;
  title?: string;
  summaryLabel?: string;
  segments?: readonly ContextBudgetSegment[];
  defaultExpanded?: boolean;
  className?: string;
}

export function formatCompactTokens(tokens: number): string {
  const safe = Math.max(0, Math.round(tokens));
  if (safe >= 1000) {
    const scaled = (safe / 1000).toFixed(safe % 1000 === 0 ? 0 : 1).replace(/\.0$/, '');
    return `${scaled}k`;
  }
  return String(safe);
}

/**
 * Ultra-quiet Paper Page 9 context-window gauge built on native `<progress>`
 * with zero inline styles, `tabular-nums` capacity readout, restrained amber/red
 * threshold tinting (`>= 80%` / `>= 95%`), and optional collapsible breakdown rows.
 */
export function ContextBudgetMeter({
  usedTokens,
  maxTokens,
  title = 'Context window',
  summaryLabel,
  segments,
  defaultExpanded = false,
  className,
}: ContextBudgetMeterProps) {
  const breakdownId = useId();
  const [expanded, setExpanded] = useState(defaultExpanded);

  const safeMax = Math.max(1, maxTokens);
  const safeUsed = Math.max(0, usedTokens);
  const rawPct = Math.round((safeUsed / safeMax) * 100);
  const clampedPct = Math.max(0, Math.min(100, rawPct));

  const level: ContextBudgetLevel =
    rawPct >= 95 ? 'critical' : rawPct >= 80 ? 'warning' : 'normal';

  const resolvedSummary =
    summaryLabel ??
    `${formatCompactTokens(safeUsed)} / ${formatCompactTokens(safeMax)} · ${rawPct}%`;

  const hasBreakdown = Boolean(segments && segments.length > 0);
  const rootClass = [
    'yui-budget-card',
    level === 'warning' ? 'is-warning' : '',
    level === 'critical' ? 'is-critical' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section
      data-slot="context-budget-meter"
      data-level={level}
      className={rootClass}
      aria-label={title}
    >
      <div className="yui-budget-top">
        {hasBreakdown ? (
          <button
            type="button"
            className="yui-budget-toggle"
            aria-expanded={expanded}
            aria-controls={breakdownId}
            onClick={() => setExpanded((prev) => !prev)}
          >
            <span className="yui-budget-title-row">
              <SlidersIcon size={12.5} className="yui-budget-icon" />
              <span className="yui-budget-title">{title}</span>
            </span>
            <span className="yui-budget-right">
              <span className="yui-budget-summary">{resolvedSummary}</span>
              <ChevronDownIcon
                size={12}
                className={expanded ? 'yui-budget-chevron is-open' : 'yui-budget-chevron'}
              />
            </span>
          </button>
        ) : (
          <div className="yui-budget-static">
            <span className="yui-budget-title-row">
              <SlidersIcon size={12.5} className="yui-budget-icon" />
              <span className="yui-budget-title">{title}</span>
            </span>
            <span className="yui-budget-summary">{resolvedSummary}</span>
          </div>
        )}
        <div className="yui-budget-bar-wrap">
          <progress
            className="yui-budget-progress"
            value={clampedPct}
            max={100}
            aria-label={`${title}: ${resolvedSummary}`}
          />
        </div>
      </div>

      {hasBreakdown && segments ? (
        <div
          id={breakdownId}
          className={expanded ? 'yui-disclosure is-open' : 'yui-disclosure'}
          aria-hidden={!expanded}
          inert={!expanded ? true : undefined}
        >
          <div className="yui-disclosure-inner">
            <ul className="yui-budget-breakdown" role="list">
              {segments.map((seg) => (
                <li key={seg.id} className="yui-budget-seg-row" data-segment-id={seg.id}>
                  <span className="yui-budget-seg-label">{seg.label}</span>
                  <span className="yui-budget-seg-vals">
                    {seg.percent !== undefined ? (
                      <span className="yui-budget-seg-pct">{seg.percent}%</span>
                    ) : null}
                    <span className="yui-budget-seg-tok">{seg.tokensLabel}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  );
}
