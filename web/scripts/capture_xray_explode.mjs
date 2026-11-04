import { chromium } from '@playwright/test';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const viewer = page.locator('div[role="region"][aria-label*="3D CAD Stage"]');
  await viewer.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500);

  const box = await viewer.boundingBox();

  // 1. Capture X-Ray Wireframe
  const xrayBtn = page.locator('button:has-text("X-RAY")');
  await xrayBtn.click({ force: true });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'docs/pixel-audit/step2-xray-mode.png', clip: box });
  console.log('Saved step2-xray-mode.png');

  // 2. Capture Explode Subsystems
  const explodeBtn = page.locator('button:has-text("EXPLODE")');
  await explodeBtn.click({ force: true });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'docs/pixel-audit/step2-explode-mode.png', clip: box });
  console.log('Saved step2-explode-mode.png');

  await browser.close();
  console.log('Done!');
}

main().catch(console.error);
