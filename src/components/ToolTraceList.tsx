import {
  Children,
  Fragment,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ApertureIcon, ChevronDownIcon, ChevronRightIcon } from '../icons/ApertureIcon.js';
import type { ApertureIconName } from '../icons/iconData.js';
import { ToolStatusIcon, type ToolStatusKind } from '../icons/ToolStatusIcons.js';
import { cn } from '../utils/clipboard.js';
import { InlineToolStatus, ToolFavicon } from './InlineToolStatus.js';

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

const TOOL_STATUS_KINDS = new Set<string>([
  'thinking',
  'reading',
  'searching',
  'researching',
  'tabs',
  'analyzing',
  'calculating',
  'writing',
  'memory',
  'done',
  'blocked',
  'error',
]);

export interface StepTreeItemProps {
  children: ReactNode;
  branch?: boolean;
  continuesBelow?: boolean;
  branchesReachParentIcon?: boolean;
  className?: string;
}

/** Single row within `StepTree` rendering a `1px` vertical stem & horizontal elbow connector. */
export function StepTreeItem({
  children,
  branch = true,
  continuesBelow = false,
  branchesReachParentIcon = false,
  className,
}: StepTreeItemProps) {
  return (
    <div
      data-slot="step-tree-item"
      data-branch={branch ? 'true' : 'false'}
      data-continues={continuesBelow ? 'true' : undefined}
      className={cn('yui-st-item', branch && 'is-branch', continuesBelow && 'is-cont', className)}
    >
      <div className={cn('yui-st-rail', branchesReachParentIcon && 'is-wide')} aria-hidden="true">
        <div className="yui-st-stem" />
        {branch ? <div className="yui-st-elbow" /> : null}
      </div>
      <div data-step-tree-content="" className={cn('yui-st-content yui-flex-1', branch && 'is-branch')}>
        {children}
      </div>
    </div>
  );
}

export interface StepTreeProps {
  children: ReactNode;
  branchesReachParentIcon?: boolean;
  className?: string;
}

function flattenFragments(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? flattenFragments(child.props.children)
      : [child],
  );
}

/** Hierarchical work step tree assigning `StepTreeItem` hairline connectors to each child step. */
export function StepTree({ children, branchesReachParentIcon = false, className }: StepTreeProps) {
  const items = flattenFragments(children);
  if (items.length === 0) return null;

  return (
    <div data-slot="step-tree" className={cn('yui-col', className)}>
      {items.map((child, idx) => (
        <StepTreeItem key={idx} branchesReachParentIcon={branchesReachParentIcon}>
          {child}
        </StepTreeItem>
      ))}
    </div>
  );
}

export type AgentStepStatus = 'idle' | 'running' | 'success' | 'error' | 'blocked';

export interface AgentStepRowProps {
  icon?: ToolStatusKind | ApertureIconName;
  iconUrl?: string;
  title: ReactNode;
  label?: string;
  detail?: string;
  body?: ReactNode;
  status?: AgentStepStatus;
  statusText?: string;
  expandable?: boolean;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onToggle?: () => void;
  input?: string;
  output?: string;
  children?: ReactNode;
  className?: string;
}

/**
 * Quiet work timeline step row featuring muted icon, human verb + detail, hover-revealed
 * chevron, and expandable I/O payload or nested children.
 */
export function AgentStepRow({
  icon = 'thinking',
  iconUrl,
  title,
  label,
  detail,
  body,
  status = 'idle',
  statusText,
  expandable,
  expanded: controlledExpanded,
  defaultExpanded = false,
  onToggle,
  input,
  output,
  children,
  className,
}: AgentStepRowProps) {
  const bodyId = useId();
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);
  const hasPayload = Boolean(children || input || output);
  const canExpand = Boolean((expandable ?? hasPayload) && (hasPayload || onToggle));
  const isOpen = canExpand && (controlledExpanded ?? uncontrolledExpanded);

  const toggle = () => {
    if (!canExpand) return;
    if (controlledExpanded === undefined) setUncontrolledExpanded((prev) => !prev);
    onToggle?.();
  };

  const iconKind: ToolStatusKind | null =
    status === 'error' || status === 'blocked'
      ? status
      : TOOL_STATUS_KINDS.has(icon)
        ? (icon as ToolStatusKind)
        : null;

  return (
    <div
      data-slot="agent-step-row"
      data-status={status}
      className={cn('yui-col yui-step-row', className)}
    >
      <div className="yui-row yui-gap-7">
        <span className="yui-step-icon" aria-hidden="true">
          {iconUrl ? (
            <ToolFavicon favicon={iconUrl} />
          ) : iconKind ? (
            <ToolStatusIcon kind={iconKind} size={13} active={status === 'running'} />
          ) : (
            <ApertureIcon name={icon as ApertureIconName} size={13} />
          )}
        </span>

        <div className="yui-col-min">
          {label ? <span className="yui-trace-label">{label}</span> : null}
          <div className="yui-row yui-gap-5">
            {canExpand ? (
              <button
                type="button"
                className="yui-row yui-gap-5 yui-step-trigger"
                aria-expanded={isOpen}
                aria-controls={hasPayload ? bodyId : undefined}
                onClick={toggle}
              >
                <span className="yui-ellipsis yui-trace-action">{title}</span>
                {detail ? <span className="yui-ellipsis yui-trace-label">{detail}</span> : null}
                <ChevronDownIcon
                  size={12}
                  className={cn('yui-trace-chevron yui-step-chevron', isOpen && 'is-open')}
                />
              </button>
            ) : (
              <>
                <span className="yui-ellipsis yui-trace-action">{title}</span>
                {detail ? <span className="yui-ellipsis yui-trace-label">{detail}</span> : null}
              </>
            )}
          </div>
          {body ? <div className="yui-muted-note">{body}</div> : null}
        </div>

        {statusText || status === 'running' ? (
          <span className="yui-row yui-gap-4 yui-trace-latency">
            {status === 'running' ? <span className="yui-status-toast-dot yui-step-dot" aria-hidden="true" /> : null}
            {statusText ? <span>{statusText}</span> : null}
          </span>
        ) : null}
      </div>

      {hasPayload ? (
        <div
          id={bodyId}
          className={cn('yui-disclosure', isOpen && 'is-open')}
          aria-hidden={!isOpen}
          inert={!isOpen ? true : undefined}
        >
          <div className="yui-disclosure-inner">
            <div className="yui-step-children">
              {input || output ? (
                <div className="yui-well yui-trace-detail">
                  {input ? (
                    <div className="yui-col">
                      <span className="yui-perm-meta-label">Input</span>
                      <pre className="yui-trace-pre">{input}</pre>
                    </div>
                  ) : null}
                  {output ? (
                    <div className="yui-col">
                      <span className="yui-perm-meta-label">
                        {status === 'blocked' || status === 'error' ? 'Note' : 'Output'}
                      </span>
                      <pre className="yui-trace-pre">{output}</pre>
                    </div>
                  ) : null}
                </div>
              ) : null}
              {children}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export interface AgentStepsCardProps {
  children?: ReactNode;
  steps?: readonly ToolTraceStep[];
  /** When `hasFinal` transitions to `true`, auto-collapses unless manually toggled. */
  hasFinal?: boolean;
  active?: boolean;
  status?: ToolStatusKind;
  activityLabel?: string;
  activityDetail?: string;
  durationText?: string;
  summaryLabel?: string;
  toolCount?: number;
  thinkingCount?: number;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onToggle?: () => void;
  timer?: boolean;
  className?: string;
}

/**
 * Unified collapsible agent timeline grouping reasoning & intermediate tool steps before
 * an assistant answer: stays expanded while working, then auto-collapses to a quiet summary
 * row once `hasFinal` turns `true` (unless manually toggled).
 */
export function AgentStepsCard({
  children,
  steps,
  hasFinal = false,
  active,
  status,
  activityLabel,
  activityDetail,
  durationText,
  summaryLabel,
  expanded: controlledExpanded,
  defaultExpanded,
  onExpandedChange,
  onToggle,
  timer = true,
  className,
}: AgentStepsCardProps) {
  const panelId = useId();
  const userToggledRef = useRef(false);
  const prevHasFinalRef = useRef(hasFinal);
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState<boolean>(() =>
    defaultExpanded !== undefined ? defaultExpanded : !hasFinal,
  );

  useEffect(() => {
    if (hasFinal && !prevHasFinalRef.current && !userToggledRef.current) {
      if (controlledExpanded === undefined) setUncontrolledExpanded(false);
      onExpandedChange?.(false);
    }
    prevHasFinalRef.current = hasFinal;
  }, [hasFinal, controlledExpanded, onExpandedChange]);

  const isExpanded = controlledExpanded ?? uncontrolledExpanded;
  const isWorking = active ?? (!hasFinal && status !== 'error' && status !== 'blocked');
  const resolvedState: ToolStatusKind =
    status ?? (isWorking ? 'thinking' : 'done');

  const resolvedLabel = isWorking
    ? (activityLabel ?? 'Working')
    : (summaryLabel ?? (durationText ? `Worked for ${durationText}` : 'Worked'));

  const handleToggle = () => {
    userToggledRef.current = true;
    const next = !isExpanded;
    if (controlledExpanded === undefined) setUncontrolledExpanded(next);
    onToggle?.();
    onExpandedChange?.(next);
  };

  return (
    <section
      data-slot="agent-steps-card"
      data-expanded={isExpanded ? 'true' : 'false'}
      data-active={isWorking ? 'true' : 'false'}
      className={cn('yui-col', className)}
    >
      <button
        type="button"
        className="yui-trace-head yui-trace-head--inline"
        aria-expanded={isExpanded}
        aria-controls={panelId}
        onClick={handleToggle}
      >
        <InlineToolStatus
          state={resolvedState}
          label={resolvedLabel}
          detail={activityDetail}
          shimmer={isWorking}
          timer={timer && isWorking}
          elapsed={durationText}
          className="yui-trace-its"
          rightSlot={
            <ChevronRightIcon
              size={12}
              className={cn('yui-activity-chevron', isExpanded && 'is-open')}
            />
          }
        />
      </button>

      <div
        id={panelId}
        className={cn('yui-disclosure', isExpanded && 'is-open')}
        aria-hidden={!isExpanded}
        inert={!isExpanded ? true : undefined}
      >
        <div className="yui-disclosure-inner">
          <div className="yui-col-5 yui-pt-2">
            {children ?? (
              <StepTree>
                {(steps ?? []).map((step) => (
                  <AgentStepRow
                    key={step.id}
                    icon={inferToolKind(step)}
                    iconUrl={typeof step.favicon === 'string' ? step.favicon : undefined}
                    title={step.actionLabel ?? step.label ?? step.tool}
                    detail={step.detail}
                    status={step.status === 'done' ? 'success' : step.status}
                    statusText={
                      step.latencyLabel ??
                      (step.durationMs !== undefined ? formatDurationMs(step.durationMs) : undefined)
                    }
                    input={step.input}
                    output={step.output}
                  />
                ))}
              </StepTree>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
