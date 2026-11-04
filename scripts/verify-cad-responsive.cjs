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
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('http://localhost:3000/cad', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const shotFile = path.join(ARTIFACT_DIR, `cad-lab-clean-${vp.name}.png`);
    await page.screenshot({ path: shotFile });
    console.log(`Saved ${shotFile}`);
    await page.close();
  }

  await browser.close();
}

verifyResponsive().catch(console.error);
