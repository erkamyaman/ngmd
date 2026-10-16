#!/usr/bin/env node
/**
 * End-to-end check for sub-path hosting. Builds the site with a `base`,
 * serves `dist/analog/public` from that sub-path with a small static server
 * (nothing is served outside it, like a project page on GitHub Pages), then
 * opens pages in Chromium and checks that pages, assets, links, the router,
 * search and the sitemap all stay under the base.
 *
 *   node scripts/check-base.mjs [--base /repo/] [--skip-build]
 *
 * Needs `playwright-core` and a Chromium: set `PLAYWRIGHT_BROWSERS_PATH`
 * (default `/opt/pw-browsers`) or `CHROMIUM_PATH`.
 */
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname, extname, join, normalize, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'dist/analog/public');
const args = process.argv.slice(2);
const baseArg = args.indexOf('--base');
const base = normalizeBase(baseArg >= 0 ? args[baseArg + 1] : '/repo/');
// `site.url` from the config: the sitemap and social URLs start with it plus the base.
const SITE_ORIGIN = /url:\s*'(https?:\/\/[^']+?)\/*'/.exec(
  readFileSync(join(ROOT, 'src/ngmd.config.ts'), 'utf8'),
)[1];

function normalizeBase(value) {
  const trimmed = (value ?? '').trim().replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}/` : '/';
}

function findChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const dir = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  const hit = readdirSync(dir)
    .filter((d) => d.startsWith('chromium-'))
    .sort()
    .pop();
  if (!hit) throw new Error(`no chromium-* folder in ${dir}`);
  return join(dir, hit, 'chrome-linux/chrome');
}

function loadPlaywright() {
  const here = createRequire(import.meta.url);
  const roots = [
    ROOT,
    ...(process.env.NODE_PATH ?? '').split(':').filter(Boolean),
    '/opt/npm-tools/node_modules',
  ];
  for (const r of roots) {
    try {
      return createRequire(join(r, 'noop.js'))('playwright-core');
    } catch {
      // try the next place
    }
  }
  return here('playwright-core');
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.md': 'text/markdown; charset=utf-8',
  '.woff2': 'font/woff2',
};

/** Serve PUBLIC under `base` only. Paths outside it, or missing files, are 404 (with 404.html). */
function serve() {
  const outside = [];
  const server = createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    let path = decodeURIComponent(url.pathname);
    if (!path.startsWith(base)) {
      outside.push(path);
      return notFound(res);
    }
    path = normalize(path.slice(base.length)).replace(/^(\.\.[/\\])+/, '');
    let file = join(PUBLIC, path);
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    else if (!existsSync(file) && existsSync(`${file}.html`)) file = `${file}.html`;
    if (!existsSync(file) || !statSync(file).isFile()) return notFound(res);
    res.writeHead(200, {'content-type': TYPES[extname(file)] ?? 'application/octet-stream'});
    res.end(readFileSync(file));
  });
  function notFound(res) {
    const page = join(PUBLIC, '404.html');
    res.writeHead(404, {'content-type': 'text/html; charset=utf-8'});
    res.end(existsSync(page) ? readFileSync(page) : 'not found');
  }
  return new Promise((ok) =>
    server.listen(0, '127.0.0.1', () => ok({server, outside, port: server.address().port})),
  );
}

const failures = [];
const check = (ok, message) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${message}`);
  if (!ok) failures.push(message);
};

if (!args.includes('--skip-build')) {
  console.log(`building with NGMD_BASE=${base}`);
  execFileSync('npx', ['vite', 'build'], {
    cwd: ROOT,
    stdio: 'inherit',
    env: {...process.env, NGMD_BASE: base === '/' ? '' : base},
  });
}

const {chromium} = loadPlaywright();
const {server, outside, port} = await serve();
const origin = `http://127.0.0.1:${port}`;
const browser = await chromium.launch({executablePath: findChromium(), args: ['--no-sandbox']});
try {
  const page = await browser.newPage();
  const bad = [];
  const expected = new Set(); // paths that are meant to fail
  page.on('response', (r) => {
    const u = new URL(r.url());
    if (u.origin === origin && r.status() >= 400 && !expected.has(u.pathname)) {
      bad.push(`${r.status()} ${u.pathname}`);
    }
  });
  // Only this server's URLs count: fonts and CDN logos are not reachable offline.
  page.on('requestfailed', (r) => {
    const u = new URL(r.url());
    // The tab icon request is cancelled when a navigation starts; that is not a failure.
    if (u.origin === origin && !/favicon/.test(u.pathname)) bad.push(`failed ${r.url()}`);
  });
  page.on('pageerror', (e) => bad.push(`pageerror ${e.message}`));

  // 1. Home page, prerendered HTML and boot.
  const first = await page.goto(`${origin}${base}`, {waitUntil: 'networkidle'});
  check(first.status() === 200, `home page loads at ${base}`);
  check((await page.title()).length > 0, `home page has a title: "${await page.title()}"`);
  const baseHref = await page.getAttribute('base', 'href');
  check(baseHref === base, `<base href> is ${base} (got ${baseHref})`);
  const logoOk = await page.evaluate(() =>
    [...document.images].every(
      (i) => !i.src || new URL(i.src).origin !== location.origin || i.naturalWidth > 0,
    ),
  );
  check(logoOk, 'every image served by the site loads on the home page');

  // 2. Docs page opened directly (prerendered), with content, links and images.
  await page.goto(`${origin}${base}concepts/theming`, {waitUntil: 'networkidle'});
  check(await page.locator('main h1').first().isVisible(), 'a deep page renders its heading');
  const links = await page.$$eval('main a[href], nav a[href], header a[href]', (as) =>
    as.map((a) => a.getAttribute('href')),
  );
  const rooted = links.filter((h) => h && h.startsWith('/') && !h.startsWith('//'));
  const unprefixed = rooted.filter((h) => !h.startsWith(base));
  check(rooted.length > 0, `found ${rooted.length} internal links`);
  check(
    unprefixed.length === 0,
    `internal links all start with ${base} (bad: ${unprefixed.slice(0, 5).join(', ')})`,
  );
  const imgs = await page.$$eval('main img[src]', (is) => is.map((i) => i.getAttribute('src')));
  const badImgs = imgs.filter((s) => s.startsWith('/') && !s.startsWith(base));
  check(
    badImgs.length === 0,
    `image sources start with ${base} (bad: ${badImgs.slice(0, 5).join(', ')})`,
  );

  // 3. Client-side navigation through the sidebar keeps the base.
  const sidebarLink = page
    .locator('aside a[href*="markdown-routes"], nav a[href*="markdown-routes"]')
    .first();
  await sidebarLink.click();
  await page.waitForURL(`**${base}concepts/markdown-routes`);
  check(
    new URL(page.url()).pathname === `${base}concepts/markdown-routes`,
    'sidebar navigation stays under the base',
  );

  // Pages rendered in the browser (not prerendered) get the base too.
  const clientLinks = await page.$$eval('main a[href]', (as) =>
    as.map((a) => a.getAttribute('href')),
  );
  const clientBad = clientLinks.filter(
    (h) => h.startsWith('/') && !h.startsWith('//') && !h.startsWith(base),
  );
  check(
    clientBad.length === 0,
    `links on a page opened by navigation start with ${base} (bad: ${clientBad.slice(0, 5).join(', ')})`,
  );

  // 4. An in-content link goes to a page that exists.
  const target = await page.$$eval('main analog-markdown a[href^="/"], main a[href^="/"]', (as) =>
    as
      .map((a) => a.getAttribute('href'))
      .find((h) => h.length > 1 && !h.includes('#') && !h.endsWith('.md') && !h.endsWith('/')),
  );
  if (target) {
    const r = await page.goto(`${origin}${target}`, {waitUntil: 'networkidle'});
    check(r.status() === 200, `in-content link ${target} resolves`);
  }

  // 5. Search finds a page and opens it under the base.
  await page.goto(`${origin}${base}`, {waitUntil: 'networkidle'});
  await page.keyboard.press('Control+k');
  const input = page.locator('[role="dialog"] input, input[role="combobox"]').first();
  await input.waitFor({timeout: 5000});
  await input.fill('theming');
  await page.waitForFunction(
    () => /theming/i.test(document.querySelector('[role="dialog"]')?.textContent ?? ''),
    null,
    {timeout: 5000},
  );
  await page.waitForTimeout(300);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(800);
  const opened = new URL(page.url()).pathname;
  check(
    opened.startsWith(base) && opened.includes('theming'),
    `search result opens under the base (${opened})`,
  );

  // 6. Unknown paths under the base get the not-found page.
  expected.add(`${base}no-such-page`);
  const missing = await page.goto(`${origin}${base}no-such-page`, {waitUntil: 'networkidle'});
  check(missing.status() === 404, 'an unknown path gives 404');

  // 7. Sitemap, robots and raw markdown use the base.
  const sitemap = await (await page.request.get(`${origin}${base}sitemap.xml`)).text();
  const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  const wantPrefix = `${SITE_ORIGIN}${base === '/' ? '' : base.slice(0, -1)}`;
  check(
    locs.length > 0 && locs.every((l) => l === wantPrefix || l.startsWith(`${wantPrefix}/`)),
    `sitemap URLs start with ${wantPrefix} (first: ${locs[0]})`,
  );
  const robots = await (await page.request.get(`${origin}${base}robots.txt`)).text();
  check(
    robots.includes(`Sitemap: ${wantPrefix}/sitemap.xml`),
    'robots.txt points at the sitemap under the base',
  );
  const md = await page.request.get(`${origin}${base}concepts/theming.md`);
  check(md.status() === 200, 'raw markdown is served under the base');
  const og = await (await page.request.get(`${origin}${base}`)).text();
  check(
    og.includes(`content="${wantPrefix}/og.png"`) &&
      og.includes(`property="og:url" content="${wantPrefix}/"`),
    'og:url and og:image carry the base',
  );

  check(bad.length === 0, `no failed requests or page errors (${bad.slice(0, 5).join('; ')})`);
  check(
    outside.length === 0,
    `nothing requested outside the base (${[...new Set(outside)].slice(0, 5).join(', ')})`,
  );
} finally {
  await browser.close();
  server.close();
}
if (failures.length) {
  console.error(`\n${failures.length} check(s) failed for base ${base}`);
  process.exit(1);
}
console.log(`\nbase path check passed for ${base}`);
