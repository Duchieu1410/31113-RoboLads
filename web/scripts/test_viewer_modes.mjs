import { chromium } from '@playwright/test';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const viewer = page.locator('div[role="region"][aria-label*="3D CAD Stage"]');
  await viewer.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500);

  // 1. Pixel Mode (Default)
  await viewer.screenshot({ path: 'docs/pixel-audit/step2-pixel-mode.png', animations: 'disabled' });
  console.log('Saved step2-pixel-mode.png');

  // 2. Real CAD Mode
  const realCadBtn = page.locator('button:has-text("REAL CAD")');
  await realCadBtn.click();
  await page.waitForTimeout(600);
  await viewer.screenshot({ path: 'docs/pixel-audit/step2-realcad-mode.png', animations: 'disabled' });
  console.log('Saved step2-realcad-mode.png');

  // 3. X-Ray Wireframe Mode
  const xrayBtn = page.locator('button:has-text("X-RAY")');
  await xrayBtn.click();
  await page.waitForTimeout(600);
  const box = await viewer.boundingBox();
  if (box) {
    await page.screenshot({ path: 'docs/pixel-audit/step2-xray-mode.png', clip: box });
    console.log('Saved step2-xray-mode.png');
  }

  // 4. Explode Subsystems Mode
  const explodeBtn = page.locator('button:has-text("EXPLODE")');
  await explodeBtn.click();
  await page.waitForTimeout(1000);
  if (box) {
    await page.screenshot({ path: 'docs/pixel-audit/step2-explode-mode.png', clip: box });
    console.log('Saved step2-explode-mode.png');
  }

  // 5. Reset View
  const resetBtn = page.locator('button:has-text("RESET")');
  await resetBtn.click();
  await page.waitForTimeout(800);
  if (box) {
    await page.screenshot({ path: 'docs/pixel-audit/step2-reset-mode.png', clip: box });
    console.log('Saved step2-reset-mode.png');
  }

  await browser.close();
  console.log('All mode tests complete!');
}

main().catch(console.error);
