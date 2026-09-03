/**
 * modeldata.js — loader + search for the AI model dataset.
 * window.ModelData.load() -> cached { models, meta, bySlug, projects }.
 * window.ModelSearch.{build,query} — weighted client-side model search.
 * Paths are relative to the document, so it works at "/" or "/CLI_CODE/".
 */
(function () {
  'use strict';
  let cache = null;

  async function j(url) {
    const r = await fetch(url, { cache: 'no-cache' });
    if (!r.ok) throw new Error(`${url} -> HTTP ${r.status}`);
    return r.json();
  }

  function load() {
    if (cache) return cache;
    cache = (async () => {
      const [md, meta, proj] = await Promise.all([
        j('data/models.json'), j('data/model-meta.json'),
        j('data/ai-projects.json').catch(() => ({ projects: [] })),
      ]);
      const models = md.models || [];
      return {
        models, meta,
        bySlug: new Map(models.map((m) => [m.slug, m])),
        projects: proj.projects || [],
      };
    })();
    cache.catch(() => { cache = null; });
    return cache;
  }
  window.ModelData = { load };

  // ---- search ----
  const tok = (s) => String(s || '').toLowerCase().split(/[^a-z0-9.+-]+/).filter(Boolean);

  function build(models) {
    return models.map((m) => ({
      m,
      name: m.name.toLowerCase(),
      nameTokens: tok(m.name),
      provider: (m.provider || '').toLowerCase(),
      family: (m.modelFamily || '').toLowerCase(),
      cats: new Set(m.categories || []),
      text: new Set([
        ...tok(m.name), ...tok(m.provider), ...tok(m.modelFamily),
        ...(m.categories || []), ...(m.useCases || []).flatMap(tok),
        ...tok(m.license), ...tok(m.architecture), ...(m.localRunners || []),
        ...(m.strengths || []).flatMap(tok),
      ]),
    }));
  }

  function query(index, q, limit) {
    const terms = tok(q).filter((t) => t.length > 1);
    if (!terms.length) return [];
    const out = [];
    for (const rec of index) {
      let score = 0; let all = true;
      for (const t of terms) {
        let s = 0;
        if (rec.name === t) s = 12;
        else if (rec.nameTokens.includes(t)) s = 10;
        else if (rec.name.includes(t)) s = 5;
        if (rec.provider.includes(t)) s = Math.max(s, 8);
        if (rec.family.includes(t)) s = Math.max(s, 7);
        if (rec.cats.has(t)) s = Math.max(s, 5);
        if (rec.text.has(t)) s = Math.max(s, 4);
        else if ([...rec.text].some((x) => x.startsWith(t) && t.length > 3)) s = Math.max(s, 2);
        if (s === 0) { all = false; break; }
        score += s;
      }
      if (all) out.push({ entry: rec.m, score });
    }
    out.sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name));
    return out.slice(0, limit || 60);
  }

  window.ModelSearch = { build, query, tokenize: tok };
})();
