const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');
const { createHash } = require('node:crypto');
const root = path.join(__dirname, '..');
const slug = 'rubiks-cube-beginner-guide';
const { data, content } = matter(fs.readFileSync(path.join(root, 'content/blog', slug + '.mdx'), 'utf8'));
const catalog = require('../src/config/cube-tutorial-images.json');
const sources = require('../scripts/cube-official-sources.json');
const figures = [...content.matchAll(/<CubeFigure image="([^"]+)" caption="([^"]+)"\s*\/>/g)];

test('cube article metadata fits every configured site language', () => {
  for (const locale of ['zh', 'en', 'ja']) {
    const messages = require('../src/messages/' + locale + '.json');
    assert.ok([...`${data.title} | ${messages.meta.title}`].length <= 60, locale);
    assert.ok([...data.excerpt].length <= 160, locale);
  }
  assert.equal(data.status, 'published');
});

test('all instructional illustrations use the central catalog and one asset directory', () => {
  assert.ok(figures.length >= 30, 'detailed illustrated steps');
  assert.doesNotMatch(content, /English quick reference|R U R|L' U'|!\[|<img\b/);
  const used = new Set();
  for (const [, key, caption] of figures) {
    const item = catalog[key];
    assert.ok(item, key);
    used.add(key);
    assert.ok(item.alt.length > 10 && caption.length > 10);
    assert.equal(path.basename(item.file), item.file, 'all assets in one directory');
    assert.ok(item.width > 0 && item.height > 0);
    const svg = fs.readFileSync(path.join(root, 'public/images/rubiks-cube', item.file), 'utf8');
    assert.equal(item.version, createHash('sha256').update(svg).digest('hex').slice(0, 12), 'image cache version must match content');
    assert.match(svg, /<svg\b/);
    assert.match(svg, /viewBox=/);
    assert.doesNotMatch(svg, /<script\b|<foreignObject\b|(?:href|src)="https?:/);
    if (item.official) assert.ok(sources.some(source => source.file === item.file && source.source === 'https://rubiks.com/solve-guide'));
  }
  for (const hand of ['right', 'left']) {
    for (let step = 1; step <= 4; step++) assert.ok(used.has(`move-${hand}-${step}`));
  }
});

test('exported article has valid metadata, figures, attribution and discovery links', { skip: !process.env.CHECK_CUBE_EXPORT }, () => {
  const file = [path.join(root, 'out/blog', slug + '.html'), path.join(root, 'out/blog', slug, 'index.html')].find(fs.existsSync);
  assert.ok(file, 'built article exists');
  const html = fs.readFileSync(file, 'utf8');
  assert.ok([...html.match(/<title>(.*?)<\/title>/s)[1]].length <= 60);
  assert.ok([...html.match(/name="description" content="([^"]*)"/)[1]].length <= 160);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.equal((html.match(/<img\b/g) || []).length, figures.length);
  assert.equal((html.match(/<figcaption\b/g) || []).length, figures.length);
  assert.doesNotMatch(html, /English quick reference/);
  assert.match(html, /图源：/);
  for (const [, key] of figures) assert.ok(html.includes(`${catalog[key].file}?v=${catalog[key].version}`), key);
  assert.match(html, /grid-cols-1/);
  assert.match(html, /sm:grid-cols-2/);
  assert.match(html, /rel="canonical"/);
  assert.match(fs.readFileSync(path.join(root, 'out/sitemap.xml'), 'utf8'), new RegExp(slug));
  assert.match(fs.readFileSync(path.join(root, 'out/rss.xml'), 'utf8'), new RegExp(slug));
});
