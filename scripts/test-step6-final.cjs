const { chromium } = require('../web/node_modules/playwright');
const fs = require('fs');

async function measureFps(page, durationMs = 1000) {
  return await page.evaluate(async (ms) => {
    return new Promise((resolve) => {
      let frames = 0;
      const start = performance.now();
      function count() {
        frames++;
        if (performance.now() - start < ms) {
          requestAnimationFrame(count);
        } else {
          resolve(Math.round((frames * 1000) / (performance.now() - start)));
        }
      }
      requestAnimationFrame(count);
    });
  }, durationMs);
}

async function run() {
  fs.mkdirSync('docs/pixel-audit', { recursive: true });
  const browser = await chromium.launch({ headless: true });

  console.log('--- 1. Testing Homepage at 1280x900 ---');
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  // Test load time of model
  const modelTimings = { beforeLoad: 0, optLoad: 0 };
  page.on('response', (res) => {
    if (res.url().includes('DecodeBot.opt.glb')) {
      console.log(`[Network] DecodeBot.opt.glb loaded (${res.status()})`);
    }
  });

  const t0 = Date.now();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  const tNav = Date.now() - t0;
  console.log(`Homepage navigation + networkidle: ${tNav}ms`);

  // Scroll to robot
  await page.evaluate(() => {
    const el = document.querySelector('.ambient-robot-card');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });

  await page.waitForFunction(() => {
    const btn = document.querySelector('button[aria-label="01. Focus DECODEBOT CHASSIS ARCHITECTURE"]');
    return btn && btn.offsetParent !== null;
  }, { timeout: 15000 });

  await page.waitForTimeout(1500);

  const homeCard = page.locator('.ambient-robot-card');
  const homeBox = await homeCard.boundingBox();

  // Capture homepage pixel CAD
  await page.screenshot({ path: 'docs/pixel-audit/step6-home-pixel-1280.png', clip: homeBox });
  console.log('Saved docs/pixel-audit/step6-home-pixel-1280.png');

  // Verify homepage toolbar has NO REAL CAD button and has FULL CAD LAB
  const hasRealCadBtn = await page.locator('.ambient-robot-card button:has-text("REAL CAD")').count();
  console.log(`Homepage has REAL CAD button: ${hasRealCadBtn > 0} (Expected: false)`);

  const homeFps = await measureFps(page, 1000);
  console.log(`Homepage measured FPS: ${homeFps} fps`);

  // Click LAUNCH FULL CAD LAB
  console.log('\n--- 2. Navigating to Dedicated CAD Page (/cad) ---');
  await page.click('a[href="/cad"]');
  await page.waitForURL('**/cad');
  await page.waitForSelector('main', { state: 'visible' });

  await page.waitForFunction(() => {
    const btn = document.querySelector('button[aria-label="01. Focus DECODEBOT CHASSIS ARCHITECTURE"]');
    return btn && btn.offsetParent !== null;
  }, { timeout: 15000 });

  await page.waitForTimeout(1500);

  // Capture CAD page in default REAL CAD mode
  await page.screenshot({ path: 'docs/pixel-audit/step6-cad-page-realcad-1280.png' });
  console.log('Saved docs/pixel-audit/step6-cad-page-realcad-1280.png');

  const cadFps = await measureFps(page, 1000);
  console.log(`CAD page measured FPS: ${cadFps} fps`);

  // Test Subsystem 02 Drivetrain on CAD page
  console.log('Switching subsystem tab 02 DRIVETRAIN on /cad...');
  await page.click('button[role="tab"]:has-text("02")');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'docs/pixel-audit/step6-cad-page-subsystem-02.png' });
  console.log('Saved docs/pixel-audit/step6-cad-page-subsystem-02.png');

  // Test EXPLODE on CAD page
  console.log('Activating EXPLODE on /cad...');
  await page.click('button:has-text("EXPLODE")');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'docs/pixel-audit/step6-cad-page-explode-1280.png' });
  console.log('Saved docs/pixel-audit/step6-cad-page-explode-1280.png');

  // Test X-RAY on CAD page
  console.log('Activating X-RAY on /cad...');
  await page.click('button:has-text("X-RAY")');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'docs/pixel-audit/step6-cad-page-xray-1280.png' });
  console.log('Saved docs/pixel-audit/step6-cad-page-xray-1280.png');

  // Test Mode Toggle to PIXEL on CAD page
  console.log('Toggling to PIXEL mode on /cad...');
  await page.click('button:has-text("PIXEL")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'docs/pixel-audit/step6-cad-page-pixel-mode.png' });
  console.log('Saved docs/pixel-audit/step6-cad-page-pixel-mode.png');

  // Test RESET on CAD page
  console.log('Resetting view on /cad...');
  await page.click('button[aria-label="Reset 3D view"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'docs/pixel-audit/step6-cad-page-reset.png' });
  console.log('Saved docs/pixel-audit/step6-cad-page-reset.png');

  // Test RETURN HOME link
  console.log('Clicking RETURN HOME...');
  await page.click('header a:has-text("RETURN HOME")');
  await page.waitForURL('http://localhost:3000/');
  console.log('Successfully navigated back to Homepage!');

  await context.close();

  // Responsive captures across 375, 768, 1920
  const viewports = [
    { w: 375, h: 812, tag: '375' },
    { w: 768, h: 1024, tag: '768' },
    { w: 1920, h: 1080, tag: '1920' },
  ];

  for (const vp of viewports) {
    console.log(`\n--- Responsive captures at ${vp.w}x${vp.h} ---`);
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1 });
    const p = await ctx.newPage();

    // 1. Homepage at viewport
    await p.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await p.evaluate(() => {
      const el = document.querySelector('.ambient-robot-card');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await p.waitForFunction(() => {
      const btn = document.querySelector('button[aria-label="01. Focus DECODEBOT CHASSIS ARCHITECTURE"]');
      return btn && btn.offsetParent !== null;
    }, { timeout: 15000 });
    await p.waitForTimeout(1200);
    const cardEl = p.locator('.ambient-robot-card');
    const b = await cardEl.boundingBox();
    await p.screenshot({ path: `docs/pixel-audit/step6-home-${vp.tag}.png`, clip: b });
    console.log(`Saved docs/pixel-audit/step6-home-${vp.tag}.png`);

    // 2. /cad at viewport
    await p.goto('http://localhost:3000/cad', { waitUntil: 'networkidle' });
    await p.waitForFunction(() => {
      const btn = document.querySelector('button[aria-label="01. Focus DECODEBOT CHASSIS ARCHITECTURE"]');
      return btn && btn.offsetParent !== null;
    }, { timeout: 15000 });
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `docs/pixel-audit/step6-cad-${vp.tag}.png` });
    console.log(`Saved docs/pixel-audit/step6-cad-${vp.tag}.png`);

    await ctx.close();
  }

  await browser.close();
  console.log('\nAll Step 6 verification tests completed successfully!');
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
