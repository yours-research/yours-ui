import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC_STYLES = path.join(ROOT, 'src', 'styles');
const DIST = path.join(ROOT, 'dist');
const DIST_STYLES = path.join(DIST, 'styles');

/**
 * Minifies CSS while preserving string literals (`"..."` / `'...'`) verbatim
 * and keeping all custom properties, calc expressions, and selectors intact.
 */
function minifyCss(css) {
  let out = '';
  let i = 0;
  let quote = '';
  const n = css.length;

  while (i < n) {
    const ch = css[i];
    const next = css[i + 1];

    if (quote) {
      out += ch;
      if (ch === '\\' && next) {
        out += next;
        i += 2;
        continue;
      }
      if (ch === quote) quote = '';
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      out += ch;
      i += 1;
      continue;
    }

    if (ch === '/' && next === '*') {
      i += 2;
      while (i < n && !(css[i] === '*' && css[i + 1] === '/')) {
        i += 1;
      }
      i += 2;
      continue;
    }

    if (/\s/.test(ch)) {
      while (i < n && /\s/.test(css[i])) i += 1;
      const prev = out[out.length - 1] ?? '';
      const peek = css[i] ?? '';
      if (prev && peek && !/[{}:;,>]/.test(prev) && !/[{}:;,>]/.test(peek)) {
        out += ' ';
      }
      continue;
    }

    if (ch === ';' && css[i + 1] === '}') {
      i += 1;
      continue;
    }

    out += ch;
    i += 1;
  }

  return out.trim();
}

function compactDistJs(dir) {
  const printer = ts.createPrinter({ removeComments: true });
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      compactDistJs(full);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      const src = fs.readFileSync(full, 'utf8');
      const sf = ts.createSourceFile(full, src, ts.ScriptTarget.ES2022);
      const compacted = printer.printFile(sf);
      fs.writeFileSync(full, compacted, 'utf8');
    }
  }
}

compactDistJs(DIST);

fs.mkdirSync(DIST_STYLES, { recursive: true });
for (const file of fs.readdirSync(SRC_STYLES)) {
  if (file.endsWith('.css')) {
    const rawCss = fs.readFileSync(path.join(SRC_STYLES, file), 'utf8');
    const minified = file === 'index.css' ? rawCss : minifyCss(rawCss);
    fs.writeFileSync(path.join(DIST_STYLES, file), minified, 'utf8');
  }
}
fs.writeFileSync(
  path.join(DIST_STYLES, 'index.d.ts'),
  '// Side-effect CSS entrypoint declaration for strict TypeScript consumers.\nexport {};\n',
);
console.log('Compacted dist/ JS and copied minified CSS design tokens/styles to dist/styles/');
