#!/usr/bin/env node
/** model-stats.mjs — human-readable roll-up of the AI datasets. */
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const readJSON = (f) => JSON.parse(readFileSync(join(ROOT, f), 'utf8'));

const models = [];
for (const f of readdirSync(join(ROOT, 'data/models')).filter((x) => x.endsWith('.json'))) {
  for (const m of readJSON(`data/models/${f}`).models || []) models.push(m);
}
let projects = [];
try { projects = readJSON('data/ai-projects.json').projects || []; } catch {}

const tally = (arr, key) => {
  const m = new Map();
  for (const x of arr) for (const v of [].concat(key(x) || [])) m.set(v, (m.get(v) || 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

console.log(`Models: ${models.length}   Providers: ${new Set(models.map((m) => m.provider)).size}   GitHub AI projects: ${projects.length}\n`);
console.log('By provider:'); for (const [k, n] of tally(models, (m) => m.provider)) console.log(`  ${String(n).padStart(3)}  ${k}`);
console.log('\nBy openness:'); for (const [k, n] of tally(models, (m) => m.openSourceStatus)) console.log(`  ${String(n).padStart(3)}  ${k}`);
console.log('\nBy category:'); for (const [k, n] of tally(models, (m) => m.categories)) console.log(`  ${String(n).padStart(3)}  ${k}`);
console.log(`\nLocal-capable: ${models.filter((m) => m.localCapable).length}   API-available: ${models.filter((m) => m.apiAvailable).length}`);
