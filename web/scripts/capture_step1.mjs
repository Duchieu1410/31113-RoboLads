import { chromium } from 'playwright';

const viewports = [
  { name: '1280-inline', width: 1280, height: 900, modal: false },
  { name: '768-inline', width: 768, height: 900, modal: false },
  { name: '375-inline', width: 375, height: 800, modal: false },
  { name: '1280-modal', width: 1280, height: 900, modal: true },
];

(async () => {
  const browser = await chromium.launch();

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    if (vp.modal) {
      // Click Launch Full CAD Lab button
      const modalBtn = page.getByRole('button', { name: /LAUNCH FULL CAD LAB/i });
      await modalBtn.scrollIntoViewIfNeeded();
      await modalBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `D:/Robotics/31113-robolads/docs/pixel-audit/step1-${vp.name}.png` });
      console.log(`Saved step1-${vp.name}.png`);
    } else {
      const section = page.locator('#robot-target');
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(3000);
      await section.screenshot({ path: `D:/Robotics/31113-robolads/docs/pixel-audit/step1-${vp.name}.png` });
      console.log(`Saved step1-${vp.name}.png`);
    }
    await page.close();
  }

  await browser.close();
})();
