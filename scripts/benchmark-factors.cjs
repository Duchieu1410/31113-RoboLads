const { chromium } = require('../web/node_modules/playwright');

async function benchmark() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=gl', '--disable-gpu-vsync']
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  console.log('Navigating to http://localhost:3000/cad ...');
  await page.goto('http://localhost:3000/cad', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Measure performance in REAL CAD mode and PIXEL mode
  const metrics = await page.evaluate(async () => {
    // Collect Three.js renderer info if exposed, or measure frame durations
    const samples = [];
    let last = performance.now();

    await new Promise((resolve) => {
      let frames = 0;
      function tick() {
        const now = performance.now();
        samples.push(now - last);
        last = now;
        frames++;
        if (frames < 120) {
          requestAnimationFrame(tick);
        } else {
          resolve();
        }
      }
      requestAnimationFrame(tick);
    });

    const avgFrameTime = samples.reduce((a, b) => a + b, 0) / samples.length;
    const maxFrameTime = Math.max(...samples);
    const minFrameTime = Math.min(...samples);
    const fps = Math.round(1000 / avgFrameTime);

    return { avgFrameTime: avgFrameTime.toFixed(2), minFrameTime: minFrameTime.toFixed(2), maxFrameTime: maxFrameTime.toFixed(2), fps };
  });

  console.log('--- Real CAD Mode Metrics ---');
  console.log(`FPS: ${metrics.fps}, Avg Frame Time: ${metrics.avgFrameTime}ms, Min: ${metrics.minFrameTime}ms, Max: ${metrics.maxFrameTime}ms`);

  // Switch to PIXEL mode
  await page.click('button:has-text("PIXEL")');
  await page.waitForTimeout(500);

  const pixelMetrics = await page.evaluate(async () => {
    const samples = [];
    let last = performance.now();

    await new Promise((resolve) => {
      let frames = 0;
      function tick() {
        const now = performance.now();
        samples.push(now - last);
        last = now;
        frames++;
        if (frames < 120) {
          requestAnimationFrame(tick);
        } else {
          resolve();
        }
      }
      requestAnimationFrame(tick);
    });

    const avgFrameTime = samples.reduce((a, b) => a + b, 0) / samples.length;
    const maxFrameTime = Math.max(...samples);
    const fps = Math.round(1000 / avgFrameTime);

    return { avgFrameTime: avgFrameTime.toFixed(2), maxFrameTime: maxFrameTime.toFixed(2), fps };
  });

  console.log('--- Pixel Mode Metrics ---');
  console.log(`FPS: ${pixelMetrics.fps}, Avg Frame Time: ${pixelMetrics.avgFrameTime}ms, Max: ${pixelMetrics.maxFrameTime}ms`);

  await browser.close();
}

benchmark().catch(console.error);
