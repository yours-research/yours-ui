import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ActionBar,
  AttachmentDropzone,
  AttachmentStrip,
  BranchPicker,
  CodeBlock,
  ContextCommandPopover,
  EmptyState,
  ErrorRecoveryBanner,
  FloatingComposer,
  FollowUpSuggestions,
  InlineCitationPill,
  KbdHint,
  MessageSkeleton,
  ModelDownloadGate,
  PermissionApprovalCard,
  PromptCapsuleStack,
  QuotedContextBanner,
  ReasoningTrace,
  ScrollToBottomButton,
  SegmentedControl,
  SourcesDrawer,
  StatusBadge,
  StreamingResponse,
  SuggestionChipRow,
  ThreadHistoryDrawer,
  ToastPill,
  ToolStepCard,
  UserMessageBubble,
  VoiceDictationPill,
  type StreamingResponseFeedback,
  type StreamingResponseProps,
  type StreamingResponseStatus,
} from '../src/components/index.js';
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
});
