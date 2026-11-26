import { describe, expect, it } from 'vitest';

interface FsLike {
  existsSync(path: string): boolean;
  readFileSync(path: string, encoding: 'utf8'): string;
  writeFileSync(path: string, data: string): void;
  mkdirSync(path: string, options?: { recursive?: boolean }): void;
  rmSync(path: string, options?: { recursive?: boolean; force?: boolean }): void;
  symlinkSync(target: string, path: string, type?: string): void;
  statSync(path: string): { size: number };
}

interface OsLike {
  tmpdir(): string;
}

interface PathLike {
  resolve(...paths: string[]): string;
  join(...paths: string[]): string;
  dirname(p: string): string;
}

interface UrlLike {
  pathToFileURL(p: string): { href: string };
}

interface ChildProcessLike {
  execSync(cmd: string, opts: { cwd: string; stdio: 'pipe' }): void;
  execFileSync(cmd: string, args: string[], opts: { cwd: string; stdio: 'pipe' }): unknown;
}

interface ProcessLike {
  platform: string;
  execPath: string;
}

async function nodeMod<T>(specifier: string): Promise<T> {
  return (await import(/* @vite-ignore */ specifier)) as T;
}

describe('@yours/ui built ESM & CSS exports smoke test', () => {
  it('resolves every package.json subpath entry cleanly from dist/', async () => {
    const fs = await nodeMod<FsLike>('node:fs');
    const path = await nodeMod<PathLike>('node:path');
    const url = await nodeMod<UrlLike>('node:url');
    const cp = await nodeMod<ChildProcessLike>('node:child_process');

    const root = path.resolve(
      path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')),
      '..',
    );
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')) as {
      exports: Record<string, string | { import?: string; types?: string; default?: string }>;
    };

    const distEntry = path.join(root, 'dist', 'index.js');
    if (!fs.existsSync(distEntry)) {
      cp.execSync('npm run build', { cwd: root, stdio: 'pipe' });
    }

    for (const [subpath, target] of Object.entries(pkg.exports)) {
      if (typeof target === 'string') {
        const filePath = path.resolve(root, target);
        expect(fs.existsSync(filePath), `${subpath} target missing: ${filePath}`).toBe(true);
        expect(fs.statSync(filePath).size).toBeGreaterThan(0);
      } else {
        if (target.types) {
          const typesPath = path.resolve(root, target.types);
          expect(fs.existsSync(typesPath), `${subpath} types missing: ${typesPath}`).toBe(true);
        }
        if (target.import) {
          const modPath = path.resolve(root, target.import);
          expect(fs.existsSync(modPath), `${subpath} import missing: ${modPath}`).toBe(true);
        }
        if (target.default) {
          const defaultPath = path.resolve(root, target.default);
          expect(fs.existsSync(defaultPath), `${subpath} default missing: ${defaultPath}`).toBe(true);
          expect(fs.statSync(defaultPath).size).toBeGreaterThan(0);
        }
      }
    }

    const rootMod = (await import(url.pathToFileURL(path.join(root, 'dist', 'index.js')).href)) as Record<string, unknown>;
    const iconsMod = (await import(url.pathToFileURL(path.join(root, 'dist', 'icons', 'index.js')).href)) as Record<string, unknown>;
    const layoutMod = (await import(url.pathToFileURL(path.join(root, 'dist', 'layout', 'index.js')).href)) as Record<string, unknown>;
    const componentsMod = (await import(
      url.pathToFileURL(path.join(root, 'dist', 'components', 'index.js')).href
    )) as Record<string, unknown>;
    const genuiMod = (await import(url.pathToFileURL(path.join(root, 'dist', 'genui', 'index.js')).href)) as Record<string, unknown>;

    expect(typeof rootMod.SidePanelShell).toBe('function');
    expect(typeof rootMod.DataTableCard).toBe('function');
    expect(typeof rootMod.ArtifactPreviewCard).toBe('function');
    expect(typeof rootMod.ShortcutSheet).toBe('function');
    expect(typeof rootMod.StatusToast).toBe('function');
    expect(typeof rootMod.CommandPalette).toBe('function');
    expect(typeof rootMod.EmptyPanelState).toBe('function');
    expect(typeof rootMod.DiffCard).toBe('function');
    expect(typeof rootMod.ToolTraceList).toBe('function');
    expect(typeof rootMod.PermissionCard).toBe('function');
    expect(typeof rootMod.ThreadHistoryList).toBe('function');
    expect(typeof rootMod.ModelRosterList).toBe('function');
    expect(typeof rootMod.TabContextList).toBe('function');
    expect(typeof rootMod.ContextBudgetMeter).toBe('function');
    expect(typeof rootMod.CitationFootnoteList).toBe('function');
    expect(typeof rootMod.CodeBlockCard).toBe('function');
    expect(typeof rootMod.OnboardingCard).toBe('function');
    expect(typeof rootMod.ErrorRecoveryCard).toBe('function');
    expect(typeof rootMod.InlineNotice).toBe('function');
    expect(typeof rootMod.AudioLevelMeter).toBe('function');
    expect(typeof rootMod.VoiceSessionCard).toBe('function');
    expect(typeof rootMod.PromptTemplateList).toBe('function');
    expect(typeof rootMod.ExportSessionCard).toBe('function');

    expect(typeof iconsMod.ApertureIcon).toBe('function');
    expect(typeof iconsMod.MatrixOrb).toBe('function');
    expect(typeof layoutMod.SidePanelShell).toBe('function');
    expect(typeof layoutMod.TopNotch).toBe('function');
    expect(typeof componentsMod.FloatingComposer).toBe('function');
    expect(typeof componentsMod.SettingsSection).toBe('function');
    expect(typeof componentsMod.ShortcutSheet).toBe('function');
    expect(typeof componentsMod.StatusToast).toBe('function');
    expect(typeof componentsMod.CommandPalette).toBe('function');
    expect(typeof componentsMod.EmptyPanelState).toBe('function');
    expect(typeof componentsMod.DiffCard).toBe('function');
    expect(typeof componentsMod.ToolTraceList).toBe('function');
    expect(typeof componentsMod.PermissionCard).toBe('function');
    expect(typeof componentsMod.ThreadHistoryList).toBe('function');
    expect(typeof componentsMod.ModelRosterList).toBe('function');
    expect(typeof componentsMod.TabContextList).toBe('function');
    expect(typeof componentsMod.ContextBudgetMeter).toBe('function');
    expect(typeof componentsMod.CitationFootnoteList).toBe('function');
    expect(typeof componentsMod.CodeBlockCard).toBe('function');
    expect(typeof componentsMod.OnboardingCard).toBe('function');
    expect(typeof componentsMod.ErrorRecoveryCard).toBe('function');
    expect(typeof componentsMod.InlineNotice).toBe('function');
    expect(typeof componentsMod.AudioLevelMeter).toBe('function');
    expect(typeof componentsMod.VoiceSessionCard).toBe('function');
    expect(typeof componentsMod.PromptTemplateList).toBe('function');
    expect(typeof componentsMod.ExportSessionCard).toBe('function');
    expect(typeof componentsMod.FindInThreadBar).toBe('function');
    expect(typeof componentsMod.StorageQuotaCard).toBe('function');
    expect(typeof rootMod.FindInThreadBar).toBe('function');
    expect(typeof rootMod.StorageQuotaCard).toBe('function');
    expect(typeof componentsMod.ModelParametersCard).toBe('function');
    expect(typeof componentsMod.NetworkAuditCard).toBe('function');
    expect(typeof componentsMod.SitePermissionsList).toBe('function');
    expect(typeof componentsMod.AgentHandoffCard).toBe('function');
    expect(typeof componentsMod.ConfirmActionCard).toBe('function');
    expect(typeof rootMod.ModelParametersCard).toBe('function');
    expect(typeof rootMod.NetworkAuditCard).toBe('function');
    expect(typeof rootMod.SitePermissionsList).toBe('function');
    expect(typeof rootMod.AgentHandoffCard).toBe('function');
    expect(typeof rootMod.ConfirmActionCard).toBe('function');
    expect(typeof genuiMod.CompareTable).toBe('function');
    expect(typeof genuiMod.MetricStripCard).toBe('function');
    expect(typeof genuiMod.TimelineCard).toBe('function');
    expect(typeof genuiMod.QuoteExcerptCard).toBe('function');
    expect(typeof rootMod.TimelineCard).toBe('function');
    expect(typeof rootMod.QuoteExcerptCard).toBe('function');
  });

  it('typechecks a strict TypeScript consumer across all public subpaths with zero missing declarations', async () => {
    const fs = await nodeMod<FsLike>('node:fs');
    const os = await nodeMod<OsLike>('node:os');
    const path = await nodeMod<PathLike>('node:path');
    const cp = await nodeMod<ChildProcessLike>('node:child_process');
    const proc = await nodeMod<ProcessLike>('node:process');

    const root = path.resolve(
      path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')),
      '..',
    );
    if (!fs.existsSync(path.join(root, 'dist', 'index.d.ts'))) {
      cp.execSync('npm run build', { cwd: root, stdio: 'pipe' });
    }

    const linkType = proc.platform === 'win32' ? 'junction' : 'dir';
    const tmpRoot = path.join(os.tmpdir(), `yours-ui-consumer-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    const nmDir = path.join(tmpRoot, 'node_modules');
    const nmScope = path.join(nmDir, '@yours');
    fs.mkdirSync(nmScope, { recursive: true });
    fs.symlinkSync(root, path.join(nmScope, 'ui'), linkType);
    fs.symlinkSync(path.join(root, 'node_modules', '@types'), path.join(nmDir, '@types'), linkType);
    fs.symlinkSync(path.join(root, 'node_modules', 'react'), path.join(nmDir, 'react'), linkType);
    fs.symlinkSync(path.join(root, 'node_modules', 'react-dom'), path.join(nmDir, 'react-dom'), linkType);

    fs.writeFileSync(
      path.join(tmpRoot, 'package.json'),
      JSON.stringify({ name: 'strict-consumer-check', private: true, type: 'module' }),
    );
    fs.writeFileSync(
      path.join(tmpRoot, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          strict: true,
          noEmit: true,
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'bundler',
          jsx: 'react-jsx',
          skipLibCheck: true,
        },
        include: ['consumer.tsx'],
      }),
    );
    fs.writeFileSync(
      path.join(tmpRoot, 'consumer.tsx'),
      [
        "import '@yours/ui/styles';",
        "import { AudioLevelMeter, VoiceSessionCard, type FloatingComposerProps } from '@yours/ui';",
        "import { MicIcon, YoursMark } from '@yours/ui/icons';",
        "import { SidePanelShell, TopNotch } from '@yours/ui/layout';",
        "import { ErrorRecoveryCard, FloatingComposer, InlineNotice } from '@yours/ui/components';",
        "import { PromptTemplateList, ExportSessionCard, FindInThreadBar, StorageQuotaCard, ModelParametersCard, NetworkAuditCard, SitePermissionsList, AgentHandoffCard, ConfirmActionCard } from '@yours/ui/components';",
        "import { CompareTable, MetricStripCard, QuoteExcerptCard, TimelineCard } from '@yours/ui/genui';",
        '',
        'export function ConsumerExample(props: FloatingComposerProps) {',
        '  return (',
        '    <SidePanelShell',
        '      theme="light"',
        '      notch={<TopNotch items={[]} expandedId={null} />}',
        '      footer={<FloatingComposer {...props} contextUsageLabel="3.2k / 8k" onOpenCommands={() => {}} />}',
        '    >',
        '      <YoursMark size={20} />',
        '      <MicIcon size={14} />',
        '      <AudioLevelMeter level={0.6} tone="active" />',
        '      <VoiceSessionCard state="listening" transcript="Testing" />',
        '      <InlineNotice tone="info" message="Compacted" />',
        '      <ErrorRecoveryCard title="Err" diagnosis="Diag" onRetry={() => {}} />',
        '      <PromptTemplateList items={[{ id: "p1", command: "/sum", title: "Summarize" }]} onSelect={() => {}} />',
        '      <ExportSessionCard metaLabel="4 turns" onCopy={() => {}} onDownload={() => {}} />',
        '      <FindInThreadBar query="local" totalMatches={3} currentMatch={1} onPrev={() => {}} onNext={() => {}} />',
        '      <StorageQuotaCard usedLabel="2.6 GB" quotaLabel="12.0 GB" entries={[{ id: "w", label: "Weights", sizeLabel: "2.4 GB", percent: 20 }]} />',
        '      <ModelParametersCard modelLabel="Qwen3.5-4B" onReset={() => {}} />',
        '      <NetworkAuditCard events={[{ id: "e1", target: "api.example", decision: "blocked", timestamp: "12:01" }]} />',
        '      <SitePermissionsList items={[{ id: "sp1", origin: "docs.yours.sh", scope: "Read active tab", mode: "once" }]} onModeChange={() => {}} onRevoke={() => {}} />',
        '      <AgentHandoffCard title="Captcha required" reason="Verify humanity before submit" origin="checkout.example" onTakeOver={() => {}} onResume={() => {}} onCancel={() => {}} />',
        '      <ConfirmActionCard title="Reset local workspace" description="Erase indexed files and chat transcripts." rows={[{ label: "Scope", value: "OPFS · 2.4 GB" }]} confirmPhrase="RESET" holdDurationMs={500} onConfirm={() => {}} onCancel={() => {}} />',
        '      <MetricStripCard label="VRAM" primaryValue="2.4 GB" values={[2.1, 2.3, 2.4]} />',
        '      <CompareTable title="Bench" leftColumnTitle="A" rightColumnTitle="B" rows={[{ feature: "Speed", leftValue: "44", rightValue: "39" }]} />',
        '      <TimelineCard title="Plan" steps={[{ id: "s1", label: "Step 1", status: "done" }]} />',
        '      <QuoteExcerptCard quote="Quoted prose." sourceTitle="Spec" locator="§1" />',
        '    </SidePanelShell>',
        '  );',
        '}',
      ].join('\n'),
    );

    try {
      const tscBin = path.join(root, 'node_modules', 'typescript', 'bin', 'tsc');
      try {
        cp.execFileSync(proc.execPath, [tscBin, '-p', path.join(tmpRoot, 'tsconfig.json')], {
          cwd: tmpRoot,
          stdio: 'pipe',
        });
      } catch (err) {
        const e = err as { stdout?: { toString(): string }; stderr?: { toString(): string }; message?: string };
        throw new Error(
          `Strict consumer tsc failed:\n${e.stdout?.toString() ?? ''}\n${e.stderr?.toString() ?? e.message ?? ''}`,
        );
      }
    } finally {
      fs.rmSync(tmpRoot, { recursive: true, force: true });
    }
  });

  it('isolates subpath entrypoints and supports esbuild tree-shaking without cross-subpath leaks', async () => {
    const fs = await nodeMod<FsLike>('node:fs');
    const os = await nodeMod<OsLike>('node:os');
    const path = await nodeMod<PathLike>('node:path');
    const cp = await nodeMod<ChildProcessLike>('node:child_process');
    const proc = await nodeMod<ProcessLike>('node:process');

    const root = path.resolve(
      path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')),
      '..',
    );
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')) as {
      sideEffects?: string[];
    };
    expect(pkg.sideEffects).toEqual(['**/*.css']);

    const linkType = proc.platform === 'win32' ? 'junction' : 'dir';
    const tmpRoot = path.join(os.tmpdir(), `yours-ui-treeshake-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    const nmScope = path.join(tmpRoot, 'node_modules', '@yours');
    fs.mkdirSync(nmScope, { recursive: true });
    fs.symlinkSync(root, path.join(nmScope, 'ui'), linkType);

    const scriptPath = path.join(tmpRoot, 'check-treeshake.mjs');
    const esbuildEntry = path.join(root, 'node_modules', 'esbuild', 'lib', 'main.js');
    fs.writeFileSync(
      scriptPath,
      [
        `import { pathToFileURL } from 'node:url';`,
        `import assert from 'node:assert/strict';`,
        `const { build } = await import(pathToFileURL(${JSON.stringify(esbuildEntry)}).href);`,
        `const bundle = async (contents) => {`,
        `  const r = await build({`,
        `    stdin: { contents, resolveDir: ${JSON.stringify(tmpRoot)}, loader: 'js' },`,
        `    bundle: true, write: false, format: 'esm', treeShaking: true,`,
        `    external: ['react', 'react-dom', 'react/jsx-runtime'],`,
        `  });`,
        `  return r.outputFiles[0].text;`,
        `};`,
        `const icons = await bundle("import { YoursMark } from '@yours/ui/icons'; console.log(YoursMark);");`,
        `assert(!icons.includes('yui-shell') && !icons.includes('yui-cmd-panel') && !icons.includes('yui-genui-card'));`,
        `const layout = await bundle("import { SidePanelShell } from '@yours/ui/layout'; console.log(SidePanelShell);");`,
        `assert(layout.includes('yui-shell') && !layout.includes('yui-cmd-panel') && !layout.includes('yui-genui-card'));`,
        `const genui = await bundle("import { QuoteExcerptCard } from '@yours/ui/genui'; console.log(QuoteExcerptCard);");`,
        `assert(genui.includes('yui-qec-quote') && !genui.includes('yui-shell') && !genui.includes('yui-cmd-panel'));`,
        `const comp = await bundle("import { FindInThreadBar } from '@yours/ui/components'; console.log(FindInThreadBar);");`,
        `assert(comp.includes('yui-find-bar') && !comp.includes('yui-shell') && !comp.includes('yui-qec-quote') && !comp.includes('yui-handoff-card') && !comp.includes('yui-confirm-card'));`,
        `const handoff = await bundle("import { AgentHandoffCard, SitePermissionsList, ConfirmActionCard } from '@yours/ui/components'; console.log(AgentHandoffCard, SitePermissionsList, ConfirmActionCard);");`,
        `assert(handoff.includes('yui-handoff-card') && handoff.includes('yui-sperm-card') && handoff.includes('yui-confirm-card') && !handoff.includes('yui-shell') && !handoff.includes('yui-qec-quote'));`,
      ].join('\n'),
    );

    try {
      cp.execFileSync(proc.execPath, [scriptPath], { cwd: tmpRoot, stdio: 'pipe' });
    } finally {
      fs.rmSync(tmpRoot, { recursive: true, force: true });
    }
  });
});
