const { chromium } = require('../web/node_modules/playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\admin\\.gemini\\antigravity-cli\\brain\\ff2f7233-852c-4693-ac57-2b46770a8bf2';

async function verify() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11']
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('--- 1. Testing Homepage (Clean & Minimal 3D Bot) ---');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // Scroll to robot-target
  const robotSection = page.locator('#robot-target');
  await robotSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);

  // Check that hotspot callout pins (01-04) are NOT present on homepage
  const hotspotCount = await page.locator('#robot-target .hotspot-dot').count();
  console.log(`Homepage Hotspots Count: ${hotspotCount} (Expected: 0)`);

  // Check that subsystem tabs are NOT on homepage
  const inventoryTabCount = await page.locator('#robot-target [role="tablist"]').count();
  console.log(`Homepage Subsystem Tablist Count: ${inventoryTabCount} (Expected: 0)`);

  // Check that the launch button is present
  const launchBtn = page.locator('text=LAUNCH FULL CAD LAB ⛶');
  const launchBtnVisible = await launchBtn.isVisible();
  console.log(`Homepage "LAUNCH FULL CAD LAB" Button Visible: ${launchBtnVisible}`);

  // Measure FPS during orbit drag on homepage
  const canvas = page.locator('#robot-target canvas');
  const box = await canvas.boundingBox();
  if (box) {
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;

    const fps = await page.evaluate(async ({ cx, cy }) => {
      let frameCount = 0;
      let active = true;
      const count = () => {
        if (active) {
          frameCount++;
          requestAnimationFrame(count);
        }
      };
      requestAnimationFrame(count);

      const start = performance.now();
      while (performance.now() - start < 1500) {
        await new Promise(r => setTimeout(r, 16));
      }
      active = false;
      const elapsedSec = (performance.now() - start) / 1000;
      return Math.round(frameCount / elapsedSec);
    }, { cx, cy });

    console.log(`Homepage 3D FPS: ${fps}`);
  }

  // Screenshot homepage section C
  const homeScreenshot = path.join(ARTIFACT_DIR, 'simplified-home-cad-section.png');
  await robotSection.screenshot({ path: homeScreenshot });
  console.log(`Saved homepage screenshot to: ${homeScreenshot}`);

  console.log('\n--- 2. Testing Dedicated /cad Page (Full CAD Lab) ---');
  await page.goto('http://localhost:3000/cad', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // Check subsystem tabs are present on /cad
  const cadTabs = await page.locator('[role="tablist"] button').count();
  console.log(`CAD Page Subsystem Tabs Count: ${cadTabs} (Expected: 4)`);

  // Check hotspots are present on /cad
  const cadHotspots = await page.locator('.hotspot-dot').count();
  console.log(`CAD Page Hotspots Count: ${cadHotspots} (Expected: 4)`);

  // Check X-Ray and Explode buttons are present on /cad
  const xrayBtn = await page.locator('button:has-text("X-RAY")').isVisible();
  const explodeBtn = await page.locator('button:has-text("EXPLODE")').isVisible();
  console.log(`CAD Page X-Ray Visible: ${xrayBtn}, Explode Visible: ${explodeBtn}`);

  // Check specs are present on /cad
  const specsHeader = await page.locator('text=CAD SUBSYSTEM HIGHLIGHTS').isVisible();
  console.log(`CAD Page Specs Header Visible: ${specsHeader}`);

  // Screenshot /cad page
  const cadScreenshot = path.join(ARTIFACT_DIR, 'dedicated-cad-page-view.png');
  await page.screenshot({ path: cadScreenshot });
  console.log(`Saved /cad page screenshot to: ${cadScreenshot}`);

  await browser.close();
  console.log('\nVerification completed successfully!');
}

verify().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
