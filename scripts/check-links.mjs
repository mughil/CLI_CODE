#!/usr/bin/env node
/**
 * check-links.mjs — offline integrity scan of the shipped site.
 *
 * Flags: missing local hrefs/srcs, case-mismatched paths, broken #anchors,
 * unsafe target="_blank" (no rel=noopener), duplicate element ids,
 * and forbidden tokens (localhost / file:// / absolute Windows paths / TODO / console.log).
 * Deterministic, no network. Exit 1 on any hard failure.
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
      // allow inside <code>/<pre> only for the documented "file://" caveat
      warnings.push(`${rel}:${line}: contains "${tok.replace(/\\\\/g, '\\')}"`);
    }
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
