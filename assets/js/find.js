/**
 * find.js — "Find My CLI". Deterministic keyword / tag / use-case scoring over
 * a natural-language goal. No AI service; every recommendation is explained by
 * the concrete fields that matched.
 */
(function () {
  'use strict';
  const esc = (s) => window.CLISearch.escapeHtml(s);

  // High-value synonym expansion: goal token -> extra match terms.
  const SYN = {
    inspect: ['debug', 'analyze', 'test'], debug: ['inspect', 'analyze'],
    http: ['api', 'rest', 'request'], api: ['rest', 'http', 'graphql', 'webhook'],
    rest: ['api', 'http'], request: ['http', 'api'],
    terminal: ['cli', 'shell', 'repl'], cli: ['terminal', 'shell'],
    note: ['notes', 'knowledge', 'markdown', 'wiki'], notes: ['knowledge', 'markdown', 'wiki'],
    diagram: ['flowchart', 'chart', 'whiteboard'], flowchart: ['diagram'],
    transcribe: ['transcription', 'subtitle', 'caption', 'speech'],
    transcription: ['subtitle', 'caption', 'speech'], subtitles: ['caption', 'subtitle', 'transcription'],
    video: ['editing', 'encode', 'ffmpeg', 'caption'], record: ['capture', 'screen-recording', 'streaming'],
    screenshot: ['capture', 'screen-recording'], stream: ['streaming'],
    image: ['photo', 'raster', 'painting'], photo: ['image', 'raster'],
    vector: ['svg', 'illustration'], illustration: ['vector', 'svg'], logo: ['vector', 'svg'],
    llm: ['ai', 'model', 'inference'], ai: ['llm', 'model', 'inference'], model: ['llm', 'inference'],
    local: [], offline: [],
    database: ['sql', 'storage'], db: ['database', 'sql'],
    embedding: ['embeddings', 'vector-database', 'rag', 'index'],
    embeddings: ['vector-database', 'rag', 'index'], rag: ['embeddings', 'vector-database', 'index'],
    search: ['index'],
    automate: ['automation', 'workflow', 'pipeline', 'orchestration'],
    automation: ['workflow', 'pipeline', 'orchestration'], workflow: ['automation', 'pipeline'],
    scrape: ['scraping', 'crawler', 'browser'], scraping: ['crawler', 'browser'], crawl: ['crawler', 'scraping'],
    browser: ['chromium', 'playwright'],
    deploy: ['deployment', 'ci', 'devops'], deployment: ['deploy', 'ci'],
    monitor: ['monitoring', 'observability', 'logging'], monitoring: ['observability', 'logging'],
    logs: ['logging', 'observability'],
    secret: ['secrets', 'password', 'security'], secrets: ['password', 'security'],
    password: ['secrets', 'security'], vault: ['secrets', 'password'],
    mock: ['stub', 'testing'], stub: ['mock', 'testing'], test: ['testing', 'mock'],
    '3d': ['cad', 'modeling', 'mesh', 'render'], cad: ['3d', 'modeling'], render: ['rendering', '3d'],
    model3d: ['3d', 'modeling'],
    game: ['game-engine', 'gamedev'],
    music: ['audio', 'sound'], audio: ['sound', 'music'], sound: ['audio'],
    gis: ['mapping', 'geospatial'], map: ['mapping', 'gis', 'geospatial'], geospatial: ['gis', 'mapping'],
    ebook: ['pdf', 'documents', 'publishing'], pdf: ['documents', 'ebook'],
    document: ['documents', 'office', 'markdown'], spreadsheet: ['office'], presentation: ['office'],
    citation: ['reference-manager', 'citations'], reference: ['reference-manager', 'citations'],
    process: ['process-manager'], container: ['docker', 'kubernetes'],
  };

  function expand(tokens) {
    const set = new Set(tokens);
    for (const t of tokens) for (const x of SYN[t] || []) set.add(x);
    return [...set];
  }

  function scoreEntry(e, terms, rawTokens) {
    let score = 0;
    const why = { tags: [], category: null, useCase: null, text: [] };
    const tagSet = new Set(e.tags || []);
    const catSet = new Set(e.categories || []);
    const descHay = (e.summary + ' ' + e.description).toLowerCase();

    for (const t of terms) {
      if (tagSet.has(t)) { score += 6; why.tags.push(t); }
      else if ([...tagSet].some((tag) => tag.includes(t) && t.length > 3)) { score += 3; why.tags.push(t); }
      if (catSet.has(t)) { score += 4; why.category = t; }
      for (const u of e.useCases || []) {
        if (u.toLowerCase().includes(t) && t.length > 3 && !why.useCase) { score += 5; why.useCase = u; }
      }
      if (descHay.includes(t) && t.length > 3) { score += 2; if (rawTokens.includes(t)) why.text.push(t); }
    }
    // curated tie-breaker weight
    if (e.dataQuality === 'curated') score += 0.5;
    why.tags = [...new Set(why.tags)];
    why.text = [...new Set(why.text)];
    return { score, why };
  }

  function recommend(clis, goal) {
    const raw = window.CLISearch.queryTokens(goal);
    if (!raw.length) return [];
    const terms = expand(raw);
    const scored = [];
    for (const e of clis) {
      const { score, why } = scoreEntry(e, terms, raw);
      if (score >= 4) scored.push({ entry: e, score, why });
    }
    scored.sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name));
    return scored.slice(0, 8);
  }

  function explain(why) {
    const bits = [];
    if (why.tags.length) bits.push(`tags <b>${why.tags.map(esc).join(', ')}</b>`);
    if (why.category) bits.push(`category <b>${esc(why.category)}</b>`);
    if (why.useCase) bits.push(`use case “${esc(why.useCase)}”`);
    if (why.text.length) bits.push(`mentions <b>${why.text.map(esc).join(', ')}</b>`);
    return bits.length ? 'Matched ' + bits.join(' · ') : 'Weak keyword overlap';
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('find-form');
    const input = document.getElementById('goal');
    const out = document.getElementById('find-results');

    let clis = [];
    try { clis = (await window.CLIData.load()).clis; } catch (e) {
      out.innerHTML = `<p class="empty">Could not load the dataset (${esc(String(e.message || e))}).</p>`;
      return;
    }

    document.querySelectorAll('[data-example]').forEach((b) => {
      b.addEventListener('click', () => { input.value = b.dataset.example; run(); });
    });
    form.addEventListener('submit', (e) => { e.preventDefault(); run(); });

    // deep link: ?goal=
    const pre = new URLSearchParams(location.search).get('goal');
    if (pre) { input.value = pre; run(); }

    function run() {
      const goal = input.value.trim();
      history.replaceState(null, '', goal ? `?goal=${encodeURIComponent(goal)}` : location.pathname);
      if (!goal) { out.innerHTML = ''; return; }
      const recs = recommend(clis, goal);
      if (!recs.length) {
        out.innerHTML = `<p class="empty">No tool in the directory clearly matches that. Try naming the format or task (“inspect HTTP APIs”, “edit video”, “local LLM”), or <a href="registry.html?q=${encodeURIComponent(goal)}">search the full text</a>.</p>`;
        return;
      }
      out.innerHTML = `<p class="reg-count"><b>${recs.length}</b> recommendation${recs.length > 1 ? 's' : ''} for “${esc(goal)}”</p>` +
        recs.map((r, i) => `
        <article class="rec">
          <div class="rec-rank">${i + 1}</div>
          <div class="rec-body">
            <a class="rec-name" href="cli.html?slug=${encodeURIComponent(r.entry.slug)}">${esc(r.entry.name)}</a>
            ${r.entry.dataQuality === 'curated' ? '<span class="pill curated">curated</span>' : ''}
            <span class="pill src ${r.entry.source}">${r.entry.source}</span>
            <p class="rec-sum">${esc(r.entry.summary)}</p>
            <p class="rec-why">${explain(r.why)}</p>
          </div>
        </article>`).join('');
    }
  });
})();
