#!/usr/bin/env node
/**
 * validate-data.mjs — schema + referential integrity gate for data/clis.json.
 * Exit 1 on any structural error or dangling cross-reference.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Ajv2020 as Ajv } from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const readJSON = (f) => JSON.parse(readFileSync(join(ROOT, f), 'utf8'));

const schema = readJSON('schema/cli.schema.json');
const doc = readJSON('data/clis.json');
const entries = doc.clis || [];

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

const errors = [];

// 1. per-entry schema
for (const e of entries) {
  if (!validate(e)) {
    for (const err of validate.errors) {
      errors.push(`${e.slug || '(no slug)'}: ${err.instancePath || '/'} ${err.message}`);
    }
  }
}

// 2. unique slug / id
const seen = new Map();
for (const e of entries) {
  if (seen.has(e.slug)) errors.push(`duplicate slug: ${e.slug}`);
  seen.set(e.slug, e);
  if (e.id !== e.slug) errors.push(`${e.slug}: id must equal slug`);
}

// 3. cross-references resolve
for (const e of entries) {
  for (const rel of ['alternatives', 'related']) {
    for (const target of e[rel] || []) {
      if (!seen.has(target)) errors.push(`${e.slug}: ${rel} -> "${target}" does not exist`);
      if (target === e.slug) errors.push(`${e.slug}: ${rel} points at itself`);
    }
  }
}

// 4. doc-level count
if (doc.count !== entries.length) errors.push(`doc.count ${doc.count} != entries ${entries.length}`);

// 5. stack presets
const stackSchema = readJSON('schema/stack.schema.json');
const validateStack = ajv.compile(stackSchema);
const stacks = (readJSON('data/stacks.json').stacks) || [];
const stackIds = new Set();
for (const s of stacks) {
  if (!validateStack(s)) {
    for (const err of validateStack.errors) errors.push(`stack ${s.id || '(no id)'}: ${err.instancePath} ${err.message}`);
  }
  if (stackIds.has(s.id)) errors.push(`duplicate stack id: ${s.id}`);
  stackIds.add(s.id);
  for (const pick of s.picks || []) {
    if (!seen.has(pick.slug)) errors.push(`stack ${s.id}: pick "${pick.slug}" is not a known tool`);
  }
}

if (errors.length) {
  console.error(`[FAIL] ${errors.length} validation error(s):\n` + errors.map((e) => '  - ' + e).join('\n'));
  process.exit(1);
}
console.log(`[ok] ${entries.length} entries + ${stacks.length} stacks valid (schema + ${countRefs()} cross-references resolve)`);

function countRefs() {
  let n = 0;
  for (const e of entries) n += (e.alternatives?.length || 0) + (e.related?.length || 0);
  return n;
}
