// Screenshots use the existing demo data only; no messages are submitted.
const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const base = 'https://kumiko0814.github.io/haruka-ai-labo/';
const output = path.resolve('guide-captures');
(async () => {
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, reducedMotion: 'reduce', locale: 'ja-JP' });
    // Serve the checked-out files while keeping the real public address in URL fields.
    await context.route('**/*', async route => {
      const url = route.request().url();
      if (!url.startsWith(base)) return route.abort();
      const response = await route.fetch({ url: 'http://127.0.0.1:8766/' + url.slice(base.length) });
      await route.fulfill({ response });
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    async function go(route) {
      await page.goto(base + route, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
    }
    async function snap(name, target = page) {
      await target.screenshot({ path: path.join(output, name + '.jpg'), type: 'jpeg', quality: 88, animations: 'disabled' });
    }
    await go('kanri.html?demo=1&gate=1');
    await snap('01_gate');
    await go('kanri.html?demo=1');
    await snap('02_kanri_full');
    await page.locator('#sec-inbox').evaluate(el => el.scrollIntoView({ block: 'start' }));
    await snap('03_inbox');
    const draft = page.locator('#ilist > .item').filter({ has: page.getByRole('button', { name: '承認して送信', exact: true }) }).first();
    await snap('04_approve_card', draft);
    await page.locator('#sec-invite').evaluate(el => el.scrollIntoView({ block: 'start' }));
    await snap('05_invite');
    await page.locator('#sec-bugs').evaluate(el => el.scrollIntoView({ block: 'start' }));
    await snap('06_bugbox');
    await page.setViewportSize({ width: 1280, height: 900 });
    await go('kanri.html?demo=1');
    await snap('10_kanri_pc');
    await page.setViewportSize({ width: 390, height: 844 });
    await go('start.html?demo=1');
    await snap('07_start');
    await go('index.html?demo=1');
    await page.locator('#ntcClose').waitFor({ state: 'visible' });
    await page.locator('#ntcClose').click();
    await page.locator('.mn[data-v="v_adv"]').click();
    await snap('08_student');
    await page.locator('.mn[data-v="v_set"]').click();
    await page.locator('#bugL').click();
    await snap('09_bugreport');
    await go('handover.html?demo=1');
    await page.screenshot({ path: path.join(output, 'handover-mobile.png'), fullPage: true, animations: 'disabled' });
    for (const width of [390, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      if (overflow) throw Error('Guide overflows at ' + width + 'px');
    }
    if (errors.length) throw Error(errors.join('\n'));
    console.log('Captured 10 demo screens; guide has no horizontal overflow at 390, 768 and 1280px.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
