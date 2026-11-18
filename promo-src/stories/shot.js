const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + __dirname + '/stories.html'); await p.waitForTimeout(800);
  for (let i = 1; i <= 7; i++) await (await p.$('#s' + i)).screenshot({ path: `n${i}.png` });
  await b.close();
})();
