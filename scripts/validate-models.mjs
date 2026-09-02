#!/usr/bin/env node
/**
 * validate-models.mjs — schema + integrity gate for the AI datasets.
 *
 * Reads every data/models/<group>.json (each: { group, models:[...] }) and
 * data/ai-projects.json ({ projects:[...] }), validates against the schemas,
 * checks unique ids/slugs, resolving cross-references, and openness values.
 * Exit 1 on any error. Prints the required roll-up stats.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Ajv2020 as Ajv } from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const readJSON = (f) => JSON.parse(readFileSync(join(ROOT, f), 'utf8'));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const vModel = ajv.compile(readJSON('schema/model.schema.json'));
const vProject = ajv.compile(readJSON('schema/aiproject.schema.json'));

const errors = [];
const models = [];
const modelDir = join(ROOT, 'data/models');
for (const f of readdirSync(modelDir).filter((x) => x.endsWith('.json')).sort()) {
  const doc = readJSON(`data/models/${f}`);
  for (const m of doc.models || []) { m._file = f; models.push(m); }
}

const ids = new Set();
const slugs = new Set();
for (const m of models) {
  const { _file, ...clean } = m;
  if (!vModel(clean)) {
    for (const e of vModel.errors) errors.push(`model ${m.slug || m.id || '(no id)'} [${_file}]: ${e.instancePath || '/'} ${e.message}`);
  }
  if (ids.has(m.id)) errors.push(`duplicate model id: ${m.id}`);
  ids.add(m.id);
  if (slugs.has(m.slug)) errors.push(`duplicate model slug: ${m.slug}`);
  slugs.add(m.slug);
  if (m.id !== m.slug) errors.push(`model ${m.slug}: id must equal slug`);
}
for (const m of models) {
  for (const rel of ['alternatives', 'related']) {
    for (const t of m[rel] || []) {
      if (!slugs.has(t)) errors.push(`model ${m.slug}: ${rel} -> "${t}" does not exist`);
      if (t === m.slug) errors.push(`model ${m.slug}: ${rel} points at itself`);
    }
  }
}

// AI projects (optional file)
let projects = [];
try { projects = readJSON('data/ai-projects.json').projects || []; } catch { /* not created yet */ }
const pIds = new Set();
const repos = new Set();
for (const p of projects) {
  if (!vProject(p)) for (const e of vProject.errors) errors.push(`project ${p.slug || '(no id)'}: ${e.instancePath} ${e.message}`);
  if (pIds.has(p.id)) errors.push(`duplicate project id: ${p.id}`);
  pIds.add(p.id);
  const repo = (p.repository || '').toLowerCase().replace(/\/$/, '');
  if (repos.has(repo)) errors.push(`duplicate project repository: ${p.repository}`);
  repos.add(repo);
  if (p.id !== p.slug) errors.push(`project ${p.slug}: id must equal slug`);
}

if (errors.length) {
  console.error(`[FAIL] ${errors.length} model/project validation error(s):\n` + errors.map((e) => '  - ' + e).join('\n'));
  process.exit(1);
}

const openCount = (v) => models.filter((m) => m.openSourceStatus === v).length;
const providers = new Set(models.map((m) => m.provider));
console.log('[ok] AI datasets valid');
console.log(`  TOTAL AI MODELS      ${models.length}`);
console.log(`  OPEN SOURCE          ${openCount('open-source')}`);
console.log(`  OPEN WEIGHT          ${openCount('open-weight')}`);
console.log(`  PROPRIETARY          ${openCount('proprietary') + openCount('api-only')}`);
console.log(`  LOCAL-CAPABLE        ${models.filter((m) => m.localCapable).length}`);
console.log(`  API-AVAILABLE        ${models.filter((m) => m.apiAvailable).length}`);
console.log(`  PROVIDER COUNT       ${providers.size}`);
console.log(`  GITHUB AI PROJECTS   ${projects.length}`);
