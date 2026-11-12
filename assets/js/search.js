/**
 * search.js — client-side weighted search over the CLI dataset.
 * Pure logic, no DOM. Exposes window.CLISearch = { build, query, tokenize, highlight }.
 *
 * Ranking weights (per matched query token):
 *   name 10 · aliases 8 · tags 6 · summary/description 5 · categories 4
 *   useCases 4 · language 2 · platforms 2
 * A result must match every query token somewhere (AND). Score = sum of best
 * per-token contributions. Curated entries win ties.
 *
 * Typo tolerance: when a token of 5+ characters matches nothing exactly or by
 * prefix, fall back to a bounded edit-distance match (Damerau-Levenshtein,
 * distance <= 1, or <= 2 for tokens of 8+ characters) at roughly half weight,
 * so exact-match ordering is unchanged and typos still resolve.
 */
(function () {
  'use strict';

  const STOP = new Set(['the', 'a', 'an', 'of', 'for', 'to', 'and', 'or', 'in', 'on', 'with', 'my', 'i', 'need', 'want', 'use', 'via', 'from']);

  function tokenize(str) {
    return String(str || '')
      .toLowerCase()
      .split(/[^a-z0-9+]+/)
      .filter((t) => t.length > 0);
  }

  function queryTokens(str) {
    const raw = tokenize(str);
    const kept = raw.filter((t) => !STOP.has(t) && t.length > 1);
    return kept.length ? kept : raw; // never return empty if user typed something
  }

  function build(clis) {
    return clis.map((e) => {
      const nameTokens = tokenize(e.name);
      const aliasTokens = (e.aliases || []).flatMap(tokenize);
      const descTokens = new Set([...tokenize(e.summary), ...tokenize(e.description)]);
      const useCaseText = (e.useCases || []).map((u) => u.toLowerCase());
      return {
        entry: e,
        nameLower: e.name.toLowerCase(),
        nameTokens,
        aliasTokens,
        slug: e.slug,
        tags: new Set(e.tags || []),
        categories: new Set(e.categories || []),
        descTokens,
        useCaseText,
        langLower: (e.language || '').toLowerCase(),
        platforms: new Set(e.platforms || []),
      };
    });
  }

  const FUZZY_MIN_LEN = 5;

  // Damerau-Levenshtein (optimal string alignment) with a length-difference
  // pre-check. Words compared here are short name/tag tokens, so the full
  // matrix is cheap.
  function editDistance(a, b, maxDist) {
    if (Math.abs(a.length - b.length) > maxDist) return maxDist + 1;
    const n = b.length;
    let prev2 = null;
    let prev = new Array(n + 1);
    let cur = new Array(n + 1);
    for (let j = 0; j <= n; j++) prev[j] = j;
    for (let i = 1; i <= a.length; i++) {
      cur[0] = i;
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
        if (prev2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          v = Math.min(v, prev2[j - 2] + 1);
        }
        cur[j] = v;
      }
      prev2 = prev;
      prev = cur;
      cur = new Array(n + 1);
    }
    return prev[n];
  }

  // Smallest distance between t and any candidate token, capped at maxDist + 1.
  function bestDist(candidates, t, maxDist) {
    let best = maxDist + 1;
    for (const cand of candidates) {
      if (Math.abs(cand.length - t.length) > maxDist) continue;
      const d = editDistance(cand, t, maxDist);
      if (d < best) best = d;
      if (best === 1) break;
    }
    return best;
  }

  // Typo fallback, only reached when exact/prefix matching scored 0.
  function fuzzyToken(rec, t) {
    const matched = { name: false, text: false };
    if (t.length < FUZZY_MIN_LEN) return { s: 0, matched };
    const maxDist = t.length >= 8 ? 2 : 1;
    let s = 0;
    if (bestDist(rec.nameTokens, t, maxDist) <= maxDist) { s = 5; matched.name = true; }
    if (bestDist(rec.aliasTokens, t, maxDist) <= maxDist) s = Math.max(s, 4);
    if (bestDist(rec.tags, t, maxDist) <= maxDist) s = Math.max(s, 3);
    if (bestDist(rec.descTokens, t, 1) <= 1) { s = Math.max(s, 2); matched.text = true; }
    return { s, matched };
  }

  function scoreToken(rec, t) {
    let s = 0;
    const matched = { name: false, text: false };

    if (rec.nameLower === t) s = Math.max(s, 12);
    else if (rec.slug === t) s = Math.max(s, 11);
    else if (rec.nameTokens.includes(t)) s = Math.max(s, 10);
    else if (rec.nameLower.startsWith(t) && t.length >= 2) s = Math.max(s, 7);
    else if (rec.nameTokens.some((n) => n.startsWith(t) && t.length >= 2)) s = Math.max(s, 5);
    else if (rec.nameLower.includes(t) && t.length >= 3) s = Math.max(s, 3);
    if (s) matched.name = true;

    if (rec.aliasTokens.includes(t)) s = Math.max(s, 8);
    else if (rec.aliasTokens.some((a) => a.startsWith(t) && t.length >= 2)) s = Math.max(s, 4);

    if (rec.tags.has(t)) s = Math.max(s, 6);
    else if ([...rec.tags].some((tag) => tag.includes(t) && t.length >= 3)) s = Math.max(s, 3);

    if (rec.descTokens.has(t)) { s = Math.max(s, 5); matched.text = true; }
    else if ([...rec.descTokens].some((d) => d.startsWith(t) && t.length >= 3)) { s = Math.max(s, 2); matched.text = true; }

    if (rec.categories.has(t)) s = Math.max(s, 4);
    if (rec.useCaseText.some((u) => u.includes(t) && t.length >= 3)) s = Math.max(s, 4);
    if (rec.langLower && rec.langLower.includes(t) && t.length >= 2) s = Math.max(s, 2);
    if (rec.platforms.has(t)) s = Math.max(s, 2);

    if (s === 0) return fuzzyToken(rec, t);
    return { s, matched };
  }

  function query(index, q, opts) {
    const options = opts || {};
    const limit = options.limit || 50;
    const tokens = queryTokens(q);
    if (!tokens.length) return [];

    const results = [];
    for (const rec of index) {
      let total = 0;
      const hitTerms = new Set();
      let allMatched = true;
      for (const t of tokens) {
        const { s, matched } = scoreToken(rec, t);
        if (s === 0) { allMatched = false; break; }
        total += s;
        if (matched.name || matched.text) hitTerms.add(t);
      }
      if (!allMatched) continue;
      results.push({ entry: rec.entry, score: total, terms: [...hitTerms] });
    }

    results.sort((a, b) =>
      b.score - a.score ||
      (b.entry.dataQuality === 'curated') - (a.entry.dataQuality === 'curated') ||
      a.entry.name.localeCompare(b.entry.name));

    return results.slice(0, limit);
  }

  function highlight(text, terms) {
    if (!terms || !terms.length) return escapeHtml(text);
    const safe = escapeHtml(text);
    const pattern = terms
      .filter(Boolean)
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .sort((a, b) => b.length - a.length)
      .join('|');
    if (!pattern) return safe;
    return safe.replace(new RegExp(`(${pattern})`, 'gi'), '<mark>$1</mark>');
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (m) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  window.CLISearch = { build, query, tokenize, queryTokens, highlight, escapeHtml, editDistance };
})();
