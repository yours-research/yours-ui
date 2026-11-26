import { useId, useState } from 'react';
import {
  AlertIcon,
  ApertureIcon,
  CheckIcon,
  ChevronDownIcon,
  ShieldIcon,
} from '../icons/ApertureIcon.js';
import type { ApertureIconName } from '../icons/iconData.js';
import { MatrixOrb } from '../icons/MatrixOrb.js';

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
}

export interface ToolTraceListProps {
  steps: readonly ToolTraceStep[];
  title?: string;
  summary?: string;
  defaultCollapsed?: boolean;
  expandedStepId?: string | null;
  onToggleStep?: (stepId: string) => void;
  className?: string;
}

function resolveToolIcon(tool: string): ApertureIconName {
  const normalized = tool.toLowerCase();
  if (normalized.includes('read') || normalized.includes('page')) return 'page';
  if (normalized.includes('search')) return 'search';
  if (normalized.includes('memory')) return 'history';
  if (normalized.includes('sandbox') || normalized.includes('run')) return 'sliders';
  return 'spark-trend';
}

function StatusGlyph({ status }: { status: ToolTraceStatus }) {
  if (status === 'running') {
    return (
      <span className="yui-trace-status is-running" aria-label="Running">
        <MatrixOrb state="streaming" size={12} />
      </span>
    );
  }
  if (status === 'blocked') {
    return (
      <span className="yui-trace-status is-blocked" aria-label="Blocked">
        <ShieldIcon size={12} />
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="yui-trace-status is-error" aria-label="Error">
        <AlertIcon size={12} />
      </span>
    );
  }
  return (
    <span className="yui-trace-status is-done" aria-label="Done">
      <CheckIcon size={12} />
    </span>
  );
}

/**
 * Ultra-quiet Paper Page 9 collapsible step ledger for local tool invocations
 * (`read_tab`, `search_web_tab`, `run_sandbox`, `memory_query`), displaying Aperture icons,
 * calm status indicators, right-aligned `tabular-nums` latency, and expandable I/O drawers.
 */
export function ToolTraceList({
  steps,
  title = 'Tool trace',
  summary,
  defaultCollapsed = false,
  expandedStepId,
  onToggleStep,
  className,
}: ToolTraceListProps) {
  const baseId = useId();
  const [ledgerCollapsed, setLedgerCollapsed] = useState(defaultCollapsed);
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const step of steps) {
      if (step.defaultExpanded) initial[step.id] = true;
    }
    return initial;
  });

  const runningCount = steps.filter((step) => step.status === 'running').length;
  const resolvedSummary =
    summary ??
    (runningCount > 0
      ? `${runningCount} running · ${steps.length} total`
      : `${steps.length} ${steps.length === 1 ? 'step' : 'steps'}`);

  const cardClass = ['yui-card-shell', 'yui-trace-card', className].filter(Boolean).join(' ');

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
      className={cardClass}
      aria-label={title}
    >
      <button
        type="button"
        className="yui-trace-head"
        aria-expanded={!ledgerCollapsed}
        aria-controls={`${baseId}-ledger`}
        onClick={() => setLedgerCollapsed((prev) => !prev)}
      >
        <span className="yui-trace-head-left">
          <ApertureIcon name="sliders" size={12.5} className="yui-privacy-icon" />
          <span className="yui-trace-head-title">{title}</span>
        </span>
        <span className="yui-trace-head-right">
          <span className="yui-audit-time">{resolvedSummary}</span>
          <ChevronDownIcon
            size={12}
            className={ledgerCollapsed ? 'yui-trace-chevron' : 'yui-trace-chevron is-open'}
          />
        </span>
      </button>

      <div
        id={`${baseId}-ledger`}
        className={ledgerCollapsed ? 'yui-disclosure' : 'yui-disclosure is-open'}
        aria-hidden={ledgerCollapsed}
        inert={ledgerCollapsed ? true : undefined}
      >
        <div className="yui-disclosure-inner">
          <ul className="yui-list-plain yui-div-list">
            {steps.map((step) => {
              const hasDetail = Boolean(step.input || step.output);
              const stepOpen = hasDetail && isStepOpen(step.id);
              const detailId = `${baseId}-step-${step.id}`;
              const iconName = step.icon ?? resolveToolIcon(step.tool);

              return (
                <li
                  key={step.id}
                  className="yui-trace-row"
                  data-step-id={step.id}
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
                      <span className="yui-row yui-flex-1">
                        <StatusGlyph status={step.status} />
                        <ApertureIcon name={iconName} size={13} className="yui-trace-tool-icon" />
                        <span className="yui-col-min">
                          <span className="yui-ellipsis yui-trace-tool">{step.tool}</span>
                          {step.label ? <span className="yui-ellipsis yui-trace-label">{step.label}</span> : null}
                        </span>
                      </span>
                      <span className="yui-trace-right">
                        {step.latencyLabel ? (
                          <span className="yui-trace-latency">{step.latencyLabel}</span>
                        ) : null}
                        <ChevronDownIcon
                          size={12}
                          className={stepOpen ? 'yui-trace-chevron is-open' : 'yui-trace-chevron'}
                        />
                      </span>
                    </button>
                  ) : (
                    <div className="yui-trace-static">
                      <span className="yui-row yui-flex-1">
                        <StatusGlyph status={step.status} />
                        <ApertureIcon name={iconName} size={13} className="yui-trace-tool-icon" />
                        <span className="yui-col-min">
                          <span className="yui-ellipsis yui-trace-tool">{step.tool}</span>
                          {step.label ? <span className="yui-ellipsis yui-trace-label">{step.label}</span> : null}
                        </span>
                      </span>
                      <span className="yui-trace-right">
                        {step.latencyLabel ? (
                          <span className="yui-trace-latency">{step.latencyLabel}</span>
                        ) : null}
                      </span>
                    </div>
                  )}

                  {hasDetail ? (
                    <div
                      id={detailId}
                      className={stepOpen ? 'yui-disclosure is-open' : 'yui-disclosure'}
                      aria-hidden={!stepOpen}
                      inert={!stepOpen ? true : undefined}
                    >
                      <div className="yui-disclosure-inner">
                        <div className="yui-trace-detail">
                          {step.input ? (
                            <div className="yui-trace-io-block">
                              <span className="yui-perm-meta-label">Input</span>
                              <pre className="yui-trace-pre">{step.input}</pre>
                            </div>
                          ) : null}
                          {step.output ? (
                            <div className="yui-trace-io-block">
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
