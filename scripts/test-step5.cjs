const { chromium } = require('../web/node_modules/playwright');
const fs = require('fs');

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

  // 1. Step 5 Default View: PIXEL Render Mode
  await page.screenshot({ path: 'docs/pixel-audit/step5-pixel-mode-1280.png', clip: box });
  console.log('Saved step5-pixel-mode-1280.png');

  // 2. Toggle to REAL CAD Mode
  console.log('Switching to REAL CAD mode...');
  await page.click('button:has-text("REAL CAD")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'docs/pixel-audit/step5-realcad-mode-1280.png', clip: box });
  console.log('Saved step5-realcad-mode-1280.png');

  // 3. Switch back to PIXEL mode
  console.log('Switching back to PIXEL mode...');
  await page.click('button:has-text("PIXEL")');
  await page.waitForTimeout(1000);

  // 4. Test X-RAY in PIXEL Mode
  console.log('Activating X-RAY in PIXEL mode...');
  await page.click('button:has-text("X-RAY WIREFRAME")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'docs/pixel-audit/step5-xray-pixel-1280.png', clip: box });
  console.log('Saved step5-xray-pixel-1280.png');

  // 5. Test X-RAY in REAL CAD Mode
  console.log('Switching to REAL CAD with X-RAY active...');
  await page.click('button:has-text("REAL CAD")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'docs/pixel-audit/step5-xray-realcad-1280.png', clip: box });
  console.log('Saved step5-xray-realcad-1280.png');

  // Turn off X-RAY
  await page.click('button:has-text("X-RAY WIREFRAME")');
  await page.waitForTimeout(500);

  // 6. Test EXPLODE in REAL CAD Mode
  console.log('Activating EXPLODE in REAL CAD mode...');
  await page.click('button:has-text("EXPLODE SUBSYSTEMS")');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'docs/pixel-audit/step5-explode-realcad-1280.png', clip: box });
  console.log('Saved step5-explode-realcad-1280.png');

  // 7. Test EXPLODE in PIXEL Mode
  console.log('Switching to PIXEL with EXPLODE active...');
  await page.click('button:has-text("PIXEL")');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'docs/pixel-audit/step5-explode-pixel-1280.png', clip: box });
  console.log('Saved step5-explode-pixel-1280.png');

  // 8. Test RESET
  console.log('Testing RESET...');
  await page.click('button[aria-label="Reset 3D view"]');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'docs/pixel-audit/step5-after-reset-1280.png', clip: box });
  console.log('Saved step5-after-reset-1280.png');

  // 9. Test Modal CAD Lab in PIXEL mode
  console.log('Opening Full CAD Lab Modal...');
  await page.click('button:has-text("LAUNCH FULL CAD LAB ⛶")');
  await page.waitForSelector('.cad-modal-dialog', { state: 'visible' });
  await page.waitForTimeout(1500);

  const modalBox = await page.locator('.cad-modal-dialog').boundingBox();
  await page.screenshot({ path: 'docs/pixel-audit/step5-cad-modal-pixel.png', clip: modalBox });
  console.log('Saved step5-cad-modal-pixel.png');

  // Modal CAD Lab in REAL CAD mode
  await page.click('.cad-modal-dialog button:has-text("REAL CAD")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'docs/pixel-audit/step5-cad-modal-realcad.png', clip: modalBox });
  console.log('Saved step5-cad-modal-realcad.png');

  // Close modal
  await page.click('button:has-text("✕ CLOSE")');
  await page.waitForTimeout(500);

  // 10. Measure FPS and WebGL performance
  console.log('Measuring runtime FPS...');
  const fps = await page.evaluate(async () => {
    return new Promise((resolve) => {
      let frames = 0;
      const start = performance.now();
      function count() {
        frames++;
        if (performance.now() - start < 1000) {
          requestAnimationFrame(count);
        } else {
          resolve(Math.round((frames * 1000) / (performance.now() - start)));
        }
      }
      requestAnimationFrame(count);
    });
  });
  console.log(`Measured Inline Viewer FPS: ${fps} fps`);

  await browser.close();
  console.log('Step 5 1280px tests completed successfully!');
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
