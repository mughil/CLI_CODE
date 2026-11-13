// CLI_CODE offline support.
// Precaches page shells and app resources so pages work after installation;
// data/ JSON stays network-first so fresh data wins when online;
// stamped assets (assets/...?v=hash) are cache-first.
// Cache-version policy: VERSION is restamped by scripts/build-data.mjs from
// the content the shell cache serves. A content change bumps VERSION -> new
// cache names -> activate purges the previous CLI_CODE-owned caches only
// (shell-clicode-* / runtime-clicode-*). Other projects' caches on this
// shared github.io origin are never touched. Byte-identical sw.js means no
// service-worker reinstall, so unchanged content never re-caches.
const VERSION = 'clicode-123e3cfb';
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

// APP_RESOURCES:auto
const APP_RESOURCES = [
  "assets/css/site.css?v=255a15e9",
  "assets/js/ai-explorer.js?v=e722cc3d",
  "assets/js/cheatsheet.js?v=647fd0cb",
  "assets/js/cli.js?v=f5c1a7c8",
  "assets/js/compare.js?v=fb27c9f7",
  "assets/js/data.js?v=5b049d0c",
  "assets/js/find-model.js?v=12906839",
  "assets/js/find.js?v=42563569",
  "assets/js/home.js?v=649ac517",
  "assets/js/model-compare.js?v=540ad80d",
  "assets/js/model.js?v=09082ba8",
  "assets/js/modeldata.js?v=89eb71f6",
  "assets/js/models.js?v=cc507c80",
  "assets/js/registry.js?v=2d05b414",
  "assets/js/run-local.js?v=3949dda5",
  "assets/js/saved.js?v=bdd99fd5",
  "assets/js/search.js?v=d7707b75",
  "assets/js/stacks.js?v=3a25f243",
  "assets/js/store.js?v=24d70c65",
  "assets/js/theme.js?v=2bab0417",
  "assets/fonts/ibm-plex-sans-latin.woff2",
  "assets/fonts/jetbrains-mono-latin.woff2",
  "data/clis.json",
  "data/meta.json",
  "data/stacks.json",
  "data/matrix_registry.json",
  "data/models.json",
  "data/model-meta.json",
  "data/ai-projects.json"
];
// /APP_RESOURCES:auto

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL).then((cache) => cache.addAll([...PRECACHE, ...APP_RESOURCES])).then(() => self.skipWaiting())
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
      if (res.ok) {
        const copy = res.clone();
        event.waitUntil(caches.open(RUNTIME).then((c) => c.put(req, copy)));
      }
      return res;
    });

  if (req.mode === 'navigate') {
    event.respondWith(
      networkFirst().catch(async () => {
        // Query strings select client-side views, not different HTML shells.
        // Only ignore them inside this app's shell cache, never across origins.
        const shell = await caches.open(SHELL);
        return (await caches.match(req)) ||
          (await shell.match(url.origin + url.pathname)) ||
          (await shell.match('404.html'));
      })
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
