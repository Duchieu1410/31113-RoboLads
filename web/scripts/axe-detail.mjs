// Prints axe violations with offending elements. Usage: node scripts/axe-detail.mjs [path ...] (default: / /resources /blog)
// Needs the dev server on BASE_URL (default http://localhost:3000). Optional env: WIDTH (default 1280).
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const base = process.env.BASE_URL ?? 'http://localhost:3000';
const width = Number(process.env.WIDTH ?? 1280);
const paths = process.argv.slice(2);
if (!paths.length) paths.push('/', '/resources', '/blog');

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width, height: 900 } });
for (const p of paths) {
  const page = await context.newPage();
  await page.goto(base + p, { waitUntil: 'load' });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(400);
  const r = await new AxeBuilder({ page }).analyze();
  console.log(`\n=== ${p} @${width}: ${r.violations.length} violation types`);
  for (const v of r.violations) {
    console.log(`- ${v.id} (${v.impact}) x${v.nodes.length}: ${v.help}`);
    for (const n of v.nodes.slice(0, 6)) {
      const msg = (n.any[0] ?? n.all[0] ?? n.none[0] ?? {}).message ?? '';
      console.log(`    ${n.target.join(' ')} :: ${msg.slice(0, 140)}`);
    }
  }
  await page.close();
}
await browser.close();
