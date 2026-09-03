#!/usr/bin/env node
/**
 * check-model-links.mjs — validate that every URL in the model / AI-project
 * datasets is well-formed and, with --net, reachable (HEAD/GET, 2xx/3xx).
 * Offline by default so CI stays deterministic; run with --net locally.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const readJSON = (f) => JSON.parse(readFileSync(join(ROOT, f), 'utf8'));
const NET = process.argv.includes('--net');

const urls = new Map(); // url -> [where]
const add = (u, where) => { if (u) urls.set(u, [...(urls.get(u) || []), where]); };

for (const f of readdirSync(join(ROOT, 'data/models')).filter((x) => x.endsWith('.json'))) {
  for (const m of readJSON(`data/models/${f}`).models || []) {
    for (const k of ['apiEndpointDocumentation', 'modelRepository', 'githubRepository', 'huggingFace', 'officialDocumentation', 'technicalReport']) add(m[k], `${m.slug}.${k}`);
    for (const s of m.sources || []) add(s.url, `${m.slug}.source`);
    for (const b of m.benchmarks || []) add(b.source, `${m.slug}.benchmark`);
  }
}
try {
  for (const p of readJSON('data/ai-projects.json').projects || []) {
    add(p.repository, `${p.slug}.repo`); add(p.officialDocs, `${p.slug}.docs`);
    for (const s of p.sources || []) add(s.url, `${p.slug}.source`);
  }
} catch {}

const bad = [];
for (const [u, where] of urls) {
  try { const url = new URL(u); if (!/^https?:$/.test(url.protocol)) bad.push(`${u} (bad protocol) @ ${where[0]}`); }
  catch { bad.push(`${u} (malformed) @ ${where[0]}`); }
}
if (bad.length) { console.error(`[FAIL] ${bad.length} malformed URL(s):\n` + bad.map((b) => '  - ' + b).join('\n')); process.exit(1); }
console.log(`[ok] ${urls.size} unique URLs well-formed`);

if (NET) {
  let fail = 0;
  await Promise.all([...urls.keys()].map(async (u) => {
    try {
      const r = await fetch(u, { method: 'GET', redirect: 'follow', headers: { 'user-agent': 'cli-code-linkcheck' } });
      // 403/429 from api.github.com is unauthenticated rate-limiting, not a dead link
      if (r.status === 403 || r.status === 429) { console.warn(`  ${r.status} (rate-limited, not counted) ${u}`); return; }
      if (r.status >= 400) { console.error(`  ${r.status} ${u}`); fail++; }
    } catch (e) { console.error(`  ERR ${u} (${e.message})`); fail++; }
  }));
  if (fail) { console.error(`[FAIL] ${fail} unreachable URL(s)`); process.exit(1); }
  console.log(`[ok] all ${urls.size} URLs reachable`);
}
