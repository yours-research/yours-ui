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
  CompareTable,
  ContextCommandPopover,
  DataTableCard,
  DraftCard,
  EmptyState,
  EntitySummaryCard,
  FloatingComposer,
  FloatingContextSheet,
  FollowUpSuggestions,
  HardwareStatusStrip,
  HookSidebarList,
  InlineCitationPill,
  InlineCitationPopover,
  LocalVaultExportCard,
  MatrixOrb,
  MemoryInspectorList,
  MetricStripCard,
  MicIcon,
  ModelDownloadGate,
  ModelDownloadProgressBar,
  NotchDrawerSearch,
  NotchOptionRow,
  PageActionCard,
  PageBriefCard,
  PageIcon,
  PermissionApprovalCard,
  PromptCapsuleStack,
  QuotedContextBanner,
  ReasoningTrace,
  SegmentedControl,
  SettingsSection,
  SettingsToggleRow,
  SidePanelShell,
  SourcesDrawer,
  StatusBadge,
  StreamingResponse,
  ToastPill,
  ToolStepCard,
  TopNotch,
  UserMessageBubble,
  VoiceSessionBar,
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
            '> Verified against active DOM with zero network calls.\\n\\n' +
            '\`\`\`ts\\nconst savings = 1 - 200 / 250; // 0.20\\n\`\`\`'
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

  return (
    <div className="yui-spec-scroll-col" data-theme={theme}>
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
            scoreLabel: '98% match',
          },
          {
            id: 'm2',
            tier: 'episodic',
            summary: 'Verified 20% annual discount above 8 workspace seats.',
            sourceDomain: 'pricing.yours.sh',
            relativeTime: '1h',
          },
          {
            id: 'm3',
            tier: 'working',
            summary: 'Temporary checkout form draft on Kyoto booking tab.',
            sourceDomain: 'stay.jp',
            relativeTime: 'Now',
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
      <DataTableCard
        title="Local Decode Matrix"
        subtitle="OPFS Q4F16 quantized checkpoints on-device"
        badge="WGSL"
        copyFormat="markdown"
        footerLabel="Tabular WebGPU measurements"
        columns={[
          { key: 'model', label: 'Checkpoint' },
          { key: 'quant', label: 'Quant' },
          { key: 'ttft', label: 'TTFT', numeric: true },
          { key: 'tps', label: 'Decode', numeric: true },
          { key: 'vram', label: 'VRAM', numeric: true },
        ]}
        rows={[
          { model: 'Qwen3.5-4B', quant: 'Q4F16', ttft: '74ms', tps: '91.6 t/s', vram: '2.6 GB' },
          { model: 'Pragma-1.5B', quant: 'Q4F16', ttft: '38ms', tps: '142.4 t/s', vram: '1.1 GB' },
          { model: 'Gemma-2B-Local', quant: 'INT4', ttft: '52ms', tps: '118.0 t/s', vram: '1.5 GB' },
        ]}
      />
      <ArtifactPreviewCard
        title="webgpu-audit-trace.md"
        fileType="MD"
        meta="4.2 KB · 42 lines · SHA-256"
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
          '- Verification result: 100% deterministic pass on CI runners',
        ].join('\\n')}
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
        {panel === 'genui' ? <GenUiShowcasePanel theme={theme} /> : null}
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
      'genui',
    ];
    for (const theme of ['light', 'dark']) {
      await page.setViewportSize({ width: 380, height: 828 });
      for (const panel of singlePanels) {
        await page.goto(`${baseUrl}/?mode=single&theme=${theme}&panel=${panel}`, {
          waitUntil: 'networkidle',
        });
        await waitForSpecimen(`${theme}/${panel}`);

        if (panel === 'live' || panel === 'sheet') {
          await page.waitForTimeout(300);
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

          const copyTableBtn = page.locator('[data-slot="data-table-card"] button');
          await copyTableBtn.click();
          const copiedText = await copyTableBtn.textContent();
          if (!copiedText || !copiedText.includes('Copied')) {
            throw new Error(`DataTableCard Copy button failed (${theme}): ${copiedText}`);
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

      // 400px width verification on Data & Artifact panel + reduced-motion audit
      await page.setViewportSize({ width: 400, height: 828 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`${baseUrl}/?mode=single&theme=${theme}&panel=data&width=400`, {
        waitUntil: 'networkidle',
      });
      await waitForSpecimen(`400/${theme}/data`);
      const data400Audit = await page.evaluate(() => {
        const root = document.getElementById('specimen-root');
        const inlineStyleCount = root ? root.querySelectorAll('[style]').length : -1;
        const docOverflow = document.documentElement.scrollWidth > 400;
        return { inlineStyleCount, docOverflow };
      });
      if (data400Audit.inlineStyleCount !== 0 || data400Audit.docOverflow) {
        throw new Error(`400px data check failed (${theme}): ${JSON.stringify(data400Audit)}`);
      }
      const data400Path = path.join(OUT_DIR, `specimen-${theme}-data-400.png`);
      await page.screenshot({ path: data400Path });
      outputs.push(data400Path);
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
        'genui',
      ]) {
        await page.goto(`${baseUrl}/?mode=single&theme=${theme}&panel=${narrowPanel}&narrow=1`, {
          waitUntil: 'networkidle',
        });
        await waitForSpecimen(`340/${theme}/${narrowPanel}`);

        if (narrowPanel === 'chat') {
          const narrowClearance = await page.evaluate(async () => {
            const stage = document.querySelector('.yui-scroll-stage');
            if (stage) stage.scrollTop = stage.scrollHeight;
            await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
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
            };
          });
          if (
            !narrowClearance ||
            narrowClearance.actionBottom > narrowClearance.stageBottom + 1 ||
            narrowClearance.actionBottom > narrowClearance.composerTop - 12
          ) {
            throw new Error(
              `340px narrow chat clearance failed (${theme}): ${JSON.stringify(narrowClearance)}`,
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
      }

      // Overview 9-up comparison sheet
      await page.setViewportSize({ width: 3656, height: 900 });
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

  if (errors.length > 0 || cspViolations.length > 0) {
    throw new Error(
      `Browser verification failed:\nerrors=${JSON.stringify(errors)}\ncsp=${JSON.stringify(cspViolations)}`,
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
