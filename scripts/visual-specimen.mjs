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
  AssistantMessage,
  AttachIcon,
  AttachmentStrip,
  BranchPicker,
  ChecklistCard,
  ChoicePromptCard,
  CompareTable,
  ContextCommandPopover,
  DraftCard,
  EmptyState,
  EntitySummaryCard,
  FloatingComposer,
  FollowUpSuggestions,
  HookSidebarList,
  InlineCitationPill,
  MatrixOrb,
  MetricStripCard,
  MicIcon,
  ModelDownloadGate,
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
  SidePanelShell,
  SourcesDrawer,
  StatusBadge,
  StreamingResponse,
  ToastPill,
  ToolStepCard,
  TopNotch,
  UserMessageBubble,
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

function SpecimenApp() {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode') || 'gallery';
  const theme = (params.get('theme') || 'light') as 'light' | 'dark';
  const panel = params.get('panel') || 'resting';
  const narrow = params.get('narrow') === '1';

  if (mode === 'single') {
    return (
      <div className={narrow ? 'yui-spec-single yui-spec-single--narrow' : 'yui-spec-single'} data-theme={theme}>
        {panel === 'resting' ? <RestingPanel theme={theme} /> : null}
        {panel === 'notch' ? <NotchExpandedPanel theme={theme} /> : null}
        {panel === 'chat' ? <ActiveChatPanel theme={theme} /> : null}
        {panel === 'live' ? <LiveStreamPopoverPanel theme={theme} /> : null}
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

    const singlePanels = ['resting', 'notch', 'live', 'chat', 'genui'];
    for (const theme of ['light', 'dark']) {
      await page.setViewportSize({ width: 380, height: 828 });
      for (const panel of singlePanels) {
        await page.goto(`${baseUrl}/?mode=single&theme=${theme}&panel=${panel}`, {
          waitUntil: 'networkidle',
        });
        await page.waitForSelector('#specimen-root > div');

        if (panel === 'live') {
          await page.waitForTimeout(300);
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

      // Narrow 340px stress pass across interactive & dense panels
      await page.setViewportSize({ width: 340, height: 828 });
      for (const narrowPanel of ['resting', 'live', 'chat', 'genui']) {
        await page.goto(`${baseUrl}/?mode=single&theme=${theme}&panel=${narrowPanel}&narrow=1`, {
          waitUntil: 'networkidle',
        });
        await page.waitForSelector('#specimen-root > div');
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
      }

      // Overview 5-up comparison sheet
      await page.setViewportSize({ width: 2040, height: 900 });
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
