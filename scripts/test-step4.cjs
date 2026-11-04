const { chromium } = require('../web/node_modules/playwright');
const fs = require('fs');
const path = require('path');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // Scroll to robot section
  await page.evaluate(() => {
    const el = document.querySelector('.ambient-robot-card');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });

  // Wait for 3D stage ready
  await page.waitForFunction(() => {
    const btn = document.querySelector('button[aria-label="01. Focus DECODEBOT CHASSIS ARCHITECTURE"]');
    return btn && btn.offsetParent !== null;
  }, { timeout: 15000 });

  await page.waitForTimeout(2000);

  const card = page.locator('.ambient-robot-card');
  const box = await card.boundingBox();
  console.log('Stage box:', box);

  fs.mkdirSync('docs/pixel-audit', { recursive: true });

  // 1. Initial State (All 4 subsystems visible, un-dimmed, default 3/4 view)
  await page.screenshot({ path: 'docs/pixel-audit/step4-initial-1280.png', clip: box });
  console.log('Saved step4-initial-1280.png');

  // 2. Click Subsystem 01 (Chassis)
  console.log('Focusing Subsystem 01 (Chassis)...');
  await page.click('button[role="tab"]:has-text("CHASSIS")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'docs/pixel-audit/step4-subsystem-01-chassis.png', clip: box });
  console.log('Saved step4-subsystem-01-chassis.png');

  // 3. Click Subsystem 02 (Drivetrain)
  console.log('Focusing Subsystem 02 (Drivetrain)...');
  await page.click('button[role="tab"]:has-text("DRIVETRAIN")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'docs/pixel-audit/step4-subsystem-02-drivetrain.png', clip: box });
  console.log('Saved step4-subsystem-02-drivetrain.png');

  // 4. Click Subsystem 03 (Intake)
  console.log('Focusing Subsystem 03 (Intake)...');
  await page.click('button[role="tab"]:has-text("INTAKE")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'docs/pixel-audit/step4-subsystem-03-intake.png', clip: box });
  console.log('Saved step4-subsystem-03-intake.png');

  // 5. Click Subsystem 04 (Avionics & Turret)
  console.log('Focusing Subsystem 04 (Avionics & Turret)...');
  await page.click('button[role="tab"]:has-text("AVIONICS")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'docs/pixel-audit/step4-subsystem-04-turret.png', clip: box });
  console.log('Saved step4-subsystem-04-turret.png');

  // 6. Test Keyboard Orbit for Occlusion and Screen Edge Clamping
  console.log('Orbiting to back-left using arrow keys to test occlusion and edge clamping...');
  const stage = page.locator('.ambient-robot-card [tabindex="0"]');
  await stage.focus();
  for (let i = 0; i < 18; i++) {
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(1000);

  const pinData = await page.evaluate(() => {
    const pins = Array.from(document.querySelectorAll('.ambient-robot-card div.absolute.top-0.left-0'));
    return pins.map((p, idx) => {
      const btn = p.querySelector('button');
      const arrowL = p.querySelector('.hotspot-arrow-prefix');
      const arrowR = p.querySelector('.hotspot-arrow-suffix');
      return {
        idx,
        transform: p.style.transform,
        opacity: p.style.opacity,
        filter: p.style.filter,
        arrowLeft: arrowL ? arrowL.textContent : '',
        arrowRight: arrowR ? arrowR.textContent : '',
        btnText: btn ? btn.textContent.trim() : ''
      };
    });
  });
  console.log('Rotated Pin Data:', JSON.stringify(pinData, null, 2));

  await page.screenshot({ path: 'docs/pixel-audit/step4-orbit-occlusion-arrows.png', clip: box });
  console.log('Saved step4-orbit-occlusion-arrows.png');

  // 7. Click RESET
  console.log('Testing RESET...');
  await page.click('button[aria-label="Reset 3D view"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'docs/pixel-audit/step4-after-reset.png', clip: box });
  console.log('Saved step4-after-reset.png');

  // 8. Test Modal CAD Lab
  console.log('Opening Full CAD Lab Modal...');
  await page.click('button:has-text("LAUNCH FULL CAD LAB ⛶")');
  await page.waitForSelector('.cad-modal-dialog', { state: 'visible' });
  await page.waitForTimeout(1500);

  const modalBox = await page.locator('.cad-modal-dialog').boundingBox();
  await page.screenshot({ path: 'docs/pixel-audit/step4-cad-modal.png', clip: modalBox });
  console.log('Saved step4-cad-modal.png');

  await browser.close();
  console.log('All Step 4 tests and captures completed successfully!');
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
