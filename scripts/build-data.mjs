#!/usr/bin/env node
/**
 * build-data.mjs — deterministic data pipeline.
 *
 * Reads the upstream registry snapshots + the contributor overlay, emits one
 * normalized file the site loads (data/clis.json) plus facet metadata
 * (data/meta.json). No network, no randomness, stable key order.
 *
 *   node scripts/build-data.mjs            # write output
 *   node scripts/build-data.mjs --check    # fail if output would change (CI drift gate)
 *
 * Derivation never invents domain facts. Fields that cannot be derived safely
 * (useCases, alternatives, related, difficulty, examples, precise language) are
 * left empty unless the overlay supplies a human-verified value.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = (...s) => join(ROOT, ...s);
const readJSON = (f) => JSON.parse(readFileSync(p(f), 'utf8'));

const CHECK = process.argv.includes('--check');

// ---------- helpers ----------------------------------------------------------

const slugify = (s) =>
  String(s).toLowerCase().trim()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const CATEGORY_ALIASES = {
  scientific: 'science',
  gamedev: 'game',
  'knowledge-management': 'knowledge',
};
const normCat = (c) => CATEGORY_ALIASES[c] || c;

function firstSentence(text) {
  const t = String(text).trim().replace(/\s+/g, ' ');
  const m = t.match(/^(.+?[.!?])(\s|$)/);
  let s = m ? m[1] : t;
  if (s.length > 160) s = s.slice(0, 157).replace(/\s+\S*$/, '') + '…';
  return s;
}

function detectRuntime(requires) {
  const r = String(requires || '').toLowerCase();
  if (/\bnode\.?js\b|\bnpm\b|\bnpx\b/.test(r)) return 'node';
  if (/\bpython\b|\bpip\b|\bpipx\b|\bpytorch\b|\buv\b/.test(r)) return 'python';
  if (/\bgolang\b|\bgo \d|\bgo toolchain\b/.test(r)) return 'go';
  if (/\brust\b|\bcargo\b/.test(r)) return 'rust';
  if (/\bjava\b|\.jar\b/.test(r)) return 'java';
  if (/\.net\b|\bdotnet\b/.test(r)) return 'dotnet';
  return null;
}

const CROSS_PLATFORM_RUNTIMES = new Set(['node', 'python', 'go', 'rust', 'java', 'dotnet']);

function detectPlatforms(requires, runtime) {
  const r = String(requires || '').toLowerCase();
  const out = new Set();
  if (/\bmacos only\b|\bmac only\b|\bmacos-only\b/.test(r)) return ['macos'];
  if (/\bwindows only\b|\bwindows-only\b/.test(r)) return ['windows'];
  if (/\blinux only\b/.test(r)) return ['linux'];
  if (/\bmacos\b|\bmac os\b|\bosx\b/.test(r)) out.add('macos');
  if (/\bwindows\b/.test(r)) out.add('windows');
  if (/\blinux\b/.test(r)) out.add('linux');
  if (out.size) return [...out].sort();
  if (runtime && CROSS_PLATFORM_RUNTIMES.has(runtime)) return ['cross-platform'];
  return [];
}

function detectPackageManagers(commands) {
  const blob = commands.filter(Boolean).join(' \n ').toLowerCase();
  const out = new Set();
  if (/\bpip install\b|\bpip3 install\b/.test(blob)) out.add('pip');
  if (/\bpipx\b/.test(blob)) out.add('pipx');
  if (/\buv (tool )?(install|add)\b|\buvx\b/.test(blob)) out.add('uv');
  if (/\bnpm (install|i)\b/.test(blob)) out.add('npm');
  if (/\bpnpm\b/.test(blob)) out.add('pnpm');
  if (/\bnpx\b/.test(blob)) out.add('npx');
  if (/\bbrew (install|tap)\b/.test(blob)) out.add('brew');
  if (/\bcargo install\b/.test(blob)) out.add('cargo');
  if (/\bgo install\b/.test(blob)) out.add('go');
  if (/\bgit\+https?:|git\+ssh:|#subdirectory=/.test(blob)) out.add('git');
  return [...out].sort();
}

function installMethod(cmd) {
  const c = cmd.toLowerCase();
  if (/\bpip3? install\b/.test(c)) return 'pip';
  if (/\bpipx\b/.test(c)) return 'pipx';
  if (/\buv (tool )?(install|add)\b|\buvx\b/.test(c)) return 'uv';
  if (/\bnpm (install|i)\b/.test(c)) return 'npm';
  if (/\bpnpm\b/.test(c)) return 'pnpm';
  if (/\bnpx\b/.test(c)) return 'npx';
  if (/\bbrew\b/.test(c)) return 'brew';
  if (/\bcargo install\b/.test(c)) return 'cargo';
  if (/\bgo install\b/.test(c)) return 'go';
  if (/git\+/.test(c)) return 'git';
  return 'shell';
}

// Controlled tag vocabulary — a tag is added only when the whole word/phrase
// appears in the name or description. Category is always included as a tag.
const TAG_VOCAB = [
  'api', 'rest', 'graphql', 'http', 'mock', 'proxy', 'webhook', 'oauth',
  'render', 'rendering', '3d', 'cad', 'mesh', 'modeling', 'animation',
  'image', 'photo', 'vector', 'raster', 'painting', 'svg', 'texture',
  'audio', 'music', 'sound', 'voice', 'transcription', 'tts', 'speech',
  'video', 'editing', 'encode', 'ffmpeg', 'caption', 'subtitle', 'capture',
  'screen-recording', 'streaming',
  'diagram', 'flowchart', 'chart', 'whiteboard',
  'database', 'sql', 'vector-database', 'embeddings', 'search', 'index',
  'llm', 'ai', 'model', 'inference', 'agent', 'prompt', 'rag',
  'automation', 'workflow', 'pipeline', 'orchestration', 'scheduler',
  'browser', 'scraping', 'crawler', 'playwright', 'chromium',
  'terminal', 'shell', 'repl', 'tui',
  'notes', 'markdown', 'knowledge-base', 'wiki', 'documents', 'ebook', 'pdf',
  'devops', 'monitoring', 'logging', 'observability', 'deployment', 'ci',
  'process-manager', 'container', 'docker', 'kubernetes',
  'game-engine', 'gamedev', 'godot', 'unreal',
  'gis', 'mapping', 'geospatial', 'simulation', 'scientific-computing',
  'secrets', 'password', 'security', 'osint',
  'cms', 'commerce', 'ecommerce', 'publishing',
  'spreadsheet', 'presentation', 'office', 'reference-manager', 'citations',
];

function deriveTags(name, description, category) {
  const hay = ` ${name} ${description} `.toLowerCase();
  const tags = new Set([category]);
  for (const term of TAG_VOCAB) {
    const re = new RegExp(`(^|[^a-z0-9])${term.replace(/[-]/g, '[- ]')}([^a-z0-9]|$)`);
    if (re.test(hay)) tags.add(term.replace(/ /g, '-'));
  }
  return [...tags].sort();
}

// ---------- load -----------------------------------------------------------

const harness = readJSON('data/registry.json').clis || [];
const publicClis = readJSON('data/public_registry.json').clis || [];
const dates = readJSON('data/registry-dates.json') || {};
const overlay = readJSON('data/overlay.json').entries || {};

// ---------- normalize -----------------------------------------------------

function normalize(raw, source) {
  const slug = slugify(raw.name);
  const ov = overlay[slug] || {};
  const category = normCat(raw.category || 'other');

  const runtime = ov.runtime ?? detectRuntime(raw.requires);
  const cmds = [raw.install_cmd, raw.npx_cmd, raw.update_cmd, raw.uninstall_cmd];

  const install = [];
  const seenCmd = new Set();
  const pushInstall = (method, command, label) => {
    if (!command || seenCmd.has(command)) return;
    seenCmd.add(command);
    const e = { method, command };
    if (label) e.label = label;
    install.push(e);
  };
  if (raw.install_cmd) pushInstall(installMethod(raw.install_cmd), raw.install_cmd, 'Install');
  if (raw.npx_cmd) pushInstall('npx', raw.npx_cmd, 'Run via npx');
  if (raw.skill_md && /^(npx|pnpm|uvx?) /.test(raw.skill_md)) pushInstall('agent-skill', raw.skill_md, 'Agent skill');
  if (raw.update_cmd) pushInstall(installMethod(raw.update_cmd), raw.update_cmd, 'Update');
  if (raw.uninstall_cmd) pushInstall(installMethod(raw.uninstall_cmd), raw.uninstall_cmd, 'Uninstall');
  for (const e of ov.install || []) pushInstall(e.method, e.command, e.label);

  const aliases = new Set(ov.aliases || []);
  if (raw.name && raw.name !== slug) aliases.add(raw.name);
  aliases.delete(slug);
  aliases.delete(raw.display_name);

  const categories = [...new Set([category, ...(ov.categories || []).map(normCat)])].sort();
  const tags = [...new Set([
    ...deriveTags(raw.display_name || raw.name, raw.description || '', category),
    ...(ov.tags || []),
  ])].sort();

  const packageManagers = [...new Set([
    ...detectPackageManagers([...cmds, ...install.map((i) => i.command)]),
    ...(ov.packageManagers || []),
  ])].sort();

  let license = ov.license ?? null;
  if (!license && source === 'harness') license = 'Apache-2.0';

  return {
    id: slug,
    slug,
    name: raw.display_name || raw.name,
    aliases: [...aliases].sort(),
    summary: ov.summary || firstSentence(raw.description || raw.display_name || raw.name),
    description: ov.description || raw.description || '',
    categories,
    tags,
    useCases: [...new Set(ov.useCases || [])],
    platforms: ov.platforms || detectPlatforms(raw.requires, runtime),
    language: ov.language ?? null,
    runtime: runtime || null,
    license,
    install,
    examples: (ov.examples || []).map((e) => ({
      title: e.title, command: e.command, ...(e.description ? { description: e.description } : {}),
    })),
    repository: ov.repository ?? raw.source_url ?? null,
    documentation: ov.documentation ?? raw.homepage ?? null,
    packageManagers,
    difficulty: ov.difficulty ?? null,
    alternatives: [...new Set(ov.alternatives || [])].sort(),
    related: [...new Set(ov.related || [])].sort(),
    source,
    dataQuality: overlay[slug] ? 'curated' : 'derived',
    lastVerified: dates[raw.name] || null,
  };
}

const entries = [
  ...harness.map((c) => normalize(c, 'harness')),
  ...publicClis.map((c) => normalize(c, 'public')),
].sort((a, b) => a.slug.localeCompare(b.slug));

// ---------- facets --------------------------------------------------------

function tally(getList) {
  const m = new Map();
  for (const e of entries) for (const v of getList(e)) m.set(v, (m.get(v) || 0) + 1);
  return [...m.entries()].map(([id, count]) => ({ id, count })).sort(
    (a, b) => b.count - a.count || a.id.localeCompare(b.id),
  );
}

const meta = {
  generated: 'static',
  counts: {
    total: entries.length,
    harness: entries.filter((e) => e.source === 'harness').length,
    public: entries.filter((e) => e.source === 'public').length,
    curated: entries.filter((e) => e.dataQuality === 'curated').length,
  },
  categories: tally((e) => e.categories),
  platforms: tally((e) => e.platforms),
  languages: tally((e) => (e.language ? e.language.split(/,\s*/) : [])),
  runtimes: tally((e) => (e.runtime ? [e.runtime] : [])),
  packageManagers: tally((e) => e.packageManagers),
  difficulties: tally((e) => (e.difficulty ? [e.difficulty] : [])),
  tags: tally((e) => e.tags),
};

// ---------- AI models: merge data/models/*.json -> data/models.json ----------

const modelDir = p('data/models');
const models = [];
for (const f of readdirSync(modelDir).filter((x) => x.endsWith('.json')).sort()) {
  for (const m of (readJSON(`data/models/${f}`).models || [])) models.push(m);
}
models.sort((a, b) => a.slug.localeCompare(b.slug));

const ctxBucket = (n) =>
  n == null ? 'unknown' : n <= 16000 ? 'small' : n <= 200000 ? 'medium' : n <= 1000000 ? 'large' : 'very-large';

// facet counts over the derived model fields
function mtally(getList) {
  const m = new Map();
  for (const e of models) for (const v of getList(e)) m.set(v, (m.get(v) || 0) + 1);
  return [...m.entries()].map(([id, count]) => ({ id, count })).sort((a, b) => b.count - a.count || String(a.id).localeCompare(String(b.id)));
}
const modelMeta = {
  generated: 'static',
  counts: {
    total: models.length,
    openSource: models.filter((m) => m.openSourceStatus === 'open-source').length,
    openWeight: models.filter((m) => m.openSourceStatus === 'open-weight').length,
    proprietary: models.filter((m) => m.openSourceStatus === 'proprietary' || m.openSourceStatus === 'api-only').length,
    localCapable: models.filter((m) => m.localCapable).length,
    apiAvailable: models.filter((m) => m.apiAvailable).length,
    providers: new Set(models.map((m) => m.provider)).size,
  },
  providers: mtally((m) => [m.provider]),
  categories: mtally((m) => m.categories || []),
  openness: mtally((m) => [m.openSourceStatus]),
  availability: mtally((m) => m.availability || []),
  contextBuckets: mtally((m) => [ctxBucket(m.contextWindow)]),
  localRunners: mtally((m) => m.localRunners || []),
};

let aiProjects = [];
try { aiProjects = readJSON('data/ai-projects.json').projects || []; } catch {}
const projectMeta = {
  count: aiProjects.length,
  categories: (() => {
    const m = new Map();
    for (const pr of aiProjects) for (const c of pr.category || []) m.set(c, (m.get(c) || 0) + 1);
    return [...m.entries()].map(([id, count]) => ({ id, count })).sort((a, b) => b.count - a.count);
  })(),
};

// ---------- emit ---------------------------------------------------------

const outClis = JSON.stringify({ schema: 'schema/cli.schema.json', count: entries.length, clis: entries }, null, 2) + '\n';
const outMeta = JSON.stringify(meta, null, 2) + '\n';
const outModels = JSON.stringify({ schema: 'schema/model.schema.json', count: models.length, models }, null, 2) + '\n';
const outModelMeta = JSON.stringify({ ...modelMeta, projects: projectMeta }, null, 2) + '\n';

function emit(file, content) {
  if (CHECK) {
    let current = '';
    try { current = readFileSync(p(file), 'utf8'); } catch {}
    if (current !== content) {
      console.error(`[FAIL] drift: ${file} is out of date. Run: npm run build`);
      process.exitCode = 1;
    } else {
      console.log(`[ok] ${file} up to date`);
    }
  } else {
    writeFileSync(p(file), content);
    console.log(`[ok] wrote ${file}`);
  }
}

emit('data/clis.json', outClis);
emit('data/meta.json', outMeta);
emit('data/models.json', outModels);
emit('data/model-meta.json', outModelMeta);

// ---------- sitemap + robots ----------------------------------------------
// SITE_URL is set by CI from the Pages URL; the default is an obvious placeholder.
// Run locally as: SITE_URL=https://you.github.io/CLI_CODE npm run build
const SITE_URL = (process.env.SITE_URL || 'https://EXAMPLE.invalid/CLI_CODE').replace(/\/+$/, '');
if (!process.env.SITE_URL && !CHECK) console.log('  (note: SITE_URL not set — sitemap/OG use a placeholder host)');

const CORE_PAGES = [
  'index.html', 'registry.html', 'find.html', 'stacks.html',
  'compare.html', 'cheatsheet.html', 'saved.html', 'docs.html',
  'models.html', 'find-model.html', 'model-compare.html', 'run-local.html', 'ai-explorer.html',
];
const urlEntry = (loc, priority) =>
  `  <url>\n    <loc>${SITE_URL}/${loc}</loc>\n    <priority>${priority}</priority>\n  </url>`;
const sitemapUrls = [
  ...CORE_PAGES.map((f) => urlEntry(f, f === 'index.html' ? '1.0' : '0.7')),
  ...meta.categories.map((c) => urlEntry(`registry.html?cat=${encodeURIComponent(c.id)}`, '0.6')),
  ...entries.map((e) => urlEntry(`cli.html?slug=${encodeURIComponent(e.slug)}`, e.dataQuality === 'curated' ? '0.7' : '0.5')),
  ...models.map((m) => urlEntry(`model.html?slug=${encodeURIComponent(m.slug)}`, '0.6')),
];
emit('sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.join('\n')}\n</urlset>\n`);
emit('robots.txt',
  `# CLI_CODE\nUser-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

// ---------- social / SEO meta + canonical injection -----------------------
// Each managed page carries "<!-- SEO:auto -->…<!-- /SEO:auto -->" in <head>;
// regenerate the block from the page's own <title> + description so unfurls
// stay in sync, and make the canonical absolute.
const SEO_PAGES = [
  'index.html', 'registry.html', 'cli.html', 'find.html', 'stacks.html',
  'compare.html', 'cheatsheet.html', 'saved.html', 'docs.html',
  'models.html', 'model.html', 'find-model.html', 'model-compare.html',
  'run-local.html', 'ai-explorer.html',
];
const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
for (const file of SEO_PAGES) {
  let html;
  try { html = readFileSync(p(file), 'utf8'); } catch { continue; }
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || 'CLI_CODE';
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  const block = [
    '<!-- SEO:auto -->',
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="CLI_CODE">',
    `<meta property="og:title" content="${attr(title)}">`,
    `<meta property="og:description" content="${attr(desc)}">`,
    `<meta property="og:url" content="${attr(`${SITE_URL}/${file}`)}">`,
    '<meta name="twitter:card" content="summary">',
    `<meta name="twitter:title" content="${attr(title)}">`,
    `<meta name="twitter:description" content="${attr(desc)}">`,
    '<!-- /SEO:auto -->',
  ].join('\n');
  let next = html.replace(/<!-- SEO:auto -->[\s\S]*?<!-- \/SEO:auto -->/, block);
  // canonical may be authored relative ("./x.html"), bare, or as an absolute
  // placeholder URL — normalise any of them to an absolute SITE_URL canonical.
  next = next.replace(/<link rel="canonical" href="(?:\.\/|https?:\/\/[^"]*\/)?([^"\/]+)">/, `<link rel="canonical" href="${SITE_URL}/$1">`);

  if (file === 'index.html' && next.includes('<!-- LD:auto -->')) {
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'CLI_CODE',
      description: desc,
      url: `${SITE_URL}/`,
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/registry.html?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    };
    next = next.replace(
      /<!-- LD:auto -->[\s\S]*?<!-- \/LD:auto -->/,
      `<!-- LD:auto -->\n<script type="application/ld+json">\n${JSON.stringify(ld, null, 2)}\n</script>\n<!-- /LD:auto -->`,
    );
  }
  emit(file, next);
}
