/**
 * check-search.mjs — regression tests for assets/js/search.js.
 *
 * Plain Node, no dependencies: loads the browser script with a minimal
 * window shim and asserts ranking, typo tolerance and AND semantics
 * against a small deterministic fixture (not the live dataset).
 * Wired into `npm run check` so CI enforces it.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'assets/js/search.js'), 'utf8');
const window = {};
new Function('window', src)(window);
const S = window.CLISearch;
assert.ok(S, 'search.js must expose window.CLISearch');

const fixture = [
  {
    name: 'Terraform', slug: 'terraform', aliases: ['tf'], tags: ['iac', 'devops'],
    summary: 'Infrastructure as code tool', description: 'Provision cloud infrastructure',
    useCases: ['provision infra'], language: 'Go', platforms: ['linux', 'macos'],
    categories: ['devops'], dataQuality: 'curated',
  },
  {
    name: 'Terramate', slug: 'terramate', aliases: [], tags: ['iac'],
    summary: 'Orchestration for Terraform stacks', description: 'Stack management',
    useCases: [], language: 'Go', platforms: ['linux'], categories: ['devops'],
  },
  {
    name: 'kubectl', slug: 'kubectl', aliases: ['kube'], tags: ['kubernetes'],
    summary: 'Kubernetes command-line tool', description: 'Control Kubernetes clusters',
    useCases: ['deploy containers'], language: 'Go', platforms: ['linux'],
    categories: ['kubernetes'], dataQuality: 'curated',
  },
  {
    name: 'Ansible', slug: 'ansible', aliases: [], tags: ['automation'],
    summary: 'Agentless automation', description: 'Configuration management',
    useCases: [], language: 'Python', platforms: ['linux'], categories: ['devops'],
  },
];
const idx = S.build(fixture);
const names = (q) => S.query(idx, q).map((r) => r.entry.name);

// --- Exact-match behavior is unchanged ---
assert.equal(names('terraform')[0], 'Terraform', 'exact name query ranks the exact tool first');
assert.equal(names('terramate')[0], 'Terramate', 'exact match beats fuzzy candidates');
assert.ok(names('kubernetes').includes('kubectl'), 'tag/summary matching still works');
assert.deepEqual(names('terraform zzzqqqwww'), [], 'AND semantics: one unmatchable token kills the record');
assert.deepEqual(names('zzzqqqwww'), [], 'distant garbage still returns nothing');
assert.ok(names('kub').includes('kubectl'), 'short-token prefix matching unchanged (no fuzzy under 5 chars)');

// --- Typo tolerance (fallback after exact/prefix fails) ---
assert.equal(names('terrafom')[0], 'Terraform', 'deleted letter resolves (dist 1)');
assert.equal(names('terrafomr')[0], 'Terraform', 'transposed letters resolve (OSA dist 1)');
assert.ok(names('ansiblr').includes('Ansible'), 'substituted letter resolves (dist 1)');
assert.deepEqual(names('kubctl'), ['kubectl'], 'repo starter-issue example: kubctl resolves');
assert.deepEqual(names('ripgrpe'), [], 'no fixture tool near ripgrpe: fuzzy does not invent matches');
assert.deepEqual(names('terrafom infrastructure'), ['Terraform'], 'AND semantics hold with one typo token');
assert.deepEqual(names('terram'), ['Terramate'], 'prefix behavior unchanged');

// --- Ranking: fuzzy never outranks an exact/prefix match on the same token ---
const tf = S.query(idx, 'terraform');
assert.equal(tf[0].entry.name, 'Terraform');
assert.ok(tf[0].score >= 10, 'exact name-token score keeps full weight');

// --- highlight() tolerates fuzzy terms and escapes HTML ---
const res = S.query(idx, 'terrafom');
assert.ok(res.length > 0);
const html = S.highlight('Terraform provisions <b>infra</b>', res[0].terms);
assert.ok(!html.includes('<b>'), 'highlight escapes HTML');
assert.ok(html.includes('&lt;b&gt;'), 'highlight output is escaped');

// --- editDistance sanity ---
assert.equal(S.editDistance('terraform', 'terrafom', 2), 1);
assert.equal(S.editDistance('terraform', 'terrafomr', 2), 1, 'transposition counts as 1');
assert.equal(S.editDistance('kitten', 'sitting', 3), 3);
assert.equal(S.editDistance('abc', 'abcde', 1), 2, 'length difference beyond maxDist short-circuits to maxDist + 1');

// --- Performance guard: fuzzy stays instant over a 500-entry-scale index ---
const big = [];
for (let i = 0; i < 500; i++) {
  big.push({
    ...fixture[i % fixture.length],
    name: `Tool${i}name`, slug: `tool${i}name`,
    description: 'word'.repeat(40) + i,
  });
}
const bigIdx = S.build(big);
const t0 = process.hrtime.bigint();
for (let i = 0; i < 20; i++) S.query(bigIdx, 'terrafom infrastrcture');
const ms = Number(process.hrtime.bigint() - t0) / 1e6;
assert.ok(ms < 1000, `20 fuzzy queries over 500 entries took ${ms.toFixed(0)}ms (limit 1000ms)`);

console.log(`check-search: all assertions passed (perf: 20 fuzzy queries/500 entries in ${ms.toFixed(0)}ms)`);
