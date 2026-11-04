import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // Scroll to robot section
  const el = page.locator('#robot-target');
  await el.scrollIntoViewIfNeeded();
  // Wait 4s for 3D model to load and render
  await page.waitForTimeout(4000);

  await page.screenshot({ path: 'D:/Robotics/31113-robolads/docs/pixel-audit/step0-current-viewer.png' });
  console.log('Saved step0-current-viewer.png');
  await browser.close();
})();
