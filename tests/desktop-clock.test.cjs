const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '../public/tools/desktop-clock');

test('clock metadata and local resources are valid', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.ok([...html.match(/<title>(.*?)<\/title>/)[1]].length <= 60);
  assert.ok([...html.match(/name="description" content="([^"]+)"/)[1]].length <= 160);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  for (const [, asset] of html.matchAll(/(?:href|src)="([^"/:]+\.[^"/]+)"/g)) {
    assert.ok(fs.existsSync(path.join(root, asset)), asset);
  }
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'site.webmanifest')));
  assert.equal(new URL(manifest.start_url, 'https://example.test/tools/desktop-clock/').pathname, '/tools/desktop-clock/');
});

test('clock directory works in development and retains static export', async () => {
  const config = require('../next.config');
  const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } = require('next/constants');
  assert.ok((await config(PHASE_DEVELOPMENT_SERVER).rewrites()).some(route => route.source === '/tools/desktop-clock/' && route.destination === '/tools/desktop-clock/index.html'));
  assert.equal(config(PHASE_PRODUCTION_BUILD).rewrites, undefined);
});

test('clock permits browser location only on its route; tool assets revalidate', async () => {
  const source = fs.readFileSync(path.join(__dirname, '../functions/_middleware.js'), 'utf8').replace('export async function onRequest', 'async function onRequest');
  const context = { URL, Headers, Response };
  vm.createContext(context);
  vm.runInContext(source, context);
  for (const pathname of ['/tools/desktop-clock/', '/tools/card-counter/', '/tools/desktop-clock/script.js', '/tools/card-counter/app.js']) {
    const response = await context.onRequest({
      request: { url: 'https://example.test' + pathname, method: 'GET' },
      env: {},
      next: async () => new Response('', { headers: { 'Permissions-Policy': 'geolocation=()' } }),
    });
    assert.equal(response.headers.get('Permissions-Policy').includes('geolocation=(self)'), pathname.startsWith('/tools/desktop-clock/'));
    if (pathname.endsWith('.js')) assert.equal(response.headers.get('Cache-Control'), 'public, max-age=0, must-revalidate');
  }
});
