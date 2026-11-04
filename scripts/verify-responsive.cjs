const { chromium } = require('../web/node_modules/playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\admin\\.gemini\\antigravity-cli\\brain\\ff2f7233-852c-4693-ac57-2b46770a8bf2';

async function verifyResponsive() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11']
  });

  const viewports = [
    { width: 375, height: 812, name: '375' },
    { width: 768, height: 1024, name: '768' },
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    // 1. Homepage Section C
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    const robotSection = page.locator('#robot-target');
    await robotSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);

    const homeFile = path.join(ARTIFACT_DIR, `simplified-home-${vp.name}.png`);
    await robotSection.screenshot({ path: homeFile });
    console.log(`Saved ${homeFile}`);

    // 2. /cad Page
    await page.goto('http://localhost:3000/cad', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const cadFile = path.join(ARTIFACT_DIR, `dedicated-cad-${vp.name}.png`);
    await page.screenshot({ path: cadFile });
    console.log(`Saved ${cadFile}`);

    await context.close();
  }

  await browser.close();
  console.log('Responsive verification complete.');
}

verifyResponsive().catch(console.error);
