const { chromium } = require('../web/node_modules/playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\admin\\.gemini\\antigravity-cli\\brain\\ff2f7233-852c-4693-ac57-2b46770a8bf2';

async function verifyPixelFonts() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('1. Loading Homepage...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // 1. Hero with restored pixelated title
  const heroShot = path.join(ARTIFACT_DIR, 'pixel-text-restored-hero.png');
  await page.screenshot({ path: heroShot });
  console.log(`Saved hero screenshot with restored pixelated text: ${heroShot}`);

  // 2. Section C with pixelated header
  await page.evaluate(() => document.getElementById('robot-target')?.scrollIntoView());
  await page.waitForTimeout(1500);

  const cadSectionShot = path.join(ARTIFACT_DIR, 'pixel-text-restored-home-cad.png');
  const robotSection = page.locator('#robot-target');
  await robotSection.screenshot({ path: cadSectionShot });
  console.log(`Saved home CAD section screenshot: ${cadSectionShot}`);

  // 3. /cad Page with pixelated headers
  console.log('2. Loading /cad page...');
  await page.goto('http://localhost:3000/cad', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const cadPageShot = path.join(ARTIFACT_DIR, 'pixel-text-restored-cad-lab.png');
  await page.screenshot({ path: cadPageShot });
  console.log(`Saved /cad workstation screenshot: ${cadPageShot}`);

  await browser.close();
  console.log('Pixel text verification complete!');
}

verifyPixelFonts().catch(err => {
  console.error(err);
  process.exit(1);
});
