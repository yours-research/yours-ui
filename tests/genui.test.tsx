import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ChecklistCard,
  ChoicePromptCard,
  CompareTable,
  DraftCard,
  EntitySummaryCard,
  MetricStripCard,
  PageActionCard,
  PageBriefCard,
} from '../src/genui/index.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let mounted: { container: HTMLElement; root: Root } | null = null;

function renderNode(node: React.ReactNode) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(node);
  });
  mounted = { container, root };
  return container;
}

afterEach(() => {
  if (mounted) {
    const { container, root } = mounted;
    act(() => {
      root.unmount();
    });
    container.remove();
    mounted = null;
  }
});

describe('@yours/ui Generative UI primitives (8 cards)', () => {
  it('renders all 8 GenUI cards and dispatches interactive callbacks cleanly', () => {
    const onToggle = vi.fn();
    const onInsertDraft = vi.fn();
    const onSelectChoice = vi.fn();
    const onConfirmPageAction = vi.fn();

    const el = renderNode(
      <div>
        <CompareTable
          title="Pro vs. Team"
          badgeText="Annual saves 17%"
          leftColumnTitle="Pro"
          rightColumnTitle="Team"
          rows={[
            { feature: '10 seats / mo', leftValue: '$200', rightValue: '$250' },
            { feature: 'Annual total', leftValue: '$2,000', rightValue: '$2,500', emphasize: true },
          ]}
          onCopy={() => {}}
        />
        <ChecklistCard
          title="Before you sign"
          items={[
            { id: 'c1', label: 'Confirm cap', done: true },
            { id: 'c2', label: 'Verify utilities', done: false },
          ]}
          onToggleItem={onToggle}
        />
        <PageBriefCard
          title="Page Brief"
          subtitle="Lease Notice"
          bullets={['3.2% rent adjustment', '30 days written reply']}
          highlightsCount={2}
          highlightsContent="Due Oct 31."
        />
        <DraftCard
          tones={[
            { id: 'concise', label: 'Concise', content: 'Concise reply body.' },
            { id: 'warm', label: 'Warm', content: 'Warm reply body.' },
          ]}
          onPrimaryAction={onInsertDraft}
        />
        <EntitySummaryCard
          title="Kyoto Stay"
          subtitle="Nov 12 – Nov 16"
          tag="Nakagyo"
          fields={[{ label: 'Rate', value: '$248/nt' }]}
          onPrimaryAction={() => {}}
        />
        <ChoicePromptCard
          question="Summary depth?"
          options={[
            { id: 'quick', title: 'Quick bullets', description: 'Under 15s' },
            { id: 'deep', title: 'Deep comparison', description: 'Full clauses' },
          ]}
          selectedId="quick"
          onSelect={onSelectChoice}
        />
        <MetricStripCard
          label="90-day range"
          primaryValue="$248"
          unitLabel="/ night"
          deltaLabel="-14% vs avg"
          values={[280, 290, 275, 248]}
          lowLabel="$248"
          highLabel="$290"
        />
        <PageActionCard
          title="Fill checkout address?"
          fields={[{ label: 'ZIP', value: '11211' }]}
          onCancel={() => {}}
          onConfirm={onConfirmPageAction}
        />
      </div>,
    );

    expect(el.querySelectorAll('.yui-genui-card').length).toBe(8);
    expect(el.querySelectorAll('.yui-genui-body').length).toBe(7);
    expect(el.querySelector('.yui-table-row.is-emphasized')?.textContent).toContain('Annual total');
    expect(el.querySelector('.yui-check-item-text.is-done')?.textContent).toContain('Confirm cap');
    expect(el.querySelector('.yui-brief-list')).toBeTruthy();
    expect(el.querySelector('.yui-kv-list .yui-kv-row')).toBeTruthy();
    expect(el.querySelector('.yui-spark-area')).toBeTruthy();
    expect(el.querySelector('.yui-spark-path')?.getAttribute('d')).toMatch(/^M /);

    const checkRow = el.querySelectorAll('.yui-check-item-row')[1] as HTMLButtonElement;
    const warmTab = Array.from(el.querySelectorAll('.yui-tone-btn')).find((b) => b.textContent === 'Warm') as HTMLButtonElement;
    const insertBtn = Array.from(el.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Insert into page'),
    ) as HTMLButtonElement;
    const deepChoice = Array.from(el.querySelectorAll('.yui-choice-row'))[1] as HTMLButtonElement;
    const applyBtn = Array.from(el.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Apply'),
    ) as HTMLButtonElement;

    act(() => {
      checkRow.click();
      warmTab.click();
      deepChoice.click();
      applyBtn.click();
    });
    act(() => {
      insertBtn.click();
    });

    expect(onToggle).toHaveBeenCalledWith('c2');
    expect(onInsertDraft).toHaveBeenCalledWith('Warm reply body.');
    expect(onSelectChoice).toHaveBeenCalledWith('deep');
    expect(onConfirmPageAction).toHaveBeenCalledTimes(1);
  });
});
