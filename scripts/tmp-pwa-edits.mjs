#!/usr/bin/env node
// Temporary one-shot PWA/offline support changes (2026-11-12).
// Applied by .github/workflows/regen-pwa.yml; both files are removed after merge.
// Icons: this script writes assets/icon.svg; the workflow rasterizes it to PNGs with ImageMagick.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

writeFileSync('manifest.webmanifest', "{\n  \"name\": \"CLI_CODE - open directory of command-line tools\",\n  \"short_name\": \"CLI_CODE\",\n  \"description\": \"An open, self-contained directory of command-line tools for developers. Search by task, compare alternatives, build a stack, and generate cheat sheets - all client-side.\",\n  \"start_url\": \"./index.html\",\n  \"scope\": \"./\",\n  \"display\": \"standalone\",\n  \"background_color\": \"#0f172a\",\n  \"theme_color\": \"#0f172a\",\n  \"icons\": [\n    { \"src\": \"assets/icon-192.png\", \"sizes\": \"192x192\", \"type\": \"image/png\" },\n    { \"src\": \"assets/icon-512.png\", \"sizes\": \"512x512\", \"type\": \"image/png\", \"purpose\": \"any\" }\n  ]\n}\n");
writeFileSync('sw.js', "// CLI_CODE offline support.\n// Precaches the page shell so every page opens offline after one visit;\n// data/ JSON stays network-first so fresh data wins when online;\n// stamped assets (assets/...?v=hash) are cache-first.\nconst VERSION = 'clicode-v1';\nconst SHELL = 'shell-' + VERSION;\nconst RUNTIME = 'runtime-' + VERSION;\nconst PRECACHE = [\n  './',\n  '404.html',\n  'ai-explorer.html',\n  'best-ai-cli-tools.html',\n  'best-database-cli-tools.html',\n  'best-devops-cli-tools.html',\n  'best-git-cli-tools.html',\n  'best-kubernetes-cli-tools.html',\n  'best-network-cli-tools.html',\n  'best-security-cli-tools.html',\n  'best-terminal-cli-tools.html',\n  'cheatsheet.html',\n  'cli.html',\n  'compare.html',\n  'docs.html',\n  'find-model.html',\n  'find.html',\n  'index.html',\n  'manifest.webmanifest',\n  'model-compare.html',\n  'model.html',\n  'models.html',\n  'registry.html',\n  'run-local.html',\n  'saved.html',\n  'stacks.html'\n];\n\nself.addEventListener('install', (event) => {\n  event.waitUntil(\n    caches.open(SHELL).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())\n  );\n});\n\nself.addEventListener('activate', (event) => {\n  event.waitUntil(\n    caches.keys()\n      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL && k !== RUNTIME).map((k) => caches.delete(k))))\n      .then(() => self.clients.claim())\n  );\n});\n\nself.addEventListener('fetch', (event) => {\n  const req = event.request;\n  if (req.method !== 'GET') return;\n  const url = new URL(req.url);\n  if (url.origin !== self.location.origin) return;\n\n  const networkFirst = () =>\n    fetch(req).then((res) => {\n      const copy = res.clone();\n      caches.open(RUNTIME).then((c) => c.put(req, copy));\n      return res;\n    });\n\n  if (req.mode === 'navigate') {\n    event.respondWith(\n      networkFirst().catch(async () => (await caches.match(req)) || (await caches.match('404.html')))\n    );\n    return;\n  }\n\n  if (url.pathname.includes('/data/')) {\n    event.respondWith(networkFirst().catch(() => caches.match(req)));\n    return;\n  }\n\n  event.respondWith(\n    caches.match(req).then((hit) => hit || networkFirst())\n  );\n});\n");
writeFileSync('assets/icon.svg', "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 32 32\"><rect width=\"32\" height=\"32\" rx=\"7\" fill=\"#0f172a\"/><path d=\"M8 11l5 5-5 5M16 21h9\" stroke=\"#22c55e\" stroke-width=\"3\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>\n");

const reg = "\n// Shared: offline support - register the service worker (silent no-op where unsupported).\nif ('serviceWorker' in navigator) {\n  window.addEventListener('load', function () {\n    navigator.serviceWorker.register('sw.js').catch(function () { /* offline support unavailable */ });\n  });\n}\n";
const themePath = 'assets/js/theme.js';
const theme = readFileSync(themePath, 'utf8');
if (!theme.includes('serviceWorker')) writeFileSync(themePath, theme.replace(/\n*$/, '\n') + reg);

const link = '<link rel="manifest" href="manifest.webmanifest">';
for (const f of readdirSync('.').filter((f) => f.endsWith('.html'))) {
  const html = readFileSync(f, 'utf8');
  if (html.includes('rel="manifest"')) continue;
  const out = html.replace(/<meta name="viewport"[^>]*>/, (m) => m + '\n' + link);
  if (out === html) throw new Error('viewport meta not found in ' + f);
  writeFileSync(f, out);
}
console.log('pwa offline changes applied');
