import { chromium } from '@playwright/test';
import fs from 'fs';

async function capture() {
  const browser = await chromium.launch();

  // 1. 1280px Inline
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const viewer = page.locator('div[role="region"][aria-label*="3D CAD Stage"]');
    await viewer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2500);
    const box = await viewer.boundingBox();
    if (box) {
      await page.screenshot({ path: 'docs/pixel-audit/step3-1280-inline.png', clip: box });
      console.log('Saved step3-1280-inline.png');
    }

    // Modal
    const modalBtn = page.locator('button:has-text("FULL CAD LAB")').first();
    if (await modalBtn.isVisible()) {
      await modalBtn.click();
      await page.waitForSelector('.cad-modal-dialog', { state: 'visible', timeout: 5000 });
      await page.waitForTimeout(1500);
      const modalViewer = page.locator('.cad-modal-dialog');
      const mbox = await modalViewer.boundingBox();
      if (mbox) {
        await page.screenshot({ path: 'docs/pixel-audit/step3-1280-modal.png', clip: mbox });
        console.log('Saved step3-1280-modal.png');
      }
    }
    await page.close();
  }

  // 2. 768px Tablet
  {
    const page = await browser.newPage({ viewport: { width: 768, height: 1024 } });
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const viewer = page.locator('div[role="region"][aria-label*="3D CAD Stage"]');
    await viewer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2500);
    const box = await viewer.boundingBox();
    if (box) {
      await page.screenshot({ path: 'docs/pixel-audit/step3-768.png', clip: box });
      console.log('Saved step3-768.png');
    }
    await page.close();
  }

  // 3. 375px Mobile
  {
    const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const viewer = page.locator('div[role="region"][aria-label*="3D CAD Stage"]');
    await viewer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2500);
    const box = await viewer.boundingBox();
    if (box) {
      await page.screenshot({ path: 'docs/pixel-audit/step3-375.png', clip: box });
      console.log('Saved step3-375.png');
    }
    await page.close();
  }

  await browser.close();
  console.log('All Step 3 captures done!');
}

capture().catch(console.error);
