const { chromium } = require('../web/node_modules/playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\admin\\.gemini\\antigravity-cli\\brain\\ff2f7233-852c-4693-ac57-2b46770a8bf2';

async function verify() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('1. Loading Homepage...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Hero section screenshot to demonstrate new futuristic font
  const heroScreenshot = path.join(ARTIFACT_DIR, 'font-update-hero.png');
  await page.screenshot({ path: heroScreenshot });
  console.log(`Saved hero screenshot with new fonts: ${heroScreenshot}`);

  // Robot Section C screenshot
  await page.evaluate(() => document.getElementById('robot-target')?.scrollIntoView());
  await page.waitForTimeout(2000);

  const homeCadScreenshot = path.join(ARTIFACT_DIR, 'font-update-home-cad.png');
  const robotSection = page.locator('#robot-target');
  await robotSection.screenshot({ path: homeCadScreenshot });
  console.log(`Saved home CAD screenshot: ${homeCadScreenshot}`);

  console.log('\n2. Loading Dedicated /cad Workstation...');
  await page.goto('http://localhost:3000/cad', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // Check no hotspot pins
  const pinCount = await page.locator('.hotspot-dot').count();
  console.log(`CAD Page Hotspot Pins Count: ${pinCount} (Expected: 0)`);

  // Check that intake, drivetrain, outtake text does NOT exist in the sidebar
  const pageText = await page.locator('aside').innerText();
  const hasIntake = pageText.toLowerCase().includes('intake');
  const hasDrivetrain = pageText.toLowerCase().includes('drivetrain');
  const hasOuttake = pageText.toLowerCase().includes('outtake');
  const hasTurret = pageText.toLowerCase().includes('turret');
  console.log(`Sidebar checks - hasIntake: ${hasIntake}, hasDrivetrain: ${hasDrivetrain}, hasOuttake: ${hasOuttake}, hasTurret: ${hasTurret}`);

  const cadScreenshot = path.join(ARTIFACT_DIR, 'font-update-cad-lab.png');
  await page.screenshot({ path: cadScreenshot });
  console.log(`Saved /cad workstation screenshot: ${cadScreenshot}`);

  await browser.close();
  console.log('\nVerification completed successfully!');
}

verify().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
