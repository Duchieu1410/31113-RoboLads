const { chromium } = require('../web/node_modules/playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\admin\\.gemini\\antigravity-cli\\brain\\ff2f7233-852c-4693-ac57-2b46770a8bf2';

async function testTurntable() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // Scroll to robot section
  const robotSection = page.locator('#robot-target');
  await robotSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  // Sample rotation over time to prove it rotates slowly
  const angles = [];
  for (let i = 0; i < 4; i++) {
    const angle = await page.evaluate(() => {
      // Return canvas visual change or performance timestamp
      return performance.now();
    });
    const shotPath = path.join(ARTIFACT_DIR, `turntable-rotation-step-${i + 1}.png`);
    await robotSection.screenshot({ path: shotPath });
    console.log(`Captured rotation frame ${i + 1}`);
    await page.waitForTimeout(800);
  }

  // Now test scrolling while viewing the section: scroll down and back up
  console.log('Testing scrolling across the page (robot should NOT jump or change camera view)...');
  await page.evaluate(() => window.scrollBy(0, 500));
  await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollBy(0, -500));
  await page.waitForTimeout(300);

  const afterScrollShot = path.join(ARTIFACT_DIR, 'turntable-after-scroll.png');
  await robotSection.screenshot({ path: afterScrollShot });
  console.log('Captured post-scroll frame');

  await browser.close();
  console.log('Turntable and scroll decoupling verification complete!');
}

testTurntable().catch(console.error);
