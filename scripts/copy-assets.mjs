import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC_STYLES = path.join(ROOT, 'src', 'styles');
const DIST_STYLES = path.join(ROOT, 'dist', 'styles');

fs.mkdirSync(DIST_STYLES, { recursive: true });
for (const file of fs.readdirSync(SRC_STYLES)) {
  if (file.endsWith('.css')) {
    fs.copyFileSync(path.join(SRC_STYLES, file), path.join(DIST_STYLES, file));
  }
}
fs.writeFileSync(
  path.join(DIST_STYLES, 'index.d.ts'),
  '// Side-effect CSS entrypoint declaration for strict TypeScript consumers.\nexport {};\n',
);
console.log('Copied CSS design tokens and component styles to dist/styles/');
