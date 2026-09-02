/**
 * store.js — versioned browser-local user state. No account, no network.
 * window.CLIStore. Corrupt or old-shape data is discarded, not trusted.
 */
(function () {
  'use strict';

  const KEY = 'clicode:state';
  const VERSION = 1;
  const LIMITS = { recent: 30, compare: 4 };

  function blank() {
    return { v: VERSION, favorites: [], recent: [], compare: [], prefs: {} };
  }

  function load() {
    let raw;
    try { raw = localStorage.getItem(KEY); } catch { return blank(); }
    if (!raw) return blank();
    let parsed;
    try { parsed = JSON.parse(raw); } catch { return blank(); }
    if (!parsed || typeof parsed !== 'object' || parsed.v !== VERSION) return blank();
    const s = blank();
    for (const k of ['favorites', 'recent', 'compare']) {
      if (Array.isArray(parsed[k])) s[k] = parsed[k].filter((x) => typeof x === 'string').slice(0, 200);
    }
    if (parsed.prefs && typeof parsed.prefs === 'object') s.prefs = parsed.prefs;
    s.compare = s.compare.slice(0, LIMITS.compare);
    return s;
  }

  let state = load();

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode / quota */ }
    window.dispatchEvent(new CustomEvent('clistore:change', { detail: snapshot() }));
  }

  function snapshot() {
    return {
      favorites: [...state.favorites],
      recent: [...state.recent],
      compare: [...state.compare],
      prefs: { ...state.prefs },
    };
  }

  const api = {
    get: snapshot,

    isFavorite: (slug) => state.favorites.includes(slug),
    toggleFavorite(slug) {
      const i = state.favorites.indexOf(slug);
      if (i === -1) state.favorites.unshift(slug);
      else state.favorites.splice(i, 1);
      persist();
      return api.isFavorite(slug);
    },

    addRecent(slug) {
      state.recent = [slug, ...state.recent.filter((s) => s !== slug)].slice(0, LIMITS.recent);
      persist();
    },

    inCompare: (slug) => state.compare.includes(slug),
    compareCount: () => state.compare.length,
    compareFull: () => state.compare.length >= LIMITS.compare,
    toggleCompare(slug) {
      const i = state.compare.indexOf(slug);
      if (i !== -1) state.compare.splice(i, 1);
      else if (state.compare.length < LIMITS.compare) state.compare.push(slug);
      else return { ok: false, reason: 'full', limit: LIMITS.compare };
      persist();
      return { ok: true, inCompare: api.inCompare(slug) };
    },
    clearCompare() { state.compare = []; persist(); },

    setPref(k, v) { state.prefs[k] = v; persist(); },
    getPref: (k, dflt) => (k in state.prefs ? state.prefs[k] : dflt),

    reset() { state = blank(); persist(); },
    LIMITS,
  };

  window.CLIStore = api;
})();
