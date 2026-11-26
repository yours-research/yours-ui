import { useState } from 'react';
import { TrashIcon, UndoIcon } from '../icons/ApertureIcon.js';
import { EmptyState } from './EmptyState.js';
import { SegmentedControl, type SegmentedOption } from './SegmentedControl.js';
import { StatusBadge, type StatusBadgeTone } from './StatusBadge.js';

export type MemoryTier = 'profile' | 'episodic' | 'working' | 'document';

export interface MemoryRecord {
  id: string;
  tier: MemoryTier;
  summary: string;
  sourceDomain?: string;
  relativeTime: string;
  groupLabel?: string;
  detail?: string;
  scoreLabel?: string;
}

export interface MemoryRecordCardProps {
  record: MemoryRecord;
  isForgotten?: boolean;
  onForget?: (id: string) => void;
  onUndo?: (id: string) => void;
  forgetLabel?: string;
  undoLabel?: string;
  onSelect?: (record: MemoryRecord) => void;
  className?: string;
}

const TIER_META: Record<MemoryTier, { label: string; tone: StatusBadgeTone }> = {
  profile: { label: 'Profile', tone: 'accent' },
  episodic: { label: 'Episodic', tone: 'neutral' },
  working: { label: 'Working', tone: 'local' },
  document: { label: 'Document', tone: 'amber' },
};

/**
 * Minimalist card for inspecting or forgetting a single local `@yours/memory`
 * record with tier badge, origin domain, tabular timestamp, and forget/undo action.
 */
export function MemoryRecordCard({
  record,
  isForgotten = false,
  onForget,
  onUndo,
  forgetLabel = 'Forget',
  undoLabel = 'Undo',
  onSelect,
  className,
}: MemoryRecordCardProps) {
  const tierMeta = TIER_META[record.tier];
  const cardClass = ['yui-mem-card', isForgotten ? 'is-forgotten' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      data-slot="memory-record-card"
      data-tier={record.tier}
      data-forgotten={isForgotten ? 'true' : 'false'}
      className={cardClass}
    >
      <div className="yui-mem-head">
        <div className="yui-action-group">
          <StatusBadge tone={tierMeta.tone} dot>
            {tierMeta.label}
          </StatusBadge>
          {record.scoreLabel ? (
            <span className="yui-mem-meta">{record.scoreLabel}</span>
          ) : null}
        </div>
        <div className="yui-row yui-shrink">
          {record.sourceDomain ? (
            <span className="yui-mem-domain">{record.sourceDomain}</span>
          ) : null}
          <span className="yui-mem-time">{record.relativeTime}</span>
        </div>
      </div>

      {onSelect && !isForgotten ? (
        <button
          type="button"
          className="yui-mem-summary-btn"
          onClick={() => onSelect(record)}
        >
          {record.summary}
        </button>
      ) : (
        <p className="yui-mem-summary">{record.summary}</p>
      )}

      {record.detail && !isForgotten ? (
        <p className="yui-mem-detail">{record.detail}</p>
      ) : null}

      {(isForgotten && onUndo) || (!isForgotten && onForget) ? (
        <div className="yui-actions-end yui-pt-2">
          {isForgotten && onUndo ? (
            <>
              <span className="yui-mem-meta">Marked to forget locally</span>
              <button
                type="button"
                className="yui-micro-pill"
                aria-label={`${undoLabel} forgetting memory`}
                onClick={() => onUndo(record.id)}
              >
                <UndoIcon size={11} />
                <span>{undoLabel}</span>
              </button>
            </>
          ) : onForget ? (
            <button
              type="button"
              className="yui-micro-pill"
              aria-label={`${forgetLabel} memory`}
              onClick={() => onForget(record.id)}
            >
              <TrashIcon size={11} />
              <span>{forgetLabel}</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export interface MemoryInspectorListProps {
  records: readonly MemoryRecord[];
  activeTier?: MemoryTier | 'all';
  defaultTier?: MemoryTier | 'all';
  onTierChange?: (tier: MemoryTier | 'all') => void;
  forgottenIds?: readonly string[];
  onForget?: (id: string) => void;
  onUndo?: (id: string) => void;
  onSelectRecord?: (record: MemoryRecord) => void;
  emptyTitle?: string;
  emptySubtitle?: string;
  filterLabel?: string;
  className?: string;
}

const FILTER_OPTIONS: readonly SegmentedOption<MemoryTier | 'all'>[] = [
  { value: 'all', label: 'All' },
  { value: 'profile', label: 'Profile' },
  { value: 'episodic', label: 'Episodic' },
  { value: 'working', label: 'Working' },
  { value: 'document', label: 'Document' },
];

/**
 * Filterable list of local `@yours/memory` records sized cleanly for drawers
 * and `FloatingContextSheet` trays across 340px–380px side panels.
 */
export function MemoryInspectorList({
  records,
  activeTier,
  defaultTier = 'all',
  onTierChange,
  forgottenIds,
  onForget,
  onUndo,
  onSelectRecord,
  emptyTitle = 'No local memories in this tier',
  emptySubtitle = 'Facts stored locally in SQLite FTS5 appear here for audit.',
  filterLabel = 'Filter memory tier',
  className,
}: MemoryInspectorListProps) {
  const [uncontrolledTier, setUncontrolledTier] = useState<MemoryTier | 'all'>(defaultTier);
  const resolvedTier = activeTier ?? uncontrolledTier;

  const setTier = (next: MemoryTier | 'all') => {
    if (activeTier === undefined) {
      setUncontrolledTier(next);
    }
    onTierChange?.(next);
  };

  const forgottenSet = new Set(forgottenIds ?? []);
  const filtered =
    resolvedTier === 'all' ? records : records.filter((item) => item.tier === resolvedTier);
  const hasGroups = filtered.some((item) => Boolean(item.groupLabel));

  const grouped: { label: string; items: MemoryRecord[] }[] = [];
  if (hasGroups) {
    const byLabel = new Map<string, MemoryRecord[]>();
    for (const record of filtered) {
      const label = record.groupLabel ?? 'Earlier';
      const bucket = byLabel.get(label);
      if (bucket) {
        bucket.push(record);
      } else {
        byLabel.set(label, [record]);
      }
    }
    for (const [label, items] of byLabel.entries()) {
      grouped.push({ label, items });
    }
  }

  const listClass = ['yui-col-10', className].filter(Boolean).join(' ');

  return (
    <div data-slot="memory-inspector-list" className={listClass}>
      <div className="yui-mem-filter">
        <SegmentedControl
          fullWidth
          value={resolvedTier}
          onChange={setTier}
          ariaLabel={filterLabel}
          options={FILTER_OPTIONS}
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyState title={emptyTitle} subtitle={emptySubtitle} orbState="idle" orbSize={20} />
      ) : hasGroups ? (
        <div className="yui-col-12">
          {grouped.map((group) => (
            <section
              key={group.label}
              data-slot="memory-group"
              aria-label={group.label}
              className="yui-mem-group"
            >
              <div className="yui-mem-group-head">
                <span className="yui-mem-group-title">{group.label}</span>
                <span className="yui-mem-group-count">{group.items.length}</span>
              </div>
              <div className="yui-col-8">
                {group.items.map((record) => (
                  <MemoryRecordCard
                    key={record.id}
                    record={record}
                    isForgotten={forgottenSet.has(record.id)}
                    onForget={onForget}
                    onUndo={onUndo}
                    onSelect={onSelectRecord}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="yui-col-8">
          {filtered.map((record) => (
            <MemoryRecordCard
              key={record.id}
              record={record}
              isForgotten={forgottenSet.has(record.id)}
              onForget={onForget}
              onUndo={onUndo}
              onSelect={onSelectRecord}
            />
          ))}
        </div>
      )}
    </div>
  );
}
