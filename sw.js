// CLI_CODE offline support.
// Precaches the page shell so every page opens offline after one visit;
// data/ JSON stays network-first so fresh data wins when online;
// stamped assets (assets/...?v=hash) are cache-first.
// Cache-version policy: VERSION is restamped by scripts/build-data.mjs from
// the content the shell cache serves. A content change bumps VERSION -> new
// cache names -> activate purges the previous CLI_CODE-owned caches only
// (shell-clicode-* / runtime-clicode-*). Other projects' caches on this
// shared github.io origin are never touched. Byte-identical sw.js means no
// service-worker reinstall, so unchanged content never re-caches.
const VERSION = 'clicode-dbcd39c4';
const SHELL = 'shell-' + VERSION;
const RUNTIME = 'runtime-' + VERSION;
const OWNED = /^(shell|runtime)-clicode-/;
const PRECACHE = [
  './',
  '404.html',
  'ai-explorer.html',
  'best-ai-cli-tools.html',
  'best-database-cli-tools.html',
  'best-devops-cli-tools.html',
  'best-git-cli-tools.html',
  'best-kubernetes-cli-tools.html',
  'best-network-cli-tools.html',
  'best-security-cli-tools.html',
  'best-terminal-cli-tools.html',
  'cheatsheet.html',
  'cli.html',
  'compare.html',
  'docs.html',
  'find-model.html',
  'find.html',
  'index.html',
  'manifest.webmanifest',
  'model-compare.html',
  'model.html',
  'models.html',
  'registry.html',
  'run-local.html',
  'saved.html',
  'stacks.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => OWNED.test(k) && k !== SHELL && k !== RUNTIME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const networkFirst = () =>
    fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(RUNTIME).then((c) => c.put(req, copy));
      return res;
    });

  if (req.mode === 'navigate') {
    event.respondWith(
      networkFirst().catch(async () => (await caches.match(req)) || (await caches.match('404.html')))
    );
    return;
  }

  if (url.pathname.includes('/data/')) {
    event.respondWith(networkFirst().catch(() => caches.match(req)));
    return;
  }

  event.respondWith(
    caches.match(req).then((hit) => hit || networkFirst())
  );
});
