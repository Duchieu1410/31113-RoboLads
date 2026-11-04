import { test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

// Screenshots + axe report for every page. Report only: results are printed and saved, never asserted.
const PAGES = [
  { slug: 'home', url: '/' },
  { slug: 'resources', url: '/resources' },
  { slug: 'blog', url: '/blog' },
  { slug: 'dev-pixel', url: '/dev/pixel' },
];
const OUT = path.resolve(__dirname, '../../docs/pixel-audit');

for (const p of PAGES) {
  test(`${p.slug}: screenshot + axe`, async ({ page }, info) => {
    mkdirSync(OUT, { recursive: true });
    await page.goto(p.url, { waitUntil: 'load' });
    // scroll through the page so lazy content renders before the full-page capture
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(500);
    const w = info.project.name;
    await page.screenshot({ path: path.join(OUT, `${p.slug}-${w}.png`), fullPage: true });

    const results = await new AxeBuilder({ page }).analyze();
    const summary = results.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
    writeFileSync(path.join(OUT, `axe-${p.slug}-${w}.json`), JSON.stringify(summary, null, 2));
    console.log(`[axe] ${p.slug} ${w}: ${summary.length} violation types`, JSON.stringify(summary));
  });
}
