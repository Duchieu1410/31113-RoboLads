const { chromium } = require('../web/node_modules/playwright');

async function profile() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=gl', '--disable-gpu-vsync']
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  await page.goto('http://localhost:3000/cad', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Profile CPU execution using Chrome DevTools Protocol (CDP) Profiler
  const client = await page.context().newCDPSession(page);
  await client.send('Profiler.enable');
  await client.send('Profiler.start');

  console.log('Profiling CPU for 3 seconds...');
  await page.waitForTimeout(3000);

  const { profile } = await client.send('Profiler.stop');

  // Parse the top time-consuming functions
  const nodeMap = new Map();
  for (const node of profile.nodes) {
    nodeMap.set(node.id, node);
  }

  const fnTimes = {};
  if (profile.samples && profile.timeDeltas) {
    for (let i = 0; i < profile.samples.length; i++) {
      const nodeId = profile.samples[i];
      const delta = profile.timeDeltas[i]; // microseconds
      const node = nodeMap.get(nodeId);
      if (node && node.callFrame) {
        const name = `${node.callFrame.functionName || '(anonymous)'} (${node.callFrame.url.split('/').pop()}:${node.callFrame.lineNumber})`;
        fnTimes[name] = (fnTimes[name] || 0) + delta;
      }
    }
  }

  const sorted = Object.entries(fnTimes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  console.log('\n--- Top 15 CPU Consumers (microseconds) ---');
  for (const [fn, time] of sorted) {
    console.log(`${(time / 1000).toFixed(1)} ms : ${fn}`);
  }

  await browser.close();
}

profile().catch(console.error);
