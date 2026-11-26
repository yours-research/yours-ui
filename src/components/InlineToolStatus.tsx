import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '../icons/ApertureIcon.js';
import { ToolStatusIcon, type ToolStatusKind } from '../icons/ToolStatusIcons.js';
import { cn } from '../utils/clipboard.js';

export interface ShimmerTextProps {
  children: ReactNode;
  active?: boolean;
  className?: string;
}

/**
 * Clean-room glare sweep typography (`background-clip: text`) with zero inline
 * styles and crisp static ink fallbacks under reduced motion & forced colors.
 */
export function ShimmerText({ children, active = true, className }: ShimmerTextProps) {
  return (
    <span
      data-slot="shimmer-text"
      data-shimmer={active ? 'active' : 'static'}
      className={cn('yui-shimmer-text', active && 'is-active', className)}
    >
      {children}
    </span>
  );
}

export interface InlineToolStateMeta {
  label?: string;
  detail?: string;
  icon?: ToolStatusKind;
  shimmer?: boolean;
}

export interface InlineToolStatusProps {
  state: ToolStatusKind;
  label?: string;
  detail?: string;
  favicon?: string | ReactNode;
  states?: Partial<Record<ToolStatusKind, string | InlineToolStateMeta>>;
  timer?: boolean;
  elapsed?: string;
  shimmer?: boolean;
  rightSlot?: ReactNode;
  className?: string;
}

const DEFAULT_LABELS: Record<ToolStatusKind, string> = {
  thinking: 'Thinking',
  reading: 'Reading page',
  searching: 'Searching the web',
  researching: 'Researching',
  tabs: 'Checking open tabs',
  analyzing: 'Analyzing',
  calculating: 'Calculating',
  writing: 'Writing response',
  memory: 'Recalling memory',
  done: 'Done',
  blocked: 'Blocked by guard',
  error: 'Step failed',
};

export function isSettledToolState(state: ToolStatusKind): boolean {
  return state === 'done' || state === 'blocked' || state === 'error';
}

/** Shared CSS-hidden broken-image safe favicon / icon slot for tool status rows. */
export function ToolFavicon({ favicon }: { favicon?: string | ReactNode }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => {
    setBroken(false);
  }, [favicon]);
  if (!favicon) return null;
  if (typeof favicon !== 'string') {
    return (
      <span className="yui-its-favicon-slot" aria-hidden="true">
        {favicon}
      </span>
    );
  }
  return (
    <img
      src={favicon}
      alt=""
      aria-hidden="true"
      className={cn('yui-its-favicon', broken && 'is-hidden')}
      onError={() => setBroken(true)}
    />
  );
}

/**
 * Quiet, borderless 32px inline AI & tool status row featuring rotating
 * icon transitions, vertical blur-crossfade verb/detail updates, optional
 * continuous timer, and glare-swept typography cleanly aligned for MV3 panels.
 */
export function InlineToolStatus({
  state,
  label,
  detail,
  favicon,
  states,
  timer = false,
  elapsed,
  shimmer,
  rightSlot,
  className,
}: InlineToolStatusProps) {
  const override = states?.[state];
  const meta: InlineToolStateMeta =
    typeof override === 'string' ? { label: override } : (override ?? {});

  const resolvedIcon = meta.icon ?? state;
  const resolvedLabel = label ?? meta.label ?? DEFAULT_LABELS[state];
  const resolvedDetail = detail ?? meta.detail;
  const isSettled = isSettledToolState(state);
  const isActive = !isSettled;
  const shouldShimmer = shimmer ?? meta.shimmer ?? isActive;

  const [liveSeconds, setLiveSeconds] = useState(1);
  const [settledSeconds, setSettledSeconds] = useState<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!timer || elapsed) {
      startRef.current = null;
      return;
    }

    if (isActive) {
      if (startRef.current === null) {
        startRef.current = Date.now();
        setLiveSeconds(1);
      }
      setSettledSeconds(null);
      const id = window.setInterval(() => {
        if (startRef.current === null) return;
        setLiveSeconds(Math.max(1, Math.round((Date.now() - startRef.current) / 1000)));
      }, 1000);
      return () => window.clearInterval(id);
    }

    if (startRef.current !== null) {
      const total = Math.max(1, Math.round((Date.now() - startRef.current) / 1000));
      setSettledSeconds(total);
      startRef.current = null;
    }
    return undefined;
  }, [timer, elapsed, isActive]);

  const timerText =
    elapsed ??
    (timer
      ? isActive
        ? `${liveSeconds}s`
        : settledSeconds !== null
          ? state === 'error' || state === 'blocked'
            ? `Failed after ${settledSeconds}s`
            : `Worked for ${settledSeconds}s`
          : null
      : null);

  const transitionKey = `${state}:${resolvedLabel}:${resolvedDetail ?? ''}`;

  return (
    <div
      data-slot="inline-tool-status"
      data-state={state}
      role="status"
      aria-live="polite"
      className={cn('yui-its', `is-${state}`, className)}
    >
      <span key={resolvedIcon} className="yui-its-icon-swap">
        <ToolStatusIcon kind={resolvedIcon} size={16} active={isActive} />
      </span>

      <span key={transitionKey} className="yui-its-copy-swap">
        <ShimmerText active={shouldShimmer} className="yui-its-label">
          {resolvedLabel}
        </ShimmerText>

        <ToolFavicon favicon={favicon} />

        {resolvedDetail ? (
          <span className="yui-its-detail yui-ellipsis">{resolvedDetail}</span>
        ) : null}
      </span>

      {timerText || rightSlot ? (
        <span className="yui-its-right">
          {timerText ? <span className="yui-its-elapsed">{timerText}</span> : null}
          {rightSlot}
        </span>
      ) : null}
    </div>
  );
}

export interface ToolStepCardProps {
  status: 'running' | 'done' | 'error';
  title: string;
  state?: ToolStatusKind;
  detail?: string;
  favicon?: string | ReactNode;
  variant?: 'inline' | 'card';
  durationLabel?: string;
  summary?: string;
  details?: string;
  defaultExpanded?: boolean;
  className?: string;
}

/**
 * Clean-room inline/card tool step capsule pairing animated `ToolStatusIcon`
 * and `ShimmerText` during execution with collapsible execution details.
 */
export function ToolStepCard({
  status,
  title,
  state,
  detail,
  favicon,
  variant = 'inline',
  durationLabel,
  summary,
  details,
  defaultExpanded = false,
  className,
}: ToolStepCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasBody = Boolean(summary || details);
  const glyphKind: ToolStatusKind =
    status === 'error' ? 'error' : status === 'done' ? (state ?? 'done') : (state ?? 'thinking');

  return (
    <div
      data-slot="tool-step-card"
      data-variant={variant}
      data-status={status}
      className={cn(
        'yui-tool-card',
        variant === 'inline' && 'yui-tool-card--inline',
        className,
      )}
    >
      <div className="yui-tool-card-head">
        <div className="yui-row yui-flex-1 yui-gap-8">
          <ToolStatusIcon kind={glyphKind} size={15} active={status === 'running'} />
          <ShimmerText active={status === 'running'} className="yui-tool-card-title">
            {title}
          </ShimmerText>
          <ToolFavicon favicon={favicon} />
          {detail ? <span className="yui-its-detail yui-ellipsis">{detail}</span> : null}
        </div>
        <div className="yui-action-group">
          {durationLabel ? <span className="yui-speed-readout">{durationLabel}</span> : null}
          {hasBody ? (
            <button
              type="button"
              className="yui-icon-btn"
              aria-label={expanded ? 'Hide tool details' : 'Show tool details'}
              aria-expanded={expanded}
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded ? <ChevronUpIcon size={12} /> : <ChevronDownIcon size={12} />}
            </button>
          ) : null}
        </div>
      </div>
      {hasBody ? (
        <div
          className={cn('yui-disclosure', expanded && 'is-open')}
          aria-hidden={!expanded}
          inert={!expanded ? true : undefined}
        >
          <div className="yui-disclosure-inner">
            <div className="yui-tool-card-body">
              {summary ? <div>{summary}</div> : null}
              {details ? <div className="yours-telemetry">{details}</div> : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
