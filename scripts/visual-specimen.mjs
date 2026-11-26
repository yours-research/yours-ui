import fs from 'node:fs';
import http from 'node:http';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, '.visual');
const require = createRequire(import.meta.url);

function resolvePlaywright() {
  const candidates = [
    process.env.PLAYWRIGHT_PATH,
    'playwright',
    path.resolve(ROOT, '../tinygpt-browser/node_modules/playwright'),
    path.resolve(ROOT, 'site/node_modules/playwright'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch {
      // Try next fallback location
    }
  }
  throw new Error(
    'Playwright is not installed. Set PLAYWRIGHT_PATH or install playwright to run visual-specimen.',
  );
}

const SPECIMEN_ENTRY_TSX = `
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ActionBar,
  ArtifactPreviewCard,
  AssistantMessage,
  AttachIcon,
  AttachmentStrip,
  BranchPicker,
  ChecklistCard,
  ChoicePromptCard,
  CitationFootnoteList,
  CodeBlockCard,
  CommandPalette,
  CompareTable,
  ContextBudgetMeter,
  ContextCommandPopover,
  DataTableCard,
  DiffCard,
  DraftCard,
  EmptyPanelState,
  EmptyState,
  EntitySummaryCard,
  ErrorRecoveryCard,
  ExportSessionCard,
  FindInThreadBar,
  FloatingComposer,
  FloatingContextSheet,
  FollowUpSuggestions,
  HardwareStatusStrip,
  HookSidebarList,
  InlineCitationPill,
  InlineCitationPopover,
  InlineNotice,
  LocalVaultExportCard,
  MatrixOrb,
  MemoryInspectorList,
  MetricStripCard,
  MicIcon,
  ModelDownloadGate,
  ModelDownloadProgressBar,
  ModelRosterList,
  NotchDrawerSearch,
  NotchOptionRow,
  OnboardingCard,
  PageActionCard,
  PageBriefCard,
  PageIcon,
  PermissionApprovalCard,
  PermissionCard,
  PromptCapsuleStack,
  PromptTemplateList,
  QuoteExcerptCard,
  QuotedContextBanner,
  ReasoningTrace,
  SegmentedControl,
  SettingsSection,
  SettingsToggleRow,
  ShortcutSheet,
  SidePanelShell,
  SourcesDrawer,
  StatusBadge,
  StatusToast,
  StorageQuotaCard,
  StreamingResponse,
  TabContextList,
  ThreadHistoryList,
  TimelineCard,
  ToastPill,
  ToolStepCard,
  ToolTraceList,
  TopNotch,
  UserMessageBubble,
  VoiceSessionBar,
  VoiceSessionCard,
  AudioLevelMeter,
} from '../src/index.js';

const NOTCH_ITEMS = [
  { id: 'new', icon: 'compose', label: 'New' },
  { id: 'threads', icon: 'history', label: 'Threads' },
  { id: 'tabs', icon: 'tab-stack', label: '1 tab', badgeDot: 'green' },
  { id: 'saved', icon: 'bookmark', label: 'Saved' },
] as const;

function RestingPanel({ theme }: { theme: 'light' | 'dark' }) {
  const [prompt, setPrompt] = useState('');
  const [pageCtx, setPageCtx] = useState(true);

  return (
    <SidePanelShell
      theme={theme}
      notch={<TopNotch items={NOTCH_ITEMS} expandedId={null} />}
      footer={
        <FloatingComposer
          value={prompt}
          onChange={setPrompt}
          onSubmit={() => setPrompt('')}
          placeholder="Ask anything..."
          leftSlot={
            <>
              <button type="button" className="yui-chip-btn yui-chip-btn--icon" aria-label="Attach file">
                <AttachIcon size={13} />
              </button>
              <button type="button" className="yui-chip-btn yui-chip-btn--icon" aria-label="Voice input">
                <MicIcon size={13} />
              </button>
              <button
                type="button"
                className={pageCtx ? 'yui-chip-btn is-active' : 'yui-chip-btn'}
                onClick={() => setPageCtx((v) => !v)}
              >
                <PageIcon size={12} />
                <span>This page</span>
              </button>
            </>
          }
        />
      }
    >
      <EmptyState
        title="Ask anything locally."
        subtitle="Qwen3.5-4B runs privately in WebGPU."
        orbState="idle"
        orbSize={30}
      >
        <PromptCapsuleStack
          items={[
            { id: 's1', icon: 'document', label: 'Summarize this page' },
            { id: 's2', icon: 'compare', label: 'Compare the options' },
            { id: 's3', icon: 'compose', label: 'Draft a reply' },
          ]}
          onSelect={() => {}}
        />
      </EmptyState>
    </SidePanelShell>
  );
}

function NotchExpandedPanel({ theme }: { theme: 'light' | 'dark' }) {
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState('t1');
  const [perfMode, setPerfMode] = useState<'max' | 'balanced' | 'smooth'>('balanced');
  const [modelId, setModelId] = useState('qwen35');

  const threads = [
    { id: 't1', title: 'Pro vs. Team pricing audit', meta: 'Now', hasLiveDot: true },
    { id: 't2', title: 'Lease renewal clause review', meta: '2h' },
    { id: 't3', title: 'Kyoto trip itinerary comparison', meta: '1d' },
    { id: 't4', title: 'Paper Page 9 notch geometry', meta: '3d' },
  ].filter((t) => !query || t.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <SidePanelShell
      theme={theme}
      veilOpen
      onVeilClick={() => {}}
      notch={
        <TopNotch
          items={NOTCH_ITEMS}
          expandedId="threads"
          drawerContent={
            <>
              <NotchDrawerSearch value={query} onChange={setQuery} count={threads.length} />
              <HookSidebarList
                label="Recent threads"
                items={threads}
                activeId={activeId}
                onSelect={setActiveId}
              />
              <div className="yui-drawer-hairline" />
              <SegmentedControl
                fullWidth
                value={perfMode}
                onChange={setPerfMode}
                ariaLabel="Inference pacing mode"
                options={[
                  { value: 'max', label: 'Max' },
                  { value: 'balanced', label: 'Balanced' },
                  { value: 'smooth', label: 'Smooth' },
                ]}
              />
              <NotchOptionRow
                title="Qwen3.5-4B · WGSL"
                subtitle="OPFS · Int8 KV cache"
                meta="2.6 GB"
                dotTone="green"
                selected={modelId === 'qwen35'}
                onClick={() => setModelId('qwen35')}
              />
            </>
          }
        />
      }
      footer={
        <FloatingComposer
          value=""
          onChange={() => {}}
          onSubmit={() => {}}
          leftSlot={<StatusBadge tone="local" dot>Qwen3.5-4B · Local</StatusBadge>}
        />
      }
    >
      <EmptyState title="Select a thread or runtime above." orbState="idle" orbSize={26} />
    </SidePanelShell>
  );
}

function ActiveChatPanel({ theme }: { theme: 'light' | 'dark' }) {
  const [reply, setReply] = useState('Compare the annual savings too');

  return (
    <SidePanelShell
      theme={theme}
      notch={<TopNotch items={NOTCH_ITEMS} expandedId={null} />}
      footer={
        <FloatingComposer
          value={reply}
          onChange={setReply}
          onSubmit={() => setReply('')}
          topSlot={
            <QuotedContextBanner
              quote="Annual billing drops effective cost from $25 to $20 per seat."
              onDismiss={() => {}}
            />
          }
          leftSlot={
            <AttachmentStrip
              items={[{ id: 'a1', name: 'pricing-spec.pdf', kind: 'file', status: 'ready' }]}
            />
          }
        />
      }
    >
      <UserMessageBubble
        contextLabel="pricing.yours.sh"
        content="Compare Pro vs. Team plans locally and verify the annual savings."
        onStartEdit={() => {}}
        onCopy={() => {}}
      />

      <AssistantMessage
        footer={
          <div className="yui-spec-foot">
            <BranchPicker currentIndex={2} total={3} />
            <ActionBar
              feedback="up"
              onCopy={() => {}}
              onRegenerate={() => {}}
              onThumbUp={() => {}}
              onThumbDown={() => {}}
              onSave={() => {}}
              onSpeak={() => {}}
              speedMetrics={{ tokensPerSec: 86.4, ttftMs: 74, outputTokens: 142 }}
            />
          </div>
        }
      >
        <ReasoningTrace
          status="done"
          durationLabel="3.2s"
          content="Extracted seat rates from the active DOM table and confirmed 20% discount for 12-month term."
          defaultExpanded
        />
        <ToolStepCard
          status="done"
          title="Read active tab pricing table & verify terms"
          durationLabel="180ms"
          summary="Parsed 4 rows cleanly inside sandboxed DOM reader."
        />
        <StreamingResponse
          status="done"
          actions={false}
          text={
            'Team saves **17% annually** above 8 seats.\\n\\n' +
            '| Plan | Seats | Monthly | Annual | Mode |\\n' +
            '|:---|---:|---:|---:|:---:|\\n' +
            '| Pro | 10 | $200 | $2,000 | Local |\\n' +
            '| Team | 10 | $250 | $2,500 | WebGPU |\\n\\n' +
            '> Verified against active DOM with zero network calls.'
          }
        />
        <div className="yui-action-group">
          <InlineCitationPill index={1} label="pricing.yours.sh" active onClick={() => {}} />
          <InlineCitationPill index={2} label="yours.sh/faq" href="https://yours.sh" />
        </div>
        <SourcesDrawer
          sources={[
            { id: 'src1', title: 'Enterprise & Team Plan FAQ (yours.sh)', subtitle: 'Section 2 · Billing' },
            { id: 'src2', title: 'Local Privacy Architecture Whitepaper', subtitle: 'Page 9' },
          ]}
        />
        <FollowUpSuggestions suggestions={['Draft an approval email to finance']} onSelect={() => {}} />
      </AssistantMessage>
    </SidePanelShell>
  );
}

function LiveStreamPopoverPanel({ theme }: { theme: 'light' | 'dark' }) {
  const [draft, setDraft] = useState('@');

  return (
    <SidePanelShell
      theme={theme}
      notch={<TopNotch items={NOTCH_ITEMS} expandedId={null} />}
      footer={
        <FloatingComposer
          value={draft}
          onChange={setDraft}
          onSubmit={() => {}}
          isGenerating
          onStop={() => {}}
          popoverSlot={
            <ContextCommandPopover
              open
              floating
              trigger="@"
              title="Attach context"
              items={[
                {
                  id: 'active-tab',
                  label: 'Active browser tab',
                  description: 'pricing.yours.sh — 4 plan tiers',
                  icon: 'page',
                  hasLiveDot: true,
                  shortcut: 'Tab',
                },
                {
                  id: 'summarize',
                  label: 'Summarize selection',
                  description: 'Local page brief card',
                  icon: 'page-scan',
                  badge: 'Local',
                  shortcut: ['⌘', 'S'],
                },
                {
                  id: 'memory',
                  label: 'Search @yours/memory',
                  description: 'Pinned specs & notes',
                  icon: 'search',
                  shortcut: 'M',
                },
              ]}
              onSelect={() => {}}
              onClose={() => {}}
            />
          }
          leftSlot={<StatusBadge tone="accent" dot pulse>Streaming · 89.2 tok/s</StatusBadge>}
        />
      }
    >
      <UserMessageBubble content="Compare the active tab options for me." />
      <AssistantMessage>
        <div className="yui-action-group">
          <MatrixOrb state="thinking" size={16} />
          <MatrixOrb state="streaming" size={16} />
          <span className="yui-speed-readout">Synthesizing grounded comparison…</span>
        </div>
        <StreamingResponse
          status="streaming"
          ink="accent"
          speed={18}
          actions={false}
          text="Comparing Team pricing across **10 seats** — verifying annual discount "
        />
      </AssistantMessage>
    </SidePanelShell>
  );
}

function GenUiShowcasePanel({ theme }: { theme: 'light' | 'dark' }) {
  const [toneId, setToneId] = useState('concise');
  const [choiceId, setChoiceId] = useState('quick');
  const [activeStep, setActiveStep] = useState('tl-2');

  return (
    <div className="yui-spec-scroll-col" data-theme={theme}>
      <TimelineCard
        title="Local Inference Pipeline"
        subtitle="Isolated worker startup"
        metaLabel="3 steps"
        onSelectStep={(step) => setActiveStep(step.id)}
        steps={[
          {
            id: 'tl-1',
            label: 'Mount OPFS weights',
            detail: 'Verified 2.6 GB SHA-256 manifest locally.',
            timestamp: '00:01',
            status: 'done',
          },
          {
            id: 'tl-2',
            label: 'Compile WGSL decode pass',
            detail: activeStep === 'tl-2' ? 'Subgroup reduction tuned for M3 GPU.' : 'Ready on adapter.',
            timestamp: '00:03',
            status: 'active',
          },
          {
            id: 'tl-3',
            label: 'Attach page DOM snapshot',
            timestamp: '00:04',
            status: 'pending',
          },
        ]}
      />
      <QuoteExcerptCard
        sourceTitle="MV3 Side Panel Specification"
        sourceDomain="developer.chrome.com"
        locator="§3 · Line 42"
        quote="Extension pages enforce style-src 'self' strictly so runtime components must avoid inline style attributes."
        onJumpToSource={() => {}}
        onCopyQuote={() => {}}
      />
      <CompareTable
        title="Pro vs. Team"
        badgeText="Local check"
        leftColumnTitle="Pro"
        rightColumnTitle="Team"
        rows={[
          { feature: '10 seats / mo', leftValue: '$200', rightValue: '$250' },
          { feature: 'Annual net', leftValue: '$2,000', rightValue: '$2,500', emphasize: true },
        ]}
        footerLabel="Updated just now"
        onCopy={() => {}}
      />
      <ChecklistCard
        title="Launch checklist"
        items={[
          { id: 'c1', label: 'Verify OPFS weights SHA-256', done: true },
          { id: 'c2', label: 'Audit MV3 style-src strict CSP', done: false },
        ]}
        onToggleItem={() => {}}
        onCopy={() => {}}
      />
      <MetricStripCard
        label="Decode Throughput"
        averageLabel="84.2 t/s avg"
        primaryValue="91.6"
        unitLabel="tok / sec"
        deltaLabel="+12% WGSL"
        values={[74, 79, 82, 85, 88, 91.6]}
        lowLabel="74"
        highLabel="91.6"
        footnote="Qwen3.5-4B INT4"
      />
      <PageBriefCard
        title="Page Brief"
        subtitle="Zero-trust Extension Spec"
        originLabel="Active tab"
        bullets={['Zero JSX inline styles anywhere', 'All inference isolated inside dedicated worker']}
        highlightsCount={1}
        highlightsContent="Lethal Trifecta breaker stays active."
        onCopy={() => {}}
      />
      <DraftCard
        tones={[
          { id: 'concise', label: 'Concise', content: 'Approved for Q3 rollout with local inference enabled.' },
          { id: 'warm', label: 'Warm', content: 'Happy to confirm we are ready to ship local WebGPU inference!' },
        ]}
        activeToneId={toneId}
        onSelectTone={setToneId}
        onCopy={() => {}}
        onPrimaryAction={() => {}}
      />
      <EntitySummaryCard
        title="Kyoto Stay"
        subtitle="Nov 12 – Nov 16"
        tag="Verified"
        fields={[
          { label: 'Rate', value: '$248/nt' },
          { label: 'District', value: 'Nakagyo' },
        ]}
        onSave={() => {}}
        onPrimaryAction={() => {}}
      />
      <ChoicePromptCard
        question="Summary depth?"
        options={[
          { id: 'quick', title: 'Quick bullets', description: 'Under 10s decode' },
          { id: 'deep', title: 'Full clause audit', description: 'Line-by-line citations' },
        ]}
        selectedId={choiceId}
        onSelect={setChoiceId}
      />
      <PageActionCard
        title="Apply shipping details?"
        fields={[
          { label: 'Recipient', value: 'Yours Research' },
          { label: 'Postal', value: '11211' },
        ]}
        onCancel={() => {}}
        onConfirm={() => {}}
      />
      <PermissionApprovalCard
        title="Allow external fetch?"
        description="Untrusted page text + private vault detected."
        ruleBadge="lethal-trifecta-network"
        onApprove={() => {}}
        onDeny={() => {}}
      />
      <ModelDownloadGate
        title="Try Pragma locally."
        models={[
          { id: 'qwen', label: 'Qwen3.5-4B', subtitle: 'WGSL Q4F16', sizeLabel: '2.6 GB', recommended: true },
        ]}
        selectedModelId="qwen"
        onSelectModel={() => {}}
        onStartDownload={() => {}}
      />
      <ToastPill message="Thread archived" onUndo={() => {}} />
    </div>
  );
}

function SheetAndCitationPanel({ theme }: { theme: 'light' | 'dark' }) {
  const [draft, setDraft] = useState('');
  const [sheetOpen, setSheetOpen] = useState(true);

  return (
    <SidePanelShell
      theme={theme}
      veilOpen={sheetOpen}
      onVeilClick={() => setSheetOpen(false)}
      notch={<TopNotch items={NOTCH_ITEMS} expandedId={null} />}
      sheet={
        <FloatingContextSheet
          open={sheetOpen}
          title="Context ingestion queue"
          subtitle="3 local sources verified"
          badge="OPFS"
          onClose={() => setSheetOpen(false)}
          footer={
            <>
              <StatusBadge tone="accent" dot>24.8 KB ready</StatusBadge>
              <button type="button" className="yui-pill-btn yui-pill-btn--primary">
                Attach all
              </button>
            </>
          }
        >
          <div className="yui-spec-foot">
            <NotchOptionRow
              icon="page"
              dotTone="green"
              title="Active tab · pricing.yours.sh"
              subtitle="Extracted 18 FAQ clauses (DOM text only)"
              meta="Verified"
              selected
              onClick={() => {}}
            />
            <NotchOptionRow
              icon="document"
              title="Pinned spec · Q3-Enterprise.md"
              subtitle="Local workspace note"
              meta="6.4 KB"
              onClick={() => {}}
            />
          </div>
        </FloatingContextSheet>
      }
      footer={
        <FloatingComposer
          value={draft}
          onChange={setDraft}
          onSubmit={() => {}}
          leftSlot={<StatusBadge tone="muted">3 attached</StatusBadge>}
        />
      }
    >
      <UserMessageBubble content="Compare the team billing discount across plans." />
      <AssistantMessage>
        <p className="yui-assistant-p">
          Verified local plan breakdown across active workspace tiers:
        </p>
        <p className="yui-assistant-p">
          <span>Annual seats drop from $25 to $20 once a workspace crosses 8 members </span>
          <InlineCitationPopover
            defaultOpen
            hoverOpen={false}
            source={{
              index: 1,
              label: 'pricing.yours.sh',
              title: 'Enterprise & Team Plan FAQ',
              domain: 'pricing.yours.sh',
              timestampLabel: 'Active tab',
              snippet: 'Annual billing drops effective cost from $25 to $20 per seat across 8+ seats.',
              url: 'https://yours.sh/pricing',
            }}
            onJumpToSource={() => {}}
          />
          <span> and apply automatically at renewal.</span>
        </p>
      </AssistantMessage>
    </SidePanelShell>
  );
}

function RuntimeAndMemoryPanel({ theme }: { theme: 'light' | 'dark' }) {
  const [tier, setTier] = useState<'all' | 'profile' | 'episodic' | 'working' | 'document'>('all');
  const [forgotten, setForgotten] = useState<string[]>(['m3']);
  const [bargeIn, setBargeIn] = useState(true);

  return (
    <SidePanelShell
      theme={theme}
      notch={<TopNotch items={NOTCH_ITEMS} expandedId={null} />}
      footer={
        <div className="yui-spec-foot">
          <VoiceSessionBar
            state="speech-detected"
            elapsedLabel="0:14"
            levels={[0.35, 0.72, 0.96, 0.78, 0.44]}
            bargeInEnabled={bargeIn}
            onToggleBargeIn={() => setBargeIn((v) => !v)}
            onToggleMute={() => {}}
            onEndSession={() => {}}
          />
          <FloatingComposer
            value=""
            onChange={() => {}}
            onSubmit={() => {}}
            leftSlot={<StatusBadge tone="local" dot>SQLite FTS5</StatusBadge>}
          />
        </div>
      }
    >
      <HardwareStatusStrip
        tierLabel="WebGPU FP16"
        adapterLabel="M3 Max"
        memoryLabel="2.6 GB"
        status="ready"
        sha256Verified
      />
      <ModelDownloadProgressBar
        modelLabel="Qwen3.5-4B · Q4F16"
        percent={74}
        state="downloading"
        hardwareLabel="WGSL"
        loadedLabel="1.92 GB"
        totalLabel="2.60 GB"
        speedLabel="118 MB/s"
        etaLabel="6s"
        onPause={() => {}}
        onCancel={() => {}}
      />
      <MemoryInspectorList
        activeTier={tier}
        onTierChange={setTier}
        forgottenIds={forgotten}
        onForget={(id) => setForgotten((prev) => (prev.includes(id) ? prev : [...prev, id]))}
        onUndo={(id) => setForgotten((prev) => prev.filter((item) => item !== id))}
        records={[
          {
            id: 'm1',
            tier: 'profile',
            summary: 'Prefers concise table comparisons with tabular telemetry.',
            sourceDomain: 'yours.sh',
            relativeTime: '2m',
            groupLabel: 'Today',
            scoreLabel: '98% match',
          },
          {
            id: 'm3',
            tier: 'working',
            summary: 'Temporary checkout form draft on Kyoto booking tab.',
            sourceDomain: 'stay.jp',
            relativeTime: 'Now',
            groupLabel: 'Today',
          },
          {
            id: 'm2',
            tier: 'episodic',
            summary: 'Verified 20% annual discount above 8 workspace seats.',
            sourceDomain: 'pricing.yours.sh',
            relativeTime: '1d',
            groupLabel: 'Yesterday',
          },
        ]}
      />
    </SidePanelShell>
  );
}

function SettingsAndVaultPanel({ theme }: { theme: 'light' | 'dark' }) {
  const [systemTheme, setSystemTheme] = useState(true);
  const [gpuPacing, setGpuPacing] = useState(true);
  const [thinkingMode, setThinkingMode] = useState(true);
  const [netTools, setNetTools] = useState(false);
  const [pickedFile, setPickedFile] = useState<string | null>(null);

  return (
    <SidePanelShell
      theme={theme}
      notch={<TopNotch items={NOTCH_ITEMS} expandedId={null} />}
      footer={
        <FloatingComposer
          value=""
          onChange={() => {}}
          onSubmit={() => {}}
          leftSlot={<StatusBadge tone="local" dot>OPFS encrypted</StatusBadge>}
        />
      }
    >
      <SettingsSection
        title="Local preferences"
        subtitle="Zero telemetry leaves this extension"
        badge="v1.0"
        footer={
          <>
            <StatusBadge tone="local" dot>
              Zero remote calls
            </StatusBadge>
            <span className="yui-mem-time">MV3 CSP strict</span>
          </>
        }
      >
        <SettingsToggleRow
          label="System appearance"
          description="Follow Cotton Paper & Obsidian Dark"
          checked={systemTheme}
          onCheckedChange={setSystemTheme}
        />
        <SettingsToggleRow
          label="GPU max pacing"
          description="Saturate WGSL compute queues for lower TTFT"
          badge="FP16"
          badgeTone="local"
          checked={gpuPacing}
          onCheckedChange={setGpuPacing}
        />
        <SettingsToggleRow
          label="Thinking trace"
          description="Stream collapsible reasoning tokens before final copy"
          shortcut={['⌘', 'T']}
          checked={thinkingMode}
          onCheckedChange={setThinkingMode}
        />
        <SettingsToggleRow
          label="Network fetch tool"
          description="Locked off while private vault data is mounted"
          badge="Strict"
          badgeTone="amber"
          checked={netTools}
          disabled
          onCheckedChange={setNetTools}
        />
      </SettingsSection>

      <LocalVaultExportCard
        recordCountLabel="148 records"
        selectedFileName={pickedFile}
        statusMessage="Last AES-GCM snapshot verified 4m ago"
        onImportFile={(file) => setPickedFile(file.name)}
        onExportEncrypted={() => {}}
        onImportEncrypted={() => {}}
        onWipeAll={() => {}}
      />
    </SidePanelShell>
  );
}

function DataAndArtifactPanel({ theme }: { theme: 'light' | 'dark' }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <SidePanelShell
      theme={theme}
      notch={<TopNotch items={NOTCH_ITEMS} expandedId={null} />}
      footer={
        <FloatingComposer
          value=""
          onChange={() => {}}
          onSubmit={() => {}}
          leftSlot={<StatusBadge tone="local" dot>Verified matrix</StatusBadge>}
        />
      }
    >
      <HardwareStatusStrip
        tierLabel="WebGPU FP16"
        adapterLabel="M3 Max"
        memoryLabel="2.6 GB"
        status="ready"
        sha256Verified
      />
      <DataTableCard
        title="Local Decode Matrix"
        subtitle="OPFS Q4F16 quantized checkpoints on-device"
        badge="WGSL"
        copyFormat="markdown"
        footerLabel="Tabular WebGPU measurements"
        columns={[
          { key: 'model', label: 'Checkpoint', sortable: true },
          { key: 'quant', label: 'Quant' },
          { key: 'ttft', label: 'TTFT', numeric: true, sortable: true },
          { key: 'tps', label: 'Decode', numeric: true, sortable: true },
          { key: 'vram', label: 'VRAM', numeric: true },
        ]}
        rows={[
          { model: 'Qwen3.5-4B', quant: 'Q4F16', ttft: '74ms', tps: '91.6 t/s', vram: '2.6 GB' },
          { model: 'Pragma-1.5B', quant: 'Q4F16', ttft: '38ms', tps: '142.4 t/s', vram: '1.1 GB' },
          { model: 'Gemma-2B-Local', quant: 'INT4', ttft: '52ms', tps: '118.0 t/s', vram: '1.5 GB' },
          { model: 'Phi-4-Mini', quant: 'INT4', ttft: '46ms', tps: '126.2 t/s', vram: '1.8 GB' },
        ]}
      />
      <ArtifactPreviewCard
        title="webgpu-audit-trace.md"
        fileType="MD"
        meta="4.2 KB · 30 lines · SHA-256"
        capped
        expanded={expanded}
        onExpandedChange={setExpanded}
        onSave={() => {}}
        preview={[
          '# Local WebGPU Decode Audit',
          '- Adapter: Apple M3 Max (FP16 subgroup arithmetic)',
          '- Shader cache: OPFS persisted across extension restarts',
          '- CSP policy: script-src self; style-src self (zero inline CSS)',
          '- Memory backend: SQLite-WASM FTS5 + HNSW encrypted store',
          '- Voice pipeline: Silero VAD + Whisper-tiny local barge-in',
          '- Guardrail status: Lethal Trifecta breaker armed (network tools locked)',
          '- Throughput: 91.6 tok/s sustained across 2048-token sliding window',
          '- Latency budget: 74ms first token including DOM extract',
          '- Checksum tree: 32 shards verified against manifest root',
          '- Kernel dispatch: fused RMSNorm + RoPE + SwiGLU WGSL pass',
          '- Attention mode: grouped-query 8:2 with INT8 KV compression',
          '- Browser sandbox: isolated dedicated Worker thread (no DOM access)',
          '- Weight provenance: HuggingFace manifest Digest checked line-by-line',
          '- Token streaming: WAAPI ink glide (zero inline DOM styles)',
          '- Panel geometry: 340px–440px responsive Cotton Paper / Obsidian Dark',
          '- Verification result: 100% deterministic pass on CI runners',
        ].join('\\n')}
      />
    </SidePanelShell>
  );
}

function WelcomeEmptyPanel({ theme }: { theme: 'light' | 'dark' }) {
  const [prompt, setPrompt] = useState('');

  return (
    <SidePanelShell
      theme={theme}
      notch={<TopNotch items={NOTCH_ITEMS} expandedId={null} />}
      footer={
        <FloatingComposer
          value={prompt}
          onChange={setPrompt}
          onSubmit={() => {}}
          leftSlot={<StatusBadge tone="local" dot>WebGPU ready</StatusBadge>}
        />
      }
    >
      <EmptyPanelState
        title="Ask locally on this page."
        subtitle="Private WebGPU inference stays inside your browser."
        starters={[
          { id: 'w1', label: 'Summarize page', icon: 'document' },
          { id: 'w2', label: 'Compare specs', icon: 'compare' },
          { id: 'w3', label: 'Extract action items', icon: 'checklist' },
        ]}
        onSelectStarter={(item) => setPrompt(item.prompt ?? item.label)}
      />
    </SidePanelShell>
  );
}

function CommandPaletteAndDiffPanel({ theme }: { theme: 'light' | 'dark' }) {
  const [open, setOpen] = useState(true);

  return (
    <SidePanelShell
      theme={theme}
      veilOpen={open}
      onVeilClick={() => setOpen(false)}
      notch={<TopNotch items={NOTCH_ITEMS} expandedId={null} />}
      overlay={
        <CommandPalette
          open={open}
          onClose={() => setOpen(false)}
          onSelectAction={() => {}}
          actions={[
            {
              id: 'summarize',
              label: 'Summarize active tab',
              description: 'Generate structured Page Brief locally',
              group: 'Page actions',
              icon: 'document',
              shortcut: ['⌘', 'S'],
            },
            {
              id: 'switch-model',
              label: 'Switch checkpoint',
              description: 'Qwen3.5-4B · Q4F16 (OPFS)',
              group: 'Runtime',
              icon: 'local-device',
              badge: 'Cached',
              shortcut: ['⌘', 'M'],
            },
            {
              id: 'voice',
              label: 'Start local voice session',
              description: 'Silero VAD + Whisper-tiny barge-in',
              group: 'Runtime',
              icon: 'mic',
              shortcut: ['⌘', '⇧', 'V'],
            },
          ]}
        />
      }
      footer={
        <FloatingComposer
          value=""
          onChange={() => {}}
          onSubmit={() => {}}
          leftSlot={<StatusBadge tone="muted">Press ⌘K</StatusBadge>}
        />
      }
    >
      <DiffCard
        filename="src/runtime/decode.ts"
        language="TS"
        footerLabel="WebGPU shader kernel patch"
        lines={[
          { type: 'context', content: 'export const WORKGROUP_SIZE = 256;' },
          { type: 'remove', content: 'const kvQuant = "fp16"; // baseline cache bandwidth usage' },
          { type: 'add', content: 'const kvQuant = "int8"; // 2x context window headroom on OPFS GPUs' },
          { type: 'add', content: 'const subgroupSync = true;' },
        ]}
      />
    </SidePanelShell>
  );
}

function TraceAndPermissionPanel({ theme }: { theme: 'light' | 'dark' }) {
  const [decision, setDecision] = useState<'pending' | 'once' | 'always' | 'denied'>('pending');

  return (
    <SidePanelShell
      theme={theme}
      notch={<TopNotch items={NOTCH_ITEMS} expandedId={null} />}
      footer={
        <FloatingComposer
          value=""
          onChange={() => {}}
          onSubmit={() => {}}
          leftSlot={
            <StatusBadge tone={decision === 'denied' ? 'amber' : 'local'} dot>
              {decision === 'pending' ? 'Guard checkpoint' : 'Decision: ' + decision}
            </StatusBadge>
          }
        />
      }
    >
      <ToolTraceList
        steps={[
          {
            id: 'read-tab',
            tool: 'read_tab',
            label: 'portal.acme.dev/security',
            status: 'done',
            latencyLabel: '142ms',
            input: '{"tabId": 14, "mode": "aom-compact"}',
            output: '{"nodes": 48, "bytes": 3120}',
          },
          {
            id: 'search-web',
            tool: 'search_web_tab',
            label: 'webgpu subgroup barriers',
            status: 'running',
            latencyLabel: '18ms',
            input: '{"query": "WGSL subgroupBroadcast", "limit": 5}',
          },
          {
            id: 'sandbox',
            tool: 'run_sandbox',
            label: 'Blocked outbound fetch',
            status: 'blocked',
            latencyLabel: 'blocked',
            output: '@yours/guard: Lethal Trifecta rule prevented exfil to api.external.test',
            defaultExpanded: true,
          },
          {
            id: 'memory',
            tool: 'memory_query',
            label: 'FTS5 + HNSW local recall',
            status: 'error',
            latencyLabel: '309ms',
            output: 'OPFS lock busy; retried with read-only snapshot',
          },
        ]}
      />
      <PermissionCard
        title="Allow form action on portal.acme.dev?"
        domain="portal.acme.dev"
        scope="Read selected billing fields + submit POST action"
        ruleLabel="Lethal Trifecta · @yours/guard"
        reason="Untrusted tab context and local memory index are both active in this turn."
        onAllowOnce={() => setDecision('once')}
        onDeny={() => setDecision('denied')}
        onAlwaysSite={() => setDecision('always')}
      />
    </SidePanelShell>
  );
}

function DiffShowcasePanel({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <SidePanelShell
      theme={theme}
      notch={<TopNotch items={NOTCH_ITEMS} expandedId={null} />}
      footer={
        <FloatingComposer
          value=""
          onChange={() => {}}
          onSubmit={() => {}}
          leftSlot={<StatusBadge tone="local" dot>Patch ready</StatusBadge>}
        />
      }
    >
      <DiffCard
        filename="src/runtime/decode.ts"
        language="TS"
        footerLabel="Unified WebGPU diff"
        lines={[
          { type: 'context', content: 'export const WORKGROUP_SIZE = 256;' },
          { type: 'remove', content: 'const kvQuant = "fp16"; // baseline cache bandwidth usage' },
          { type: 'add', content: 'const kvQuant = "int8"; // 2x context window headroom on OPFS GPUs' },
          { type: 'add', content: 'const subgroupSync = true;' },
        ]}
      />
      <ArtifactPreviewCard
        title="shader-trace.log"
        fileType="LOG"
        meta="2.9 KB · 30 lines · OPFS"
        capped
        preview={Array.from({ length: 28 }, (_, i) =>
          '[' + String(i + 1).padStart(2, '0') + '] wgsl dispatch group=(32,1,1) dt=' + (1.1 + (i % 5) * 0.2).toFixed(1) + 'ms ok',
        ).join('\\n')}
      />
    </SidePanelShell>
  );
}

function DrawerAndContextPanel({ theme }: { theme: 'light' | 'dark' }) {
  const [activeThreadId, setActiveThreadId] = useState('th-1');
  const [pinnedIds, setPinnedIds] = useState<Record<string, boolean>>({ 'th-1': true });
  const [selectedModelId, setSelectedModelId] = useState('qwen-4b');
  const [mutedIds, setMutedIds] = useState<Record<string, boolean>>({ 'tab-3': true });
  const [tabItems, setTabItems] = useState([
    {
      id: 'tab-1',
      domain: 'docs.rs',
      title: 'wgpu ComputePassEncoder & subgroup barriers guide',
      tokenLabel: '1.4k tok',
      kind: 'tab' as const,
    },
    {
      id: 'tab-2',
      domain: 'github.com/yours-research',
      title: 'Strict Chrome MV3 CSP architecture checklist',
      tokenLabel: '840 tok',
      kind: 'tab' as const,
    },
    {
      id: 'tab-3',
      domain: 'yours.sh',
      title: 'Selected shader memory layout table snippet',
      tokenLabel: '320 tok',
      kind: 'snippet' as const,
    },
  ]);

  return (
    <SidePanelShell
      theme={theme}
      notch={<TopNotch items={NOTCH_ITEMS} expandedId={null} />}
      sheet={
        <FloatingContextSheet
          open
          title="Attached tab context"
          badge={String(tabItems.length)}
        >
          <TabContextList
            items={tabItems.map((item) => ({ ...item, muted: Boolean(mutedIds[item.id]) }))}
            onToggleMute={(id) => setMutedIds((prev) => ({ ...prev, [id]: !prev[id] }))}
            onDetach={(id) => setTabItems((prev) => prev.filter((item) => item.id !== id))}
          />
        </FloatingContextSheet>
      }
      footer={
        <FloatingComposer
          value=""
          onChange={() => {}}
          onSubmit={() => {}}
          leftSlot={<StatusBadge tone="local" dot>Drawers ready</StatusBadge>}
        />
      }
    >
      <ThreadHistoryList
        activeId={activeThreadId}
        onSelect={setActiveThreadId}
        onTogglePin={(id) => setPinnedIds((prev) => ({ ...prev, [id]: !prev[id] }))}
        onDelete={() => {}}
        items={[
          {
            id: 'th-1',
            title: 'WebGPU subgroup reduction tuning',
            preview: 'KV int8 quantization freed 2x window headroom on M3 GPU.',
            timestamp: '2m ago',
            turnCount: 6,
            groupLabel: 'Today',
            pinned: Boolean(pinnedIds['th-1']),
          },
          {
            id: 'th-2',
            title: 'Lethal Trifecta guard policy review',
            preview: 'Inline PermissionCard requires host + scope confirmation.',
            timestamp: 'Yesterday',
            turnCount: 4,
            groupLabel: 'Yesterday',
            pinned: Boolean(pinnedIds['th-2']),
          },
        ]}
      />
      <ModelRosterList
        selectedId={selectedModelId}
        onSelectModel={setSelectedModelId}
        onDownloadModel={() => {}}
        models={[
          {
            id: 'qwen-4b',
            name: 'Qwen3.5-4B',
            quantLabel: 'Q4F16',
            sizeLabel: '2.4 GB',
            vramLabel: '3.1 GB VRAM',
            speedLabel: '44 tok/s',
            state: selectedModelId === 'qwen-4b' ? 'active' : 'cached',
          },
          {
            id: 'gemma-4',
            name: 'Gemma 4 E4B',
            quantLabel: 'Q4',
            sizeLabel: '2.7 GB',
            vramLabel: '3.4 GB VRAM',
            speedLabel: '39 tok/s',
            state: selectedModelId === 'gemma-4' ? 'active' : 'cached',
          },
          {
            id: 'llama-3b',
            name: 'Llama-3.2-3B',
            quantLabel: 'Q4',
            sizeLabel: '1.9 GB',
            vramLabel: '2.4 GB VRAM',
            state: 'download',
          },
        ]}
      />
    </SidePanelShell>
  );
}

function BudgetAndCitationPanel({ theme }: { theme: 'light' | 'dark' }) {
  const [activeCite, setActiveCite] = useState<number | string>(1);

  return (
    <SidePanelShell
      theme={theme}
      notch={<TopNotch items={NOTCH_ITEMS} expandedId={null} />}
      footer={
        <FloatingComposer
          value=""
          onChange={() => {}}
          onSubmit={() => {}}
          leftSlot={<StatusBadge tone="local" dot>3.2k / 8k ctx</StatusBadge>}
        />
      }
    >
      <ContextBudgetMeter
        usedTokens={3200}
        maxTokens={8000}
        defaultExpanded
        segments={[
          { id: 'sys', label: 'System prompt', tokensLabel: '640 tok', percent: 8 },
          { id: 'tab', label: 'Active tab (docs.rs)', tokensLabel: '1.4k tok', percent: 18 },
          { id: 'hist', label: 'Conversation history', tokensLabel: '840 tok', percent: 10 },
          { id: 'mem', label: 'Local FTS5 memory', tokensLabel: '320 tok', percent: 4 },
        ]}
      />
      <ContextBudgetMeter
        usedTokens={6880}
        maxTokens={8000}
        title="Compaction threshold"
      />
      <CitationFootnoteList
        activeIndex={activeCite}
        onShowOnPage={(cite) => setActiveCite(cite.index)}
        onCopyQuote={() => {}}
        citations={[
          {
            id: 'fn-1',
            index: 1,
            title: 'WebGPU Subgroup Operations',
            domain: 'gpuweb.github.io',
            locator: 'Section 3.2 · Para 4',
            excerpt:
              'Subgroup barriers synchronize invocations cleanly inside a compute workgroup without global memory fences.',
            highlight: 'warm',
          },
          {
            id: 'fn-2',
            index: 2,
            title: 'MV3 Extension Security Model',
            domain: 'developer.chrome.com',
            locator: 'CSP v3 · Note 2',
            excerpt:
              'Extension side-panel documents block inline style attributes under default style-src self policies.',
            highlight: 'mono',
          },
        ]}
      />
    </SidePanelShell>
  );
}

function OnboardingAndCodePanel({ theme }: { theme: 'light' | 'dark' }) {
  const [initialized, setInitialized] = useState(false);

  return (
    <SidePanelShell
      theme={theme}
      notch={<TopNotch items={NOTCH_ITEMS} expandedId={null} />}
      footer={
        <FloatingComposer
          value=""
          onChange={() => {}}
          onSubmit={() => {}}
          leftSlot={
            <StatusBadge tone="local" dot>
              {initialized ? 'Qwen3.5-4B warm' : 'OPFS ready'}
            </StatusBadge>
          }
        />
      }
    >
      <OnboardingCard
        checkpointLabel="Qwen3.5-4B · Q4F16"
        cacheSizeLabel="2.6 GB"
        adapterLabel="WebGPU ready"
        ctaLabel={initialized ? 'Checkpoint initialized' : 'Download & initialize locally'}
        loading={false}
        secondaryLabel="Choose another checkpoint"
        onInitialize={() => setInitialized(true)}
        onSecondaryAction={() => {}}
      />
      <CodeBlockCard
        title="decode_kernel.wgsl"
        language="wgsl"
        showLineNumbers
        code={
          '@compute @workgroup_size(256, 1, 1)\\n' +
          'fn kv_dequant_q4(@builtin(global_invocation_id) gid: vec3<u32>) {\\n' +
          '  let packed = kv_cache_q4[gid.x]; // subgroup quantized load across OPFS ring\\n' +
          '  workgroupBarrier();\\n' +
          '}'
        }
      />
      <StreamingResponse
        status="done"
        actions={false}
        text={'\\x60\\x60\\x60bash\\nnpm exec @yours/cli verify --webgpu\\n\\x60\\x60\\x60'}
      />
    </SidePanelShell>
  );
}

function RecoveryAndNoticePanel({ theme }: { theme: 'light' | 'dark' }) {
  const [retried, setRetried] = useState(false);
  const [switched, setSwitched] = useState(false);
  const [compactionExpanded, setCompactionExpanded] = useState(false);

  return (
    <SidePanelShell
      theme={theme}
      notch={<TopNotch items={NOTCH_ITEMS} expandedId={null} />}
      footer={
        <FloatingComposer
          value=""
          onChange={() => {}}
          onSubmit={() => {}}
          leftSlot={
            <StatusBadge tone={retried ? 'local' : 'danger'} dot>
              {retried ? 'Retry queued' : switched ? 'Selecting checkpoint' : 'Adapter interrupted'}
            </StatusBadge>
          }
        />
      }
    >
      <InlineNotice
        tone="info"
        icon="history"
        message={
          compactionExpanded
            ? 'Context compacted · 9 older turns shown inline'
            : 'Context compacted · 9 older turns folded'
        }
        actionLabel={compactionExpanded ? 'Collapse' : 'Expand'}
        onAction={() => setCompactionExpanded((prev) => !prev)}
      />
      <InlineNotice
        tone="warning"
        icon="shield"
        message="Private tab · Local memory paused"
        actionLabel="Settings"
        onAction={() => {}}
      />
      <InlineNotice
        tone="success"
        message="OPFS weights verified · SHA-256 matched"
      />
      <ErrorRecoveryCard
        title="WebGPU device adapter lost"
        badgeLabel="WebGPU lost"
        diagnosis="Chrome reclaimed the GPU context while the tab slept. Cached OPFS weights remain intact."
        diagnostics={
          'GPUDeviceLostInfo: reason="unknown"\\n' +
          'adapter=Apple M3 (metal, subgroup=32)\\n' +
          'opfs=qwen3.5-4b-q4f16 (2.6 GB verified)'
        }
        onRetry={() => setRetried(true)}
        onSwitchModel={() => setSwitched(true)}
      />
    </SidePanelShell>
  );
}

function VoiceAndComposerPanel({ theme }: { theme: 'light' | 'dark' }) {
  const [muted, setMuted] = useState(false);
  const [bargeIn, setBargeIn] = useState(true);
  const [cmdOpened, setCmdOpened] = useState(false);
  const [prompt, setPrompt] = useState('Summarize voice transcript locally');

  return (
    <SidePanelShell
      theme={theme}
      notch={<TopNotch items={NOTCH_ITEMS} expandedId={null} />}
      footer={
        <FloatingComposer
          value={prompt}
          onChange={setPrompt}
          onSubmit={() => {}}
          onOpenCommands={() => setCmdOpened((prev) => !prev)}
          commandsLabel="Open slash commands"
          contextUsageLabel="6.4k / 8k"
          contextUsageTone="warning"
          leftSlot={
            <StatusBadge tone="local" dot>
              {cmdOpened ? 'Commands open' : 'Qwen3.5-4B'}
            </StatusBadge>
          }
        />
      }
    >
      <VoiceSessionCard
        state="speech-detected"
        elapsedLabel="00:18"
        transcript="Compare the OPFS weight size"
        interimTranscript="between Qwen3.5-4B and Gemma"
        level={0.78}
        pushToTalkKey="Space"
        onPushToTalk={() => {}}
        bargeInEnabled={bargeIn}
        onToggleBargeIn={() => setBargeIn((prev) => !prev)}
        muted={muted}
        onToggleMute={() => setMuted((prev) => !prev)}
        onEndSession={() => {}}
      />
      <div className="yui-alm-strip">
        <div className="yui-alm-pair">
          <span className="yui-alm-pair-label">Idle</span>
          <AudioLevelMeter level={0.14} tone="neutral" bars={7} label="Idle level" />
        </div>
        <div className="yui-alm-pair">
          <span className="yui-alm-pair-label">Speaking</span>
          <AudioLevelMeter level={0.76} tone="speaking" bars={10} animated label="Speaking level" />
        </div>
      </div>
    </SidePanelShell>
  );
}

function TemplatesAndExportPanel({ theme }: { theme: 'light' | 'dark' }) {
  const [pinnedIds, setPinnedIds] = useState<Record<string, boolean>>({ 'tpl-1': true });
  const [selectedCmd, setSelectedCmd] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState('14 turns · 18.4 KB');

  return (
    <SidePanelShell
      theme={theme}
      notch={<TopNotch items={NOTCH_ITEMS} expandedId={null} />}
      footer={
        <FloatingComposer
          value={selectedCmd ?? ''}
          onChange={setSelectedCmd}
          onSubmit={() => {}}
          onOpenCommands={() => setSelectedCmd('/summarize ')}
          leftSlot={<StatusBadge tone="local" dot>{selectedCmd ? 'Template loaded' : statusNote}</StatusBadge>}
        />
      }
    >
      <PromptTemplateList
        onSelect={(item) => setSelectedCmd(item.command + ' ')}
        onTogglePin={(id) => setPinnedIds((prev) => ({ ...prev, [id]: !prev[id] }))}
        items={[
          {
            id: 'tpl-1',
            command: '/summarize',
            title: 'Summarize active page',
            description: 'Extract 5 key takeaways from local DOM.',
            category: 'Page',
            pinned: Boolean(pinnedIds['tpl-1']),
            shortcut: '⌘1',
          },
          {
            id: 'tpl-2',
            command: '/wgsl',
            title: 'Audit WebGPU kernel',
            description: 'Inspect subgroup barriers and memory layout.',
            category: 'Code',
            pinned: Boolean(pinnedIds['tpl-2']),
          },
          {
            id: 'tpl-3',
            command: '/redact',
            title: 'Check PII before export',
            description: 'Scan quoted snippets locally before saving.',
            category: 'Local',
            pinned: Boolean(pinnedIds['tpl-3']),
          },
        ]}
      />
      <ExportSessionCard
        metaLabel={statusNote}
        previewText={'# Local session\\nVerified privately.'}
        onCopy={() => setStatusNote('Copied to clipboard')}
        onDownload={(opts) => setStatusNote('Saved .' + opts.format)}
      />
    </SidePanelShell>
  );
}

function ShortcutAndToastPanel({ theme }: { theme: 'light' | 'dark' }) {
  const [toastOpen, setToastOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <SidePanelShell
      theme={theme}
      veilOpen={drawerOpen}
      onVeilClick={() => setDrawerOpen(false)}
      notch={
        <TopNotch
          expandedId={drawerOpen ? 'threads' : null}
          onClose={() => setDrawerOpen(false)}
          items={[
            { id: 'new', icon: 'compose', label: 'New', onClick: () => setDrawerOpen(false) },
            {
              id: 'threads',
              icon: 'history',
              label: 'Threads',
              onClick: () => setDrawerOpen((prev) => !prev),
            },
            { id: 'tabs', icon: 'tab-stack', label: '1 tab', badgeDot: 'green' },
            { id: 'saved', icon: 'bookmark', label: 'Saved' },
          ]}
          drawerContent={
            drawerOpen ? (
              <HookSidebarList
                activeId="h1"
                items={[
                  { id: 'h1', title: 'Shortcuts & toast layer', meta: 'Now' },
                  { id: 'h2', title: 'Local checkpoint backup', meta: '1h' },
                ]}
              />
            ) : null
          }
        />
      }
      toast={
        <StatusToast
          open={toastOpen}
          tone="local"
          message="Memory snapshot backed up locally"
          detail="148 records · 420 KB"
          onUndo={() => {}}
          onDismiss={() => setToastOpen(false)}
        />
      }
      footer={
        <FloatingComposer
          value=""
          onChange={() => {}}
          onSubmit={() => {}}
          leftSlot={<StatusBadge tone="muted">Press ? for keys</StatusBadge>}
        />
      }
    >
      <ShortcutSheet
        title="Keyboard shortcuts"
        subtitle="Extension side-panel quick keys"
        badge="v1.0"
        groups={[
          {
            title: 'Notch & Navigation',
            items: [
              { label: 'Focus composer', description: 'Jump directly to prompt bar', keys: ['⌘', 'K'] },
              { label: 'Toggle threads drawer', keys: ['⌘', 'H'] },
              { label: 'Close active overlay', keys: 'Esc' },
            ],
          },
          {
            title: 'Local Runtime',
            items: [
              { label: 'Toggle thinking trace', keys: ['⌘', 'T'] },
              { label: 'Start / stop voice', keys: ['⌘', 'M'] },
              { label: 'Copy last response', keys: ['⌘', '⇧', 'C'] },
            ],
          },
        ]}
      />
    </SidePanelShell>
  );
}

function StorageAndFindPanel({ theme }: { theme: 'light' | 'dark' }) {
  const [query, setQuery] = useState('local');
  const [matchIdx, setMatchIdx] = useState(2);
  const [matchCase, setMatchCase] = useState(false);
  const [vaultVerified, setVaultVerified] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Local OPFS active · 2.6 GB / 12.0 GB');
  const [entries, setEntries] = useState([
    {
      id: 'weights',
      label: 'Cached WGSL weights',
      detail: 'Qwen3.5-4B · INT4 OPFS',
      sizeLabel: '2.4 GB',
      percent: 20,
      tone: 'weights' as const,
      verified: true,
    },
    {
      id: 'vault',
      label: 'Encrypted memory vault',
      detail: 'IndexedDB AES-GCM',
      sizeLabel: '160 MB',
      percent: 4,
      tone: 'vault' as const,
      verified: false,
    },
    {
      id: 'history',
      label: 'Thread history',
      detail: '14 encrypted sessions',
      sizeLabel: '40 MB',
      percent: 2,
      tone: 'history' as const,
      verified: false,
    },
  ]);

  const totalMatches = query.trim().length > 0 ? 7 : 0;

  return (
    <SidePanelShell
      theme={theme}
      notch={<TopNotch items={NOTCH_ITEMS} expandedId={null} />}
      footer={
        <FloatingComposer
          value=""
          onChange={() => {}}
          onSubmit={() => {}}
          leftSlot={<StatusBadge tone="local" dot>{statusMsg}</StatusBadge>}
        />
      }
    >
      <FindInThreadBar
        query={query}
        onQueryChange={(next) => {
          setQuery(next);
          setMatchIdx(1);
        }}
        totalMatches={totalMatches}
        currentMatch={matchIdx}
        onPrev={() => setMatchIdx((prev) => (prev <= 1 ? totalMatches : prev - 1))}
        onNext={() => setMatchIdx((prev) => (prev >= totalMatches ? 1 : prev + 1))}
        caseSensitive={matchCase}
        onToggleCaseSensitive={() => setMatchCase((prev) => !prev)}
        onClose={() => setStatusMsg('Find bar closed via Esc')}
      />
      <FindInThreadBar
        query="CSP bypass"
        totalMatches={0}
        onPrev={() => {}}
        onNext={() => {}}
        onClose={() => {}}
      />
      <StorageQuotaCard
        usedLabel="2.6 GB"
        quotaLabel="12.0 GB"
        entries={entries.map((entry) => ({
          ...entry,
          status:
            entry.id === 'vault'
              ? vaultVerified
                ? 'verified'
                : 'idle'
              : entry.verified
                ? 'verified'
                : 'idle',
          onVerify:
            entry.id === 'vault'
              ? () => {
                  setVaultVerified(true);
                  setStatusMsg('Vault SHA-256 verified');
                }
              : entry.id === 'weights'
                ? () => setStatusMsg('OPFS weights SHA-256 verified')
                : undefined,
          onClear:
            entry.id === 'history'
              ? () => {
                  setEntries((prev) => prev.filter((item) => item.id !== 'history'));
                  setStatusMsg('Cleared thread history cache');
                }
              : undefined,
        }))}
        onClearAll={() => setStatusMsg('Cleared temporary local cache')}
      />
    </SidePanelShell>
  );
}

function SpecimenApp() {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode') || 'gallery';
  const theme = (params.get('theme') || 'light') as 'light' | 'dark';
  const panel = params.get('panel') || 'resting';
  const widthMode = params.get('width') || (params.get('narrow') === '1' ? '340' : '380');
  const singleClass =
    widthMode === '340'
      ? 'yui-spec-single yui-spec-single--narrow'
      : widthMode === '400'
        ? 'yui-spec-single yui-spec-single--wide'
        : 'yui-spec-single';

  if (mode === 'single') {
    return (
      <div className={singleClass} data-theme={theme}>
        {panel === 'resting' ? <RestingPanel theme={theme} /> : null}
        {panel === 'notch' ? <NotchExpandedPanel theme={theme} /> : null}
        {panel === 'chat' ? <ActiveChatPanel theme={theme} /> : null}
        {panel === 'live' ? <LiveStreamPopoverPanel theme={theme} /> : null}
        {panel === 'sheet' ? <SheetAndCitationPanel theme={theme} /> : null}
        {panel === 'runtime' ? <RuntimeAndMemoryPanel theme={theme} /> : null}
        {panel === 'settings' ? <SettingsAndVaultPanel theme={theme} /> : null}
        {panel === 'data' ? <DataAndArtifactPanel theme={theme} /> : null}
        {panel === 'shortcuts' ? <ShortcutAndToastPanel theme={theme} /> : null}
        {panel === 'welcome' ? <WelcomeEmptyPanel theme={theme} /> : null}
        {panel === 'palette' ? <CommandPaletteAndDiffPanel theme={theme} /> : null}
        {panel === 'diff' ? <DiffShowcasePanel theme={theme} /> : null}
        {panel === 'trace' ? <TraceAndPermissionPanel theme={theme} /> : null}
        {panel === 'drawers' ? <DrawerAndContextPanel theme={theme} /> : null}
        {panel === 'budget' ? <BudgetAndCitationPanel theme={theme} /> : null}
        {panel === 'onboarding' ? <OnboardingAndCodePanel theme={theme} /> : null}
        {panel === 'recovery' ? <RecoveryAndNoticePanel theme={theme} /> : null}
        {panel === 'voice' ? <VoiceAndComposerPanel theme={theme} /> : null}
        {panel === 'templates' ? <TemplatesAndExportPanel theme={theme} /> : null}
        {panel === 'genui' ? <GenUiShowcasePanel theme={theme} /> : null}
        {panel === 'storage' ? <StorageAndFindPanel theme={theme} /> : null}
      </div>
    );
  }

  return (
    <div className="yui-spec-grid" data-theme={theme}>
      <div className="yui-spec-frame"><RestingPanel theme={theme} /></div>
      <div className="yui-spec-frame"><NotchExpandedPanel theme={theme} /></div>
      <div className="yui-spec-frame"><LiveStreamPopoverPanel theme={theme} /></div>
      <div className="yui-spec-frame"><ActiveChatPanel theme={theme} /></div>
      <div className="yui-spec-frame"><SheetAndCitationPanel theme={theme} /></div>
      <div className="yui-spec-frame"><RuntimeAndMemoryPanel theme={theme} /></div>
      <div className="yui-spec-frame"><SettingsAndVaultPanel theme={theme} /></div>
      <div className="yui-spec-frame"><DataAndArtifactPanel theme={theme} /></div>
      <div className="yui-spec-frame"><ShortcutAndToastPanel theme={theme} /></div>
      <div className="yui-spec-frame"><WelcomeEmptyPanel theme={theme} /></div>
      <div className="yui-spec-frame"><CommandPaletteAndDiffPanel theme={theme} /></div>
      <div className="yui-spec-frame"><DiffShowcasePanel theme={theme} /></div>
      <div className="yui-spec-frame"><TraceAndPermissionPanel theme={theme} /></div>
      <div className="yui-spec-frame"><DrawerAndContextPanel theme={theme} /></div>
      <div className="yui-spec-frame"><BudgetAndCitationPanel theme={theme} /></div>
      <div className="yui-spec-frame"><OnboardingAndCodePanel theme={theme} /></div>
      <div className="yui-spec-frame"><RecoveryAndNoticePanel theme={theme} /></div>
      <div className="yui-spec-frame"><VoiceAndComposerPanel theme={theme} /></div>
      <div className="yui-spec-frame"><TemplatesAndExportPanel theme={theme} /></div>
      <div className="yui-spec-frame"><StorageAndFindPanel theme={theme} /></div>
      <div className="yui-spec-frame-auto"><GenUiShowcasePanel theme={theme} /></div>
    </div>
  );
}

const rootEl = document.getElementById('specimen-root');
if (rootEl) {
  createRoot(rootEl).render(<SpecimenApp />);
}
`;

const SPECIMEN_CSS = `
html, body {
  margin: 0;
  padding: 0;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.yui-spec-single {
  width: 380px;
  min-height: 828px;
  box-sizing: border-box;
  background: var(--bg-canvas);
}

.yui-spec-single--narrow {
  width: 340px;
}

.yui-spec-single--wide {
  width: 400px;
}

.yui-spec-single > .yui-shell {
  height: 828px;
}

.yui-spec-grid {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 24px;
  padding: 24px;
  background: var(--bg-canvas);
}

.yui-spec-frame {
  width: 380px;
  height: 828px;
  flex-shrink: 0;
}

.yui-spec-frame-auto {
  width: 380px;
  flex-shrink: 0;
  padding: 12px 16px;
  box-sizing: border-box;
  background: var(--yui-stage-bg);
  border: 1px solid var(--yui-stage-border);
  border-radius: 18px;
}

.yui-spec-scroll-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 12px 16px 18px 16px;
  width: 100%;
  box-sizing: border-box;
  background: var(--yui-stage-bg);
}

.yui-spec-frame-auto .yui-spec-scroll-col {
  padding: 0;
}

.yui-spec-foot {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
`;

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const distCssPath = path.join(ROOT, 'dist', 'styles', 'index.css');
  if (!fs.existsSync(distCssPath)) {
    throw new Error('Missing dist/styles/index.css. Run `npm run build` first.');
  }

  const designCss = [
    fs.readFileSync(path.join(ROOT, 'src', 'styles', 'tokens.css'), 'utf8'),
    fs.readFileSync(path.join(ROOT, 'src', 'styles', 'components.css'), 'utf8'),
    SPECIMEN_CSS,
  ].join('\n');

  const bundled = await esbuild.build({
    stdin: {
      contents: SPECIMEN_ENTRY_TSX,
      resolveDir: path.join(ROOT, 'scripts'),
      loader: 'tsx',
    },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'browser',
    jsx: 'automatic',
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  });

  const specimenJs = bundled.outputFiles[0].text;
  const htmlDoc = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>@yours/ui Visual Specimen</title>
  <link rel="stylesheet" href="/specimen.css" />
</head>
<body>
  <div id="specimen-root"></div>
  <script type="module" src="/specimen.js"></script>
</body>
</html>`;

  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    "object-src 'none'",
  ].join('; ');

  const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', 'http://localhost');
    if (url.pathname === '/') {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': csp,
      });
      res.end(htmlDoc);
      return;
    }
    if (url.pathname === '/specimen.css') {
      res.writeHead(200, {
        'Content-Type': 'text/css; charset=utf-8',
        'Content-Security-Policy': csp,
      });
      res.end(designCss);
      return;
    }
    if (url.pathname === '/specimen.js') {
      res.writeHead(200, {
        'Content-Type': 'text/javascript; charset=utf-8',
        'Content-Security-Policy': csp,
      });
      res.end(specimenJs);
      return;
    }
    res.writeHead(404);
    res.end('Not Found');
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  const { chromium } = resolvePlaywright();
  const browser = await chromium.launch({ headless: true });

  const errors = [];
  const cspViolations = [];
  const contrastReport = [];
  const outputs = [];
  let hoverGeometry = null;

  try {
    const page = await browser.newPage({
      viewport: { width: 380, height: 828 },
      deviceScaleFactor: 2,
    });
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
    });
    await page.exposeFunction('__recordCsp', (d) => cspViolations.push(d));
    await page.addInitScript(() => {
      document.addEventListener('securitypolicyviolation', (e) => {
        window.__recordCsp(`${e.violatedDirective} -> ${e.blockedURI}`);
      });
    });

    const waitForSpecimen = async (label) => {
      try {
        await page.waitForSelector('#specimen-root > div', { timeout: 6000 });
      } catch (err) {
        const msg = err && typeof err === 'object' && 'message' in err ? err.message : String(err);
        throw new Error(
          `Specimen mount failed on ${label}: ${msg}\nerrors=${JSON.stringify(errors)}\ncsp=${JSON.stringify(cspViolations)}`,
        );
      }
    };

    const singlePanels = [
      'resting',
      'notch',
      'live',
      'chat',
      'sheet',
      'runtime',
      'settings',
      'data',
      'shortcuts',
      'welcome',
      'palette',
      'diff',
      'trace',
      'drawers',
      'budget',
      'onboarding',
      'recovery',
      'voice',
      'templates',
      'genui',
      'storage',
    ];
    const auditPanelContrast = async (activeTheme, panelName) => {
      const failures = await page.evaluate((t) => {
        const parseRgba = (str) => {
          const m = str.match(/rgba?\(([^)]+)\)/);
          if (!m) return null;
          const parts = m[1].split(',').map((x) => parseFloat(x.trim()));
          return [parts[0], parts[1], parts[2], parts[3] ?? 1];
        };
        const relLum = ([r, g, b]) => {
          const f = (c) => {
            const s = c / 255;
            return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
          };
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        };
        const compositeOver = (fg, bg) => {
          const a = fg[3] ?? 1;
          return [
            fg[0] * a + bg[0] * (1 - a),
            fg[1] * a + bg[1] * (1 - a),
            fg[2] * a + bg[2] * (1 - a),
            1,
          ];
        };
        const effectiveBg = (el) => {
          const stack = [];
          let cur = el;
          while (cur && cur !== document.documentElement) {
            const bg = parseRgba(getComputedStyle(cur).backgroundColor);
            if (bg && bg[3] > 0) stack.unshift(bg);
            cur = cur.parentElement;
          }
          const rootBg = t === 'dark' ? [18, 18, 21, 1] : [250, 248, 245, 1];
          return stack.reduce((acc, layer) => compositeOver(layer, acc), rootBg);
        };
        const root = document.getElementById('specimen-root');
        if (!root) return [{ selector: '#specimen-root', reason: 'missing' }];
        const isMutedEl = (el) => {
          const matched = el.closest(
            '[class*="muted"],[class*="-meta"],[class*="-sub"],[class*="-time"],[class*="-col-head"],[class*="-kv-key"],[class*="-group-title"],[class*="-pct"],[class*="-sep"],[class*="-kbd"],.yui-data-th,.yui-diff-ln',
          );
          return Boolean(matched);
        };
        const bad = [];
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let textNode;
        while ((textNode = walker.nextNode())) {
          if (!textNode.textContent || !textNode.textContent.trim()) continue;
          const el = textNode.parentElement;
          if (!el) continue;
          if (
            el.closest('[hidden], [aria-hidden="true"], [inert], .yui-disclosure:not(.is-open), svg')
          ) {
            continue;
          }
          if (el.closest(':disabled, [aria-disabled="true"]')) continue;
          const rect = el.getBoundingClientRect();
          if (rect.width < 1 || rect.height < 1) continue;
          const cs = getComputedStyle(el);
          if (cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) continue;
          const rawFg = parseRgba(cs.color);
          if (!rawFg) continue;
          const bg = effectiveBg(el);
          const fg = rawFg[3] < 1 ? compositeOver(rawFg, bg) : rawFg;
          const l1 = Math.max(relLum(fg), relLum(bg));
          const l2 = Math.min(relLum(fg), relLum(bg));
          const ratio = (l1 + 0.05) / (l2 + 0.05);
          const fontSize = parseFloat(cs.fontSize);
          const minRatio = fontSize >= 18 || isMutedEl(el) ? 3.0 : 4.5;
          if (ratio < minRatio) {
            bad.push({
              className: typeof el.className === 'string' ? el.className : el.tagName.toLowerCase(),
              ratio: Number(ratio.toFixed(2)),
              minRatio,
              text: textNode.textContent.trim().slice(0, 40),
            });
          }
        }
        return bad;
      }, activeTheme);
      if (failures.length > 0) {
        contrastReport.push({ panel: `${activeTheme}/${panelName}`, failures });
      }
    };
    const blurActive = () =>
      page.evaluate(() => {
        const ae = document.activeElement;
        if (ae && typeof ae.blur === 'function') ae.blur();
      });
    for (const theme of ['light', 'dark']) {
      await page.setViewportSize({ width: 380, height: 828 });
      for (const panel of singlePanels) {
        await page.goto(`${baseUrl}/?mode=single&theme=${theme}&panel=${panel}`, {
          waitUntil: 'networkidle',
        });
        await waitForSpecimen(`${theme}/${panel}`);

        if (panel === 'live' || panel === 'sheet' || panel === 'palette' || panel === 'drawers' || panel === 'budget') {
          await page.waitForTimeout(300);
        }

        if (
          [
            'voice',
            'templates',
            'recovery',
            'onboarding',
            'budget',
            'drawers',
            'trace',
            'diff',
            'palette',
            'data',
            'shortcuts',
            'welcome',
            'storage',
          ].includes(panel)
        ) {
          await auditPanelContrast(theme, panel);
        }

        if (panel === 'storage') {
          await page.locator('[data-slot="find-in-thread-bar"] .yui-find-case-btn').first().click();
          if (
            (await page
              .locator('[data-slot="find-in-thread-bar"] .yui-find-case-btn')
              .first()
              .getAttribute('aria-pressed')) !== 'true'
          ) {
            throw new Error(`FindInThreadBar case toggle failed (${theme})`);
          }
          await page.locator('[data-slot="find-in-thread-bar"] [aria-label="Next match"]').first().click();
          const countAfter = await page
            .locator('[data-slot="find-in-thread-bar"] .yui-find-count')
            .first()
            .textContent();
          if (countAfter !== '3 / 7') {
            throw new Error(`FindInThreadBar Next match failed (${theme}): ${countAfter}`);
          }
          await page
            .locator('[data-storage-id="vault"] .yui-storage-action-btn')
            .click();
          const vaultStatus = await page
            .locator('[data-storage-id="vault"]')
            .getAttribute('data-status');
          if (vaultStatus !== 'verified') {
            throw new Error(`StorageQuotaCard Verify SHA-256 failed (${theme}): ${vaultStatus}`);
          }
          await page
            .locator('[data-storage-id="history"] .yui-storage-clear-btn')
            .click();
          if ((await page.locator('[data-storage-id="history"]').count()) !== 0) {
            throw new Error(`StorageQuotaCard Clear row failed (${theme})`);
          }
        }

        if (panel === 'chat') {
          const fadeAtTop = await page.evaluate(() => {
            const wrap = document.querySelector('.yui-scroll-wrap');
            const stage = document.querySelector('.yui-scroll-stage');
            return {
              scrollTop: stage ? Math.round(stage.scrollTop) : -1,
              top: wrap?.getAttribute('data-fade-top'),
              bottom: wrap?.getAttribute('data-fade-bottom'),
            };
          });
          if (fadeAtTop.top !== 'false' || fadeAtTop.bottom !== 'true') {
            throw new Error(`380px chat initial fade check failed (${theme}): ${JSON.stringify(fadeAtTop)}`);
          }

          const clearance = await page.evaluate(async () => {
            const stage = document.querySelector('.yui-scroll-stage');
            if (stage) stage.scrollTop = stage.scrollHeight;
            await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
            const wrap = document.querySelector('.yui-scroll-wrap');
            const actionRow = Array.from(document.querySelectorAll('.yui-action-row')).at(-1);
            const composer = document.querySelector('.yui-composer');
            if (!stage || !actionRow || !composer) return null;
            const sr = stage.getBoundingClientRect();
            const ar = actionRow.getBoundingClientRect();
            const cr = composer.getBoundingClientRect();
            return {
              actionBottom: Math.round(ar.bottom),
              stageBottom: Math.round(sr.bottom),
              composerTop: Math.round(cr.top),
              fadeTop: wrap?.getAttribute('data-fade-top'),
              fadeBottom: wrap?.getAttribute('data-fade-bottom'),
            };
          });
          if (
            !clearance ||
            clearance.actionBottom > clearance.stageBottom + 1 ||
            clearance.actionBottom > clearance.composerTop - 12 ||
            clearance.fadeTop !== 'true' ||
            clearance.fadeBottom !== 'false'
          ) {
            throw new Error(
              `380px chat clearance/fade failed (${theme}): ${JSON.stringify(clearance)}`,
            );
          }
          // Restore scrollTop=0 for clean 380px initial-state chat screenshot
          await page.evaluate(async () => {
            const stage = document.querySelector('.yui-scroll-stage');
            if (stage) stage.scrollTop = 0;
            await new Promise((r) => requestAnimationFrame(r));
          });
        }

        const audit = await page.evaluate(() => {
          const root = document.getElementById('specimen-root');
          const inlineStyleCount = root ? root.querySelectorAll('[style]').length : -1;
          const docOverflow = document.documentElement.scrollWidth > 380;
          return { inlineStyleCount, docOverflow };
        });

        if (audit.inlineStyleCount !== 0) {
          throw new Error(
            `CSP check failed (${theme}/${panel}): found ${audit.inlineStyleCount} [style] nodes`,
          );
        }
        if (audit.docOverflow) {
          throw new Error(`Horizontal overflow detected at 380px width on ${theme}/${panel}`);
        }

        await blurActive();
        const outPath = path.join(OUT_DIR, `specimen-${theme}-${panel}.png`);
        await page.screenshot({ path: outPath, fullPage: panel === 'genui' });
        outputs.push(outPath);

        // Live interactive WAAPI & state checks (post-screenshot so baseline PNGs stay pure)
        if (panel === 'notch') {
          await page.click('.yui-notch-drawer .yui-seg-btn:nth-of-type(1)');
          await page.waitForTimeout(80);
          const maxLeft = await page.evaluate(() => {
            const thumb = document.querySelector('.yui-notch-drawer .yui-seg-thumb');
            return thumb ? thumb.getBoundingClientRect().left : -1;
          });
          await page.click('.yui-notch-drawer .yui-seg-btn:nth-of-type(3)');
          await page.waitForTimeout(360);
          const smoothResult = await page.evaluate(() => {
            const seg = document.querySelector('.yui-notch-drawer [data-slot="segmented-control"]');
            const thumb = document.querySelector('.yui-notch-drawer .yui-seg-thumb');
            const root = document.getElementById('specimen-root');
            const nonEmptyStyles = root
              ? Array.from(root.querySelectorAll('[style]')).filter(
                  (n) => (n.getAttribute('style') || '').trim().length > 0,
                )
              : [];
            return {
              mode: seg?.getAttribute('data-thumb'),
              left: thumb ? thumb.getBoundingClientRect().left : -1,
              styles: nonEmptyStyles.length,
            };
          });
          if (
            smoothResult.mode !== 'animated' ||
            smoothResult.styles !== 0 ||
            !(smoothResult.left > maxLeft + 20)
          ) {
            throw new Error(
              `SegmentedControl interactive WAAPI glide failed (${theme}): maxLeft=${maxLeft}, smooth=${JSON.stringify(smoothResult)}`,
            );
          }
        }

        if (panel === 'sheet') {
          await page.click('.yui-ctx-sheet [aria-label="Close sheet"]');
          await page.waitForTimeout(80);
          const sheetAfterClose = await page.locator('[data-slot="floating-context-sheet"]').count();
          await page.click('.yui-cite-wrap button.yui-citation-pill');
          const reopenedCount = await page.locator('.yui-cite-card').count();
          await page.click('.yui-cite-wrap button.yui-citation-pill');
          const closedCount = await page.locator('.yui-cite-card').count();
          if (sheetAfterClose !== 0 || reopenedCount !== 1 || closedCount !== 0) {
            throw new Error(
              `Sheet close / InlineCitationPopover toggle failed (${theme}): sheet=${sheetAfterClose}, reopened=${reopenedCount}, closed=${closedCount}`,
            );
          }
        }

        if (panel === 'runtime') {
          const groupCount = await page.locator('[data-slot="memory-group"]').count();
          if (groupCount !== 2) {
            throw new Error(`MemoryInspectorList sticky date groups failed (${theme}): ${groupCount}`);
          }
          await page.click('.yui-mem-filter .yui-seg-btn:nth-of-type(2)');
          await page.waitForTimeout(80);
          const profileCount = await page.locator('[data-slot="memory-record-card"]').count();
          await page.click('.yui-mem-filter .yui-seg-btn:nth-of-type(1)');
          await page.waitForTimeout(80);
          const allCount = await page.locator('[data-slot="memory-record-card"]').count();
          if (profileCount !== 1 || allCount !== 3) {
            throw new Error(
              `MemoryInspectorList filter check failed (${theme}): profile=${profileCount}, all=${allCount}`,
            );
          }
        }

        if (panel === 'settings') {
          const firstSwitch = page.locator('[data-slot="settings-toggle-row"] [role="switch"]').first();
          const beforeChecked = await firstSwitch.getAttribute('aria-checked');
          await firstSwitch.click();
          const afterChecked = await firstSwitch.getAttribute('aria-checked');
          if (beforeChecked === afterChecked) {
            throw new Error(`SettingsToggleRow click did not flip aria-checked (${theme})`);
          }

          const exportBtn = page.locator('.yui-vault-actions button:has-text("Export vault")');
          const disabledBefore = await exportBtn.isDisabled();
          await page.fill('.yui-vault-input', 'correct-horse-staple');
          const disabledAfter = await exportBtn.isDisabled();
          if (!disabledBefore || disabledAfter) {
            throw new Error(
              `LocalVaultExportCard passphrase gating failed (${theme}): before=${disabledBefore}, after=${disabledAfter}`,
            );
          }

          await page.setInputFiles('.yui-vault-file-input', {
            name: 'snapshot-backup.yvlt',
            mimeType: 'application/octet-stream',
            buffer: Buffer.from('yours-encrypted-vault'),
          });
          const dropText = await page.locator('[data-slot="vault-file-drop"]').textContent();
          if (!dropText || !dropText.includes('snapshot-backup.yvlt')) {
            throw new Error(`Vault file picker bridge failed (${theme}): dropText=${dropText}`);
          }

          await page.click('.yui-vault-danger-zone button');
          const promptVisible = await page.locator('.yui-vault-confirm-copy').isVisible();
          await page.click('.yui-vault-confirm-row button:has-text("Cancel")');
          const promptGone = (await page.locator('.yui-vault-confirm-copy').count()) === 0;
          if (!promptVisible || !promptGone) {
            throw new Error(`LocalVaultExportCard wipe confirmation flow failed (${theme})`);
          }
        }

        if (panel === 'data') {
          await page.click('[data-slot="artifact-preview-card"] button[aria-expanded]');
          await page.waitForTimeout(220);
          const collapsedFade = await page
            .locator('.yui-scroll-wrap')
            .getAttribute('data-fade-bottom');
          await page.click('[data-slot="artifact-preview-card"] button[aria-expanded]');
          await page.waitForTimeout(220);
          const expandedFade = await page
            .locator('.yui-scroll-wrap')
            .getAttribute('data-fade-bottom');
          if (collapsedFade !== 'false' || expandedFade !== 'true') {
            throw new Error(
              `SidePanelShell inner ResizeObserver fade check failed (${theme}): collapsed=${collapsedFade}, expanded=${expandedFade}`,
            );
          }

          const copyTableBtn = page.locator('[data-slot="data-table-card"] button').first();
          await copyTableBtn.click();
          const copiedText = await copyTableBtn.textContent();
          if (!copiedText || !copiedText.includes('Copied')) {
            throw new Error(`DataTableCard Copy button failed (${theme}): ${copiedText}`);
          }

          const decodeHeader = page.locator('[data-slot="data-table-card"] th:nth-of-type(4)');
          await decodeHeader.locator('button').click();
          const ascSort = await decodeHeader.getAttribute('aria-sort');
          await decodeHeader.locator('button').click();
          const descSort = await decodeHeader.getAttribute('aria-sort');
          if (ascSort !== 'ascending' || descSort !== 'descending') {
            throw new Error(`DataTableCard sort check failed (${theme}): asc=${ascSort}, desc=${descSort}`);
          }

          const headerCopy = page.locator('[data-slot="artifact-header-copy"]');
          await headerCopy.click();
          const headerCopiedText = await headerCopy.textContent();
          if (!headerCopiedText || !headerCopiedText.includes('Copied')) {
            throw new Error(`ArtifactPreviewCard header copy failed (${theme}): ${headerCopiedText}`);
          }

          const hasCapFade = await page
            .locator('[data-slot="artifact-preview-card"] .yui-artifact-scroll-wrap')
            .getAttribute('data-bottom-fade');
          if (hasCapFade !== 'true') {
            throw new Error(`Expected capped ArtifactPreviewCard bottom fade, got ${hasCapFade}`);
          }
        }

        if (panel === 'palette') {
          // Verify scrim sits strictly BEHIND .yui-cmd-panel and panel is full opacity on top
          const scrimAudit = await page.evaluate(() => {
            const panelEl = document.querySelector('.yui-cmd-panel');
            if (!panelEl) return { missing: true };
            const style = getComputedStyle(panelEl);
            const rect = panelEl.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const hitEl = document.elementFromPoint(cx, cy);
            return {
              opacity: style.opacity,
              hitInsidePanel: Boolean(hitEl && panelEl.contains(hitEl)),
              hitClass: hitEl?.className ?? null,
            };
          });
          if (
            scrimAudit.missing ||
            scrimAudit.opacity !== '1' ||
            !scrimAudit.hitInsidePanel
          ) {
            throw new Error(
              `CommandPalette scrim stacking check failed (${theme}): ${JSON.stringify(scrimAudit)}`,
            );
          }

          const paletteInput = page.locator('[data-slot="command-palette"] [role="combobox"]');
          await paletteInput.focus();
          const activeBefore = await paletteInput.getAttribute('aria-activedescendant');
          await page.keyboard.press('ArrowDown');
          const activeAfter = await paletteInput.getAttribute('aria-activedescendant');
          if (!activeBefore || !activeAfter || activeBefore === activeAfter) {
            throw new Error(
              `CommandPalette ArrowDown did not update aria-activedescendant (${theme}): ${activeBefore} -> ${activeAfter}`,
            );
          }

          // WCAG AA contrast audit across CommandPalette
          const contrastFailures = await page.evaluate(() => {
            const parseRgba = (str) => {
              const m = str.match(/rgba?\(([^)]+)\)/);
              if (!m) return null;
              const parts = m[1].split(',').map((x) => parseFloat(x.trim()));
              return [parts[0], parts[1], parts[2], parts[3] ?? 1];
            };
            const relLum = ([r, g, b]) => {
              const f = (c) => {
                const s = c / 255;
                return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
              };
              return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
            };
            const effectiveBg = (el) => {
              let cur = el;
              while (cur && cur !== document.documentElement) {
                const bg = parseRgba(getComputedStyle(cur).backgroundColor);
                if (bg && bg[3] >= 0.95) return bg;
                cur = cur.parentElement;
              }
              return [255, 255, 255, 1];
            };
            const selectors = [
              '[data-slot="command-palette"] .yui-cmd-item-label',
              '[data-slot="command-palette"] .yui-cmd-item-desc',
              '[data-slot="command-palette"] .yui-palette-group-title',
            ];
            const bad = [];
            for (const sel of selectors) {
              for (const node of document.querySelectorAll(sel)) {
                const fg = parseRgba(getComputedStyle(node).color);
                const bg = effectiveBg(node);
                if (!fg) continue;
                const l1 = Math.max(relLum(fg), relLum(bg));
                const l2 = Math.min(relLum(fg), relLum(bg));
                const ratio = (l1 + 0.05) / (l2 + 0.05);
                if (ratio < 4.5) {
                  bad.push({ sel, ratio: Number(ratio.toFixed(2)), text: node.textContent });
                }
              }
            }
            return bad;
          });
          if (contrastFailures.length > 0) {
            throw new Error(`WCAG AA contrast audit failed (${theme}/palette): ${JSON.stringify(contrastFailures)}`);
          }
        }

        if (panel === 'trace') {
          const traceContrast = await page.evaluate(() => {
            const parseRgba = (str) => {
              const m = str.match(/rgba?\(([^)]+)\)/);
              if (!m) return null;
              const parts = m[1].split(',').map((x) => parseFloat(x.trim()));
              return [parts[0], parts[1], parts[2], parts[3] ?? 1];
            };
            const relLum = ([r, g, b]) => {
              const f = (c) => {
                const s = c / 255;
                return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
              };
              return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
            };
            const effectiveBg = (el) => {
              let cur = el;
              while (cur && cur !== document.documentElement) {
                const bg = parseRgba(getComputedStyle(cur).backgroundColor);
                if (bg && bg[3] >= 0.95) return bg;
                cur = cur.parentElement;
              }
              return [255, 255, 255, 1];
            };
            const selectors = [
              '[data-slot="tool-trace-list"] .yui-trace-tool',
              '[data-slot="tool-trace-list"] .yui-trace-label',
              '[data-slot="tool-trace-list"] .yui-trace-latency',
              '[data-slot="permission-card"] .yui-perm-title',
              '[data-slot="permission-card"] .yui-perm-reason',
              '[data-slot="permission-card"] .yui-perm-meta-label',
              '[data-slot="permission-card"] .yui-perm-meta-val',
              '[data-slot="permission-card"] .yui-perm-tertiary',
            ];
            const bad = [];
            for (const sel of selectors) {
              for (const node of document.querySelectorAll(sel)) {
                const fg = parseRgba(getComputedStyle(node).color);
                const bg = effectiveBg(node);
                if (!fg) continue;
                const l1 = Math.max(relLum(fg), relLum(bg));
                const l2 = Math.min(relLum(fg), relLum(bg));
                const ratio = (l1 + 0.05) / (l2 + 0.05);
                if (ratio < 4.5) {
                  bad.push({ sel, ratio: Number(ratio.toFixed(2)), text: node.textContent });
                }
              }
            }
            return bad;
          });
          if (traceContrast.length > 0) {
            throw new Error(`WCAG AA contrast audit failed (${theme}/trace): ${JSON.stringify(traceContrast)}`);
          }

          const firstTrigger = page.locator('[data-slot="tool-trace-list"] .yui-trace-trigger').first();
          await firstTrigger.click();
          const expanded = await firstTrigger.getAttribute('aria-expanded');
          if (expanded !== 'true') {
            throw new Error(`Expected ToolTraceList step to expand on click (${theme})`);
          }
          await page.locator('[data-slot="permission-card"] .yui-pill-btn--primary').click();
          const badgeText = await page.locator('.yui-composer .yui-status-badge').textContent();
          if (!badgeText?.includes('once')) {
            throw new Error(`PermissionCard Allow once action did not update badge (${theme}): ${badgeText}`);
          }
        }

        if (panel === 'drawers') {
          const drawerContrast = await page.evaluate(() => {
            const parseRgba = (str) => {
              const m = str.match(/rgba?\(([^)]+)\)/);
              if (!m) return null;
              const parts = m[1].split(',').map((x) => parseFloat(x.trim()));
              return [parts[0], parts[1], parts[2], parts[3] ?? 1];
            };
            const relLum = ([r, g, b]) => {
              const f = (c) => {
                const s = c / 255;
                return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
              };
              return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
            };
            const effectiveBg = (el) => {
              let cur = el;
              while (cur && cur !== document.documentElement) {
                const bg = parseRgba(getComputedStyle(cur).backgroundColor);
                if (bg && bg[3] >= 0.95) return bg;
                cur = cur.parentElement;
              }
              return [255, 255, 255, 1];
            };
            const selectors = [
              '[data-slot="thread-history-list"] .yui-th-title',
              '[data-slot="thread-history-list"] .yui-th-preview',
              '[data-slot="thread-history-list"] .yui-th-meta',
              '[data-slot="model-roster-list"] .yui-model-name',
              '[data-slot="model-roster-list"] .yui-model-specs',
              '[data-slot="tab-context-list"] .yui-tabctx-domain',
              '[data-slot="tab-context-list"] .yui-tabctx-title',
              '[data-slot="tab-context-list"] .yui-tabctx-tok',
            ];
            const bad = [];
            for (const sel of selectors) {
              for (const node of document.querySelectorAll(sel)) {
                const fg = parseRgba(getComputedStyle(node).color);
                const bg = effectiveBg(node);
                if (!fg) continue;
                const l1 = Math.max(relLum(fg), relLum(bg));
                const l2 = Math.min(relLum(fg), relLum(bg));
                const ratio = (l1 + 0.05) / (l2 + 0.05);
                if (ratio < 4.5) {
                  bad.push({ sel, ratio: Number(ratio.toFixed(2)), text: node.textContent });
                }
              }
            }
            return bad;
          });
          if (drawerContrast.length > 0) {
            throw new Error(`WCAG AA contrast audit failed (${theme}/drawers): ${JSON.stringify(drawerContrast)}`);
          }

          // Interactive checks: ModelRosterList ArrowDown switches active radio, TabContextList Mute toggles, ThreadHistoryList two-step delete opens confirm
          const radios = page.locator('[data-slot="model-roster-list"] [role="radio"]');
          await radios.nth(0).focus();
          await page.keyboard.press('ArrowDown');
          const secondChecked = await radios.nth(1).getAttribute('aria-checked');
          if (secondChecked !== 'true') {
            throw new Error(`ModelRosterList ArrowDown did not check second radio (${theme}): ${secondChecked}`);
          }
          const muteBtn = page.locator('[data-slot="tab-context-list"] .yui-tabctx-mute-btn').first();
          await muteBtn.click();
          if ((await muteBtn.getAttribute('aria-pressed')) !== 'true') {
            throw new Error(`TabContextList mute button did not toggle aria-pressed (${theme})`);
          }
          const delInit = page.locator('[data-slot="thread-history-list"] [aria-label^="Delete "]').first();
          await delInit.click();
          if ((await page.locator('[data-slot="thread-history-list"] .yui-th-confirm-btn').count()) !== 1) {
            throw new Error(`ThreadHistoryList delete did not show two-step confirmation (${theme})`);
          }
        }

        if (panel === 'shortcuts') {
          // Open TopNotch drawer -> veilOpen=true, verify StatusToast Undo & Dismiss hit-tests resolve above .yui-veil
          await page.locator('.yui-notch-btn').nth(1).click();
          await page.waitForTimeout(160);
          const toastHitAudit = await page.evaluate(() => {
            const veil = document.querySelector('.yui-veil.is-open');
            const toast = document.querySelector('[data-slot="status-toast"]');
            if (!veil || !toast) return { missing: true, hasVeil: Boolean(veil), hasToast: Boolean(toast) };
            const undoBtn = Array.from(toast.querySelectorAll('button')).find((b) =>
              b.textContent?.includes('Undo'),
            );
            const dismissBtn = toast.querySelector('[aria-label="Dismiss notification"]');
            if (!undoBtn || !dismissBtn) return { missingBtn: true };
            const uRect = undoBtn.getBoundingClientRect();
            const dRect = dismissBtn.getBoundingClientRect();
            const uHit = document.elementFromPoint(uRect.left + uRect.width / 2, uRect.top + uRect.height / 2);
            const dHit = document.elementFromPoint(dRect.left + dRect.width / 2, dRect.top + dRect.height / 2);
            return {
              undoInsideToast: Boolean(uHit && toast.contains(uHit)),
              dismissInsideToast: Boolean(dHit && toast.contains(dHit)),
            };
          });
          if (
            toastHitAudit.missing ||
            toastHitAudit.missingBtn ||
            !toastHitAudit.undoInsideToast ||
            !toastHitAudit.dismissInsideToast
          ) {
            throw new Error(
              `StatusToast over veil hit-test failed (${theme}): ${JSON.stringify(toastHitAudit)}`,
            );
          }
          await page.locator('[data-slot="status-toast"] [aria-label="Dismiss notification"]').click();
          if ((await page.locator('[data-slot="status-toast"]').count()) !== 0) {
            throw new Error(`StatusToast did not dismiss over veil (${theme})`);
          }
        }

        if (panel === 'onboarding') {
          const onbContrast = await page.evaluate(() => {
            const parseRgba = (str) => {
              const m = str.match(/rgba?\(([^)]+)\)/);
              if (!m) return null;
              const parts = m[1].split(',').map((x) => parseFloat(x.trim()));
              return [parts[0], parts[1], parts[2], parts[3] ?? 1];
            };
            const relLum = ([r, g, b]) => {
              const f = (c) => {
                const s = c / 255;
                return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
              };
              return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
            };
            const effectiveBg = (el) => {
              let cur = el;
              while (cur && cur !== document.documentElement) {
                const bg = parseRgba(getComputedStyle(cur).backgroundColor);
                if (bg && bg[3] >= 0.95) return bg;
                cur = cur.parentElement;
              }
              return [255, 255, 255, 1];
            };
            const selectors = [
              '[data-slot="onboarding-card"] .yui-onb-title',
              '[data-slot="onboarding-card"] .yui-onb-sub',
              '[data-slot="onboarding-card"] .yui-onb-ckpt-label',
              '[data-slot="onboarding-card"] .yui-onb-cache',
              '[data-slot="onboarding-card"] .yui-onb-privacy',
              '[data-slot="code-block-card"] .yui-codecard-title',
              '[data-slot="code-block-card"] .yui-codecard-lang',
              '[data-slot="code-block-card"] .yui-sr-code-copy',
            ];
            const bad = [];
            for (const sel of selectors) {
              for (const node of document.querySelectorAll(sel)) {
                const fg = parseRgba(getComputedStyle(node).color);
                const bg = effectiveBg(node);
                if (!fg) continue;
                const l1 = Math.max(relLum(fg), relLum(bg));
                const l2 = Math.min(relLum(fg), relLum(bg));
                const ratio = (l1 + 0.05) / (l2 + 0.05);
                if (ratio < 4.5) {
                  bad.push({ sel, ratio: Number(ratio.toFixed(2)), text: node.textContent });
                }
              }
            }
            return bad;
          });
          if (onbContrast.length > 0) {
            throw new Error(`WCAG AA contrast audit failed (${theme}/onboarding): ${JSON.stringify(onbContrast)}`);
          }
          await page.locator('[data-slot="code-block-card"] .yui-sr-code-copy').click();
          await page.locator('[data-slot="onboarding-card"] .yui-onb-cta').click();
          const onbBadge = await page.locator('.yui-composer .yui-status-badge').textContent();
          if (!onbBadge?.includes('warm')) {
            throw new Error(`OnboardingCard initialize click did not update badge (${theme}): ${onbBadge}`);
          }
        }

        if (panel === 'recovery') {
          const recContrast = await page.evaluate(() => {
            const parseRgba = (str) => {
              const m = str.match(/rgba?\(([^)]+)\)/);
              if (!m) return null;
              const parts = m[1].split(',').map((x) => parseFloat(x.trim()));
              return [parts[0], parts[1], parts[2], parts[3] ?? 1];
            };
            const relLum = ([r, g, b]) => {
              const f = (c) => {
                const s = c / 255;
                return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
              };
              return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
            };
            const compositeOver = (fg, bg) => {
              const a = fg[3] ?? 1;
              return [
                fg[0] * a + bg[0] * (1 - a),
                fg[1] * a + bg[1] * (1 - a),
                fg[2] * a + bg[2] * (1 - a),
                1,
              ];
            };
            const effectiveBg = (el) => {
              const stack = [];
              let cur = el;
              while (cur && cur !== document.documentElement) {
                const bg = parseRgba(getComputedStyle(cur).backgroundColor);
                if (bg && bg[3] > 0) stack.unshift(bg);
                cur = cur.parentElement;
              }
              return stack.reduce((acc, layer) => compositeOver(layer, acc), [255, 255, 255, 1]);
            };
            const selectors = [
              '[data-slot="error-recovery-card"] .yui-recovery-badge',
              '[data-slot="error-recovery-card"] .yui-recovery-title',
              '[data-slot="error-recovery-card"] .yui-recovery-diagnosis',
              '[data-slot="error-recovery-card"] .yui-recovery-toggle',
              '[data-slot="inline-notice"] .yui-notice-text',
              '[data-slot="inline-notice"] .yui-notice-action',
            ];
            const bad = [];
            for (const sel of selectors) {
              for (const node of document.querySelectorAll(sel)) {
                const fg = parseRgba(getComputedStyle(node).color);
                const bg = effectiveBg(node);
                if (!fg) continue;
                const l1 = Math.max(relLum(fg), relLum(bg));
                const l2 = Math.min(relLum(fg), relLum(bg));
                const ratio = (l1 + 0.05) / (l2 + 0.05);
                if (ratio < 4.5) {
                  bad.push({ sel, ratio: Number(ratio.toFixed(2)), text: node.textContent });
                }
              }
            }
            return bad;
          });
          if (recContrast.length > 0) {
            throw new Error(`WCAG AA contrast audit failed (${theme}/recovery): ${JSON.stringify(recContrast)}`);
          }
          const toggleBtn = page.locator('[data-slot="error-recovery-card"] .yui-recovery-toggle');
          await toggleBtn.click();
          if ((await toggleBtn.getAttribute('aria-expanded')) !== 'true') {
            throw new Error(`ErrorRecoveryCard trace toggle failed (${theme})`);
          }
          await page.locator('[data-slot="error-recovery-card"] .yui-recovery-copy').click();
          const copyText = await page.locator('[data-slot="error-recovery-card"] .yui-recovery-copy').textContent();
          if (!copyText?.includes('Copied')) {
            throw new Error(`ErrorRecoveryCard copy diagnostics failed (${theme}): ${copyText}`);
          }
          await page.locator('[data-slot="error-recovery-card"] .yui-recovery-retry').click();
          const recBadge = await page.locator('.yui-composer .yui-status-badge').textContent();
          if (!recBadge?.includes('Retry queued')) {
            throw new Error(`ErrorRecoveryCard retry click did not update badge (${theme}): ${recBadge}`);
          }
          await page.locator('[data-slot="inline-notice"] .yui-notice-action').first().click();
        }

        if (panel === 'voice') {
          const voiceContrast = await page.evaluate(() => {
            const parseRgba = (str) => {
              const m = str.match(/rgba?\(([^)]+)\)/);
              if (!m) return null;
              const parts = m[1].split(',').map((x) => parseFloat(x.trim()));
              return [parts[0], parts[1], parts[2], parts[3] ?? 1];
            };
            const relLum = ([r, g, b]) => {
              const f = (c) => {
                const s = c / 255;
                return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
              };
              return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
            };
            const compositeOver = (fg, bg) => {
              const a = fg[3] ?? 1;
              return [
                fg[0] * a + bg[0] * (1 - a),
                fg[1] * a + bg[1] * (1 - a),
                fg[2] * a + bg[2] * (1 - a),
                1,
              ];
            };
            const effectiveBg = (el) => {
              const stack = [];
              let cur = el;
              while (cur && cur !== document.documentElement) {
                const bg = parseRgba(getComputedStyle(cur).backgroundColor);
                if (bg && bg[3] > 0) stack.unshift(bg);
                cur = cur.parentElement;
              }
              return stack.reduce((acc, layer) => compositeOver(layer, acc), [255, 255, 255, 1]);
            };
            const selectors = [
              '[data-slot="voice-session-card"] .yui-voice-card-title',
              '[data-slot="voice-session-card"] .yui-voice-committed',
              '[data-slot="voice-session-card"] .yui-voice-interim',
              '[data-slot="voice-session-card"] .yui-voice-privacy',
              '.yui-composer-cmd-btn',
              '.yui-composer-usage',
            ];
            const bad = [];
            for (const sel of selectors) {
              for (const node of document.querySelectorAll(sel)) {
                const fg = parseRgba(getComputedStyle(node).color);
                const bg = effectiveBg(node);
                if (!fg) continue;
                const l1 = Math.max(relLum(fg), relLum(bg));
                const l2 = Math.min(relLum(fg), relLum(bg));
                const ratio = (l1 + 0.05) / (l2 + 0.05);
                if (ratio < 4.5) {
                  bad.push({ sel, ratio: Number(ratio.toFixed(2)), text: node.textContent });
                }
              }
            }
            return bad;
          });
          if (voiceContrast.length > 0) {
            throw new Error(`WCAG AA contrast audit failed (${theme}/voice): ${JSON.stringify(voiceContrast)}`);
          }
          await page.locator('[data-slot="voice-session-card"] .yui-voice-mute-pill').click();
          const mutedState = await page
            .locator('[data-slot="voice-session-card"] [data-slot="audio-level-meter"]')
            .getAttribute('data-tone');
          if (mutedState !== 'muted') {
            throw new Error(`VoiceSessionCard mute toggle failed (${theme}): ${mutedState}`);
          }
          await page.locator('.yui-composer-cmd-btn').click();
          const cmdBadge = await page.locator('.yui-composer .yui-status-badge').textContent();
          if (!cmdBadge?.includes('Commands open')) {
            throw new Error(`FloatingComposer slash trigger click failed (${theme}): ${cmdBadge}`);
          }
        }

        if (panel === 'templates') {
          const tplContrast = await page.evaluate(() => {
            const parseRgba = (str) => {
              const m = str.match(/rgba?\(([^)]+)\)/);
              if (!m) return null;
              const parts = m[1].split(',').map((x) => parseFloat(x.trim()));
              return [parts[0], parts[1], parts[2], parts[3] ?? 1];
            };
            const relLum = ([r, g, b]) => {
              const f = (c) => {
                const s = c / 255;
                return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
              };
              return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
            };
            const compositeOver = (fg, bg) => {
              const a = fg[3] ?? 1;
              return [
                fg[0] * a + bg[0] * (1 - a),
                fg[1] * a + bg[1] * (1 - a),
                fg[2] * a + bg[2] * (1 - a),
                1,
              ];
            };
            const effectiveBg = (el) => {
              const stack = [];
              let cur = el;
              while (cur && cur !== document.documentElement) {
                const bg = parseRgba(getComputedStyle(cur).backgroundColor);
                if (bg && bg[3] > 0) stack.unshift(bg);
                cur = cur.parentElement;
              }
              return stack.reduce((acc, layer) => compositeOver(layer, acc), [255, 255, 255, 1]);
            };
            const selectors = [
              '[data-slot="prompt-template-list"] .yui-ptl-title',
              '[data-slot="prompt-template-list"] .yui-ptl-cmd',
              '[data-slot="prompt-template-list"] .yui-ptl-item-title',
              '[data-slot="prompt-template-list"] .yui-ptl-desc',
              '[data-slot="export-session-card"] .yui-export-title',
              '[data-slot="export-session-card"] .yui-export-sub',
              '[data-slot="export-session-card"] .yui-export-toggle-label',
              '[data-slot="export-session-card"] .yui-export-privacy',
            ];
            const bad = [];
            for (const sel of selectors) {
              for (const node of document.querySelectorAll(sel)) {
                const fg = parseRgba(getComputedStyle(node).color);
                const bg = effectiveBg(node);
                if (!fg) continue;
                const l1 = Math.max(relLum(fg), relLum(bg));
                const l2 = Math.min(relLum(fg), relLum(bg));
                const ratio = (l1 + 0.05) / (l2 + 0.05);
                if (ratio < 4.5) {
                  bad.push({ sel, ratio: Number(ratio.toFixed(2)), text: node.textContent });
                }
              }
            }
            return bad;
          });
          if (tplContrast.length > 0) {
            throw new Error(`WCAG AA contrast audit failed (${theme}/templates): ${JSON.stringify(tplContrast)}`);
          }
          await page.locator('[data-slot="prompt-template-list"] .yui-ptl-main').first().click();
          const tplBadge = await page.locator('.yui-composer .yui-status-badge').textContent();
          if (!tplBadge?.includes('Template loaded')) {
            throw new Error(`PromptTemplateList click did not update badge (${theme}): ${tplBadge}`);
          }
          await page.locator('[data-slot="export-session-card"] [role="switch"]').first().click();
          await page.locator('[data-slot="export-session-card"] .yui-export-copy-btn').click();
          const expCopy = await page.locator('[data-slot="export-session-card"] .yui-export-copy-btn').textContent();
          if (!expCopy?.includes('Copied')) {
            throw new Error(`ExportSessionCard copy failed (${theme}): ${expCopy}`);
          }
        }

        if (panel === 'genui') {
          const genuiAudit = await page.evaluate((activeTheme) => {
            const parseRgba = (str) => {
              const m = str.match(/rgba?\(([^)]+)\)/);
              if (!m) return null;
              const parts = m[1].split(',').map((x) => parseFloat(x.trim()));
              return [parts[0], parts[1], parts[2], parts[3] ?? 1];
            };
            const relLum = ([r, g, b]) => {
              const f = (c) => {
                const s = c / 255;
                return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
              };
              return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
            };
            const compositeOver = (fg, bg) => {
              const a = fg[3] ?? 1;
              return [
                fg[0] * a + bg[0] * (1 - a),
                fg[1] * a + bg[1] * (1 - a),
                fg[2] * a + bg[2] * (1 - a),
                1,
              ];
            };
            const effectiveBg = (el) => {
              const stack = [];
              let cur = el;
              while (cur && cur !== document.documentElement) {
                const bg = parseRgba(getComputedStyle(cur).backgroundColor);
                if (bg && bg[3] > 0) stack.unshift(bg);
                cur = cur.parentElement;
              }
              const rootBg = activeTheme === 'dark' ? [18, 18, 21, 1] : [250, 248, 245, 1];
              return stack.reduce((acc, layer) => compositeOver(layer, acc), rootBg);
            };
            const bodySelectors = [
              '[data-slot="timeline-card"] .yui-genui-title',
              '[data-slot="timeline-card"] .yui-tl-label',
              '[data-slot="timeline-card"] .yui-tl-detail',
              '[data-slot="quote-excerpt-card"] .yui-genui-title',
              '[data-slot="quote-excerpt-card"] .yui-qec-quote',
              '[data-slot="quote-excerpt-card"] .yui-qec-locator',
              '.yui-genui-card .yui-genui-title',
              '.yui-genui-card .yui-table-cell-val',
              '.yui-genui-card .yui-table-cell-label',
              '.yui-genui-card .yui-table-row.is-emphasized .yui-table-cell-val',
              '.yui-genui-card .yui-check-item-text',
              '.yui-genui-card .yui-metric-primary',
              '.yui-genui-card .yui-delta-pill',
              '.yui-genui-card .yui-brief-list li',
              '.yui-genui-card .yui-draft-well',
              '.yui-genui-card .yui-entity-val',
              '.yui-genui-card .yui-prompt-capsule-title',
              '.yui-genui-card .yui-kv-val',
              '.yui-genui-card .yui-micro-pill',
              '.yui-genui-card .yui-pill-btn',
            ];
            const mutedSelectors = [
              '.yui-genui-card .yui-genui-muted',
              '.yui-genui-card .yui-table-col-head',
              '.yui-genui-card .yui-kv-key',
              '[data-slot="timeline-card"] .yui-tl-time',
            ];
            const cardCount = document.querySelectorAll('.yui-genui-card').length;
            const bad = [];
            const missing = [];
            const check = (selectors, minRatio) => {
              for (const sel of selectors) {
                const nodes = document.querySelectorAll(sel);
                if (nodes.length === 0) {
                  missing.push(sel);
                  continue;
                }
                for (const node of nodes) {
                  const bg = effectiveBg(node);
                  const rawFg = parseRgba(getComputedStyle(node).color);
                  if (!rawFg) continue;
                  const fg = rawFg[3] < 1 ? compositeOver(rawFg, bg) : rawFg;
                  const l1 = Math.max(relLum(fg), relLum(bg));
                  const l2 = Math.min(relLum(fg), relLum(bg));
                  const ratio = (l1 + 0.05) / (l2 + 0.05);
                  if (ratio < minRatio) {
                    bad.push({ sel, ratio: Number(ratio.toFixed(2)), minRatio, text: (node.textContent ?? '').slice(0, 48) });
                  }
                }
              }
            };
            check(bodySelectors, 4.5);
            check(mutedSelectors, 3.0);
            return { cardCount, missing, bad };
          }, theme);
          if (genuiAudit.cardCount < 10 || genuiAudit.missing.length > 0 || genuiAudit.bad.length > 0) {
            throw new Error(`GenUI WCAG AA contrast audit failed (${theme}): ${JSON.stringify(genuiAudit)}`);
          }
        }

        if (panel === 'budget') {
          const budgetContrast = await page.evaluate(() => {
            const parseRgba = (str) => {
              const m = str.match(/rgba?\(([^)]+)\)/);
              if (!m) return null;
              const parts = m[1].split(',').map((x) => parseFloat(x.trim()));
              return [parts[0], parts[1], parts[2], parts[3] ?? 1];
            };
            const relLum = ([r, g, b]) => {
              const f = (c) => {
                const s = c / 255;
                return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
              };
              return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
            };
            const effectiveBg = (el) => {
              let cur = el;
              while (cur && cur !== document.documentElement) {
                const bg = parseRgba(getComputedStyle(cur).backgroundColor);
                if (bg && bg[3] >= 0.95) return bg;
                cur = cur.parentElement;
              }
              return [255, 255, 255, 1];
            };
            const selectors = [
              '[data-slot="context-budget-meter"] .yui-budget-title',
              '[data-slot="context-budget-meter"] .yui-budget-summary',
              '[data-slot="context-budget-meter"] .yui-budget-seg-label',
              '[data-slot="context-budget-meter"] .yui-budget-seg-tok',
              '[data-slot="citation-footnote-list"] .yui-fn-title',
              '[data-slot="citation-footnote-list"] .yui-fn-meta',
              '[data-slot="citation-footnote-list"] .yui-fn-quote',
              '[data-slot="citation-footnote-list"] .yui-fn-btn',
            ];
            const bad = [];
            for (const sel of selectors) {
              for (const node of document.querySelectorAll(sel)) {
                const fg = parseRgba(getComputedStyle(node).color);
                const bg = effectiveBg(node);
                if (!fg) continue;
                const l1 = Math.max(relLum(fg), relLum(bg));
                const l2 = Math.min(relLum(fg), relLum(bg));
                const ratio = (l1 + 0.05) / (l2 + 0.05);
                if (ratio < 4.5) {
                  bad.push({ sel, ratio: Number(ratio.toFixed(2)), text: node.textContent });
                }
              }
            }
            return bad;
          });
          if (budgetContrast.length > 0) {
            throw new Error(`WCAG AA contrast audit failed (${theme}/budget): ${JSON.stringify(budgetContrast)}`);
          }
          const toggle = page.locator('[data-slot="context-budget-meter"] .yui-budget-toggle').first();
          await toggle.click();
          if ((await toggle.getAttribute('aria-expanded')) !== 'false') {
            throw new Error(`Expected ContextBudgetMeter breakdown to collapse on toggle (${theme})`);
          }
          await page.locator('[data-slot="citation-footnote-list"] [aria-label="Copy quote 1"]').click();
        }

        if (panel === 'diff') {
          const capFade = await page
            .locator('[data-slot="artifact-preview-card"] .yui-artifact-scroll-wrap')
            .getAttribute('data-bottom-fade');
          if (capFade !== 'true') {
            throw new Error(`Expected capped ArtifactPreviewCard fade on diff panel (${theme}), got ${capFade}`);
          }
        }

        // Capture TopNotch intermediate hover-grow (272px x 52px) state directly over resting
        if (panel === 'resting') {
          await page.hover('.yui-notch-assembly');
          await page.waitForTimeout(400);
          const notchRect = await page.evaluate(() => {
            const box = document.querySelector('.yui-notch-housing')?.getBoundingClientRect();
            return box ? { width: Math.round(box.width), height: Math.round(box.height) } : null;
          });
          hoverGeometry = notchRect;
          if (!notchRect || notchRect.width < 260 || notchRect.height < 48) {
            throw new Error(
              `TopNotch hover-grow did not reach 272x52 geometry (${JSON.stringify(notchRect)})`,
            );
          }
          const hoverPath = path.join(OUT_DIR, `specimen-${theme}-notch-hover.png`);
          await page.screenshot({ path: hoverPath });
          outputs.push(hoverPath);
        }
      }

      // 400px width verification across key panels + reduced-motion audit
      await page.setViewportSize({ width: 400, height: 828 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      for (const widePanel of ['chat', 'data', 'shortcuts', 'welcome', 'palette', 'diff', 'trace', 'drawers', 'budget', 'onboarding', 'recovery', 'voice', 'templates', 'genui', 'storage']) {
        await page.goto(`${baseUrl}/?mode=single&theme=${theme}&panel=${widePanel}&width=400`, {
          waitUntil: 'networkidle',
        });
        await waitForSpecimen(`400/${theme}/${widePanel}`);
        const wideAudit = await page.evaluate(() => {
          const root = document.getElementById('specimen-root');
          const inlineStyleCount = root ? root.querySelectorAll('[style]').length : -1;
          const docOverflow = document.documentElement.scrollWidth > 400;
          return { inlineStyleCount, docOverflow };
        });
        if (wideAudit.inlineStyleCount !== 0 || wideAudit.docOverflow) {
          throw new Error(`400px ${widePanel} check failed (${theme}): ${JSON.stringify(wideAudit)}`);
        }
        await blurActive();
        const widePath = path.join(OUT_DIR, `specimen-${theme}-${widePanel}-400.png`);
        await page.screenshot({ path: widePath, fullPage: widePanel === 'genui' });
        outputs.push(widePath);
      }
      await page.emulateMedia({ reducedMotion: 'no-preference' });

      // Narrow 340px stress pass across interactive & dense panels
      await page.setViewportSize({ width: 340, height: 828 });
      for (const narrowPanel of [
        'resting',
        'live',
        'chat',
        'sheet',
        'runtime',
        'settings',
        'data',
        'shortcuts',
        'welcome',
        'palette',
        'diff',
        'trace',
        'drawers',
        'budget',
        'onboarding',
        'recovery',
        'voice',
        'templates',
        'genui',
        'storage',
      ]) {
        await page.goto(`${baseUrl}/?mode=single&theme=${theme}&panel=${narrowPanel}&narrow=1`, {
          waitUntil: 'networkidle',
        });
        await waitForSpecimen(`340/${theme}/${narrowPanel}`);

        if (narrowPanel === 'chat') {
          await page.evaluate(() => {
            const stage = document.querySelector('.yui-scroll-stage');
            if (stage) stage.scrollTop = stage.scrollHeight;
          });
          await page.waitForTimeout(260);
          const narrowClearance = await page.evaluate(async () => {
            const stage = document.querySelector('.yui-scroll-stage');
            const wrap = document.querySelector('.yui-scroll-wrap--fade');
            const notch = document.querySelector('.yui-notch-housing');
            await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
            const actionRow = Array.from(document.querySelectorAll('.yui-action-row')).at(-1);
            const composer = document.querySelector('.yui-composer');
            if (!stage || !wrap || !notch || !actionRow || !composer) return null;
            const sr = stage.getBoundingClientRect();
            const nr = notch.getBoundingClientRect();
            const ar = actionRow.getBoundingClientRect();
            const cr = composer.getBoundingClientRect();
            const beforeStyle = getComputedStyle(wrap, '::before');
            return {
              actionBottom: Math.round(ar.bottom),
              stageBottom: Math.round(sr.bottom),
              composerTop: Math.round(cr.top),
              fadeTop: wrap.getAttribute('data-fade-top'),
              beforeOpacity: Number(parseFloat(beforeStyle.opacity).toFixed(2)),
              beforeHeight: Math.round(parseFloat(beforeStyle.height)),
              notchBottom: Math.round(nr.bottom),
              solidCapClearance: Math.round(parseFloat(beforeStyle.height) * 0.52),
            };
          });
          if (
            !narrowClearance ||
            narrowClearance.actionBottom > narrowClearance.stageBottom + 1 ||
            narrowClearance.actionBottom > narrowClearance.composerTop - 12 ||
            narrowClearance.fadeTop !== 'true' ||
            narrowClearance.beforeOpacity < 0.99 ||
            narrowClearance.beforeHeight < 80 ||
            narrowClearance.solidCapClearance < narrowClearance.notchBottom - 12
          ) {
            throw new Error(
              `340px narrow chat clearance/top-cap failed (${theme}): ${JSON.stringify(narrowClearance)}`,
            );
          }
        }

        if (narrowPanel === 'runtime') {
          const runtimeBounds = await page.evaluate(() => {
            const selectors = [
              '[data-slot="hardware-status-strip"]',
              '[data-slot="model-download-progress-bar"]',
              '[data-slot="voice-session-bar"]',
              '[data-slot="memory-inspector-list"]',
            ];
            return selectors.map((selector) => {
              const el = document.querySelector(selector);
              if (!el) return { selector, missing: true };
              const rect = el.getBoundingClientRect();
              return {
                selector,
                right: Math.round(rect.right),
                scrollOverflow: el.scrollWidth > el.clientWidth + 1,
              };
            });
          });
          const bad = runtimeBounds.find((b) => b.missing || b.right > 332 || b.scrollOverflow);
          if (bad) {
            throw new Error(`340px runtime bounds failed (${theme}): ${JSON.stringify(runtimeBounds)}`);
          }
        }

        const narrowAudit = await page.evaluate(() => {
          const root = document.getElementById('specimen-root');
          const inlineStyleCount = root ? root.querySelectorAll('[style]').length : -1;
          const docOverflow = document.documentElement.scrollWidth > 340;
          return { inlineStyleCount, docOverflow };
        });
        if (narrowAudit.inlineStyleCount !== 0 || narrowAudit.docOverflow) {
          throw new Error(
            `340px narrow check failed (${theme}/${narrowPanel}): ${JSON.stringify(narrowAudit)}`,
          );
        }
        await blurActive();
        if (narrowPanel === 'chat') {
          const narrowPath = path.join(OUT_DIR, `specimen-${theme}-narrow340.png`);
          await page.screenshot({ path: narrowPath });
          outputs.push(narrowPath);
        }
        if (narrowPanel === 'runtime') {
          const runtimeNarrowPath = path.join(OUT_DIR, `specimen-${theme}-runtime-narrow340.png`);
          await page.screenshot({ path: runtimeNarrowPath });
          outputs.push(runtimeNarrowPath);
        }
        if (narrowPanel === 'data') {
          const tableRightFade = await page
            .locator('[data-slot="data-table-card"] .yui-data-scroll-wrap')
            .getAttribute('data-scrollable-right');
          if (tableRightFade !== 'true') {
            throw new Error(
              `Expected DataTableCard horizontal scroll fade at 340px (${theme}), got ${tableRightFade}`,
            );
          }
          const dataNarrowPath = path.join(OUT_DIR, `specimen-${theme}-data-340.png`);
          await page.screenshot({ path: dataNarrowPath });
          outputs.push(dataNarrowPath);
        }
        if (narrowPanel === 'shortcuts') {
          const shortcutsNarrowPath = path.join(OUT_DIR, `specimen-${theme}-shortcuts-340.png`);
          await page.screenshot({ path: shortcutsNarrowPath });
          outputs.push(shortcutsNarrowPath);
        }
        if (narrowPanel === 'welcome') {
          const welcomeNarrowPath = path.join(OUT_DIR, `specimen-${theme}-welcome-340.png`);
          await page.screenshot({ path: welcomeNarrowPath });
          outputs.push(welcomeNarrowPath);
        }
        if (narrowPanel === 'palette') {
          const paletteNarrowPath = path.join(OUT_DIR, `specimen-${theme}-palette-340.png`);
          await page.screenshot({ path: paletteNarrowPath });
          outputs.push(paletteNarrowPath);
        }
        if (narrowPanel === 'diff') {
          const diffScrollFade = await page
            .locator('[data-slot="diff-card"] .yui-data-scroll-wrap')
            .getAttribute('data-scrollable-right');
          if (diffScrollFade !== 'true') {
            throw new Error(`Expected DiffCard horizontal scroll fade at 340px (${theme}), got ${diffScrollFade}`);
          }
          const diffNarrowPath = path.join(OUT_DIR, `specimen-${theme}-diff-340.png`);
          await page.screenshot({ path: diffNarrowPath });
          outputs.push(diffNarrowPath);
        }
        if (narrowPanel === 'trace') {
          const permAlign = await page.evaluate(() => {
            const vals = Array.from(document.querySelectorAll('[data-slot="permission-card"] .yui-perm-meta-val'));
            if (vals.length < 2) return null;
            const dLeft = Math.round(vals[0].getBoundingClientRect().left);
            const sLeft = Math.round(vals[1].getBoundingClientRect().left);
            return { dLeft, sLeft, delta: Math.abs(dLeft - sLeft) };
          });
          if (!permAlign || permAlign.delta > 2) {
            throw new Error(`PermissionCard 340px DOMAIN/SCOPE alignment failed (${theme}): ${JSON.stringify(permAlign)}`);
          }
          const traceNarrowPath = path.join(OUT_DIR, `specimen-${theme}-trace-340.png`);
          await page.screenshot({ path: traceNarrowPath });
          outputs.push(traceNarrowPath);
        }
        if (narrowPanel === 'drawers') {
          const drawer340Audit = await page.evaluate(() => {
            const specVals = Array.from(
              document.querySelectorAll('[data-slot="model-roster-list"] .yui-model-spec-token'),
            );
            const clippedSpec = specVals.find((el) => el.scrollWidth > el.clientWidth + 1);
            const visibleSeps = Array.from(
              document.querySelectorAll('[data-slot="model-roster-list"] .yui-model-spec-sep'),
            ).filter((sep) => getComputedStyle(sep).display !== 'none').length;
            const tabSepCount = document.querySelectorAll(
              '[data-slot="tab-context-list"] .yui-tabctx-sep',
            ).length;
            const snippetDomain = Array.from(
              document.querySelectorAll('[data-slot="tab-context-list"] .yui-tabctx-domain'),
            ).at(-1);
            const snippetDomainClipped = snippetDomain
              ? snippetDomain.scrollWidth > snippetDomain.clientWidth + 1
              : true;
            const tabTokInDomain = document.querySelectorAll(
              '[data-slot="tab-context-list"] .yui-tabctx-domain-row .yui-tabctx-tok',
            ).length;
            const firstTitle = document.querySelector('[data-slot="tab-context-list"] .yui-tabctx-title');
            const titleWidth = firstTitle ? Math.round(firstTitle.getBoundingClientRect().width) : 0;
            return {
              clippedText: clippedSpec ? clippedSpec.textContent : null,
              visibleSeps,
              tabSepCount,
              snippetDomainClipped,
              tabTokInDomain,
              titleWidth,
            };
          });
          if (
            drawer340Audit.clippedText ||
            drawer340Audit.visibleSeps !== 0 ||
            drawer340Audit.tabSepCount !== 0 ||
            drawer340Audit.snippetDomainClipped ||
            drawer340Audit.tabTokInDomain < 3 ||
            drawer340Audit.titleWidth < 130
          ) {
            throw new Error(`340px drawers legibility audit failed (${theme}): ${JSON.stringify(drawer340Audit)}`);
          }
          const drawersNarrowPath = path.join(OUT_DIR, `specimen-${theme}-drawers-340.png`);
          await page.screenshot({ path: drawersNarrowPath });
          outputs.push(drawersNarrowPath);
        }
        if (narrowPanel === 'budget') {
          const budgetNarrowPath = path.join(OUT_DIR, `specimen-${theme}-budget-340.png`);
          await page.screenshot({ path: budgetNarrowPath });
          outputs.push(budgetNarrowPath);
        }
        if (narrowPanel === 'onboarding') {
          const codeFade = await page
            .locator('[data-slot="code-block-card"] .yui-data-scroll-wrap')
            .getAttribute('data-scrollable-right');
          if (codeFade !== 'true') {
            throw new Error(`Expected CodeBlockCard horizontal scroll fade at 340px (${theme}), got ${codeFade}`);
          }
          const onbNarrowPath = path.join(OUT_DIR, `specimen-${theme}-onboarding-340.png`);
          await page.screenshot({ path: onbNarrowPath });
          outputs.push(onbNarrowPath);
        }
        if (narrowPanel === 'recovery') {
          const recNarrowPath = path.join(OUT_DIR, `specimen-${theme}-recovery-340.png`);
          await page.screenshot({ path: recNarrowPath });
          outputs.push(recNarrowPath);
        }
        if (narrowPanel === 'voice') {
          const voiceControlsCheck = await page.evaluate(() => {
            const btns = Array.from(
              document.querySelectorAll('[data-slot="voice-session-card"] .yui-voice-card-btns button'),
            );
            const tops = btns.map((b) => Math.round(b.getBoundingClientRect().top));
            const uniqueRows = new Set(tops).size;
            return { count: btns.length, uniqueRows };
          });
          if (voiceControlsCheck.count !== 3 || voiceControlsCheck.uniqueRows !== 1) {
            throw new Error(`Expected VoiceSessionCard 3 primary controls on 1 row at 340px (${theme}): ${JSON.stringify(voiceControlsCheck)}`);
          }
          const voiceNarrowPath = path.join(OUT_DIR, `specimen-${theme}-voice-340.png`);
          await page.screenshot({ path: voiceNarrowPath });
          outputs.push(voiceNarrowPath);
        }
        if (narrowPanel === 'templates') {
          const tplNarrowPath = path.join(OUT_DIR, `specimen-${theme}-templates-340.png`);
          await page.screenshot({ path: tplNarrowPath });
          outputs.push(tplNarrowPath);
        }
        if (narrowPanel === 'genui') {
          const genuiNarrowPath = path.join(OUT_DIR, `specimen-${theme}-genui-340.png`);
          await page.screenshot({ path: genuiNarrowPath, fullPage: true });
          outputs.push(genuiNarrowPath);
        }
        if (narrowPanel === 'storage') {
          const storageNarrowPath = path.join(OUT_DIR, `specimen-${theme}-storage-340.png`);
          await page.screenshot({ path: storageNarrowPath });
          outputs.push(storageNarrowPath);
        }
      }

      // Forced-colors audit at 380px across settings, recovery, voice, templates, genui & storage
      await page.setViewportSize({ width: 380, height: 828 });
      await page.emulateMedia({ forcedColors: 'active' });
      for (const fcPanel of ['settings', 'recovery', 'voice', 'templates', 'genui', 'storage']) {
        await page.goto(`${baseUrl}/?mode=single&theme=${theme}&panel=${fcPanel}`, {
          waitUntil: 'networkidle',
        });
        await waitForSpecimen(`forced-colors/${theme}/${fcPanel}`);
        const fcAudit = await page.evaluate(() => {
          const root = document.getElementById('specimen-root');
          return root ? root.querySelectorAll('[style]').length : -1;
        });
        if (fcAudit !== 0) {
          throw new Error(`Forced-colors CSP inline-style audit failed (${theme}/${fcPanel}): ${fcAudit}`);
        }
      }
      await page.emulateMedia({ forcedColors: 'none' });

      // Overview 20-up comparison sheet
      await page.setViewportSize({ width: 8104, height: 900 });
      await page.goto(`${baseUrl}/?mode=gallery&theme=${theme}`, { waitUntil: 'networkidle' });
      const overviewPath = path.join(OUT_DIR, `specimen-${theme}-overview.png`);
      await page.screenshot({ path: overviewPath, fullPage: true });
      outputs.push(overviewPath);
    }
  } finally {
    await browser.close();
    server.closeAllConnections?.();
    server.close();
  }

  if (errors.length > 0 || cspViolations.length > 0 || contrastReport.length > 0) {
    throw new Error(
      `Browser verification failed:\nerrors=${JSON.stringify(errors)}\ncsp=${JSON.stringify(cspViolations)}\nwcag=${JSON.stringify(contrastReport, null, 2)}`,
    );
  }

  console.log(
    JSON.stringify(
      {
        status: 'ok',
        cspStyleSrcSelf: 'verified-zero-inline-styles',
        viewportsVerified: [380, 340],
        hoverNotchGeometry: hoverGeometry,
        outputs,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
