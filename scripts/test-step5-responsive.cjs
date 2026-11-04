const { chromium } = require('../web/node_modules/playwright');
const fs = require('fs');

async function captureViewport(width, height, prefix) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  console.log(`\nNavigating at ${width}x${height}...`);
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

  // 1. PIXEL mode
  await page.screenshot({ path: `docs/pixel-audit/${prefix}-pixel.png`, clip: box });
  console.log(`Saved docs/pixel-audit/${prefix}-pixel.png`);

  // 2. REAL CAD mode
  await page.click('button:has-text("REAL CAD")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: `docs/pixel-audit/${prefix}-realcad.png`, clip: box });
  console.log(`Saved docs/pixel-audit/${prefix}-realcad.png`);

  // Switch back to PIXEL mode before modal
  await page.click('button:has-text("PIXEL")');
  await page.waitForTimeout(500);

  // 3. Modal CAD Lab
  const launchBtn = page.locator('button:has-text("LAUNCH FULL CAD LAB ⛶")');
  if (await launchBtn.count() > 0 && await launchBtn.isVisible()) {
    await launchBtn.click();
    await page.waitForSelector('.cad-modal-dialog', { state: 'visible' });
    await page.waitForTimeout(1200);
    const modalBox = await page.locator('.cad-modal-dialog').boundingBox();
    await page.screenshot({ path: `docs/pixel-audit/${prefix}-modal.png`, clip: modalBox });
    console.log(`Saved docs/pixel-audit/${prefix}-modal.png`);
  }

  await browser.close();
}

async function captureSubsystems() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  console.log('\nCapturing subsystem highlights in PIXEL mode...');
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

  const subsystems = [
    { text: 'CHASSIS', file: 'step5-subsystem-01-chassis.png' },
    { text: 'DRIVETRAIN', file: 'step5-subsystem-02-drivetrain.png' },
    { text: 'INTAKE', file: 'step5-subsystem-03-intake.png' },
    { text: 'AVIONICS', file: 'step5-subsystem-04-turret.png' },
  ];

  for (const sub of subsystems) {
    console.log(`Clicking tab ${sub.text}...`);
    await page.click(`button[role="tab"]:has-text("${sub.text}")`);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `docs/pixel-audit/${sub.file}`, clip: box });
    console.log(`Saved docs/pixel-audit/${sub.file}`);
  }

  await browser.close();
}

async function run() {
  fs.mkdirSync('docs/pixel-audit', { recursive: true });
  // Viewports already captured, capturing subsystems:
  await captureSubsystems();
  console.log('\nAll responsive & subsystem captures complete!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
