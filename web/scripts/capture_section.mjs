import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  const section = page.locator('#robot-target');
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(4000);

  await section.screenshot({ path: 'D:/Robotics/31113-robolads/docs/pixel-audit/step0-robot-section.png' });
  console.log('Saved step0-robot-section.png');
  await browser.close();
})();
