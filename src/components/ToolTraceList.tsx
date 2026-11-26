import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ChevronDownIcon } from '../icons/ApertureIcon.js';
import type { ApertureIconName } from '../icons/iconData.js';
import { ToolStatusIcon, type ToolStatusKind } from '../icons/ToolStatusIcons.js';
import { cn } from '../utils/clipboard.js';
import { InlineToolStatus } from './InlineToolStatus.js';

export type ToolTraceStatus = 'running' | 'done' | 'blocked' | 'error';

export interface ToolTraceStep {
  id: string;
  tool: string;
  label?: string;
  icon?: ApertureIconName;
  status: ToolTraceStatus;
  latencyLabel?: string;
  input?: string;
  output?: string;
  defaultExpanded?: boolean;
  state?: ToolStatusKind;
  actionLabel?: string;
  detail?: string;
  favicon?: string | ReactNode;
  durationMs?: number;
}

export interface ToolTraceListProps {
  steps: readonly ToolTraceStep[];
  title?: string;
  summary?: string;
  defaultCollapsed?: boolean;
  expandedStepId?: string | null;
  onToggleStep?: (stepId: string) => void;
  variant?: 'inline' | 'card';
  timer?: boolean;
  className?: string;
}

export type ToolChainProps = ToolTraceListProps;

function inferToolKind(step: ToolTraceStep): ToolStatusKind {
  if (step.state) return step.state;
  const t = step.tool.toLowerCase();
  if (t.includes('read') || t.includes('page') || t.includes('fetch')) return 'reading';
  if (t.includes('search')) return 'searching';
  if (t.includes('tab')) return 'tabs';
  if (t.includes('calc') || t.includes('sandbox') || t.includes('analy') || t.includes('run')) {
    return 'analyzing';
  }
  if (t.includes('memory') || t.includes('vault')) return 'memory';
  if (t.includes('writ') || t.includes('draft')) return 'writing';
  return 'thinking';
}

const VERBS: Record<ToolStatusKind, readonly [string, string]> = {
  thinking: ['Thinking', 'Thought'],
  reading: ['Reading active page', 'Read active page'],
  searching: ['Searching the web', 'Searched the web'],
  researching: ['Researching', 'Researched'],
  tabs: ['Checking open tabs', 'Checked open tabs'],
  analyzing: ['Calculating', 'Calculated'],
  calculating: ['Calculating', 'Calculated'],
  writing: ['Writing response', 'Wrote response'],
  memory: ['Recalling memory', 'Recalled memory'],
  done: ['Completed', 'Completed'],
  blocked: ['Blocked by guard', 'Blocked by guard'],
  error: ['Step failed', 'Step failed'],
};

function formatDurationMs(ms: number): string {
  const safe = Math.max(0, ms);
  return safe < 1000 ? `${Math.round(safe)}ms` : `${(safe / 1000).toFixed(1)}s`;
}

function parseStepMs(step: ToolTraceStep): number {
  if (typeof step.durationMs === 'number' && Number.isFinite(step.durationMs)) {
    return step.durationMs;
  }
  if (!step.latencyLabel) return 0;
  const m = step.latencyLabel.match(/([\d.]+)\s*(ms|s)\b/i);
  if (!m) return 0;
  const val = parseFloat(m[1]);
  return m[2].toLowerCase() === 's' ? val * 1000 : val;
}

function StepGlyph({ step, kind }: { step: ToolTraceStep; kind: ToolStatusKind }) {
  const glyphKind: ToolStatusKind =
    step.status === 'blocked'
      ? 'blocked'
      : step.status === 'error'
        ? 'error'
        : step.status === 'running'
          ? kind
          : 'done';

  return (
    <span className={cn('yui-trace-status', `is-${step.status}`)} aria-hidden="true">
      <ToolStatusIcon kind={glyphKind} size={13.5} active={step.status === 'running'} />
    </span>
  );
}

/**
 * Quiet borderless rotating shimmer tool chain (`variant="inline"`, default)
 * or bordered card ledger (`variant="card"`), tracking active step verbs,
 * subtle favicons/details, continuous timer, and an expandable 1px hairline
 * timeline rail with inspectable I/O payloads.
 */
export function ToolTraceList({
  steps,
  title = 'Tool trace',
  summary,
  defaultCollapsed,
  expandedStepId,
  onToggleStep,
  variant = 'inline',
  timer = false,
  className,
}: ToolTraceListProps) {
  const baseId = useId();

  let activeIndex = -1;
  steps.forEach((s, idx) => {
    if (s.status === 'running') activeIndex = idx;
  });
  const isRunning = activeIndex !== -1;

  const manualRef = useRef(false);
  const [ledgerCollapsed, setLedgerCollapsed] = useState<boolean>(() =>
    defaultCollapsed !== undefined ? defaultCollapsed : !isRunning,
  );
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const step of steps) {
      if (step.defaultExpanded) initial[step.id] = true;
    }
    return initial;
  });

  useEffect(() => {
    if (defaultCollapsed === undefined && !manualRef.current) {
      setLedgerCollapsed(!isRunning);
    }
  }, [isRunning, defaultCollapsed]);

  const activeStep = isRunning ? steps[activeIndex] : undefined;
  const hasError = steps.some((s) => s.status === 'error');
  const hasBlocked = steps.some((s) => s.status === 'blocked');
  const totalMs = steps.reduce((acc, s) => acc + parseStepMs(s), 0);
  const totalElapsed = totalMs > 0 ? formatDurationMs(totalMs) : undefined;

  const singleSettled = steps.length === 1 ? steps[0] : undefined;
  const singleKind = singleSettled ? inferToolKind(singleSettled) : 'done';
  const settledSummary =
    summary ??
    (singleSettled
      ? singleSettled.actionLabel ?? VERBS[singleKind][1]
      : `Used ${steps.length} ${steps.length === 1 ? 'tool' : 'tools'}`);
  const settledDetail = singleSettled ? (singleSettled.detail ?? singleSettled.label) : undefined;
  const settledState: ToolStatusKind = hasError ? 'error' : hasBlocked ? 'blocked' : 'done';

  const activeKind = activeStep ? inferToolKind(activeStep) : settledState;
  const headerLabel = activeStep
    ? (activeStep.actionLabel ?? VERBS[activeKind][0])
    : settledSummary;
  const headerDetail = activeStep ? (activeStep.detail ?? activeStep.label) : settledDetail;
  const headerElapsed = activeStep
    ? (activeStep.latencyLabel ??
      (activeStep.durationMs !== undefined ? formatDurationMs(activeStep.durationMs) : undefined))
    : totalElapsed;

  const isStepOpen = (stepId: string) =>
    expandedStepId !== undefined ? expandedStepId === stepId : Boolean(uncontrolledExpanded[stepId]);

  const toggleStep = (stepId: string) => {
    if (expandedStepId === undefined) {
      setUncontrolledExpanded((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
    }
    onToggleStep?.(stepId);
  };

  return (
    <section
      data-slot="tool-trace-list"
      data-variant={variant}
      data-running={isRunning ? 'true' : 'false'}
      className={cn(
        variant === 'card' ? 'yui-card-shell yui-trace-card' : 'yui-trace-inline',
        className,
      )}
      aria-label={title}
    >
      <button
        type="button"
        className={cn('yui-trace-head', variant === 'inline' && 'yui-trace-head--inline')}
        aria-expanded={!ledgerCollapsed}
        aria-controls={`${baseId}-ledger`}
        onClick={() => {
          manualRef.current = true;
          setLedgerCollapsed((prev) => !prev);
        }}
      >
        <InlineToolStatus
          state={activeStep ? activeKind : settledState}
          label={headerLabel}
          detail={headerDetail}
          favicon={activeStep?.favicon}
          shimmer={isRunning}
          timer={timer}
          elapsed={headerElapsed}
          className="yui-trace-its"
          rightSlot={
            <span className="yui-action-group">
              {isRunning && steps.length > 1 ? (
                <span className="yui-trace-step-badge">{`${activeIndex + 1}/${steps.length}`}</span>
              ) : null}
              <ChevronDownIcon
                size={12}
                className={cn('yui-trace-chevron', !ledgerCollapsed && 'is-open')}
              />
            </span>
          }
        />
      </button>

      <div
        id={`${baseId}-ledger`}
        className={cn('yui-disclosure', !ledgerCollapsed && 'is-open')}
        aria-hidden={ledgerCollapsed}
        inert={ledgerCollapsed ? true : undefined}
      >
        <div className="yui-disclosure-inner">
          <ul
            className={cn(
              'yui-list-plain',
              variant === 'inline' ? 'yui-trace-rail-list' : 'yui-div-list',
            )}
          >
            {steps.map((step) => {
              const stepKind = inferToolKind(step);
              const hasDetail = Boolean(step.input || step.output);
              const stepOpen = hasDetail && isStepOpen(step.id);
              const detailId = `${baseId}-step-${step.id}`;
              const displayTitle =
                step.actionLabel ??
                (variant === 'inline' ? VERBS[stepKind][step.status === 'running' ? 0 : 1] : step.tool);
              const displaySub = step.detail ?? step.label;
              const latencyText =
                step.latencyLabel ??
                (step.durationMs !== undefined ? formatDurationMs(step.durationMs) : undefined);

              const rowHead = (
                <>
                  <span className="yui-row yui-flex-1">
                    <StepGlyph step={step} kind={stepKind} />
                    <span className="yui-col-min">
                      <span
                        className={cn(
                          'yui-ellipsis',
                          variant === 'inline' ? 'yui-trace-action' : 'yui-trace-tool',
                        )}
                      >
                        {displayTitle}
                      </span>
                      {displaySub ? (
                        <span className="yui-ellipsis yui-trace-label">{displaySub}</span>
                      ) : null}
                    </span>
                  </span>
                  <span className="yui-row yui-gap-5 yui-shrink-0">
                    {latencyText ? <span className="yui-trace-latency">{latencyText}</span> : null}
                    {hasDetail ? (
                      <ChevronDownIcon
                        size={12}
                        className={cn('yui-trace-chevron', stepOpen && 'is-open')}
                      />
                    ) : null}
                  </span>
                </>
              );

              return (
                <li
                  key={step.id}
                  className="yui-trace-row"
                  data-step-id={step.id}
                  data-tool={step.tool}
                  data-status={step.status}
                >
                  {hasDetail ? (
                    <button
                      type="button"
                      className="yui-trace-trigger"
                      aria-expanded={stepOpen}
                      aria-controls={detailId}
                      onClick={() => toggleStep(step.id)}
                    >
                      {rowHead}
                    </button>
                  ) : (
                    <div className="yui-trace-static">{rowHead}</div>
                  )}

                  {hasDetail ? (
                    <div
                      id={detailId}
                      className={cn('yui-disclosure', stepOpen && 'is-open')}
                      aria-hidden={!stepOpen}
                      inert={!stepOpen ? true : undefined}
                    >
                      <div className="yui-disclosure-inner">
                        <div className="yui-trace-detail">
                          {step.input ? (
                            <div className="yui-col">
                              <span className="yui-perm-meta-label">Input</span>
                              <pre className="yui-trace-pre">{step.input}</pre>
                            </div>
                          ) : null}
                          {step.output ? (
                            <div className="yui-col">
                              <span className="yui-perm-meta-label">
                                {step.status === 'blocked' || step.status === 'error'
                                  ? 'Note'
                                  : 'Output'}
                              </span>
                              <pre className="yui-trace-pre">{step.output}</pre>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

export const ToolChain = ToolTraceList;
