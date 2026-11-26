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
  QuoteExcerptCard,
  TimelineCard,
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

  it('renders TimelineCard and QuoteExcerptCard cleanly without inline styles', () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    const onSelectStep = vi.fn();
    const onJumpToSource = vi.fn();
    const onCopyQuote = vi.fn();

    const el = renderNode(
      <div>
        <TimelineCard
          title="Verification Plan"
          subtitle="Local WebGPU pipeline"
          metaLabel="3 steps"
          onSelectStep={onSelectStep}
          steps={[
            { id: 's1', label: 'Load weights', detail: 'Mapped 2.6 GB from OPFS', timestamp: '00:01', status: 'done' },
            { id: 's2', label: 'Compile WGSL kernels', detail: 'Subgroup barrier pass', timestamp: '00:03', status: 'active' },
            { id: 's3', label: 'Verify checksums', status: 'pending' },
          ]}
        />
        <QuoteExcerptCard
          sourceTitle="Chromium MV3 Security Architecture"
          sourceDomain="developer.chrome.com"
          locator="§3 · Line 42"
          quote="Side panel documents enforce script-src 'self' and style-src 'self' strictly."
          onJumpToSource={onJumpToSource}
          onCopyQuote={onCopyQuote}
        />
      </div>,
    );

    expect(el.querySelectorAll('[style]').length).toBe(0);

    const timeline = el.querySelector('[data-slot="timeline-card"]') as HTMLElement;
    expect(timeline.querySelectorAll('.yui-tl-item').length).toBe(3);
    expect(timeline.querySelectorAll('.yui-tl-dot.is-active').length).toBe(1);

    act(() => {
      (timeline.querySelectorAll('.yui-tl-btn')[1] as HTMLButtonElement).click();
    });
    expect(onSelectStep).toHaveBeenCalledWith(expect.objectContaining({ id: 's2', status: 'active' }));

    const quote = el.querySelector('[data-slot="quote-excerpt-card"]') as HTMLElement;
    expect(quote.querySelector('.yui-qec-locator')?.textContent).toBe('§3 · Line 42');

    act(() => {
      (quote.querySelector('.yui-qec-copy') as HTMLButtonElement).click();
      (quote.querySelector('button:not(.yui-qec-copy)') as HTMLButtonElement).click();
    });
    expect(writeText).toHaveBeenCalledWith(
      "Side panel documents enforce script-src 'self' and style-src 'self' strictly.",
    );
    expect(onCopyQuote).toHaveBeenCalledTimes(1);
    expect(onJumpToSource).toHaveBeenCalledTimes(1);
    expect(quote.querySelector('.yui-qec-copy')?.textContent).toContain('Copied');
  });
});
