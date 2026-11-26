import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

if (!fs.existsSync(path.join(DIST, 'index.js'))) {
  console.error('Missing dist/ build output. Run `npm run build` first.');
  process.exit(1);
}

function collectFiles(dir, ext, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(full, ext, out);
    } else if (entry.isFile() && entry.name.endsWith(ext)) {
      out.push(full);
    }
  }
  return out;
}

function measureFile(absPath) {
  const buf = fs.readFileSync(absPath);
  const gz = gzipSync(buf, { level: 9 });
  return { raw: buf.length, gzip: gz.length };
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(2)} KB`;
}

const ENTRYPOINTS = [
  ['@yours/ui', 'dist/index.js'],
  ['@yours/ui/icons', 'dist/icons/index.js'],
  ['@yours/ui/layout', 'dist/layout/index.js'],
  ['@yours/ui/components', 'dist/components/index.js'],
  ['@yours/ui/genui', 'dist/genui/index.js'],
  ['@yours/ui/styles (tokens)', 'dist/styles/tokens.css'],
  ['@yours/ui/styles (components)', 'dist/styles/components.css'],
];

const jsFiles = collectFiles(DIST, '.js');
const cssFiles = collectFiles(DIST, '.css');

let totalJsRaw = 0;
let totalJsGzip = 0;
for (const file of jsFiles) {
  const m = measureFile(file);
  totalJsRaw += m.raw;
  totalJsGzip += m.gzip;
}

let totalCssRaw = 0;
let totalCssGzip = 0;
for (const file of cssFiles) {
  const m = measureFile(file);
  totalCssRaw += m.raw;
  totalCssGzip += m.gzip;
}

const MAX_CSS_GZIP = 19 * 1024;
const MAX_JS_GZIP = 80 * 1024;

const rows = ENTRYPOINTS.map(([label, rel]) => {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) {
    throw new Error(`Missing built entrypoint: ${rel}`);
  }
  const m = measureFile(abs);
  return {
    entrypoint: label,
    file: rel,
    raw: formatKb(m.raw),
    gzip: formatKb(m.gzip),
  };
});

console.log('\n@yours/ui MV3 Bundle Size Budget Report');
console.log('------------------------------------------------------------');
for (const r of rows) {
  console.log(
    `${r.entrypoint.padEnd(32)} raw=${r.raw.padStart(9)}  gzip=${r.gzip.padStart(9)}`,
  );
}
console.log('------------------------------------------------------------');
console.log(
  `${`Total dist/ JS (${jsFiles.length} files)`.padEnd(32)} raw=${formatKb(totalJsRaw).padStart(9)}  gzip=${formatKb(totalJsGzip).padStart(9)} (budget <= ${formatKb(MAX_JS_GZIP)})`,
);
console.log(
  `${`Total dist/ CSS (${cssFiles.length} files)`.padEnd(32)} raw=${formatKb(totalCssRaw).padStart(9)}  gzip=${formatKb(totalCssGzip).padStart(9)} (budget <= ${formatKb(MAX_CSS_GZIP)})`,
);

if (totalJsGzip > MAX_JS_GZIP) {
  console.error(
    `MV3 JS bundle gzip budget exceeded: ${formatKb(totalJsGzip)} > ${formatKb(MAX_JS_GZIP)}`,
  );
  process.exit(1);
}
if (totalCssGzip > MAX_CSS_GZIP) {
  console.error(
    `MV3 CSS bundle gzip budget exceeded: ${formatKb(totalCssGzip)} > ${formatKb(MAX_CSS_GZIP)}`,
  );
  process.exit(1);
}
