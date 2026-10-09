const { chromium } = require('playwright');
(async () => {
  const [,, html, out] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://' + html); await p.waitForTimeout(300);
  await p.pdf({ path: out, format: 'A4', preferCSSPageSize: true, printBackground: true, tagged: true, outline: true });
  await b.close();
})();
