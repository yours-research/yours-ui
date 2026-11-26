import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ActionBar,
  AgentHandoffCard,
  ArtifactPreviewCard,
  AttachmentDropzone,
  AttachmentStrip,
  AudioLevelMeter,
  BranchPicker,
  CitationFootnoteList,
  CodeBlock,
  CodeBlockCard,
  CommandPalette,
  ConfirmActionCard,
  ContextBudgetMeter,
  ContextCommandPopover,
  DataTableCard,
  DeviceCapabilityCard,
  DiffCard,
  EmptyPanelState,
  EmptyState,
  ErrorRecoveryBanner,
  ErrorRecoveryCard,
  ExportSessionCard,
  FindInThreadBar,
  FloatingComposer,
  FloatingContextSheet,
  FollowUpSuggestions,
  HardwareStatusStrip,
  InlineCitationPill,
  InlineCitationPopover,
  InlineNotice,
  InlineToolStatus,
  KbdHint,
  LocalVaultExportCard,
  MemoryInspectorList,
  MemoryRecordCard,
  MessageSkeleton,
  ModelDownloadGate,
  ModelDownloadProgressBar,
  ModelParametersCard,
  ModelRosterList,
  NetworkAuditCard,
  OfflineStatusBanner,
  OnboardingCard,
  PageSelectionCard,
  PermissionApprovalCard,
  PermissionCard,
  PromptCapsuleStack,
  PromptTemplateList,
  QuotedContextBanner,
  ReasoningTrace,
  ScrollToBottomButton,
  SegmentedControl,
  SessionCheckpointCard,
  SettingsSection,
  SettingsToggleRow,
  ShimmerText,
  ShortcutSheet,
  SitePermissionsList,
  SourcesDrawer,
  type SitePermissionItem,
  StatusBadge,
  StatusToast,
  StorageQuotaCard,
  StreamingResponse,
  SuggestionChipRow,
  TabContextList,
  ThreadHistoryDrawer,
  ThreadHistoryList,
  ToastPill,
  ToolChain,
  ToolStepCard,
  ToolTraceList,
  UserMessageBubble,
  VoiceDictationPill,
  VoiceSessionBar,
  VoiceSessionCard,
  type StreamingResponseFeedback,
  type StreamingResponseProps,
  type StreamingResponseStatus,
} from '../src/components/index.js';
import { SidePanelShell } from '../src/layout/index.js';
import DefaultStreamingResponse from '../src/components/StreamingResponse.js';

interface FsModule {
  readFileSync(path: URL, encoding: 'utf8'): string;
}

async function readSourceFile(relativePath: string): Promise<string> {
  const fsId = 'node:fs';
  const fs = (await import(/* @vite-ignore */ fsId)) as FsModule;
  return fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

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

function rerenderNode(node: React.ReactNode) {
  if (!mounted) {
    throw new Error('No mounted root to rerender');
  }
  const { container, root } = mounted;
  act(() => {
    root.render(node);
  });
  return container;
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
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
    const liveDisclosure = liveWrap.querySelector('.yui-disclosure') as HTMLElement;
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.textContent).toContain('Thinking');
    expect(trigger.textContent).toContain('2s');
    expect(liveDisclosure.classList.contains('is-open')).toBe(false);
    expect(liveDisclosure.getAttribute('aria-hidden')).toBe('true');

    act(() => {
      trigger.click();
    });
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(liveDisclosure.classList.contains('is-open')).toBe(true);
    expect(liveDisclosure.getAttribute('aria-hidden')).toBe('false');
    expect(liveWrap.querySelector('.yui-reasoning-body')).toBeTruthy();
    expect(liveWrap.querySelector('.yui-reasoning-text')?.textContent).toBe('Step 1');

    act(() => {
      trigger.click();
    });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(liveDisclosure.classList.contains('is-open')).toBe(false);
    expect(liveDisclosure.getAttribute('aria-hidden')).toBe('true');

    const defaultOpenWrap = el.querySelector('[data-case="default-open"]')!;
    expect(defaultOpenWrap.querySelector('button.yui-reasoning-trigger')?.getAttribute('aria-expanded')).toBe('true');
    expect(defaultOpenWrap.querySelector('.yui-disclosure')?.classList.contains('is-open')).toBe(true);
    expect(defaultOpenWrap.querySelector('.yui-reasoning-text')?.textContent).toBe('Step 1');
  });

  it('renders StreamingResponse immediately when status="done" with full markdown, safe links, lists, code copy, and actions', () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    const onCopy = vi.fn();
    const onRetry = vi.fn();
    const onFeedback = vi.fn<(f: StreamingResponseFeedback) => void>();

    const markdown = [
      '# Top Title',
      '## Section Title',
      '### Sub Title',
      '',
      'Use **bold**, *italic*, _under_, snake_case_identifier, and `inlineCode`.',
      '',
      'Links: [Wiki](https://en.wikipedia.org/wiki/Alan_Turing_(computer_scientist)) [Docs](/docs) [Bad](javascript:alert(1)) [Evil](data:text/html,hi).',
      '',
      '> Quoted insight',
      '> across lines',
      '',
      '- Bullet one',
      '* Bullet two',
      '+ Bullet three',
      '',
      '3. Third step',
      '4. Fourth step',
      '',
      '```ts',
      'const a = 1;',
      'const b = 2;',
      '```',
    ].join('\n');

    const status: StreamingResponseStatus = 'done';
    const props: StreamingResponseProps = {
      text: markdown,
      status,
      defaultFeedback: 'up',
      onCopy,
      onRetry,
      onFeedback,
      'aria-label': 'Assistant response',
    };

    expect(DefaultStreamingResponse).toBe(StreamingResponse);

    const el = renderNode(<StreamingResponse {...props} />);
    const root = el.querySelector('.yui-sr')!;
    expect(root.getAttribute('aria-label')).toBe('Assistant response');
    expect(root.getAttribute('aria-busy')).toBeNull();
    expect(el.querySelector('[data-slot="streaming-response-caret"]')).toBeNull();

    // Headings map levels 1..3 to h3..h5
    expect(el.querySelector('h3.yui-sr-h1')?.textContent).toBe('Top Title');
    expect(el.querySelector('h4.yui-sr-h2')?.textContent).toBe('Section Title');
    expect(el.querySelector('h5.yui-sr-h3')?.textContent).toBe('Sub Title');

    // Inline formatting & snake_case word-boundary guard
    expect(el.querySelector('strong')?.textContent).toBe('bold');
    const ems = Array.from(el.querySelectorAll('em')).map((node) => node.textContent);
    expect(ems).toEqual(['italic', 'under']);
    expect(el.textContent).toContain('snake_case_identifier');
    expect(el.querySelector('.yui-sr-inline-code')?.textContent).toBe('inlineCode');

    // Safe links including Wikipedia balanced parens, plus unsafe URI stripping
    const links = Array.from(el.querySelectorAll('a'));
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      'https://en.wikipedia.org/wiki/Alan_Turing_(computer_scientist)',
      '/docs',
    ]);
    expect(links[0].getAttribute('target')).toBe('_blank');
    expect(links[1].getAttribute('target')).toBeNull();
    expect(el.textContent).toContain('Bad');
    expect(el.textContent).toContain('Evil');
    expect(el.innerHTML).not.toContain('javascript:');
    expect(el.innerHTML).not.toContain('data:text/html');

    // Blockquote, unordered list, ordered list with custom start
    expect(el.querySelector('blockquote.yui-sr-quote')?.textContent).toBe('Quoted insight across lines');
    expect(el.querySelectorAll('ul.yui-sr-ul li').length).toBe(3);
    const ol = el.querySelector('ol.yui-sr-ol')!;
    expect(ol.getAttribute('start')).toBe('3');
    expect(ol.querySelectorAll('li').length).toBe(2);

    // Fenced code block + header copy swap
    expect(el.querySelector('.yui-sr-code-header')?.textContent).toContain('ts');
    expect(el.querySelector('.yui-sr-code-pre code')?.textContent).toBe('const a = 1;\nconst b = 2;');
    const codeCopyBtn = el.querySelector('.yui-sr-code-copy') as HTMLButtonElement;
    act(() => {
      codeCopyBtn.click();
    });
    expect(writeText).toHaveBeenCalledWith('const a = 1;\nconst b = 2;');
    expect(codeCopyBtn.textContent).toContain('Copied');
    act(() => {
      vi.advanceTimersByTime(1600);
    });
    expect(codeCopyBtn.textContent).toContain('Copy');

    // Settled actions row
    const actionsRow = el.querySelector('[data-slot="streaming-response-actions"]')!;
    expect(actionsRow).toBeTruthy();

    const copyBtn = actionsRow.querySelector('[aria-label="Copy response"]') as HTMLButtonElement;
    const retryBtn = actionsRow.querySelector('[aria-label="Retry response"]') as HTMLButtonElement;
    const thumbUpBtn = actionsRow.querySelector('[aria-label="Thumbs up"]') as HTMLButtonElement;
    const thumbDownBtn = actionsRow.querySelector('[aria-label="Thumbs down"]') as HTMLButtonElement;

    expect(thumbUpBtn.getAttribute('aria-pressed')).toBe('true');
    expect(thumbUpBtn.classList.contains('is-active')).toBe(true);
    expect(thumbDownBtn.getAttribute('aria-pressed')).toBe('false');

    act(() => {
      copyBtn.click();
    });
    expect(onCopy).toHaveBeenCalledWith(markdown);
    expect(writeText).toHaveBeenLastCalledWith(markdown);
    expect(copyBtn.getAttribute('aria-label')).toBe('Copied response');

    act(() => {
      retryBtn.click();
    });
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(retryBtn.querySelector('.yui-sr-retry-icon')?.classList.contains('is-spinning')).toBe(true);

    act(() => {
      thumbUpBtn.click();
    });
    expect(onFeedback).toHaveBeenLastCalledWith(null);
    expect(thumbUpBtn.getAttribute('aria-pressed')).toBe('false');
    expect(thumbUpBtn.classList.contains('is-active')).toBe(false);

    act(() => {
      thumbDownBtn.click();
    });
    expect(onFeedback).toHaveBeenLastCalledWith('down');
    expect(thumbDownBtn.getAttribute('aria-pressed')).toBe('true');
    expect(thumbDownBtn.classList.contains('is-active')).toBe(true);

    // actions={false} hides actions row, default ol omits start=1
    rerenderNode(<StreamingResponse text={'1. First\n2. Second'} actions={false} />);
    expect(el.querySelector('[data-slot="streaming-response-actions"]')).toBeNull();
    expect(el.querySelector('ol.yui-sr-ol')?.getAttribute('start')).toBeNull();
  });

  it('streams progressively with caret, accent ink WAAPI, unclosed markers, stop truncation, and restart', () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    const animateSpy = vi.fn<
      (
        keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
        options?: number | KeyframeAnimationOptions,
      ) => Animation
    >(() => ({ cancel: vi.fn() }) as unknown as Animation);
    Object.defineProperty(HTMLElement.prototype, 'animate', {
      configurable: true,
      writable: true,
      value: animateSpy,
    });

    const origGetComputedStyle = window.getComputedStyle;
    vi.spyOn(window, 'getComputedStyle').mockImplementation((element: Element) => {
      const base = origGetComputedStyle(element);
      return {
        ...base,
        color: 'rgb(20, 20, 19)',
        getPropertyValue: (prop: string) =>
          prop === '--yui-cobalt' ? '#1D4ED8' : base.getPropertyValue(prop),
      } as CSSStyleDeclaration;
    });

    const onCopy = vi.fn();

    // Unclosed bold marker followed by trailing token so wordEnds commits "**bold" while streaming
    const streamText = 'Hello **bold tail';
    const el = renderNode(
      <StreamingResponse text={streamText} status="streaming" ink="accent" onCopy={onCopy} />,
    );

    const root = el.querySelector('.yui-sr')!;
    expect(root.getAttribute('aria-busy')).toBe('true');
    const caret = el.querySelector('[data-slot="streaming-response-caret"]')!;
    expect(caret).toBeTruthy();
    expect(caret.classList.contains('yui-sr-caret--accent')).toBe(true);
    expect(el.querySelector('[data-slot="streaming-response-actions"]')).toBeNull();

    // Frame 1 reveals "Hello"
    act(() => {
      vi.advanceTimersByTime(16);
    });
    expect(el.textContent).toBe('Hello');

    // Advance enough frames to reveal "**bold" (unclosed strong)
    act(() => {
      vi.advanceTimersByTime(220);
    });
    expect(el.querySelector('strong')?.textContent).toBe('bold');
    expect(el.textContent).not.toContain('**');

    // Verify WAAPI blur, opacity, and accent ink animations ran on mounted words
    const keyframesList = animateSpy.mock.calls.map((c) => c[0]);
    expect(keyframesList).toEqual(
      expect.arrayContaining([
        [{ filter: 'blur(5px)' }, { filter: 'blur(0px)' }],
        [{ opacity: 0 }, { opacity: 1 }],
        [{ color: '#1D4ED8' }, { color: 'rgb(20, 20, 19)' }],
      ]),
    );

    // Unclosed code and unclosed link checks while streaming
    rerenderNode(<StreamingResponse text="Run `code next" status="streaming" />);
    act(() => {
      vi.advanceTimersByTime(220);
    });
    expect(el.querySelector('.yui-sr-inline-code')?.textContent).toBe('code');
    expect(el.textContent).not.toContain('`');

    rerenderNode(<StreamingResponse text="Open [link next" status="streaming" />);
    act(() => {
      vi.advanceTimersByTime(220);
    });
    expect(el.querySelector('.yui-sr-link-pending')?.textContent).toBe('link');
    expect(el.textContent).not.toContain('[');

    // Caret horizontal glide along the same line when caret rect moves right
    let caretLeft = 100;
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      if (this.getAttribute('data-slot') === 'streaming-response-caret') {
        return {
          left: caretLeft,
          top: 20,
          right: caretLeft + 2,
          bottom: 36,
          width: 2,
          height: 16,
          x: caretLeft,
          y: 20,
          toJSON: () => ({}),
        } as DOMRect;
      }
      return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
    });
    animateSpy.mockClear();
    rerenderNode(<StreamingResponse text="Glide one two " status="streaming" />);
    caretLeft = 142;
    act(() => {
      vi.advanceTimersByTime(16);
    });
    expect(animateSpy).toHaveBeenCalledWith(
      [{ translate: '-42px 0' }, { translate: '0 0' }],
      expect.objectContaining({ duration: 180 }),
    );

    // Sentence pause (240ms extra on top of 125ms/word) holds back next word briefly after period
    rerenderNode(<StreamingResponse text="Wait. Next word " status="streaming" speed={8} />);
    act(() => {
      vi.advanceTimersByTime(16);
    });
    expect(el.textContent).toBe('Wait.');
    act(() => {
      vi.advanceTimersByTime(220);
    });
    expect(el.textContent).toBe('Wait.');
    act(() => {
      vi.advanceTimersByTime(180);
    });
    expect(el.textContent).toBe('Wait. Next');

    // Catch-up pacing accelerates when > 16 words are queued (normal 8 w/s would reveal <= 5 words in 450ms)
    const manyWords = `${Array.from({ length: 36 }, (_, idx) => `w${idx}`).join(' ')} end`;
    rerenderNode(<StreamingResponse text={manyWords} status="streaming" speed={8} />);
    act(() => {
      vi.advanceTimersByTime(450);
    });
    expect(el.textContent).toContain('w16');

    // Stopped mid-stream copies ONLY revealed text
    rerenderNode(
      <StreamingResponse
        text="Alpha beta gamma delta epsilon"
        status="streaming"
        speed={8}
        onCopy={onCopy}
      />,
    );
    act(() => {
      vi.advanceTimersByTime(150);
    });
    const revealedBeforeStop = el.textContent ?? '';
    expect(revealedBeforeStop).toContain('Alpha');
    expect(revealedBeforeStop).not.toContain('epsilon');

    rerenderNode(
      <StreamingResponse
        text="Alpha beta gamma delta epsilon"
        status="stopped"
        speed={8}
        onCopy={onCopy}
      />,
    );
    expect(el.querySelector('[data-slot="streaming-response-caret"]')).toBeNull();
    expect(root.getAttribute('aria-busy')).toBeNull();
    const copyBtn = el.querySelector('[data-slot="streaming-response-actions"] [aria-label="Copy response"]') as HTMLButtonElement;
    expect(copyBtn).toBeTruthy();

    act(() => {
      copyBtn.click();
    });
    expect(onCopy).toHaveBeenCalledWith(revealedBeforeStop);
    expect(writeText).toHaveBeenLastCalledWith(revealedBeforeStop);

    // Non-prefix replacement restarts stream cleanly
    rerenderNode(<StreamingResponse text="Fresh start " status="streaming" />);
    expect(el.textContent).toBe('');
    act(() => {
      vi.advanceTimersByTime(16);
    });
    expect(el.textContent).toBe('Fresh');
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(el.textContent).toBe('Fresh start');

    // Transition streaming -> done drains final word and settles
    rerenderNode(<StreamingResponse text="Fresh start done" status="done" />);
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(el.textContent).toBe('Fresh start done');
    expect(el.querySelector('[data-slot="streaming-response-caret"]')).toBeNull();
    expect(el.querySelector('[data-slot="streaming-response-actions"]')).toBeTruthy();

    // Streaming fenced code block animates line-by-line without closing fence yet
    animateSpy.mockClear();
    rerenderNode(
      <StreamingResponse
        text={'```js\nconst x = 1;\nconst y = 2;\n'}
        status="streaming"
      />,
    );
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(el.querySelector('.yui-sr-code-header')?.textContent).toContain('js');
    expect(el.querySelectorAll('.yui-sr-code-line').length).toBe(2);
    expect(el.querySelector('.yui-sr-code-pre code')?.textContent).toBe('const x = 1;\nconst y = 2;');
  });

  it('respects prefers-reduced-motion and supports custom ink colors without JSX style=', () => {
    const animateSpy = vi.fn<
      (
        keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
        options?: number | KeyframeAnimationOptions,
      ) => Animation
    >(() => ({ cancel: vi.fn() }) as unknown as Animation);
    Object.defineProperty(HTMLElement.prototype, 'animate', {
      configurable: true,
      writable: true,
      value: animateSpy,
    });

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });

    const el = renderNode(
      <StreamingResponse text="Instant reduced motion " status="streaming" ink="#059669" />,
    );
    expect(el.textContent).toBe('Instant reduced motion');
    // Under reduced motion, words do not run blur/opacity animations; only custom ink caret highlight may run
    const wordAnimCalls = animateSpy.mock.calls.filter(
      (call) => Array.isArray(call[0]) && ('filter' in call[0][0] || 'opacity' in call[0][0]),
    );
    expect(wordAnimCalls.length).toBe(0);
  });

  it('satisfies strict Chrome MV3 CSP (zero JSX style= and zero dangerouslySetInnerHTML) and defines .yui-sr-* CSS', async () => {
    const tsxSource = await readSourceFile('../src/components/StreamingResponse.tsx');
    expect(tsxSource).not.toContain('style={');
    expect(tsxSource).not.toContain('dangerouslySetInnerHTML');

    const cssSource = await readSourceFile('../src/styles/components.css');
    expect(cssSource).toContain('.yui-sr');
    expect(cssSource).toContain('.yui-sr-caret--accent');
    expect(cssSource).toContain('@keyframes yui-sr-item-in');
    expect(cssSource).toContain('--yui-cobalt-soft');

    const reducedMotionIdx = cssSource.indexOf('@media (prefers-reduced-motion: reduce)');
    expect(reducedMotionIdx).toBeGreaterThan(-1);
    expect(cssSource.slice(reducedMotionIdx)).toContain('.yui-sr-caret');
    expect(cssSource.slice(reducedMotionIdx)).toContain('.yui-sr-action-btn');
  });

  it('renders EmptyState, StatusBadge, FloatingComposer rightSlot/IME, UserMessageBubble Escape, and ThreadHistoryDrawer empty state', () => {
    const onSubmit = vi.fn();
    const onCancelEdit = vi.fn();
    const onSelectThread = vi.fn();

    const el = renderNode(
      <div>
        <EmptyState
          title="Ask anything locally."
          subtitle="Runs entirely in your browser."
          orbState="idle"
        >
          <PromptCapsuleStack
            items={[{ id: 'e1', icon: 'document', label: 'Summarize this page' }]}
            onSelect={() => {}}
          />
        </EmptyState>
        <div data-case="badges">
          <StatusBadge tone="neutral">Idle</StatusBadge>
          <StatusBadge tone="local" dot pulse>
            Local · WebGPU
          </StatusBadge>
          <StatusBadge tone="accent" dot>
            Context
          </StatusBadge>
          <StatusBadge tone="amber">Pending</StatusBadge>
          <StatusBadge tone="danger">Blocked</StatusBadge>
        </div>
        <FloatingComposer
          value={'Line 1\nLine 2'}
          onChange={() => {}}
          onSubmit={onSubmit}
          rightSlot={<StatusBadge tone="local">Ready</StatusBadge>}
        />
        <UserMessageBubble
          content="Original"
          isEditing
          onCancelEdit={onCancelEdit}
          onSaveEdit={() => {}}
        />
        <div data-case="history-populated">
          <ThreadHistoryDrawer
            threads={[{ id: 't1', title: 'Clean pricing breakdown' }]}
            activeThreadId="t1"
            searchQuery=""
            onSearchChange={() => {}}
            onSelectThread={onSelectThread}
            onNewThread={() => {}}
          />
        </div>
        <div data-case="history-empty">
          <ThreadHistoryDrawer
            threads={[]}
            searchQuery="zzz"
            onSearchChange={() => {}}
            onSelectThread={() => {}}
            onNewThread={() => {}}
            emptyText="Nothing found"
          />
        </div>
      </div>,
    );

    expect(el.querySelector('[data-slot="empty-state"]')).toBeTruthy();
    expect(el.querySelectorAll('[data-slot="status-badge"]').length).toBe(6);
    expect(el.querySelector('.yui-status-badge--local .yui-status-badge-dot.is-pulse')).toBeTruthy();

    const textarea = el.querySelector('.yui-composer-input') as HTMLTextAreaElement;
    expect(textarea.rows).toBe(2);

    // IME composition Enter should not submit
    act(() => {
      const evt = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      Object.defineProperty(evt, 'isComposing', { value: true });
      textarea.dispatchEvent(evt);
    });
    expect(onSubmit).toHaveBeenCalledTimes(0);

    // Escape inside UserMessageBubble edit cancels cleanly
    const editBox = el.querySelector('.yui-edit-textarea') as HTMLTextAreaElement;
    act(() => {
      editBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(onCancelEdit).toHaveBeenCalledTimes(1);

    const threadBtn = el.querySelector('[data-case="history-populated"] .yui-thread-select-btn') as HTMLButtonElement;
    act(() => {
      threadBtn.click();
    });
    expect(onSelectThread).toHaveBeenCalledWith('t1');
    expect(el.querySelector('[data-case="history-empty"]')?.textContent).toContain('Nothing found');
  });

  it('enforces zero JSX style= and zero dangerouslySetInnerHTML across all src TSX files', async () => {
    const fsId = 'node:fs';
    const fs = (await import(/* @vite-ignore */ fsId)) as {
      readdirSync(dir: string, opts: { withFileTypes: true }): Array<{ name: string; isDirectory(): boolean }>;
      readFileSync(file: string, enc: string): string;
    };

    const tsxFiles: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const next = `${dir}/${entry.name}`;
        if (entry.isDirectory()) walk(next);
        else if (entry.name.endsWith('.tsx')) tsxFiles.push(next);
      }
    };
    walk('src');

    expect(tsxFiles.length).toBeGreaterThan(20);
    for (const file of tsxFiles) {
      const src = fs.readFileSync(file, 'utf8');
      expect(src, `${file} must not contain JSX style={`).not.toMatch(/\bstyle\s*=\s*\{/);
      expect(src, `${file} must not contain dangerouslySetInnerHTML`).not.toMatch(
        /\bdangerouslySetInnerHTML\s*=/,
      );
    }
  });

  it('supports bidirectional CSS grid disclosures on ToolStepCard and SourcesDrawer, plus KbdHint, ContextCommandPopover, SegmentedControl, and InlineCitationPill', async () => {
    const onSelectCmd = vi.fn();
    const onCloseCmd = vi.fn();
    const onSegChange = vi.fn();
    const onCiteClick = vi.fn();

    const el = renderNode(
      <div>
        <div data-case="tool">
          <ToolStepCard
            status="done"
            title="Read tab"
            summary="Parsed 3 tables"
            defaultExpanded={false}
          />
        </div>
        <div data-case="sources">
          <SourcesDrawer
            sources={[{ id: 's1', title: 'Spec', url: 'https://yours.sh' }]}
            defaultExpanded={false}
          />
        </div>
        <KbdHint keys={['⌘', 'K']} size="xs" />
        <SegmentedControl
          value="balanced"
          onChange={onSegChange}
          options={[
            { value: 'max', label: 'Max' },
            { value: 'balanced', label: 'Balanced' },
            { value: 'disabled', label: 'Off', disabled: true },
            { value: 'smooth', label: 'Smooth' },
          ]}
        />
        <div data-case="citations">
          <InlineCitationPill index={1} label="yours.sh" href="https://yours.sh" />
          <InlineCitationPill index={2} label="This tab" active onClick={onCiteClick} />
          <InlineCitationPill label="Static note" />
        </div>
        <FloatingComposer
          value="@"
          onChange={() => {}}
          onSubmit={() => {}}
          popoverSlot={
            <ContextCommandPopover
              open
              floating
              trigger="@"
              items={[
                { id: 'tab', label: 'Current tab', icon: 'page', hasLiveDot: true, shortcut: 'Tab' },
                { id: 'blocked', label: 'Locked', disabled: true },
                { id: 'docs', label: 'Local docs', icon: 'document', badge: 'OPFS' },
              ]}
              onSelect={onSelectCmd}
              onClose={onCloseCmd}
            />
          }
        />
      </div>,
    );

    // ToolStepCard & SourcesDrawer start collapsed in grid-row disclosure and toggle smoothly
    const toolDisclosure = el.querySelector('[data-case="tool"] .yui-disclosure')!;
    const toolBtn = el.querySelector('[data-case="tool"] button') as HTMLButtonElement;
    expect(toolDisclosure.classList.contains('is-open')).toBe(false);
    act(() => {
      toolBtn.click();
    });
    expect(toolDisclosure.classList.contains('is-open')).toBe(true);

    const srcDisclosure = el.querySelector('[data-case="sources"] .yui-disclosure')!;
    const srcBtn = el.querySelector('[data-case="sources"] button') as HTMLButtonElement;
    expect(srcDisclosure.classList.contains('is-open')).toBe(false);
    act(() => {
      srcBtn.click();
    });
    expect(srcDisclosure.classList.contains('is-open')).toBe(true);

    // KbdHint renders exact keycaps
    expect(el.querySelectorAll('.yui-kbd--xs').length).toBeGreaterThanOrEqual(2);

    // SegmentedControl ArrowRight skips disabled option
    const activeRadio = el.querySelector('.yui-seg-btn.is-active') as HTMLButtonElement;
    act(() => {
      activeRadio.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    });
    expect(onSegChange).toHaveBeenCalledWith('smooth');

    // InlineCitationPill renders anchor, button, and span
    expect(el.querySelector('a.yui-citation-pill')?.getAttribute('target')).toBe('_blank');
    const citeBtn = el.querySelector('button.yui-citation-pill') as HTMLButtonElement;
    act(() => {
      citeBtn.click();
    });
    expect(onCiteClick).toHaveBeenCalledTimes(1);
    expect(el.querySelector('span.yui-citation-pill')).toBeTruthy();

    // ContextCommandPopover keyboard navigation skips disabled item and selects with Enter, Escape closes
    const popover = el.querySelector('[data-slot="context-command-popover"]')!;
    expect(popover.classList.contains('yui-cmd-popover--floating')).toBe(true);
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    });
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });
    expect(onSelectCmd).toHaveBeenCalledWith(expect.objectContaining({ id: 'docs' }));

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(onCloseCmd).toHaveBeenCalledTimes(1);

    const cssSource = await readSourceFile('../src/styles/components.css');
    expect(cssSource).toContain('.yui-disclosure.is-open');
    expect(cssSource).toContain('.yui-cmd-popover--floating');
    expect(cssSource).toContain('.yui-seg-btn.is-active');
    expect(cssSource).toContain('.yui-citation-pill');
    expect(cssSource).toContain('.yui-notch-opt-row');
  });

  it('drives WAAPI spring sliding thumb on SegmentedControl and renders FloatingContextSheet & InlineCitationPopover', async () => {
    const animateSpy = vi.fn<
      (
        keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
        options?: number | KeyframeAnimationOptions,
      ) => Animation
    >(() => ({ cancel: vi.fn() }) as unknown as Animation);
    Object.defineProperty(HTMLElement.prototype, 'animate', {
      configurable: true,
      writable: true,
      value: animateSpy,
    });

    const onChangeSeg = vi.fn();
    const onCloseSheet = vi.fn();
    const onJumpSource = vi.fn();

    let currentVal: 'max' | 'balanced' = 'max';
    const el = renderNode(
      <div>
        <SegmentedControl
          value={currentVal}
          onChange={(v) => {
            currentVal = v;
            onChangeSeg(v);
          }}
          options={[
            { value: 'max', label: 'Max' },
            { value: 'balanced', label: 'Balanced' },
          ]}
        />
        <FloatingContextSheet
          open
          title="Ingestion queue"
          subtitle="2 local files ready"
          badge="OPFS"
          onClose={onCloseSheet}
          footer={<span className="yui-genui-muted">All SHA-256 verified</span>}
        >
          <div>spec.pdf</div>
        </FloatingContextSheet>
        <InlineCitationPopover
          source={{
            index: 1,
            label: 'pricing.yours.sh',
            title: 'Enterprise & Team Plan FAQ',
            domain: 'pricing.yours.sh',
            snippet: 'Annual billing lowers per-seat cost by 17% for 8+ seats.',
            url: 'https://yours.sh/pricing',
          }}
          onJumpToSource={onJumpSource}
        />
      </div>,
    );

    // Simulate non-zero browser layout widths on segmented buttons and re-render to trigger spring glide
    const segBtns = Array.from(el.querySelectorAll('.yui-seg-btn')) as HTMLButtonElement[];
    Object.defineProperty(segBtns[0], 'offsetWidth', { configurable: true, value: 48 });
    Object.defineProperty(segBtns[0], 'offsetLeft', { configurable: true, value: 2 });
    Object.defineProperty(segBtns[1], 'offsetWidth', { configurable: true, value: 72 });
    Object.defineProperty(segBtns[1], 'offsetLeft', { configurable: true, value: 52 });

    rerenderNode(
      <div>
        <SegmentedControl
          value="balanced"
          onChange={onChangeSeg}
          options={[
            { value: 'max', label: 'Max' },
            { value: 'balanced', label: 'Balanced' },
          ]}
        />
        <FloatingContextSheet
          open
          title="Ingestion queue"
          subtitle="2 local files ready"
          badge="OPFS"
          onClose={onCloseSheet}
          footer={<span className="yui-genui-muted">All SHA-256 verified</span>}
        >
          <div>spec.pdf</div>
        </FloatingContextSheet>
        <InlineCitationPopover
          source={{
            index: 1,
            label: 'pricing.yours.sh',
            title: 'Enterprise & Team Plan FAQ',
            domain: 'pricing.yours.sh',
            snippet: 'Annual billing lowers per-seat cost by 17% for 8+ seats.',
            url: 'https://yours.sh/pricing',
          }}
          onJumpToSource={onJumpSource}
        />
      </div>,
    );

    expect(el.querySelector('[data-slot="segmented-control"]')?.getAttribute('data-thumb')).toBe(
      'animated',
    );
    expect(animateSpy).toHaveBeenCalled();

    // FloatingContextSheet renders & Escape dismisses
    const sheet = el.querySelector('[data-slot="floating-context-sheet"]');
    expect(sheet).toBeTruthy();
    expect(sheet?.textContent).toContain('Ingestion queue');
    expect(sheet?.textContent).toContain('All SHA-256 verified');

    // InlineCitationPopover click opens grounded snippet and Jump button fires + closes
    const pillBtn = el.querySelector('[data-slot="inline-citation-popover"] button.yui-citation-pill') as HTMLButtonElement;
    act(() => {
      pillBtn.click();
    });
    const citeCard = el.querySelector('.yui-cite-card');
    expect(citeCard).toBeTruthy();
    expect(citeCard?.textContent).toContain('Enterprise & Team Plan FAQ');
    expect(citeCard?.textContent).toContain('17%');

    const jumpBtn = citeCard?.querySelector('.yui-micro-pill') as HTMLButtonElement;
    act(() => {
      jumpBtn.click();
    });
    expect(onJumpSource).toHaveBeenCalledTimes(1);
    expect(el.querySelector('.yui-cite-card')).toBeNull();

    // Escape closes FloatingContextSheet
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(onCloseSheet).toHaveBeenCalledTimes(1);

    const cssSource = await readSourceFile('../src/styles/components.css');
    expect(cssSource).toContain('.yui-seg-thumb');
    expect(cssSource).toContain('.yui-ctx-sheet');
    expect(cssSource).toContain('.yui-cite-card');
    expect(cssSource).toContain('.yui-sheet-region');
  });

  it('renders MemoryInspectorList with tier filtering & undo, HardwareStatusStrip, ModelDownloadProgressBar, and VoiceSessionBar', async () => {
    const onForget = vi.fn();
    const onUndo = vi.fn();
    const onPause = vi.fn();
    const onCancel = vi.fn();
    const onToggleBargeIn = vi.fn();
    const onToggleMute = vi.fn();
    const onEndSession = vi.fn();

    const records = [
      {
        id: 'm1',
        tier: 'profile' as const,
        summary: 'Prefers concise benchmark deltas over prose',
        sourceDomain: 'yours.sh',
        relativeTime: '2m',
      },
      {
        id: 'm2',
        tier: 'episodic' as const,
        summary: 'Audited Q3 enterprise billing clauses',
        sourceDomain: 'pricing.yours.sh',
        relativeTime: '1h',
      },
      {
        id: 'm3',
        tier: 'working' as const,
        summary: 'Comparing 8-seat annual renewal savings',
        relativeTime: 'Now',
      },
    ];

    const el = renderNode(
      <div>
        <HardwareStatusStrip
          tierLabel="WebGPU FP16"
          adapterLabel="Apple M3 Max"
          memoryLabel="2.6 GB OPFS"
          status="ready"
          sha256Verified
        />
        <ModelDownloadProgressBar
          modelLabel="Qwen3.5-4B · Q4F16"
          percent={64}
          state="downloading"
          hardwareLabel="WebGPU"
          loadedLabel="1.66 GB"
          totalLabel="2.60 GB"
          speedLabel="118 MB/s"
          etaLabel="8s"
          onPause={onPause}
          onCancel={onCancel}
        />
        <VoiceSessionBar
          state="speech-detected"
          elapsedLabel="0:14"
          levels={[0.1, 0.35, 0.6, 0.82, 0.95]}
          bargeInEnabled
          onToggleBargeIn={onToggleBargeIn}
          onToggleMute={onToggleMute}
          onEndSession={onEndSession}
        />
        <MemoryInspectorList
          records={records}
          forgottenIds={['m3']}
          onForget={onForget}
          onUndo={onUndo}
        />
      </div>,
    );

    expect(el.querySelector('[data-slot="hardware-status-strip"]')?.textContent).toContain(
      'WebGPU FP16',
    );
    expect(el.querySelector('[data-slot="hardware-status-strip"]')?.textContent).toContain('SHA-256');

    const progress = el.querySelector('.yui-dl-progress') as HTMLProgressElement;
    expect(progress.getAttribute('value')).toBe('64');
    expect(el.querySelector('.yui-dl-bar-card')?.textContent).toContain('118 MB/s');
    expect(el.querySelectorAll('.yui-dl-sep').length).toBe(2);

    act(() => {
      (Array.from(el.querySelectorAll('.yui-dl-bar-card button')).find((b) =>
        b.textContent?.includes('Pause'),
      ) as HTMLButtonElement).click();
      (el.querySelector('[aria-label="Cancel download"]') as HTMLButtonElement).click();
    });
    expect(onPause).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);

    // VoiceSessionBar 5-bar meter quantization + controls
    const bars = Array.from(el.querySelectorAll('.yui-vm-bar')).map((b) => b.className);
    expect(bars.length).toBe(5);
    expect(bars[0]).toContain('yui-vm-bar--0');
    expect(bars[4]).toContain('yui-vm-bar--4');

    act(() => {
      (Array.from(el.querySelectorAll('.yui-voice-actions button')).find((b) =>
        b.textContent?.includes('Barge-in'),
      ) as HTMLButtonElement).click();
      (el.querySelector('[aria-label="Mute microphone"]') as HTMLButtonElement).click();
      (el.querySelector('[aria-label="End voice session"]') as HTMLButtonElement).click();
    });
    expect(onToggleBargeIn).toHaveBeenCalledTimes(1);
    expect(onToggleMute).toHaveBeenCalledTimes(1);
    expect(onEndSession).toHaveBeenCalledTimes(1);

    // MemoryInspectorList filtering & Forget / Undo callbacks
    expect(el.querySelectorAll('[data-slot="memory-record-card"]').length).toBe(3);
    act(() => {
      (el.querySelector('[aria-label="Forget memory"]') as HTMLButtonElement).click();
      (el.querySelector('[aria-label="Undo forgetting memory"]') as HTMLButtonElement).click();
    });
    expect(onForget).toHaveBeenCalledWith('m1');
    expect(onUndo).toHaveBeenCalledWith('m3');

    const segButtons = el.querySelectorAll('.yui-mem-filter .yui-seg-btn') as NodeListOf<HTMLButtonElement>;
    act(() => {
      // Document filter (5th option) has no records -> EmptyState
      segButtons[4].click();
    });
    expect(el.querySelectorAll('[data-slot="memory-record-card"]').length).toBe(0);
    expect(el.querySelector('[data-slot="empty-state"]')).toBeTruthy();

    act(() => {
      // Profile filter (2nd option) -> 1 record
      segButtons[1].click();
    });
    expect(el.querySelectorAll('[data-slot="memory-record-card"]').length).toBe(1);
    expect(MemoryRecordCard).toBeTypeOf('function');

    const cssSource = await readSourceFile('../src/styles/components.css');
    expect(cssSource).toContain('.yui-mem-card');
    expect(cssSource).toContain('.yui-hw-strip');
    expect(cssSource).toContain('.yui-dl-bar-card');
    expect(cssSource).toContain('.yui-voice-bar');
    expect(cssSource).toContain('.yui-scroll-wrap--fade');
  });

  it('traps focus in FloatingContextSheet & restores trigger focus, plus SettingsSection/SettingsToggleRow & LocalVaultExportCard', async () => {
    const onToggleTheme = vi.fn();
    const onExport = vi.fn();
    const onImport = vi.fn();
    const onWipe = vi.fn();
    const onClose = vi.fn();

    const el = renderNode(
      <div>
        <button type="button" className="sheet-trigger">Open sheet</button>
        <SettingsSection title="Local runtime preferences" subtitle="All stored on-device" badge="Local">
          <SettingsToggleRow
            label="Thinking trace"
            description="Show collapsible chain-of-thought during generation"
            badge="Qwen3.5"
            shortcut={['⌘', 'T']}
            checked
            onCheckedChange={onToggleTheme}
          />
          <SettingsToggleRow
            label="Allow network tools"
            description="Disabled under Lethal Trifecta strict breaker"
            checked={false}
            disabled
            onCheckedChange={onToggleTheme}
          />
        </SettingsSection>
        <LocalVaultExportCard
          recordCountLabel="148 records"
          onExportEncrypted={onExport}
          onImportEncrypted={onImport}
          onWipeAll={onWipe}
        />
      </div>,
    );

    // SettingsToggleRow toggle & disabled guard
    const switches = el.querySelectorAll('[role="switch"]') as NodeListOf<HTMLButtonElement>;
    expect(switches.length).toBe(2);
    expect(switches[0].getAttribute('aria-checked')).toBe('true');
    expect(switches[1].disabled).toBe(true);
    act(() => {
      switches[0].click();
      switches[1].click();
    });
    expect(onToggleTheme).toHaveBeenCalledTimes(1);
    expect(onToggleTheme).toHaveBeenCalledWith(false);

    // LocalVaultExportCard passphrase gating & export/import/wipe confirm
    const exportBtn = Array.from(el.querySelectorAll('.yui-vault-actions button')).find((b) =>
      b.textContent?.includes('Export vault'),
    ) as HTMLButtonElement;
    const importBtn = Array.from(el.querySelectorAll('.yui-vault-actions button')).find((b) =>
      b.textContent?.includes('Import'),
    ) as HTMLButtonElement;
    expect(exportBtn.disabled).toBe(true);
    expect(importBtn.disabled).toBe(true);

    const input = el.querySelector('.yui-vault-input') as HTMLInputElement;
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    act(() => {
      valueSetter?.call(input, 'correct-horse-staple');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(exportBtn.disabled).toBe(false);
    expect(importBtn.disabled).toBe(false);

    act(() => {
      exportBtn.click();
      importBtn.click();
    });
    expect(onExport).toHaveBeenCalledWith('correct-horse-staple');
    expect(onImport).toHaveBeenCalledWith('correct-horse-staple');

    act(() => {
      (el.querySelector('.yui-vault-danger-zone button') as HTMLButtonElement).click();
    });
    expect(el.textContent).toContain('Erase all local memory shards?');
    expect(onWipe).not.toHaveBeenCalled();

    act(() => {
      (Array.from(el.querySelectorAll('.yui-vault-confirm-row button')).find((b) =>
        b.textContent?.includes('Confirm wipe'),
      ) as HTMLButtonElement).click();
    });
    expect(onWipe).toHaveBeenCalledTimes(1);

    // Focus trap & trigger restoration on FloatingContextSheet
    const trigger = el.querySelector('.sheet-trigger') as HTMLButtonElement;
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    rerenderNode(
      <div>
        <button type="button" className="sheet-trigger">Open sheet</button>
        <FloatingContextSheet open title="Keyboard sheet" onClose={onClose}>
          <button type="button" className="sheet-action">Sheet action</button>
        </FloatingContextSheet>
      </div>,
    );

    const closeBtn = el.querySelector('[aria-label="Close sheet"]') as HTMLButtonElement;
    const actionBtn = el.querySelector('.sheet-action') as HTMLButtonElement;
    expect(document.activeElement).toBe(closeBtn);

    act(() => {
      actionBtn.focus();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    });
    expect(document.activeElement).toBe(closeBtn);

    rerenderNode(
      <div>
        <button type="button" className="sheet-trigger">Open sheet</button>
        <FloatingContextSheet open={false} title="Keyboard sheet" onClose={onClose}>
          <button type="button" className="sheet-action">Sheet action</button>
        </FloatingContextSheet>
      </div>,
    );
    expect(document.activeElement).toBe(trigger);

    const cssSource = await readSourceFile('../src/styles/components.css');
    expect(cssSource).toContain('.yui-switch');
    expect(cssSource).toContain('.yui-vault-card');
  });

  it('supports LocalVaultExportCard file drop input, DataTableCard formatting/copy, and ArtifactPreviewCard collapsible body', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    const onImportFile = vi.fn();
    const onSaveArtifact = vi.fn();
    const onExpandedChange = vi.fn();

    const el = renderNode(
      <div>
        <LocalVaultExportCard
          selectedFileName="backup-2026.yvlt"
          statusMessage="Verified 2m ago"
          onExportEncrypted={() => {}}
          onImportEncrypted={() => {}}
          onImportFile={onImportFile}
        />
        <DataTableCard
          title="Decode Latency"
          badge="WGSL"
          columns={[
            { key: 'model', label: 'Model' },
            { key: 'ttft', label: 'TTFT', numeric: true },
            { key: 'tps', label: 'TPS', numeric: true },
          ]}
          rows={[
            { model: 'Qwen3.5-4B', ttft: '74ms', tps: 91.6 },
            { model: 'Pragma-1.5B', ttft: '38ms', tps: 142.4 },
          ]}
          copyFormat="markdown"
          footerLabel="Local benchmark"
        />
        <ArtifactPreviewCard
          title="benchmark-notes.md"
          fileType="MD"
          meta="2.4 KB · 32 lines"
          preview={'# Summary\nAll local runs verified cleanly.'}
          onExpandedChange={onExpandedChange}
          onSave={onSaveArtifact}
        />
      </div>,
    );

    expect(el.querySelector('.yui-vault-actions--dual')).toBeTruthy();
    expect(el.querySelector('[data-slot="vault-file-drop"]')?.textContent).toContain(
      'backup-2026.yvlt',
    );
    const fileInput = el.querySelector('.yui-vault-file-input') as HTMLInputElement;
    const mockFile = new File(['encrypted'], 'restore.yvlt', { type: 'application/octet-stream' });
    Object.defineProperty(fileInput, 'files', { configurable: true, value: [mockFile] });
    act(() => {
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(onImportFile).toHaveBeenCalledWith(mockFile);

    // DataTableCard Markdown copy
    expect(el.querySelectorAll('.yui-data-tr').length).toBe(2);
    const copyTableBtn = el.querySelector('[data-slot="data-table-card"] button') as HTMLButtonElement;
    act(() => {
      copyTableBtn.click();
    });
    expect(writeText).toHaveBeenCalledWith(
      '| Model | TTFT | TPS |\n| :--- | ---: | ---: |\n| Qwen3.5-4B | 74ms | 91.6 |\n| Pragma-1.5B | 38ms | 142.4 |',
    );
    expect(copyTableBtn.textContent).toContain('Copied');

    // ArtifactPreviewCard collapse & Save
    const artifact = el.querySelector('[data-slot="artifact-preview-card"]') as HTMLElement;
    expect(artifact.getAttribute('data-expanded')).toBe('true');
    const toggleBtn = artifact.querySelector('[aria-label="Collapse benchmark-notes.md"]') as HTMLButtonElement;
    act(() => {
      toggleBtn.click();
    });
    expect(artifact.getAttribute('data-expanded')).toBe('false');
    expect(onExpandedChange).toHaveBeenCalledWith(false);

    const saveBtn = Array.from(artifact.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Save'),
    ) as HTMLButtonElement;
    act(() => {
      saveBtn.click();
    });
    expect(onSaveArtifact).toHaveBeenCalledTimes(1);

    const cssSource = await readSourceFile('../src/styles/components.css');
    expect(cssSource).toContain('.yui-data-card');
    expect(cssSource).toContain('.yui-artifact-card');
    expect(cssSource).toContain('.yui-vault-drop');
    expect(cssSource).toContain('.yui-dl-sep');
  });

  it('supports DataTableCard column sorting (aria-sort), ArtifactPreviewCard header Copy & capped scroll, MemoryInspectorList date dividers, ShortcutSheet, and StatusToast', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    const onUndoToast = vi.fn();
    const onDismissToast = vi.fn();

    const el = renderNode(
      <div>
        <DataTableCard
          title="Sortable Decode Matrix"
          columns={[
            { key: 'model', label: 'Checkpoint', sortable: true },
            { key: 'tps', label: 'Decode', numeric: true, sortable: true },
          ]}
          rows={[
            { model: 'Qwen3.5-4B', tps: 91.6 },
            { model: 'Pragma-1.5B', tps: 142.4 },
            { model: 'Gemma-2B', tps: 118.0 },
          ]}
        />
        <ArtifactPreviewCard
          title="long-trace.log"
          fileType="LOG"
          meta="120 lines"
          capped
          preview={'line 1\nline 2\nline 3'}
        />
        <MemoryInspectorList
          records={[
            { id: 'm1', tier: 'profile', summary: 'Prefers tables', relativeTime: '2m', groupLabel: 'Today' },
            { id: 'm2', tier: 'episodic', summary: 'Reviewed Q3 billing', relativeTime: '1d', groupLabel: 'Yesterday' },
          ]}
        />
        <ShortcutSheet
          subtitle="Side-panel navigation"
          badge="MV3"
          groups={[
            {
              title: 'Navigation',
              items: [
                { label: 'Focus composer', description: 'Jump straight to prompt', keys: ['⌘', 'K'] },
                { label: 'Toggle thinking', keys: ['⌘', 'T'] },
              ],
            },
          ]}
        />
        <StatusToast
          message="2 memory items forgotten"
          detail="SQLite FTS5"
          tone="local"
          onUndo={onUndoToast}
          onDismiss={onDismissToast}
        />
      </div>,
    );

    // DataTableCard sorting cycle: none -> ascending -> descending -> none
    const sortHeaders = el.querySelectorAll('.yui-data-th.is-sortable');
    const tpsTh = sortHeaders[1] as HTMLElement;
    const tpsBtn = tpsTh.querySelector('.yui-data-sort-btn') as HTMLButtonElement;
    expect(tpsTh.getAttribute('aria-sort')).toBe('none');

    act(() => {
      tpsBtn.click();
    });
    expect(tpsTh.getAttribute('aria-sort')).toBe('ascending');
    const ascCells = Array.from(el.querySelectorAll('.yui-data-tr td:first-child')).map((c) => c.textContent);
    expect(ascCells).toEqual(['Qwen3.5-4B', 'Gemma-2B', 'Pragma-1.5B']);

    act(() => {
      tpsBtn.click();
    });
    expect(tpsTh.getAttribute('aria-sort')).toBe('descending');
    const descCells = Array.from(el.querySelectorAll('.yui-data-tr td:first-child')).map((c) => c.textContent);
    expect(descCells).toEqual(['Pragma-1.5B', 'Gemma-2B', 'Qwen3.5-4B']);

    act(() => {
      tpsBtn.click();
    });
    expect(tpsTh.getAttribute('aria-sort')).toBe('none');

    // ArtifactPreviewCard header Copy & capped body
    expect(el.querySelector('.yui-artifact-pre.is-capped')).toBeTruthy();
    const headerCopy = el.querySelector('[data-slot="artifact-header-copy"]') as HTMLButtonElement;
    act(() => {
      headerCopy.click();
    });
    expect(writeText).toHaveBeenCalledWith('line 1\nline 2\nline 3');
    expect(headerCopy.textContent).toContain('Copied');

    // MemoryInspectorList grouped sticky dividers
    const groups = Array.from(el.querySelectorAll('[data-slot="memory-group"]'));
    expect(groups.length).toBe(2);
    expect(groups[0].querySelector('.yui-mem-group-title')?.textContent).toBe('Today');
    expect(groups[1].querySelector('.yui-mem-group-title')?.textContent).toBe('Yesterday');

    // ShortcutSheet & StatusToast
    expect(el.querySelector('[data-slot="shortcut-sheet"]')?.textContent).toContain('Focus composer');
    expect(el.querySelectorAll('[data-slot="shortcut-sheet"] .yui-kbd').length).toBe(4);

    const toast = el.querySelector('[data-slot="status-toast"]') as HTMLElement;
    expect(toast.getAttribute('role')).toBe('status');
    expect(toast.getAttribute('aria-live')).toBe('polite');
    act(() => {
      (Array.from(toast.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Undo'),
      ) as HTMLButtonElement).click();
      (toast.querySelector('[aria-label="Dismiss notification"]') as HTMLButtonElement).click();
    });
    expect(onUndoToast).toHaveBeenCalledTimes(1);
    expect(onDismissToast).toHaveBeenCalledTimes(1);

    rerenderNode(<StatusToast open={false} message="Hidden" />);
    expect(el.querySelector('[data-slot="status-toast"]')).toBeNull();

    const cssSource = await readSourceFile('../src/styles/components.css');
    expect(cssSource).toContain('.yui-data-sort-btn');
    expect(cssSource).toContain('.yui-mem-group-head');
    expect(cssSource).toContain('.yui-shortcut-sheet');
    expect(cssSource).toContain('.yui-status-toast');
    expect(cssSource).toContain('.yui-artifact-pre.is-capped');
  });

  it('supports CommandPalette keyboard/ARIA navigation & focus trap, EmptyPanelState starters, and DiffCard copy', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    const onSelectAction = vi.fn();
    const onClosePalette = vi.fn();
    const onSelectStarter = vi.fn();

    const actions = [
      { id: 'cmd-1', label: 'Summarize active tab', group: 'Page', shortcut: ['⌘', 'S'] },
      { id: 'cmd-2', label: 'Disabled cloud fetch', group: 'Guardrails', disabled: true },
      { id: 'cmd-3', label: 'Switch local model', group: 'Runtime', shortcut: ['⌘', 'M'] },
    ];

    const el = renderNode(
      <div>
        <button type="button" className="palette-trigger">Open palette</button>
        <EmptyPanelState
          starters={[
            { id: 's1', label: 'Summarize this page', icon: 'document' },
            { id: 's2', label: 'Compare pricing', icon: 'compare' },
          ]}
          onSelectStarter={onSelectStarter}
        />
        <DiffCard
          filename="src/runtime/decode.ts"
          language="TS"
          lines={[
            { type: 'context', content: 'const quant = "Q4F16";' },
            { type: 'remove', content: 'const maxTokens = 512;' },
            { type: 'add', content: 'const maxTokens = 2048;' },
            { type: 'add', content: 'const kvCache = "int8";' },
          ]}
        />
      </div>,
    );

    // EmptyPanelState renders monogram, starters, and footer
    expect(el.querySelector('[data-slot="empty-panel-state"]')?.textContent).toContain(
      'On-device WebGPU',
    );
    act(() => {
      (el.querySelector('.yui-empty-panel-chip') as HTMLButtonElement).click();
    });
    expect(onSelectStarter).toHaveBeenCalledWith({
      id: 's1',
      label: 'Summarize this page',
      icon: 'document',
    });

    // DiffCard computes +2 / -1 and copies patched output without removed lines
    const diffCard = el.querySelector('[data-slot="diff-card"]') as HTMLElement;
    expect(diffCard.querySelector('.yui-diff-stat-add')?.textContent).toBe('+2');
    expect(diffCard.querySelector('.yui-diff-stat-del')?.textContent).toBe('-1');
    act(() => {
      (diffCard.querySelector('[data-slot="diff-copy-btn"]') as HTMLButtonElement).click();
    });
    expect(writeText).toHaveBeenCalledWith(
      'const quant = "Q4F16";\nconst maxTokens = 2048;\nconst kvCache = "int8";',
    );

    // CommandPalette open -> focus trap -> ArrowDown skips disabled -> Enter -> filter empty -> Escape restores focus
    const trigger = el.querySelector('.palette-trigger') as HTMLButtonElement;
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    rerenderNode(
      <div>
        <button type="button" className="palette-trigger">Open palette</button>
        <CommandPalette
          open
          actions={actions}
          onSelectAction={onSelectAction}
          onClose={onClosePalette}
        />
      </div>,
    );

    const dialog = el.querySelector('[data-slot="command-palette"]') as HTMLElement;
    const combobox = dialog.querySelector('[role="combobox"]') as HTMLInputElement;
    expect(document.activeElement).toBe(combobox);
    const activeBefore = combobox.getAttribute('aria-activedescendant');
    expect(activeBefore).toContain('cmd-1');

    act(() => {
      combobox.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    });
    // Disabled cmd-2 skipped -> lands on cmd-3
    expect(combobox.getAttribute('aria-activedescendant')).toContain('cmd-3');

    act(() => {
      combobox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });
    expect(onSelectAction).toHaveBeenCalledWith(actions[2]);

    // Filter to empty state
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    act(() => {
      valueSetter?.call(combobox, 'zzzzz-no-match');
      combobox.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(dialog.querySelector('.yui-palette-empty')?.textContent).toContain('No matching commands');

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(onClosePalette).toHaveBeenCalledTimes(1);

    rerenderNode(
      <div>
        <button type="button" className="palette-trigger">Open palette</button>
        <CommandPalette
          open={false}
          actions={actions}
          onSelectAction={onSelectAction}
          onClose={onClosePalette}
        />
      </div>,
    );
    expect(document.activeElement).toBe(trigger);

    const cssSource = await readSourceFile('../src/styles/components.css');
    expect(cssSource).toContain('.yui-palette-card');
    expect(cssSource).toContain('.yui-empty-panel');
    expect(cssSource).toContain('.yui-diff-card');
  });

  it('renders ToolTraceList collapsible steps, PermissionCard actions with Enter/Escape keys, and SidePanelShell overlay layering', async () => {
    const onAllowOnce = vi.fn();
    const onDeny = vi.fn();
    const onAlwaysSite = vi.fn();
    const onToggleStep = vi.fn();

    const el = renderNode(
      <SidePanelShell
        theme="light"
        veilOpen
        overlay={
          <CommandPalette
            open
            actions={[{ id: 'a1', label: 'Run trace check', group: 'Runtime' }]}
          />
        }
      >
        <ToolTraceList
          onToggleStep={onToggleStep}
          steps={[
            {
              id: 's1',
              tool: 'read_tab',
              label: 'yours.sh/spec',
              status: 'done',
              latencyLabel: '42ms',
              input: '{"url":"https://yours.sh/spec"}',
              output: '{"tokens":1240}',
            },
            {
              id: 's2',
              tool: 'search_web_tab',
              label: 'WebGPU subgroup support',
              status: 'running',
              latencyLabel: '118ms',
            },
            {
              id: 's3',
              tool: 'run_sandbox',
              label: 'Blocked network egress',
              status: 'blocked',
              latencyLabel: 'blocked',
              output: 'Prevented by @yours/guard Lethal Trifecta rule',
            },
            {
              id: 's4',
              tool: 'memory_query',
              label: 'FTS5 timeout',
              status: 'error',
              latencyLabel: '502ms',
            },
          ]}
        />
        <PermissionCard
          title="Allow outbound POST?"
          domain="api.example.com"
          scope="Submit structured page brief JSON"
          ruleLabel="Lethal Trifecta · @yours/guard"
          reason="Untrusted tab context + active memory store requested external POST."
          onAllowOnce={onAllowOnce}
          onDeny={onDeny}
          onAlwaysSite={onAlwaysSite}
        />
      </SidePanelShell>,
    );

    // SidePanelShell overlay sits in .yui-stage-overlay sibling above .yui-veil
    const stageOverlay = el.querySelector('.yui-stage-overlay');
    const cmdPanel = stageOverlay?.querySelector('.yui-cmd-panel');
    expect(stageOverlay).toBeTruthy();
    expect(cmdPanel).toBeTruthy();
    expect(el.querySelector('.yui-scroll-stage .yui-cmd-panel')).toBeNull();

    // ToolTraceList step disclosure + status badges
    const trace = el.querySelector('[data-slot="tool-trace-list"]') as HTMLElement;
    expect(trace.querySelectorAll('.yui-trace-row').length).toBe(4);
    const firstTrigger = trace.querySelector('.yui-trace-trigger') as HTMLButtonElement;
    expect(firstTrigger.getAttribute('aria-expanded')).toBe('false');
    act(() => {
      firstTrigger.click();
    });
    expect(firstTrigger.getAttribute('aria-expanded')).toBe('true');
    expect(onToggleStep).toHaveBeenCalledWith('s1');
    expect(trace.textContent).toContain('{"url":"https://yours.sh/spec"}');

    // Ledger collapse
    const headBtn = trace.querySelector('.yui-trace-head') as HTMLButtonElement;
    act(() => {
      headBtn.click();
    });
    expect(headBtn.getAttribute('aria-expanded')).toBe('false');

    // PermissionCard buttons + keyboard Escape / Enter
    const perm = el.querySelector('[data-slot="permission-card"]') as HTMLElement;
    expect(perm.textContent).toContain('api.example.com');
    act(() => {
      (Array.from(perm.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Always for this site'),
      ) as HTMLButtonElement).click();
    });
    expect(onAlwaysSite).toHaveBeenCalledTimes(1);

    act(() => {
      perm.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      perm.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(onAllowOnce).toHaveBeenCalledTimes(1);
    expect(onDeny).toHaveBeenCalledTimes(1);

    const cssSource = await readSourceFile('../src/styles/components.css');
    expect(cssSource).toContain('.yui-stage-overlay');
    expect(cssSource).toContain('.yui-cmd-panel');
    expect(cssSource).toContain('.yui-trace-card');
    expect(cssSource).toContain('.yui-perm-card');
  });

  it('supports ThreadHistoryList pin/two-step delete, ModelRosterList radiogroup keys, and TabContextList mute/detach', async () => {
    const onSelectThread = vi.fn();
    const onTogglePin = vi.fn();
    const onDeleteThread = vi.fn();
    const onSelectModel = vi.fn();
    const onDownloadModel = vi.fn();
    const onToggleMute = vi.fn();
    const onDetach = vi.fn();

    const el = renderNode(
      <div>
        <ThreadHistoryList
          activeId="th1"
          onSelect={onSelectThread}
          onTogglePin={onTogglePin}
          onDelete={onDeleteThread}
          items={[
            {
              id: 'th1',
              title: 'WebGPU subgroup reduction tuning',
              preview: 'Switching KV cache from fp16 to int8 doubled context...',
              timestamp: '2m ago',
              turnCount: 6,
              groupLabel: 'Today',
              pinned: true,
            },
            {
              id: 'th2',
              title: 'CSP audit on Chrome side panel',
              preview: 'Verified zero inline styles and strict script-src self.',
              timestamp: 'Yesterday',
              turnCount: 4,
              groupLabel: 'Yesterday',
            },
          ]}
        />
        <ModelRosterList
          selectedId="m1"
          onSelectModel={onSelectModel}
          onDownloadModel={onDownloadModel}
          models={[
            {
              id: 'm1',
              name: 'Qwen3.5-4B',
              quantLabel: 'Q4F16',
              sizeLabel: '2.4 GB',
              vramLabel: '3.1 GB VRAM',
              speedLabel: '44 tok/s',
              state: 'active',
            },
            {
              id: 'm2',
              name: 'Gemma 4 E4B',
              quantLabel: 'Q4',
              sizeLabel: '2.7 GB',
              vramLabel: '3.4 GB VRAM',
              speedLabel: '39 tok/s',
              state: 'cached',
            },
            {
              id: 'm3',
              name: 'Llama-3.2-3B',
              quantLabel: 'Q4',
              sizeLabel: '1.9 GB',
              state: 'download',
            },
          ]}
        />
        <TabContextList
          onToggleMute={onToggleMute}
          onDetach={onDetach}
          items={[
            {
              id: 'tc1',
              domain: 'docs.rs',
              title: 'wgpu ComputePassEncoder subgroup barriers',
              tokenLabel: '1.4k tok',
              kind: 'tab',
            },
            {
              id: 'tc2',
              domain: 'yours.sh',
              title: 'Highlighted kernel dispatch excerpt',
              tokenLabel: '320 tok',
              kind: 'snippet',
              muted: true,
            },
          ]}
        />
      </div>,
    );

    // ThreadHistoryList sticky groups + two-step delete
    const groups = Array.from(el.querySelectorAll('[data-slot="thread-history-group"]'));
    expect(groups.length).toBe(2);
    expect(groups[0].querySelector('.yui-th-group-title')?.textContent).toBe('Today');
    expect(el.querySelector('[aria-current="true"]')?.textContent).toContain('WebGPU subgroup');

    const delInitBtn = el.querySelector('[aria-label="Delete CSP audit on Chrome side panel"]') as HTMLButtonElement;
    act(() => {
      delInitBtn.click();
    });
    expect(onDeleteThread).not.toHaveBeenCalled();

    const delConfirmBtn = el.querySelector('[aria-label="Confirm delete CSP audit on Chrome side panel"]') as HTMLButtonElement;
    act(() => {
      delConfirmBtn.click();
    });
    expect(onDeleteThread).toHaveBeenCalledWith('th2');

    // ModelRosterList radiogroup + ArrowDown + Enter on download
    const radios = Array.from(el.querySelectorAll('[data-slot="model-roster-list"] [role="radio"]')) as HTMLButtonElement[];
    expect(radios.length).toBe(3);
    expect(radios[0].getAttribute('aria-checked')).toBe('true');

    act(() => {
      radios[0].focus();
      radios[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    });
    expect(onSelectModel).toHaveBeenCalledWith('m2');

    act(() => {
      radios[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });
    expect(onDownloadModel).toHaveBeenCalledWith('m3');

    // TabContextList mute + detach
    const muteBtn = el.querySelector('[aria-label="Mute docs.rs"]') as HTMLButtonElement;
    expect(muteBtn.getAttribute('aria-pressed')).toBe('false');
    act(() => {
      muteBtn.click();
      (el.querySelector('[aria-label="Detach yours.sh"]') as HTMLButtonElement).click();
    });
    expect(onToggleMute).toHaveBeenCalledWith('tc1');
    expect(onDetach).toHaveBeenCalledWith('tc2');

    const cssSource = await readSourceFile('../src/styles/components.css');
    expect(cssSource).toContain('grid-template-columns: 52px minmax(0, 1fr);');
    expect(cssSource).toContain('.yui-th-root');
    expect(cssSource).toContain('.yui-model-roster');
    expect(cssSource).toContain('.yui-tabctx-list');
  });

  it('renders ContextBudgetMeter threshold states & breakdown and CitationFootnoteList copy/jump actions', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    const onShowOnPage = vi.fn();
    const onCopyQuote = vi.fn();

    const el = renderNode(
      <div>
        <ContextBudgetMeter
          usedTokens={3200}
          maxTokens={8000}
          segments={[
            { id: 'sys', label: 'System', tokensLabel: '640 tok', percent: 8 },
            { id: 'tab', label: 'Active tab', tokensLabel: '1.4k tok', percent: 18 },
            { id: 'hist', label: 'History', tokensLabel: '840 tok', percent: 10 },
            { id: 'mem', label: 'Memory', tokensLabel: '320 tok', percent: 4 },
          ]}
        />
        <ContextBudgetMeter usedTokens={6800} maxTokens={8000} title="Near cap" />
        <ContextBudgetMeter usedTokens={7800} maxTokens={8000} title="At cap" />
        <CitationFootnoteList
          activeIndex={1}
          onShowOnPage={onShowOnPage}
          onCopyQuote={onCopyQuote}
          citations={[
            {
              id: 'fn1',
              index: 1,
              title: 'WebGPU Subgroup Operations Spec',
              domain: 'gpuweb.github.io',
              locator: 'Section 3.2 · Para 4',
              excerpt: 'Subgroup barriers synchronize invocations cleanly within a compute workgroup.',
              highlight: 'warm',
            },
            {
              id: 'fn2',
              index: 2,
              title: 'MV3 Content Security Policy',
              domain: 'developer.chrome.com',
              locator: 'CSP v3 · Note 2',
              excerpt: 'Extension pages prohibit unsafe-inline styles by default.',
              highlight: 'mono',
            },
          ]}
        />
      </div>,
    );

    const meters = Array.from(el.querySelectorAll('[data-slot="context-budget-meter"]')) as HTMLElement[];
    expect(meters.length).toBe(3);
    expect(meters[0].getAttribute('data-level')).toBe('normal');
    expect(meters[0].textContent).toContain('3.2k / 8k · 40%');
    expect(meters[1].getAttribute('data-level')).toBe('warning');
    expect(meters[2].getAttribute('data-level')).toBe('critical');
    expect((meters[0].querySelector('progress') as HTMLProgressElement).value).toBe(40);

    const toggle = meters[0].querySelector('.yui-budget-toggle') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    act(() => {
      toggle.click();
    });
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(meters[0].textContent).toContain('Active tab');
    expect(meters[0].textContent).toContain('1.4k tok');

    const footnotes = el.querySelector('[data-slot="citation-footnote-list"]') as HTMLElement;
    expect(footnotes.querySelectorAll('.yui-fn-row').length).toBe(2);
    act(() => {
      (footnotes.querySelector('.yui-fn-btn') as HTMLButtonElement).click();
      (footnotes.querySelector('[aria-label="Copy quote 1"]') as HTMLButtonElement).click();
    });
    expect(onShowOnPage).toHaveBeenCalledTimes(1);
    expect(onCopyQuote).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith(
      'Subgroup barriers synchronize invocations cleanly within a compute workgroup.',
    );

    const cssSource = await readSourceFile('../src/styles/components.css');
    expect(cssSource).toContain('.yui-budget-progress');
    expect(cssSource).toContain('.yui-fn-quote.is-warm');
  });

  it('parses and renders GFM Markdown pipe-tables in StreamingResponse including alignments and partial streaming rows', async () => {
    const md = [
      'Here is the benchmark comparison:',
      '',
      '| Model | Speed | Size | Note |',
      '|:---|---:|:---:|---|',
      '| **Qwen3.5-4B** | `44 tok/s` | 2.4 GB | Local OPFS \\| GPU |',
      '| Gemma 4 E4B | 39 tok/s | 2.7 GB | Warm cache |',
    ].join('\n');

    const el = renderNode(<StreamingResponse text={md} status="done" actions={false} />);
    const tableWrap = el.querySelector('[data-slot="streaming-response-table"]');
    expect(tableWrap).toBeTruthy();

    const ths = Array.from(tableWrap!.querySelectorAll('th'));
    expect(ths.map((n) => n.textContent)).toEqual(['Model', 'Speed', 'Size', 'Note']);
    expect(ths[0].classList.contains('is-left')).toBe(true);
    expect(ths[1].classList.contains('is-right')).toBe(true);
    expect(ths[2].classList.contains('is-center')).toBe(true);

    const rows = Array.from(tableWrap!.querySelectorAll('tbody tr'));
    expect(rows.length).toBe(2);
    expect(rows[0].querySelector('strong')?.textContent).toBe('Qwen3.5-4B');
    expect(rows[0].querySelector('code')?.textContent).toBe('44 tok/s');
    expect(rows[0].textContent).toContain('Local OPFS | GPU');

    // Partial trailing row during streaming renders safely without crashing
    const partialMd = [
      '| Col A | Col B |',
      '|---|---|',
      '| cell-1 |',
    ].join('\n');
    rerenderNode(<StreamingResponse text={partialMd} status="streaming" speed={200} actions={false} />);
    expect(el.querySelector('.yui-sr')).toBeTruthy();

    const cssSource = await readSourceFile('../src/styles/components.css');
    expect(cssSource).toContain('.yui-toast-overlay');
    expect(cssSource).toContain('z-index: 45');
    expect(cssSource).toContain('.yui-sr-table');
    expect(cssSource).toContain('container-type: inline-size');
    expect(cssSource).toContain('@container (max-width: 340px)');
  });

  it('renders CodeBlockCard with language badge, line numbers & copy feedback, and OnboardingCard setup CTA', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    const onCopyCode = vi.fn();
    const onInitialize = vi.fn();
    const onSecondaryAction = vi.fn();

    const el = renderNode(
      <div>
        <CodeBlockCard
          title="shader.wgsl"
          language="wgsl"
          showLineNumbers
          onCopy={onCopyCode}
          code={'@compute @workgroup_size(256)\nfn main() {\n  workgroupBarrier();\n}'}
        />
        <OnboardingCard
          checkpointLabel="Qwen3.5-4B · Q4F16"
          cacheSizeLabel="2.6 GB"
          adapterLabel="WebGPU ready"
          secondaryLabel="Choose another checkpoint"
          onInitialize={onInitialize}
          onSecondaryAction={onSecondaryAction}
        />
      </div>,
    );

    const codeCard = el.querySelector('[data-slot="code-block-card"]') as HTMLElement;
    expect(codeCard.querySelector('.yui-codecard-lang')?.textContent).toBe('wgsl');
    expect(codeCard.querySelectorAll('.yui-codecard-ln').length).toBe(4);

    act(() => {
      (codeCard.querySelector('.yui-sr-code-copy') as HTMLButtonElement).click();
    });
    expect(onCopyCode).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith(
      '@compute @workgroup_size(256)\nfn main() {\n  workgroupBarrier();\n}',
    );
    expect(codeCard.querySelector('.yui-sr-code-copy')?.textContent).toContain('Copied');

    const onb = el.querySelector('[data-slot="onboarding-card"]') as HTMLElement;
    expect(onb.textContent).toContain('Qwen3.5-4B · Q4F16');
    expect(onb.textContent).toContain('2.6 GB');
    expect(onb.textContent).toContain('Zero cloud API keys');
    act(() => {
      (onb.querySelector('.yui-onb-cta') as HTMLButtonElement).click();
      (onb.querySelector('.yui-onb-secondary') as HTMLButtonElement).click();
    });
    expect(onInitialize).toHaveBeenCalledTimes(1);
    expect(onSecondaryAction).toHaveBeenCalledTimes(1);

    const cssSource = await readSourceFile('../src/styles/components.css');
    expect(cssSource).toContain('height: 84px;');
    expect(cssSource).toContain('.yui-codecard');
    expect(cssSource).toContain('.yui-onb-card');
  });

  it('renders ErrorRecoveryCard (expandable trace, Copy diagnostics, Retry/Switch) and InlineNotice tones cleanly without inline styles', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    const onRetry = vi.fn();
    const onSwitchModel = vi.fn();
    const onCopyDiagnostics = vi.fn();
    const onNoticeAction = vi.fn();

    const el = renderNode(
      <div>
        <ErrorRecoveryCard
          title="WebGPU device adapter lost"
          badgeLabel="WebGPU lost"
          diagnosis="Chrome reclaimed the GPU context after idle sleep."
          diagnostics={'GPUDeviceLostInfo: reason="destroyed"\nadapter=Apple M3'}
          onRetry={onRetry}
          onSwitchModel={onSwitchModel}
          onCopyDiagnostics={onCopyDiagnostics}
        />
        <InlineNotice
          tone="info"
          icon="history"
          message="Context compacted · 9 older turns folded"
          actionLabel="Expand"
          onAction={onNoticeAction}
        />
        <InlineNotice tone="warning" message="Private tab · Local memory paused" />
        <InlineNotice tone="success" message="OPFS weights verified" />
      </div>,
    );

    expect(el.querySelectorAll('[style]').length).toBe(0);

    const card = el.querySelector('[data-slot="error-recovery-card"]') as HTMLElement;
    expect(card.textContent).toContain('WebGPU lost');
    expect(card.textContent).toContain('WebGPU device adapter lost');
    expect(card.querySelector('.yui-recovery-pre')).toBeNull();

    const toggle = card.querySelector('.yui-recovery-toggle') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    act(() => {
      toggle.click();
    });
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(card.querySelector('.yui-recovery-pre')?.textContent).toContain('GPUDeviceLostInfo');

    act(() => {
      (card.querySelector('.yui-recovery-copy') as HTMLButtonElement).click();
    });
    expect(writeText).toHaveBeenCalledWith('GPUDeviceLostInfo: reason="destroyed"\nadapter=Apple M3');
    expect(onCopyDiagnostics).toHaveBeenCalledTimes(1);
    expect(card.querySelector('.yui-recovery-copy')?.textContent).toContain('Copied');

    act(() => {
      (card.querySelector('.yui-recovery-retry') as HTMLButtonElement).click();
      (card.querySelector('.yui-recovery-switch') as HTMLButtonElement).click();
    });
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onSwitchModel).toHaveBeenCalledTimes(1);

    const notices = el.querySelectorAll('[data-slot="inline-notice"]');
    expect(notices.length).toBe(3);
    expect(notices[0].getAttribute('data-tone')).toBe('info');
    expect(notices[1].getAttribute('data-tone')).toBe('warning');
    expect(notices[2].getAttribute('data-tone')).toBe('success');

    act(() => {
      (notices[0].querySelector('.yui-notice-action') as HTMLButtonElement).click();
    });
    expect(onNoticeAction).toHaveBeenCalledTimes(1);

    const cssSource = await readSourceFile('../src/styles/components.css');
    expect(cssSource).toContain('.yui-recovery-card');
    expect(cssSource).toContain('.yui-notice--warning');

    const reducedIdx = cssSource.indexOf('@media (prefers-reduced-motion: reduce)');
    expect(cssSource.slice(reducedIdx)).toContain('.yui-recovery-chevron');
    expect(cssSource.slice(reducedIdx)).toContain('.yui-notice-action');

    const forcedIdx = cssSource.indexOf('@media (forced-colors: active)');
    expect(forcedIdx).toBeGreaterThan(-1);
    expect(cssSource.slice(forcedIdx)).toContain('.yui-recovery-card');
    expect(cssSource.slice(forcedIdx)).toContain('.yui-notice');
  });

  it('renders AudioLevelMeter, VoiceSessionCard (transcript, mute/barge-in/end, privacy), and FloatingComposer command & token props without inline styles', async () => {
    const onOpenCommands = vi.fn();
    const onPushToTalk = vi.fn();
    const onToggleBargeIn = vi.fn();
    const onToggleMute = vi.fn();
    const onEndSession = vi.fn();

    const el = renderNode(
      <div>
        <AudioLevelMeter level={0.72} tone="active" bars={7} animated label="Mic level" />
        <VoiceSessionCard
          state="speech-detected"
          elapsedLabel="00:18"
          transcript="Compare the local WebGPU speeds"
          interimTranscript="across the two checkpoints"
          pushToTalkKey="Space"
          onPushToTalk={onPushToTalk}
          bargeInEnabled
          onToggleBargeIn={onToggleBargeIn}
          muted={false}
          onToggleMute={onToggleMute}
          onEndSession={onEndSession}
        />
        <FloatingComposer
          value="Draft prompt"
          onChange={() => {}}
          onSubmit={() => {}}
          onOpenCommands={onOpenCommands}
          contextUsageLabel="6.4k / 8k"
          contextUsageTone="warning"
        />
      </div>,
    );

    expect(el.querySelectorAll('[style]').length).toBe(0);

    const standaloneMeter = el.querySelector('[data-slot="audio-level-meter"]') as HTMLElement;
    expect(standaloneMeter.getAttribute('role')).toBe('meter');
    expect(standaloneMeter.querySelectorAll('.yui-alm-bar').length).toBe(7);
    expect(standaloneMeter.getAttribute('aria-valuenow')).toBe('72');

    const voiceCard = el.querySelector('[data-slot="voice-session-card"]') as HTMLElement;
    expect(voiceCard.querySelector('.yui-voice-committed')?.textContent).toBe(
      'Compare the local WebGPU speeds',
    );
    expect(voiceCard.querySelector('.yui-voice-interim')?.textContent).toBe(
      'across the two checkpoints',
    );
    expect(voiceCard.querySelector('.yui-voice-caret')).toBeTruthy();
    expect(voiceCard.textContent).toContain('On-device STT');

    act(() => {
      (voiceCard.querySelector('.yui-voice-ptt-btn') as HTMLButtonElement).click();
      (voiceCard.querySelector('.yui-voice-mute-pill') as HTMLButtonElement).click();
      (voiceCard.querySelector('.yui-voice-end-btn') as HTMLButtonElement).click();
      (el.querySelector('.yui-composer-cmd-btn') as HTMLButtonElement).click();
    });
    expect(onPushToTalk).toHaveBeenCalledTimes(1);
    expect(onToggleMute).toHaveBeenCalledTimes(1);
    expect(onEndSession).toHaveBeenCalledTimes(1);
    expect(onOpenCommands).toHaveBeenCalledTimes(1);

    const usageBadge = el.querySelector('.yui-composer-usage') as HTMLElement;
    expect(usageBadge.textContent).toBe('6.4k / 8k');
    expect(usageBadge.classList.contains('is-warning')).toBe(true);

    // Zero-config backward compatibility: omitting optional props renders no extra buttons/badges
    rerenderNode(<FloatingComposer value="" onChange={() => {}} onSubmit={() => {}} />);
    expect(el.querySelector('.yui-composer-cmd-btn')).toBeNull();
    expect(el.querySelector('.yui-composer-usage')).toBeNull();

    const cssSource = await readSourceFile('../src/styles/components.css');
    expect(cssSource).toContain('.yui-voice-card');
    expect(cssSource).toContain('.yui-alm-bar--5');
    expect(cssSource).toContain('.yui-composer-cmd-btn');
    const forcedIdx = cssSource.indexOf('@media (forced-colors: active)');
    expect(cssSource.slice(forcedIdx)).toContain('.yui-alm-bar');
    expect(cssSource.slice(forcedIdx)).toContain('.yui-voice-card');
  });

  it('renders PromptTemplateList (category filter, search, pin toggle, Up/Down/Enter) and ExportSessionCard (format, toggles, copy/download) cleanly without inline styles', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    const onSelectTemplate = vi.fn();
    const onTogglePin = vi.fn();
    const onCopyExport = vi.fn();
    const onDownloadExport = vi.fn();

    const el = renderNode(
      <div>
        <PromptTemplateList
          onSelect={onSelectTemplate}
          onTogglePin={onTogglePin}
          items={[
            {
              id: 't1',
              command: '/summarize',
              title: 'Summarize active tab',
              description: 'Concise bullets from local DOM prose.',
              category: 'Page',
              shortcut: '⌘1',
            },
            {
              id: 't2',
              command: '/wgsl',
              title: 'Audit compute shader',
              description: 'Check barriers and shared memory bank conflicts.',
              category: 'Code',
              pinned: true,
            },
          ]}
        />
        <ExportSessionCard
          metaLabel="14 turns · 18.4 KB"
          previewText={'# Session Export\nVerified locally.'}
          onCopy={onCopyExport}
          onDownload={onDownloadExport}
        />
      </div>,
    );

    expect(el.querySelectorAll('[style]').length).toBe(0);

    const ptl = el.querySelector('[data-slot="prompt-template-list"]') as HTMLElement;
    const rows = Array.from(ptl.querySelectorAll('.yui-ptl-row'));
    // Pinned item sorts first
    expect(rows[0].getAttribute('data-template-id')).toBe('t2');

    // Category filter pill
    const tabs = Array.from(ptl.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
    act(() => {
      tabs.find((btn) => btn.textContent === 'Page')?.click();
    });
    expect(ptl.querySelectorAll('.yui-ptl-row').length).toBe(1);
    expect(ptl.querySelector('.yui-ptl-cmd')?.textContent).toBe('/summarize');

    // Reset to All and test roving ArrowDown + Enter + pin click
    act(() => {
      tabs.find((btn) => btn.textContent === 'All')?.click();
    });
    const firstOpt = ptl.querySelector('.yui-ptl-main') as HTMLButtonElement;
    act(() => {
      firstOpt.focus();
    });
    act(() => {
      firstOpt.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    });
    expect(ptl.querySelectorAll('.yui-ptl-row')[1].classList.contains('is-active')).toBe(true);

    act(() => {
      (ptl.querySelectorAll('.yui-ptl-main')[1] as HTMLButtonElement).click();
      (ptl.querySelector('.yui-ptl-pin-btn') as HTMLButtonElement).click();
    });
    expect(onSelectTemplate).toHaveBeenCalledWith(expect.objectContaining({ id: 't1' }));
    expect(onTogglePin).toHaveBeenCalledWith('t2');

    const exp = el.querySelector('[data-slot="export-session-card"]') as HTMLElement;
    expect(exp.getAttribute('data-format')).toBe('markdown');
    expect(exp.textContent).toContain('Local file · Nothing uploaded');

    const segBtns = Array.from(exp.querySelectorAll('.yui-seg-btn')) as HTMLButtonElement[];
    const switches = Array.from(exp.querySelectorAll('[role="switch"]')) as HTMLButtonElement[];
    act(() => {
      segBtns[1].click(); // JSON
      switches[0].click(); // toggle tool traces off
    });
    expect(exp.getAttribute('data-format')).toBe('json');
    expect(switches[0].getAttribute('aria-checked')).toBe('false');

    act(() => {
      (exp.querySelector('.yui-export-copy-btn') as HTMLButtonElement).click();
      (exp.querySelector('.yui-export-dl-btn') as HTMLButtonElement).click();
    });
    expect(writeText).toHaveBeenCalledWith('# Session Export\nVerified locally.');
    expect(onCopyExport).toHaveBeenCalledWith({
      format: 'json',
      includeToolTraces: false,
      includeCitations: true,
    });
    expect(onDownloadExport).toHaveBeenCalledWith({
      format: 'json',
      includeToolTraces: false,
      includeCitations: true,
    });

    const cssSource = await readSourceFile('../src/styles/components.css');
    expect(cssSource).toContain('.yui-ptl-card');
    expect(cssSource).toContain('.yui-export-card');
    expect(cssSource).toContain('.yui-voice-card-btns');
    expect(cssSource.slice(cssSource.indexOf('@media (forced-colors: active)'))).toContain('.yui-export-card');
  });

  it('renders FindInThreadBar and StorageQuotaCard with zero inline styles and full actions', async () => {
    const onQueryChange = vi.fn();
    const onPrev = vi.fn();
    const onNext = vi.fn();
    const onToggleCase = vi.fn();
    const onClose = vi.fn();
    const onVerify = vi.fn();
    const onClearEntry = vi.fn();
    const onClearAll = vi.fn();

    const el = renderNode(
      <div>
        <FindInThreadBar
          query="local"
          totalMatches={7}
          currentMatch={2}
          onQueryChange={onQueryChange}
          onPrev={onPrev}
          onNext={onNext}
          caseSensitive={false}
          onToggleCaseSensitive={onToggleCase}
          onClose={onClose}
        />
        <FindInThreadBar
          query="missing"
          totalMatches={0}
          onPrev={onPrev}
          onNext={onNext}
        />
        <StorageQuotaCard
          usedLabel="2.6 GB"
          quotaLabel="12.0 GB"
          entries={[
            {
              id: 'weights',
              label: 'Cached WGSL weights',
              detail: 'Qwen3.5-4B · INT4 OPFS',
              sizeLabel: '2.4 GB',
              percent: 20,
              tone: 'weights',
              status: 'verified',
              onVerify,
              onClear: onClearEntry,
            },
            {
              id: 'vault',
              label: 'Encrypted memory vault',
              detail: 'IndexedDB AES-GCM',
              sizeLabel: '160 MB',
              percent: 1.5,
              tone: 'vault',
              onClear: onClearEntry,
            },
          ]}
          onClearAll={onClearAll}
        />
      </div>,
    );

    expect(el.querySelectorAll('[style]').length).toBe(0);

    const bars = el.querySelectorAll('[data-slot="find-in-thread-bar"]');
    expect(bars[0].querySelector('.yui-find-count')?.textContent).toBe('2 / 7');
    expect(bars[1].querySelector('.yui-find-count')?.textContent).toBe('No matches');
    expect(
      (bars[1].querySelector('[aria-label="Next match"]') as HTMLButtonElement).disabled,
    ).toBe(true);

    const input = bars[0].querySelector('.yui-find-input') as HTMLInputElement;
    act(() => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      input.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true }),
      );
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      (bars[0].querySelector('[aria-label="Match case"]') as HTMLButtonElement).click();
    });
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onToggleCase).toHaveBeenCalledTimes(1);

    const quota = el.querySelector('[data-slot="storage-quota-card"]') as HTMLElement;
    expect(quota.textContent).toContain('2.6 GB');
    expect(quota.textContent).toContain('12.0 GB');
    expect(quota.textContent).toContain('100% local browser storage');
    expect(quota.querySelectorAll('.yui-storage-seg').length).toBe(2);
    expect(quota.querySelector('.yui-storage-seg')?.getAttribute('width')).toBe('20');

    act(() => {
      (quota.querySelector('.yui-storage-action-btn') as HTMLButtonElement).click();
      (quota.querySelector('.yui-storage-clear-btn') as HTMLButtonElement).click();
      (quota.querySelector('.yui-storage-clear-all') as HTMLButtonElement).click();
    });
    expect(onVerify).toHaveBeenCalledTimes(1);
    expect(onClearEntry).toHaveBeenCalledTimes(1);
    expect(onClearAll).toHaveBeenCalledTimes(1);

    const cssSource = await readSourceFile('../src/styles/components.css');
    expect(cssSource).toContain('.yui-find-bar');
    expect(cssSource).toContain('.yui-storage-card');
    expect(cssSource.slice(cssSource.indexOf('@media (forced-colors: active)'))).toContain(
      '.yui-storage-card',
    );
  });

  it('contains Tab/Shift+Tab focus and restores trigger focus on Escape or veil click across modal overlays', () => {
    function OverlayHarness({ mode }: { mode: 'palette' | 'shortcut' | 'sheet' }) {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <button
            type="button"
            data-testid="trigger-btn"
            onClick={() => setOpen(true)}
          >
            Open overlay
          </button>
          <SidePanelShell
            veilOpen={open}
            onVeilClick={() => setOpen(false)}
            overlay={
              mode === 'palette' ? (
                <CommandPalette
                  open={open}
                  onClose={() => setOpen(false)}
                  actions={[
                    { id: 'a1', label: 'Action 1', onSelect: () => {} },
                    { id: 'a2', label: 'Action 2', onSelect: () => {} },
                  ]}
                />
              ) : mode === 'shortcut' ? (
                <ShortcutSheet
                  open={open}
                  onClose={() => setOpen(false)}
                  items={[{ label: 'Find in thread', keys: ['Ctrl', 'F'] }]}
                />
              ) : null
            }
            sheet={
              mode === 'sheet' ? (
                <FloatingContextSheet
                  open={open}
                  title="Local context"
                  onClose={() => setOpen(false)}
                  footer={
                    <button type="button" data-testid="sheet-apply">
                      Apply
                    </button>
                  }
                >
                  <button type="button" data-testid="sheet-first">
                    Inspect
                  </button>
                </FloatingContextSheet>
              ) : null
            }
          />
        </div>
      );
    }

    for (const mode of ['palette', 'shortcut', 'sheet'] as const) {
      const el = renderNode(<OverlayHarness mode={mode} />);
      const trigger = el.querySelector('[data-testid="trigger-btn"]') as HTMLButtonElement;

      act(() => {
        trigger.focus();
      });
      expect(document.activeElement).toBe(trigger);

      act(() => {
        trigger.click();
      });

      const dialog = el.querySelector('[role="dialog"]') as HTMLElement;
      expect(dialog).not.toBeNull();
      expect(dialog.contains(document.activeElement)).toBe(true);

      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      expect(focusables.length).toBeGreaterThanOrEqual(1);

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      // Tab from last wraps to first
      act(() => {
        last.focus();
      });
      act(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
      });
      expect(document.activeElement).toBe(first);

      // Shift+Tab from first wraps to last
      act(() => {
        document.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }),
        );
      });
      expect(document.activeElement).toBe(last);

      // Escape dismisses overlay & restores focus to trigger
      act(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      });
      expect(el.querySelector('[role="dialog"]')).toBeNull();
      expect(document.activeElement).toBe(trigger);

      // Re-open and dismiss via veil click -> restores focus to trigger
      act(() => {
        trigger.click();
      });
      expect(el.querySelector('[role="dialog"]')).not.toBeNull();
      act(() => {
        trigger.blur();
        (el.querySelector('.yui-veil.is-open') as HTMLElement).click();
      });
      expect(el.querySelector('[role="dialog"]')).toBeNull();
      expect(document.activeElement).toBe(trigger);

      // Unmount previous harness cleanly before next mode iteration
      act(() => {
        mounted?.root.unmount();
      });
      mounted?.container.remove();
      mounted = null;
    }
  });

  it('renders ModelParametersCard and NetworkAuditCard with zero inline styles and full interactions', async () => {
    const onReset = vi.fn();
    const onClearLog = vi.fn();
    const onExportJson = vi.fn();
    const events = [
      {
        id: 'e1',
        target: 'api.external.invalid/v1',
        detail: 'Blocked by default-deny network policy',
        decision: 'blocked' as const,
        timestamp: '05:31:12',
      },
      {
        id: 'e2',
        target: 'docs.yours.sh/spec',
        detail: 'One-time page fetch approved by user',
        decision: 'allowed-once' as const,
        timestamp: '05:31:18',
      },
      {
        id: 'e3',
        target: 'opfs://qwen3.5-4b-q4.bin',
        detail: 'Local WebGPU tensor weights',
        decision: 'local' as const,
        timestamp: '05:31:20',
      },
    ];

    const el = renderNode(
      <div>
        <ModelParametersCard modelLabel="Qwen3.5-4B" onReset={onReset} />
        <NetworkAuditCard
          events={events}
          onClearLog={onClearLog}
          onExportJson={onExportJson}
        />
      </div>,
    );

    expect(el.querySelectorAll('[style]').length).toBe(0);

    const params = el.querySelector('[data-slot="model-parameters-card"]') as HTMLElement;
    expect(params.textContent).toContain('0.70');
    expect(params.textContent).toContain('0.90');
    expect(params.textContent).toContain('2,048');

    const tabs = Array.from(params.querySelectorAll('[role="radio"]')) as HTMLButtonElement[];
    act(() => {
      tabs.find((btn) => btn.textContent === 'Deep')?.click();
      tabs.find((btn) => btn.textContent === 'Smooth UI')?.click();
    });
    expect(params.querySelector('.yui-params-foot')?.textContent).toContain('DEEP');
    expect(params.querySelector('.yui-params-foot')?.textContent).toContain('Smooth UI');

    act(() => {
      (params.querySelector('.yui-params-reset-btn') as HTMLButtonElement).click();
    });
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(params.querySelector('.yui-params-foot')?.textContent).toContain('AUTO');

    const audit = el.querySelector('[data-slot="network-audit-card"]') as HTMLElement;
    expect(audit.textContent).toContain('0 bytes');
    expect(audit.textContent).toContain('Local WebGPU');
    expect(audit.querySelectorAll('[data-audit-id]').length).toBe(3);
    expect(audit.textContent).toContain('Blocked');
    expect(audit.textContent).toContain('Allowed once');
    expect(audit.textContent).toContain('Local only');

    act(() => {
      (audit.querySelector('.yui-audit-clear-btn') as HTMLButtonElement).click();
      (audit.querySelector('.yui-audit-export-btn') as HTMLButtonElement).click();
    });
    expect(onClearLog).toHaveBeenCalledTimes(1);
    expect(onExportJson).toHaveBeenCalledWith(events);

    const cssSource = await readSourceFile('../src/styles/components.css');
    expect(cssSource).toContain('.yui-params-card');
    expect(cssSource).toContain('.yui-audit-card');
    expect(cssSource).toContain('.yui-storage-row-lead');
    expect(cssSource.slice(cssSource.indexOf('@media (forced-colors: active)'))).toContain(
      '.yui-audit-card',
    );
  });

  it('renders SitePermissionsList & AgentHandoffCard with per-origin modes, locked site access, handoff callbacks, and zero inline styles', async () => {
    const onModeChange = vi.fn();
    const onRevoke = vi.fn();
    const onRevokeAll = vi.fn();
    const onTakeOver = vi.fn();
    const onResume = vi.fn();
    const onCancel = vi.fn();

    function Harness() {
      const [items, setItems] = useState<SitePermissionItem[]>([
        {
          id: 'sp1',
          origin: 'docs.yours.sh',
          scope: 'Read active tab DOM & headings',
          mode: 'once',
          lastUsedLabel: '2m ago',
        },
        {
          id: 'sp2',
          origin: 'checkout.bank.invalid',
          scope: 'Fill shipping fields (no payment)',
          mode: 'once',
          lastUsedLabel: 'Just now',
          lockedReason: 'Persistent site-wide access disabled on banking flows',
        },
      ]);
      const [handoffState, setHandoffState] = useState<'waiting' | 'user-active'>('waiting');

      return (
        <div>
          <SitePermissionsList
            items={items}
            onModeChange={(id, nextMode) => {
              onModeChange(id, nextMode);
              setItems((prev) =>
                prev.map((item) => (item.id === id ? { ...item, mode: nextMode } : item)),
              );
            }}
            onRevoke={(id) => {
              onRevoke(id);
              setItems((prev) => prev.filter((item) => item.id !== id));
            }}
            onRevokeAll={() => {
              onRevokeAll();
              setItems([]);
            }}
          />
          <AgentHandoffCard
            title="Login & 2FA checkpoint"
            reason="Paused before signing in so you can complete 2FA directly."
            origin="accounts.example.invalid"
            progressLabel="Step 3 of 5 · Sign in"
            state={handoffState}
            onTakeOver={() => {
              onTakeOver();
              setHandoffState('user-active');
            }}
            onResume={onResume}
            onCancel={onCancel}
          />
        </div>
      );
    }

    const el = renderNode(<Harness />);
    expect(el.querySelectorAll('[style]').length).toBe(0);

    const list = el.querySelector('[data-slot="site-permissions-list"]') as HTMLElement;
    expect(list.textContent).toContain('docs.yours.sh');
    expect(list.textContent).toContain('Persistent site-wide access disabled on banking flows');

    const docsRadios = Array.from(
      list.querySelectorAll('[data-permission-id="sp1"] [role="radio"]'),
    ) as HTMLButtonElement[];
    const lockedSiteBtn = list.querySelectorAll(
      '[data-permission-id="sp2"] [role="radio"]',
    )[2] as HTMLButtonElement;
    expect(lockedSiteBtn.disabled).toBe(true);

    act(() => {
      docsRadios.find((b) => b.textContent === 'Site')?.click();
    });
    expect(onModeChange).toHaveBeenCalledWith('sp1', 'site');
    expect(list.querySelector('[data-permission-id="sp1"]')?.getAttribute('data-mode')).toBe('site');

    const handoff = el.querySelector('[data-slot="agent-handoff-card"]') as HTMLElement;
    expect(handoff.getAttribute('data-state')).toBe('waiting');
    expect(handoff.textContent).toContain('Step 3 of 5 · Sign in');

    const takeOverBtn = Array.from(handoff.querySelectorAll('button')).find(
      (b) => b.textContent === 'Take over tab',
    ) as HTMLButtonElement;
    act(() => {
      takeOverBtn.click();
    });
    expect(onTakeOver).toHaveBeenCalledTimes(1);
    expect(handoff.getAttribute('data-state')).toBe('user-active');

    const resumeBtn = Array.from(handoff.querySelectorAll('button')).find(
      (b) => b.textContent === 'Resume',
    ) as HTMLButtonElement;
    const cancelBtn = Array.from(handoff.querySelectorAll('button')).find(
      (b) => b.textContent === 'Cancel',
    ) as HTMLButtonElement;
    act(() => {
      resumeBtn.click();
      cancelBtn.click();
    });
    expect(onResume).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);

    act(() => {
      (list.querySelector('[data-permission-id="sp1"] button.yui-storage-clear-btn') as HTMLButtonElement).click();
    });
    expect(onRevoke).toHaveBeenCalledWith('sp1');
    expect(list.querySelectorAll('[data-permission-id]').length).toBe(1);

    const revokeAllBtn = Array.from(list.querySelectorAll('footer button')).find(
      (b) => b.textContent?.includes('Revoke all'),
    ) as HTMLButtonElement;
    act(() => {
      revokeAllBtn.click();
    });
    expect(onRevokeAll).toHaveBeenCalledTimes(1);
    expect(list.textContent).toContain('No sites approved — all requests ask first');

    const cssSource = await readSourceFile('../src/styles/components.css');
    expect(cssSource).toContain('.yui-sperm-card');
    expect(cssSource).toContain('.yui-handoff-card');
    expect(cssSource.slice(cssSource.indexOf('@media (forced-colors: active)'))).toContain(
      '.yui-handoff-card',
    );
  });

  it('supports optional inline Revoke all confirmation on SitePermissionsList with Cancel focus and Escape dismissal', () => {
    const onRevokeAll = vi.fn();
    const el = renderNode(
      <SitePermissionsList
        confirmRevokeAll
        items={[
          { id: 's1', origin: 'docs.yours.sh', scope: 'Read active tab', mode: 'once' },
        ]}
        onRevokeAll={onRevokeAll}
      />,
    );

    const revokeAllBtn = Array.from(el.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Revoke all'),
    ) as HTMLButtonElement;
    act(() => {
      revokeAllBtn.click();
    });

    const confirmGroup = el.querySelector('[role="group"]') as HTMLElement;
    expect(confirmGroup).not.toBeNull();
    const cancelBtn = Array.from(confirmGroup.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Cancel',
    ) as HTMLButtonElement;
    expect(document.activeElement).toBe(cancelBtn);
    expect(onRevokeAll).toHaveBeenCalledTimes(0);

    act(() => {
      confirmGroup.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(el.querySelector('[role="group"]')).toBeNull();
    const restoredBtn = Array.from(el.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Revoke all'),
    ) as HTMLButtonElement;
    expect(document.activeElement).toBe(restoredBtn);

    act(() => {
      restoredBtn.click();
    });
    const confirmRevokeBtn = Array.from(
      el.querySelectorAll('[role="group"] button'),
    ).find((b) => b.textContent?.includes('Confirm revoke')) as HTMLButtonElement;
    act(() => {
      confirmRevokeBtn.click();
    });
    expect(onRevokeAll).toHaveBeenCalledTimes(1);
  });

  it('renders ConfirmActionCard with summary rows, Cancel focus, Esc dismissal, confirmPhrase gating, hold-to-confirm, reduced-motion fallback, and zero inline styles', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const el = renderNode(
      <ConfirmActionCard
        title="Purge OPFS workspace cache"
        description="Removes locally cached weights and vector indexes on this device."
        rows={[
          { label: 'Scope', value: 'OPFS · 2.4 GB' },
          { label: 'Entries', value: '142 chunks' },
        ]}
        confirmPhrase="PURGE"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    const card = el.querySelector('[data-slot="confirm-action-card"]') as HTMLElement;
    expect(card).not.toBeNull();
    expect(card.getAttribute('data-tone')).toBe('danger');
    expect(el.textContent).toContain('OPFS · 2.4 GB');
    expect(el.textContent).toContain('142 chunks');
    expect(el.querySelectorAll('[style]').length).toBe(0);

    const buttons = Array.from(card.querySelectorAll('button'));
    const cancelBtn = buttons.find((b) => b.textContent?.trim() === 'Cancel') as HTMLButtonElement;
    const confirmBtn = buttons.find((b) => b.textContent?.trim() === 'Confirm') as HTMLButtonElement;
    expect(document.activeElement).toBe(cancelBtn);
    expect(confirmBtn.disabled).toBe(true);

    const input = card.querySelector('input') as HTMLInputElement;
    const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    act(() => {
      nativeSetter?.call(input, 'PURGE');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(confirmBtn.disabled).toBe(false);

    act(() => {
      confirmBtn.click();
    });
    expect(onConfirm).toHaveBeenCalledTimes(1);

    act(() => {
      card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(onCancel).toHaveBeenCalledTimes(1);

    const origMatchMedia = window.matchMedia;
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: (query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        onchange: null,
        dispatchEvent: () => false,
      }),
    });
    vi.useFakeTimers();
    try {
      const onHoldConfirm = vi.fn();
      const holdEl = renderNode(
        <ConfirmActionCard
          title="Revoke site cookies"
          description="Hold to confirm clearing stored auth cookies."
          tone="amber"
          holdDurationMs={400}
          confirmLabel="Clear cookies"
          onConfirm={onHoldConfirm}
        />,
      );
      const holdCard = holdEl.querySelector('[data-slot="confirm-action-card"]') as HTMLElement;
      expect(holdCard.getAttribute('data-tone')).toBe('amber');
      expect(holdCard.textContent).toContain('Hold 0.4s or Space to confirm');
      const holdBtn = Array.from(holdCard.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Hold to clear cookies'),
      ) as HTMLButtonElement;

      act(() => {
        holdBtn.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      });
      expect(holdCard.getAttribute('data-holding')).toBe('true');
      act(() => {
        vi.advanceTimersByTime(200);
      });
      const statusEl = holdCard.querySelector('[role="status"]');
      expect(statusEl?.textContent).toContain('Holding ·');
      expect(onHoldConfirm).toHaveBeenCalledTimes(0);

      act(() => {
        holdBtn.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true }));
      });
      expect(holdCard.getAttribute('data-holding')).toBe('false');

      act(() => {
        holdBtn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      });
      act(() => {
        vi.advanceTimersByTime(520);
      });
      expect(onHoldConfirm).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
      window.matchMedia = origMatchMedia;
    }

    const cssSource = await readSourceFile('../src/styles/components.css');
    expect(cssSource).toContain('.yui-confirm-card');
    expect(cssSource).toContain('.yui-pill-btn--danger');
    expect(cssSource).toContain('.yui-sperm-top');
    expect(cssSource.slice(cssSource.indexOf('@media (forced-colors: active)'))).toContain(
      '.yui-confirm-card',
    );
  });

  it('renders PageSelectionCard & DeviceCapabilityCard with Expand/Collapse, Locate/Dismiss, Headroom meter, Tier selection, Re-check, and zero inline styles', async () => {
    const onLocate = vi.fn();
    const onDismiss = vi.fn();
    const onExpandedChange = vi.fn();
    const onSelectTier = vi.fn();
    const onRecheck = vi.fn();

    const longExcerpt =
      'Local-first Chrome MV3 assistants keep tab context, embeddings, and weights inside your Origin Private File System without uploading DOM fragments to external inference servers even under heavy multi-tab research sessions.';
    const selEl = renderNode(
      <PageSelectionCard
        origin="docs.yours.sh"
        pageTitle="Architecture Spec"
        locator="§2 · ¶1"
        tokenEstimate="~48 tok"
        excerpt={longExcerpt}
        onExpandedChange={onExpandedChange}
        onLocate={onLocate}
        onDismiss={onDismiss}
      />,
    );

    const selCard = selEl.querySelector('[data-slot="page-selection-card"]') as HTMLElement;
    expect(selCard).not.toBeNull();
    expect(selCard.getAttribute('data-expanded')).toBe('false');
    expect(selEl.querySelectorAll('[style]').length).toBe(0);
    expect(selCard.textContent).toContain('docs.yours.sh');
    expect(selCard.textContent).toContain('§2 · ¶1');
    expect(selCard.textContent).toContain('~48 tok');

    const quoteEl = selCard.querySelector('[data-slot="page-selection-quote"]') as HTMLElement;
    expect(quoteEl.classList.contains('is-clamped')).toBe(true);

    const toggleBtn = selCard.querySelector('button[aria-expanded]') as HTMLButtonElement;
    expect(toggleBtn.textContent).toContain('Expand');
    act(() => {
      toggleBtn.click();
    });
    expect(selCard.getAttribute('data-expanded')).toBe('true');
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    expect(toggleBtn.textContent).toContain('Collapse');

    const locateBtn = Array.from(selCard.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Show on page'),
    ) as HTMLButtonElement;
    const dismissBtn = Array.from(selCard.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Remove'),
    ) as HTMLButtonElement;
    act(() => {
      locateBtn.click();
      dismissBtn.click();
    });
    expect(onLocate).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);

    const devEl = renderNode(
      <DeviceCapabilityCard
        status="tight"
        adapterName="Apple M2 Pro GPU"
        vramLabel="16.0 GB unified"
        ramLabel="16 GB"
        diskLabel="4.8 GB free"
        headroom={{ usedGb: 8.6, neededGb: 3.4, freeGb: 7.4, totalGb: 16.0 }}
        selectedTierId="qwen-1.5b"
        tiers={[
          { id: 'qwen-1.5b', label: '1.5B Q4', detail: '1.3 GB', recommended: true },
          { id: 'qwen-4b', label: '4B Q4', detail: '3.4 GB' },
        ]}
        onSelectTier={onSelectTier}
        onRecheck={onRecheck}
      />,
    );

    const devCard = devEl.querySelector('[data-slot="device-capability-card"]') as HTMLElement;
    expect(devCard).not.toBeNull();
    expect(devCard.getAttribute('data-status')).toBe('tight');
    expect(devEl.querySelectorAll('[style]').length).toBe(0);
    expect(devCard.textContent).toContain('Apple M2 Pro GPU');
    expect(devCard.textContent).toContain('Tight fit');
    expect(devCard.textContent).toContain('16.0 GB unified');
    expect(devCard.textContent).toContain('4.8 GB free');
    expect(devCard.querySelectorAll('svg rect').length).toBe(2);

    const tier4bBtn = Array.from(devCard.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('4B Q4'),
    ) as HTMLButtonElement;
    const recheckBtn = Array.from(devCard.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Re-check'),
    ) as HTMLButtonElement;
    act(() => {
      tier4bBtn.click();
      recheckBtn.click();
    });
    expect(onSelectTier).toHaveBeenCalledWith('qwen-4b');
    expect(onRecheck).toHaveBeenCalledTimes(1);

    const cssSource = await readSourceFile('../src/styles/components.css');
    expect(cssSource).toContain('.yui-sel-card');
    expect(cssSource).toContain('.yui-sel-quote');
    expect(cssSource).toContain('.yui-devcap-card');
    const forced = cssSource.slice(cssSource.indexOf('@media (forced-colors: active)'));
    expect(forced).toContain('.yui-sel-card');
    expect(forced).toContain('.yui-devcap-card');
  });

  it('supports SegmentedControl roving arrow/Home/End focus & ShortcutSheet modal focus trap + Escape restoration', () => {
    function Harness() {
      const [mode, setMode] = useState<'off' | 'once' | 'site'>('once');
      const [modalOpen, setModalOpen] = useState(false);
      return (
        <div>
          <SegmentedControl
            ariaLabel="Mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'off', label: 'Off' },
              { value: 'once', label: 'Once' },
              { value: 'site', label: 'Site' },
              { value: 'locked' as 'site', label: 'Locked', disabled: true },
            ]}
          />
          <button type="button" data-slot="open-shortcuts" onClick={() => setModalOpen(true)}>
            Shortcuts
          </button>
          <ShortcutSheet
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            items={[{ label: 'Command palette', keys: ['⌘', 'K'] }]}
          />
        </div>
      );
    }

    const el = renderNode(<Harness />);
    const radios = el.querySelectorAll('[role="radio"]') as NodeListOf<HTMLButtonElement>;
    expect(radios[1].getAttribute('tabindex')).toBe('0');
    act(() => {
      radios[1].focus();
      radios[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    });
    expect(document.activeElement).toBe(radios[2]);
    expect(radios[2].getAttribute('aria-checked')).toBe('true');

    // Wraps past disabled option back to index 0
    act(() => {
      radios[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    });
    expect(document.activeElement).toBe(radios[0]);
    expect(radios[0].getAttribute('aria-checked')).toBe('true');

    // End jumps to last enabled radio (index 2), Home jumps to index 0
    act(() => {
      radios[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    });
    expect(document.activeElement).toBe(radios[2]);
    act(() => {
      radios[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    });
    expect(document.activeElement).toBe(radios[0]);

    // Modal ShortcutSheet traps Tab and restores trigger focus on Escape
    const openBtn = el.querySelector('[data-slot="open-shortcuts"]') as HTMLButtonElement;
    act(() => {
      openBtn.focus();
      openBtn.click();
    });
    const sheet = el.querySelector('[data-slot="shortcut-sheet"]') as HTMLElement;
    expect(sheet.getAttribute('role')).toBe('dialog');
    expect(sheet.getAttribute('aria-modal')).toBe('true');
    expect(sheet.contains(document.activeElement)).toBe(true);
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(el.querySelector('[data-slot="shortcut-sheet"]')).toBeNull();
    expect(document.activeElement).toBe(openBtn);
  });

  it('verifies reduced-motion & ARIA contracts across AudioLevelMeter, AgentHandoffCard, VoiceSessionBar, FindInThreadBar, and DeviceCapabilityCard', async () => {
    const cssSource = await readSourceFile('../src/styles/components.css');
    const reducedBlock = cssSource.slice(cssSource.indexOf('@media (prefers-reduced-motion: reduce)'));
    expect(reducedBlock).toContain('animation: none !important');
    expect(reducedBlock).toContain('transition: none !important');

    const el = renderNode(
      <div>
        <AudioLevelMeter level={0.8} tone="speaking" animated />
        <AgentHandoffCard
          title="Login required"
          reason="Sign in to proceed"
          origin="auth.example"
          state="waiting"
        />
        <VoiceSessionBar state="speaking" />
        <FindInThreadBar query="local" totalMatches={4} currentMatch={2} onPrev={() => {}} onNext={() => {}} />
        <DeviceCapabilityCard status="ready" adapterName="WebGPU M2" rechecking onRecheck={() => {}} />
      </div>,
    );

    expect(el.querySelector('[data-slot="audio-level-meter"]')?.getAttribute('role')).toBe('meter');
    expect(el.querySelector('[data-slot="agent-handoff-card"] .yui-status-badge-dot')?.classList.contains('is-pulse')).toBe(true);
    expect(el.querySelector('[data-slot="voice-session-bar"]')?.getAttribute('aria-live')).toBe('polite');
    expect(el.querySelector('[data-slot="find-in-thread-bar"]')?.getAttribute('role')).toBe('search');
    expect(el.querySelector('[data-slot="find-in-thread-bar"] [aria-live="polite"]')?.textContent).toBe('2 / 4');
    const recheckBtn = Array.from(el.querySelectorAll('[data-slot="device-capability-card"] button')).at(-1);
    expect(recheckBtn?.getAttribute('aria-busy')).toBe('true');
  });

  it('renders OfflineStatusBanner, SessionCheckpointCard (inline confirm + Cancel focus + Escape restore + Branch), and @container rules without inline styles', async () => {
    const onRetry = vi.fn();
    const onLocalOnly = vi.fn();
    const onRestore = vi.fn();
    const onBranch = vi.fn();

    const el = renderNode(
      <div className="yui-surface">
        <OfflineStatusBanner
          status="offline-degraded"
          localOnlyActive
          retrying
          onLocalOnly={onLocalOnly}
          onRetry={onRetry}
        />
        <SessionCheckpointCard
          timestamp="10:18 AM"
          turnCount={12}
          pinnedTabCount={2}
          contextSnapshot="4.8k / 16k tok"
          checkpointLabel="cp-08"
          onRestore={onRestore}
          onBranch={onBranch}
        />
      </div>,
    );

    expect(el.querySelectorAll('[style]').length).toBe(0);
    const banner = el.querySelector('[data-slot="offline-status-banner"]') as HTMLElement;
    expect(banner.getAttribute('role')).toBe('status');
    expect(banner.getAttribute('data-status')).toBe('offline-degraded');
    expect(banner.textContent).toContain('100% local WebGPU inference');

    const localBtn = banner.querySelector('button[aria-pressed="true"]') as HTMLButtonElement;
    const retryBtn = banner.querySelector('button[aria-busy="true"]') as HTMLButtonElement;
    expect(localBtn).not.toBeNull();
    expect(retryBtn.disabled).toBe(true);
    act(() => {
      localBtn.click();
    });
    expect(onLocalOnly).toHaveBeenCalledTimes(1);

    const ckpt = el.querySelector('[data-slot="session-checkpoint-card"]') as HTMLElement;
    expect(ckpt.textContent).toContain('10:18 AM');
    expect(ckpt.textContent).toContain('12 turns');
    expect(ckpt.textContent).toContain('2 pinned');
    expect(ckpt.textContent).toContain('4.8k / 16k tok');

    const branchBtn = Array.from(ckpt.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Branch from here'),
    ) as HTMLButtonElement;
    const restoreBtn = Array.from(ckpt.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Restore checkpoint'),
    ) as HTMLButtonElement;
    act(() => {
      branchBtn.click();
    });
    expect(onBranch).toHaveBeenCalledTimes(1);

    // Inline confirmation focuses Cancel and restores to Restore checkpoint on Escape
    act(() => {
      restoreBtn.click();
    });
    expect(ckpt.getAttribute('data-confirming')).toBe('true');
    expect(document.activeElement?.textContent).toBe('Cancel');
    const grp = ckpt.querySelector('[role="group"]') as HTMLElement;
    act(() => {
      grp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(ckpt.getAttribute('data-confirming')).toBe('false');
    expect(document.activeElement).toBe(restoreBtn);
    expect(onRestore).not.toHaveBeenCalled();

    // Confirming triggers onRestore
    act(() => {
      restoreBtn.click();
    });
    const confirmBtn = Array.from(ckpt.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Confirm restore'),
    ) as HTMLButtonElement;
    act(() => {
      confirmBtn.click();
    });
    expect(onRestore).toHaveBeenCalledTimes(1);

    const cssSource = await readSourceFile('../src/styles/components.css');
    expect(cssSource).toContain('.yui-surface');
    expect(cssSource).toContain('container-type: inline-size');
    expect(cssSource).toContain('@container (max-width: 340px)');
    expect(cssSource).toContain('@container (max-width: 380px)');
    expect(cssSource).toContain('@container (max-width: 420px)');
    const forced = cssSource.slice(cssSource.indexOf('@media (forced-colors: active)'));
    expect(forced).toContain('.yui-offline-banner');
    expect(forced).toContain('.yui-ckpt-card');
  });

  it('renders ShimmerText, InlineToolStatus overrides, CSS-only broken favicon hiding, and continuous timer transitions', () => {
    const shimmerEl = renderNode(
      <div>
        <ShimmerText active>Reading active tab</ShimmerText>
        <ShimmerText active={false}>Completed step</ShimmerText>
      </div>,
    );
    const shimmers = shimmerEl.querySelectorAll('[data-slot="shimmer-text"]');
    expect(shimmers.length).toBe(2);
    expect(shimmers[0]?.classList.contains('is-active')).toBe(true);
    expect(shimmers[1]?.classList.contains('is-active')).toBe(false);
    expect(shimmerEl.querySelectorAll('[style]').length).toBe(0);

    vi.useFakeTimers();
    try {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);
      mounted = { container, root };

      act(() => {
        root.render(
          <InlineToolStatus
            state="searching"
            detail="docs.yours.sh"
            favicon="https://invalid.local/favicon.png"
            states={{
              searching: { label: 'Querying index', detail: 'yours.sh/docs' },
            }}
            timer
          />,
        );
      });

      const status = container.querySelector('[data-slot="inline-tool-status"]') as HTMLElement;
      expect(status.getAttribute('role')).toBe('status');
      expect(status.textContent).toContain('Querying index');
      expect(status.textContent).toContain('docs.yours.sh');
      expect(container.querySelectorAll('[style]').length).toBe(0);

      // Broken favicon hides cleanly via CSS class instead of inline style
      const img = container.querySelector('img.yui-its-favicon') as HTMLImageElement;
      expect(img.classList.contains('is-hidden')).toBe(false);
      act(() => {
        img.dispatchEvent(new Event('error'));
      });
      expect(img.classList.contains('is-hidden')).toBe(true);
      expect(img.getAttribute('style')).toBeNull();

      // Timer increments during active run and formats Worked for / Failed after on settle
      act(() => {
        vi.advanceTimersByTime(3100);
      });
      expect(status.textContent).toContain('3s');

      act(() => {
        root.render(<InlineToolStatus state="done" timer />);
      });
      expect(status.textContent).toContain('Worked for 3s');

      act(() => {
        root.render(<InlineToolStatus state="error" timer />);
      });
      expect(status.textContent).toContain('Failed after 3s');
    } finally {
      vi.useRealTimers();
    }
  });

  it('renders ToolChain / ToolTraceList inline borderless hairline rail, auto-collapse, rotating steps, and upgraded ToolStepCard + CSS', async () => {
    expect(ToolChain).toBe(ToolTraceList);

    // Settled chain auto-collapses to summary unless defaultCollapsed={false}
    const settledSteps = [
      {
        id: 't1',
        tool: 'tabs.read',
        state: 'reading' as const,
        actionLabel: 'Reading active tab',
        detail: 'yours.sh/spec',
        status: 'done' as const,
        latencyLabel: '42 ms',
        input: '{"tabId":1}',
        output: '{"ok":true}',
      },
      {
        id: 't2',
        tool: 'web.search',
        state: 'searching' as const,
        actionLabel: 'Searching references',
        detail: 'clean-room svg',
        status: 'done' as const,
        latencyLabel: '88 ms',
      },
    ];

    const collapsedEl = renderNode(<ToolChain steps={settledSteps} />);
    const section = collapsedEl.querySelector('[data-slot="tool-trace-list"]') as HTMLElement;
    expect(section.classList.contains('yui-trace-inline')).toBe(true);
    expect(section.textContent).toContain('Used 2 tools');
    const headBtn = section.querySelector('.yui-trace-head') as HTMLButtonElement;
    expect(headBtn.getAttribute('aria-expanded')).toBe('false');
    expect(section.querySelectorAll('.yui-trace-row').length).toBe(2);

    // Expanding shows borderless hairline rail & inspectable I/O drawers
    act(() => {
      headBtn.click();
    });
    expect(headBtn.getAttribute('aria-expanded')).toBe('true');
    expect(section.querySelector('.yui-trace-rail-list')).not.toBeNull();
    const firstTrigger = section.querySelector('.yui-trace-trigger') as HTMLButtonElement;
    expect(firstTrigger.getAttribute('aria-expanded')).toBe('false');
    act(() => {
      firstTrigger.click();
    });
    expect(firstTrigger.getAttribute('aria-expanded')).toBe('true');
    expect(section.textContent).toContain('{"tabId":1}');

    // Running mid-chain shows active rotating step & step counter badge
    const runningEl = renderNode(
      <ToolTraceList
        steps={[
          ...settledSteps,
          {
            id: 't3',
            tool: 'synth.write',
            state: 'writing',
            actionLabel: 'Drafting response',
            detail: 'Streaming 340 tok',
            status: 'running',
          },
        ]}
      />,
    );
    expect(runningEl.textContent).toContain('Drafting response');
    expect(runningEl.textContent).toContain('3/3');
    expect(runningEl.querySelector('.yui-shimmer-text.is-active')).not.toBeNull();

    // Card mode & upgraded ToolStepCard variants remain supported
    const cardEl = renderNode(
      <div>
        <ToolTraceList variant="card" steps={settledSteps} defaultCollapsed={false} />
        <ToolStepCard status="running" state="analyzing" title="Analyzing DOM" detail="142 nodes" />
        <ToolStepCard variant="card" status="done" title="Verified hash" summary="SHA-256 matched" />
      </div>,
    );
    expect(cardEl.querySelector('.yui-trace-card')).not.toBeNull();
    expect(cardEl.querySelector('.yui-tool-card--inline')).not.toBeNull();
    expect(cardEl.querySelectorAll('[style]').length).toBe(0);

    const [tokensCss, compCss] = await Promise.all([
      readSourceFile('../src/styles/tokens.css'),
      readSourceFile('../src/styles/components.css'),
    ]);
    expect(tokensCss).toContain('--yui-shimmer-ink');
    expect(tokensCss).toContain('--yui-shimmer-shine');
    expect(compCss).toContain('@keyframes yuiShimmer');
    expect(compCss).toContain('.yui-trace-rail-list');
    const reduced = compCss.slice(compCss.indexOf('@media (prefers-reduced-motion: reduce)'));
    expect(reduced).toContain('.yui-shimmer-text.is-active');
    expect(reduced).toContain('.yui-tsi-check');
    const forcedCss = compCss.slice(compCss.indexOf('@media (forced-colors: active)'));
    expect(forcedCss).toContain('.yui-shimmer-text.is-active');
    expect(forcedCss).toContain('.yui-trace-rail-list::before');
  });
});
