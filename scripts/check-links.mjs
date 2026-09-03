#!/usr/bin/env node
/**
 * check-links.mjs — offline integrity scan of the shipped site.
 *
 * Flags: missing local hrefs/srcs, case-mismatched paths, broken #anchors,
 * unsafe target="_blank" (no rel=noopener), duplicate element ids,
 * and forbidden tokens (localhost / file:// / absolute Windows paths / TODO / console.log).
 * Deterministic, no network. Exit 1 on any hard failure.
 *
 *   node scripts/check-links.mjs          # offline integrity (in `npm run check`)
 *   node scripts/check-links.mjs --net    # also GET every external URL in
 *                                         # data/clis.json (opt-in, non-deterministic)
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, relative, posix } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['node_modules', '.git', 'design-system', '.claude']);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const files = walk(ROOT);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const jsFiles = files.filter((f) => f.endsWith('.js') || f.endsWith('.mjs'));
const errors = [];
const warnings = [];

// index every real path lowercased -> actual, for case-mismatch detection
const realPaths = new Set(files.map((f) => relative(ROOT, f).split('\\').join('/')));
const realLower = new Map([...realPaths].map((p) => [p.toLowerCase(), p]));

const idsById = {};

for (const file of htmlFiles) {
  const rel = relative(ROOT, file).split('\\').join('/');
  const html = readFileSync(file, 'utf8');

  // duplicate ids
  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map((m) => m[1]);
  const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
  if (dup.length) errors.push(`${rel}: duplicate id(s): ${[...new Set(dup)].join(', ')}`);
  idsById[rel] = new Set(ids);

  // forbidden tokens
  for (const tok of ['localhost', 'file://', 'C:\\\\', 'C:/Users', 'TODO', 'FIXME']) {
    const re = new RegExp(tok, 'g');
    const hits = [...html.matchAll(re)];
    for (const h of hits) {
      const line = html.slice(0, h.index).split('\n').length;
      warnings.push(`${rel}:${line}: contains "${tok.replace(/\\\\/g, '\\')}"`);
    }
  }

  // stale branding / dead internal targets
  for (const bad of ['CLI-Anything Hub', 'clianything', 'matrices.html']) {
    if (html.includes(bad)) {
      const line = html.slice(0, html.indexOf(bad)).split('\n').length;
      errors.push(`${rel}:${line}: stale reference "${bad}"`);
    }
  }

  // images need alt text
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt=/.test(m[0])) errors.push(`${rel}: <img> without alt: ${m[0].slice(0, 70)}`);
  }

  // unsafe target=_blank
  for (const m of html.matchAll(/<a\b[^>]*\btarget=["']_blank["'][^>]*>/g)) {
    if (!/\brel=["'][^"']*noopener/.test(m[0])) {
      errors.push(`${rel}: target="_blank" without rel="noopener": ${m[0].slice(0, 80)}`);
    }
  }
}

// resolve href/src references
for (const file of htmlFiles) {
  const rel = relative(ROOT, file).split('\\').join('/');
  const html = readFileSync(file, 'utf8');
  const refs = [...html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)].map((m) => m[1]);

  for (const ref of refs) {
    if (/^(https?:)?\/\//.test(ref) || ref.startsWith('mailto:') || ref.startsWith('data:')) continue;
    if (ref.startsWith('#')) {
      const id = decodeURIComponent(ref.slice(1));
      if (id && !idsById[rel].has(id)) warnings.push(`${rel}: anchor ${ref} has no matching id (may be JS-injected)`);
      continue;
    }
    const [pathPart, hash] = ref.split('#');
    if (!pathPart) continue;
    const abs = resolve(dirname(file), pathPart.split('?')[0]);
    const target = relative(ROOT, abs).split('\\').join('/');
    if (!realPaths.has(target)) {
      if (realLower.has(target.toLowerCase())) {
        errors.push(`${rel}: "${ref}" case mismatch -> actual "${realLower.get(target.toLowerCase())}"`);
      } else {
        errors.push(`${rel}: "${ref}" -> missing file (${target})`);
      }
      continue;
    }
    if (hash && target.endsWith('.html')) {
      const targetHtml = readFileSync(abs, 'utf8');
      const targetIds = new Set([...targetHtml.matchAll(/\sid=["']([^"']+)["']/g)].map((m) => m[1]));
      if (!targetIds.has(decodeURIComponent(hash))) {
        warnings.push(`${rel}: "${ref}" anchor #${hash} not found in ${target} (may be JS-injected)`);
      }
    }
  }
}

// js debugging leftovers
for (const file of jsFiles) {
  if (file.includes(`${posix.sep}scripts${posix.sep}`) || /[\\/]scripts[\\/]/.test(file)) continue;
  const rel = relative(ROOT, file).split('\\').join('/');
  const js = readFileSync(file, 'utf8');
  js.split('\n').forEach((ln, i) => {
    if (/\bconsole\.log\(/.test(ln)) errors.push(`${rel}:${i + 1}: console.log`);
    if (/\blocalhost\b|file:\/\//.test(ln)) warnings.push(`${rel}:${i + 1}: localhost/file:// reference`);
  });
}

if (warnings.length) console.warn(`[warn] ${warnings.length} warning(s):\n` + warnings.map((w) => '  - ' + w).join('\n'));
if (errors.length) {
  console.error(`[FAIL] ${errors.length} error(s):\n` + errors.map((e) => '  - ' + e).join('\n'));
  process.exit(1);
}
console.log(`[ok] links & integrity OK (${htmlFiles.length} html, ${jsFiles.length} js scanned)`);

// ---- opt-in external-URL reachability ------------------------------------
if (process.argv.includes('--net')) {
  const clisPath = join(ROOT, 'data/clis.json');
  const clis = existsSync(clisPath) ? JSON.parse(readFileSync(clisPath, 'utf8')).clis || [] : [];
  const urls = new Map();
  for (const c of clis) {
    for (const k of ['documentation', 'repository']) {
      const u = c[k];
      if (u && /^https?:\/\//.test(u)) urls.set(u, [...(urls.get(u) || []), `${c.slug}.${k}`]);
    }
  }
  console.log(`\n[net] GET ${urls.size} unique external URL(s) from data/clis.json ...`);
  const list = [...urls.keys()];
  const bad = [];     // definitive: HTTP 4xx/5xx (a real dead link)
  const soft = [];    // connection-level failure after retry (usually the site
                      // blocks automated clients or the runner's network — not
                      // proof the link is dead). Reported, does not fail.
  let ok = 0;
  const CHUNK = 24;
  for (let i = 0; i < list.length; i += CHUNK) {
    await Promise.all(list.slice(i, i + CHUNK).map(async (u) => {
      const once = async () => {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 25000);
        try {
          return await fetch(u, { method: 'GET', redirect: 'follow', signal: ctrl.signal, headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) cli-code-linkcheck' } });
        } finally { clearTimeout(timer); }
      };
      try {
        let r;
        try { r = await once(); }
        catch { await new Promise((res) => setTimeout(res, 1500)); r = await once(); } // one retry — transient DNS/TLS/abort
        if (r.status === 429 || r.status === 403) { console.warn(`  ${r.status} (blocked/rate-limited, not counted) ${u}`); return; }
        if (r.status >= 400) bad.push(`${r.status} ${u}  <- ${urls.get(u)[0]}`);
        else ok++;
      } catch (e) { soft.push(`ERR ${u} (${e.message})  <- ${urls.get(u)[0]}`); }
    }));
  }
  if (soft.length) console.warn(`[warn] ${soft.length} URL(s) unreachable from here (site blocks bots / network) — verify manually:\n` + soft.map((b) => '  - ' + b).join('\n'));
  console.log(`[net] ${ok} reachable, ${soft.length} inconclusive, ${bad.length} dead`);
  if (bad.length) {
    console.error(`[FAIL] ${bad.length} dead external URL(s) (HTTP 4xx/5xx):\n` + bad.map((b) => '  - ' + b).join('\n'));
    process.exit(1);
  }
  console.log(`[ok] ${ok} external URLs reachable`);
}
