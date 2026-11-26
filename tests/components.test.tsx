import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ActionBar,
  AttachmentDropzone,
  AttachmentStrip,
  BranchPicker,
  CodeBlock,
  ErrorRecoveryBanner,
  FloatingComposer,
  FollowUpSuggestions,
  MessageSkeleton,
  ModelDownloadGate,
  PermissionApprovalCard,
  PromptCapsuleStack,
  QuotedContextBanner,
  ReasoningTrace,
  ScrollToBottomButton,
  SourcesDrawer,
  SuggestionChipRow,
  ThreadHistoryDrawer,
  ToastPill,
  ToolStepCard,
  UserMessageBubble,
  VoiceDictationPill,
} from '../src/components/index.js';

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

describe('@yours/ui chat & runtime primitives', () => {
  it('renders FloatingComposer, handles submit/stop, and supports quote/voice/attachments', () => {
    const onSubmit = vi.fn();
    const onStop = vi.fn();
    const onConfirmVoice = vi.fn();

    const el = renderNode(
      <div>
        <FloatingComposer
          value="Summarize this spec"
          onChange={() => {}}
          onSubmit={onSubmit}
          topSlot={<QuotedContextBanner quote="Local inference runs in WebGPU." onDismiss={() => {}} />}
          leftSlot={<AttachmentStrip items={[{ id: '1', name: 'spec.pdf', status: 'uploading', progressPercent: 64 }]} />}
        />
        <FloatingComposer
          value=""
          isGenerating
          onChange={() => {}}
          onSubmit={onSubmit}
          onStop={onStop}
        />
        <VoiceDictationPill elapsedLabel="0:04" onConfirm={onConfirmVoice} onCancel={() => {}} />
        <AttachmentDropzone active />
      </div>,
    );

    const sendBtn = el.querySelectorAll('.yui-send-btn')[0] as HTMLButtonElement;
    const stopBtn = el.querySelectorAll('.yui-send-btn')[1] as HTMLButtonElement;
    const acceptVoiceBtn = el.querySelector('[aria-label="Accept dictation"]') as HTMLButtonElement;

    act(() => {
      sendBtn.click();
      stopBtn.click();
      acceptVoiceBtn.click();
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onStop).toHaveBeenCalledTimes(1);
    expect(onConfirmVoice).toHaveBeenCalledTimes(1);
    expect(el.textContent).toContain('spec.pdf');
    expect(el.textContent).toContain('64%');
  });

  it('renders starter capsules, messages, code block, action bar speed readout, and branches', () => {
    const onSelectStarter = vi.fn();
    const onSaveEdit = vi.fn();

    const el = renderNode(
      <div>
        <PromptCapsuleStack
          items={[{ id: 'p1', icon: 'document', label: 'Summarize' }]}
          onSelect={onSelectStarter}
        />
        <SuggestionChipRow items={[{ id: 'c1', label: 'Compare plans' }]} onSelect={onSelectStarter} />
        <ScrollToBottomButton onClick={() => {}} />
        <UserMessageBubble
          content="Initial question"
          contextLabel="This page"
          isEditing
          onSaveEdit={onSaveEdit}
          onCancelEdit={() => {}}
        />
        <CodeBlock code="const x = 1;" language="ts" />
        <ActionBar
          onCopy={() => {}}
          onRegenerate={() => {}}
          onThumbUp={() => {}}
          onThumbDown={() => {}}
          onSave={() => {}}
          onSpeak={() => {}}
          speedMetrics={{ tokensPerSec: 84.2, ttftMs: 92, outputTokens: 120 }}
        />
        <BranchPicker currentIndex={2} total={3} onPrevious={() => {}} onNext={() => {}} />
        <FollowUpSuggestions suggestions={['Compare annual pricing']} onSelect={() => {}} />
      </div>,
    );

    expect(el.textContent).toContain('84.2 tok/s · 92ms TTFT · 120 tok');
    expect(el.textContent).toContain('2 / 3');

    const saveEditBtn = Array.from(el.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Save'),
    ) as HTMLButtonElement;
    act(() => {
      saveEditBtn.click();
    });
    expect(onSaveEdit).toHaveBeenCalledWith('Initial question');
  });

  it('renders ReasoningTrace, ToolStepCard, PermissionApprovalCard, Sources, History, and ModelDownloadGate', () => {
    const onApprove = vi.fn();
    const onDeny = vi.fn();
    const onDownload = vi.fn();

    const el = renderNode(
      <div>
        <ReasoningTrace status="done" durationLabel="4s" content="Checked local pricing table." />
        <ToolStepCard status="done" title="Read active tab" durationLabel="0.3s" summary="Extracted pricing." />
        <PermissionApprovalCard
          title="Allow external fetch?"
          description="Lethal Trifecta breaker detected untrusted context + private memory."
          ruleBadge="lethal-trifecta-network"
          onApprove={onApprove}
          onDeny={onDeny}
        />
        <SourcesDrawer sources={[{ id: 's1', title: 'Pricing FAQ', url: 'https://yours.sh' }]} defaultExpanded />
        <ThreadHistoryDrawer
          threads={[{ id: 't1', title: 'Pricing breakdown', updatedLabel: 'Now' }]}
          activeThreadId="t1"
          searchQuery=""
          onSearchChange={() => {}}
          onSelectThread={() => {}}
          onNewThread={() => {}}
        />
        <ErrorRecoveryBanner title="Stream interrupted" onRetry={() => {}} />
        <MessageSkeleton />
        <ToastPill message="Thread archived" onUndo={() => {}} />
        <ModelDownloadGate
          models={[
            { id: 'Pragma-1-4B', label: 'Pragma-1-4B', subtitle: 'q4f16', sizeLabel: '2.4 GB', recommended: true },
          ]}
          selectedModelId="Pragma-1-4B"
          onSelectModel={() => {}}
          onStartDownload={onDownload}
        />
      </div>,
    );

    const reasoningTrigger = el.querySelector('.yui-reasoning-trigger') as HTMLButtonElement;
    act(() => {
      reasoningTrigger.click();
    });
    expect(el.textContent).toContain('Checked local pricing table.');

    const allowBtn = Array.from(el.querySelectorAll('button')).find((b) => b.textContent === 'Allow once')!;
    const denyBtn = Array.from(el.querySelectorAll('button')).find((b) => b.textContent === 'Decline')!;
    const dlBtn = Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.includes('Download'))!;
    act(() => {
      allowBtn.click();
      denyBtn.click();
      dlBtn.click();
    });

    expect(onApprove).toHaveBeenCalledTimes(1);
    expect(onDeny).toHaveBeenCalledTimes(1);
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  it('toggles live ReasoningTrace body while thinking when content is non-empty', () => {
    const el = renderNode(
      <div>
        <div data-case="empty">
          <ReasoningTrace status="thinking" durationLabel="1s" />
        </div>
        <div data-case="blank">
          <ReasoningTrace status="thinking" content="" />
        </div>
        <div data-case="live">
          <ReasoningTrace
            status="thinking"
            durationLabel="2s"
            content="Step 1"
            defaultExpanded={false}
          />
        </div>
        <div data-case="default-open">
          <ReasoningTrace
            status="thinking"
            content="Step 1"
            defaultExpanded
          />
        </div>
      </div>,
    );

    const emptyWrap = el.querySelector('[data-case="empty"]')!;
    expect(emptyWrap.querySelector('button.yui-reasoning-trigger')).toBeNull();
    expect(emptyWrap.querySelector('.yui-reasoning-trigger')?.textContent).toContain('Thinking');
    expect(emptyWrap.querySelector('.yui-reasoning-body')).toBeNull();

    const blankWrap = el.querySelector('[data-case="blank"]')!;
    expect(blankWrap.querySelector('button.yui-reasoning-trigger')).toBeNull();
    expect(blankWrap.querySelector('.yui-reasoning-body')).toBeNull();

    const liveWrap = el.querySelector('[data-case="live"]')!;
    const trigger = liveWrap.querySelector('button.yui-reasoning-trigger') as HTMLButtonElement;
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.textContent).toContain('Thinking');
    expect(trigger.textContent).toContain('2s');
    expect(liveWrap.querySelector('.yui-reasoning-body')).toBeNull();

    act(() => {
      trigger.click();
    });
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(liveWrap.querySelector('.yui-reasoning-body')).toBeTruthy();
    expect(liveWrap.querySelector('.yui-reasoning-text')?.textContent).toBe('Step 1');

    act(() => {
      trigger.click();
    });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(liveWrap.querySelector('.yui-reasoning-body')).toBeNull();

    const defaultOpenWrap = el.querySelector('[data-case="default-open"]')!;
    expect(defaultOpenWrap.querySelector('button.yui-reasoning-trigger')?.getAttribute('aria-expanded')).toBe('true');
    expect(defaultOpenWrap.querySelector('.yui-reasoning-text')?.textContent).toBe('Step 1');
  });
});
