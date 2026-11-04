const { chromium } = require('../web/node_modules/playwright');
const fs = require('fs');

async function captureViewport(width, height, filename) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  console.log(`Navigating at ${width}x${height}...`);
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  await page.evaluate(() => {
    const el = document.querySelector('.ambient-robot-card');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });

  await page.waitForFunction(() => {
    const btn = document.querySelector('button[aria-label="01. Focus DECODEBOT CHASSIS ARCHITECTURE"]');
    return btn && btn.offsetParent !== null;
  }, { timeout: 15000 });

  await page.waitForTimeout(1500);

  const card = page.locator('.ambient-robot-card');
  const box = await card.boundingBox();
  await page.screenshot({ path: `docs/pixel-audit/${filename}`, clip: box });
  console.log(`Saved docs/pixel-audit/${filename}`);

  await browser.close();
}

async function run() {
  await captureViewport(768, 1024, 'step4-768.png');
  await captureViewport(375, 812, 'step4-375.png');
  console.log('Responsive captures done!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
