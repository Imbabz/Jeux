// Génère les icônes PNG depuis public/icon*.svg (iOS ignore les icônes SVG).
// Usage : node scripts/build_icons.mjs
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';

const pub = new URL('../public/', import.meta.url);
const svg = (name) => readFileSync(new URL(name, pub), 'utf8');
// iOS arrondit lui-même les coins et noircit la transparence : icône carrée et opaque.
const square = svg('icon.svg').replace(' rx="112"', '');
const targets = [
  { file: 'apple-touch-icon.png', size: 180, source: square },
  { file: 'icon-192.png', size: 192, source: svg('icon.svg') },
  { file: 'icon-512.png', size: 512, source: svg('icon.svg') },
  { file: 'icon-maskable-512.png', size: 512, source: svg('icon-maskable.svg') },
];

const browser = await chromium.launch(
  process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
);
for (const { file, size, source } of targets) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  const sized = source.replace('<svg ', `<svg width="${size}" height="${size}" `);
  await page.setContent(`<body style="margin:0">${sized}</body>`);
  await page.screenshot({ path: new URL(file, pub).pathname, omitBackground: true });
  await page.close();
}
await browser.close();
