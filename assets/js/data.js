/**
 * data.js — single loader for the built dataset. window.CLIData.load() returns
 * a cached promise of { clis, meta, bySlug }. Paths are relative to the current
 * document, so it works unchanged at "/" or "/CLI_CODE/".
 */
(function () {
  'use strict';
  let cache = null;

  async function fetchJSON(url) {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
    return res.json();
  }

  function load() {
    if (cache) return cache;
    cache = (async () => {
      const [clisDoc, meta] = await Promise.all([
        fetchJSON('data/clis.json'),
        fetchJSON('data/meta.json'),
      ]);
      const clis = clisDoc.clis || [];
      const bySlug = new Map(clis.map((c) => [c.slug, c]));
      return { clis, meta, bySlug };
    })();
    cache.catch(() => { cache = null; }); // allow retry on failure
    return cache;
  }

  window.CLIData = { load };
})();
