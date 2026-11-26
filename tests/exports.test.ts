import { describe, expect, it } from 'vitest';

interface FsLike {
  existsSync(path: string): boolean;
  readFileSync(path: string, encoding: 'utf8'): string;
  statSync(path: string): { size: number };
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
      exports: Record<string, string | { import?: string; types?: string }>;
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
    expect(typeof genuiMod.CompareTable).toBe('function');
    expect(typeof genuiMod.MetricStripCard).toBe('function');
  });
});
