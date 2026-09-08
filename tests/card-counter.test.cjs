const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '../public/tools/card-counter');
const locales = ['zh', 'en', 'ja', 'ko'];

test('development serves each tool directory; static builds need no rewrites', async () => {
  const config = require('../next.config');
  const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } = require('next/constants');
  const routes = await config(PHASE_DEVELOPMENT_SERVER).rewrites();
  for (const locale of locales) {
    const prefix = `/tools/card-counter${locale === 'zh' ? '' : '/' + locale}/`;
    assert.deepEqual(routes.find(route => route.source === prefix), {
      source: prefix,
      destination: prefix + 'index.html',
    });
  }
  const production = config(PHASE_PRODUCTION_BUILD);
  assert.equal(production.output, 'export');
  assert.equal(production.rewrites, undefined);
});

for (const locale of locales) {
  test(`${locale}: metadata, language links and assets`, () => {
    const file = locale === 'zh' ? 'index.html' : `${locale}/index.html`;
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    const title = html.match(/<title>(.*?)<\/title>/)[1];
    const description = html.match(/name="description" content="([^"]+)"/)[1];
    assert.ok([...title].length > 0 && [...title].length <= 60);
    assert.ok([...description].length > 0 && [...description].length <= 160);
    assert.ok(html.includes(`<html lang="${locale}">`));
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.ok(!html.includes('cardcounter.pairusuo.top'));
    for (const [, url] of html.matchAll(/(?:src|href)="(\/tools\/card-counter\/[^\"]*)"/g)) {
      const relative = url.slice('/tools/card-counter/'.length);
      assert.ok(fs.existsSync(path.join(root, relative.endsWith('/') || !relative ? relative + 'index.html' : relative)), url);
    }
  });

  test(`${locale}: language switching stays inside the tool`, () => {
    const listeners = {};
    const items = locales.map(lang => ({ getAttribute: () => lang, setAttribute() {} }));
    const button = { setAttribute() {}, addEventListener() {} };
    const menu = {
      querySelectorAll: () => items,
      addEventListener: (name, fn) => { listeners[name] = fn; },
    };
    let destination;
    const window = {
      location: { pathname: `/tools/card-counter/${locale === 'zh' ? '' : locale + '/'}`, search: '?test=1', hash: '#cards', assign: url => { destination = url; } },
      addEventListener: (_, fn) => fn(),
    };
    const document = {
      currentScript: { src: 'https://example.test/tools/card-counter/i18n.js' },
      documentElement: { getAttribute: () => locale },
      getElementById: id => id === 'langBtn' ? button : menu,
      addEventListener() {},
    };
    vm.runInNewContext(fs.readFileSync(path.join(root, 'i18n.js'), 'utf8'), { window, document, URL });
    for (const target of locales) {
      listeners.click({ target: { closest: () => ({ getAttribute: () => target }) } });
      assert.equal(destination, `/tools/card-counter/${target === 'zh' ? '' : target + '/'}?test=1#cards`);
    }
  });
}
