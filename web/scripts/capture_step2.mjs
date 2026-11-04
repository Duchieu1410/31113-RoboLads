import { chromium } from '@playwright/test';
import fs from 'fs';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const viewer = page.locator('div[role="region"][aria-label*="3D CAD Stage"]');
  await viewer.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500); // Allow GLB to stream and render
  
  const tokenVal = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--stone-300'));
  console.log('--stone-300 computed value:', tokenVal);
  
  if (!fs.existsSync('docs/pixel-audit')) {
    fs.mkdirSync('docs/pixel-audit', { recursive: true });
  }
  
  const targetPath = process.argv[2] || 'docs/pixel-audit/step2-before-1280.png';
  await viewer.screenshot({ path: targetPath });
  console.log(`Saved screenshot to ${targetPath}`);
  await browser.close();
}

main().catch(console.error);
