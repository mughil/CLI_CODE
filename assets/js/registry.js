/**
 * registry.js — the Browse page. Search + facet filters + sortable table over
 * data/clis.json, with URL-persisted state and full keyboard control.
 * Rows link to cli.html?slug=<slug> (the canonical, deep-linkable tool view).
 */
(function () {
  'use strict';

  const S = {
    clis: [], index: null, meta: null,
    q: '', source: 'all', category: 'all', platform: 'all',
    language: 'all', pm: 'all', difficulty: 'all', curated: false,
    sort: 'relevance', dir: -1,
    view: [], sel: -1, limit: 60,
  };
  const el = {};

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    el.search = document.getElementById('q');
    el.source = document.getElementById('f-source');
    el.category = document.getElementById('f-category');
    el.platform = document.getElementById('f-platform');
    el.language = document.getElementById('f-language');
    el.pm = document.getElementById('f-pm');
    el.difficulty = document.getElementById('f-difficulty');
    el.curated = document.getElementById('f-curated');
    el.clear = document.getElementById('f-clear');
    el.count = document.getElementById('result-count');
    el.tbody = document.getElementById('rows');
    el.head = document.getElementById('thead-row');

    try {
      const data = await window.CLIData.load();
      S.clis = data.clis;
      S.meta = data.meta;
    } catch (err) {
      el.tbody.innerHTML = `<tr><td colspan="6" class="empty">Could not load the dataset (${String(err.message || err)}).<br>Serve the folder over HTTP — <code>npm run build</code> then a static server.</td></tr>`;
      return;
    }

    buildFacetOptions();
    wire();
    readURL();
    apply();

    // warm the search index off the critical path so the first query is instant
    const warm = () => { S.index = S.index || window.CLISearch.build(S.clis); };
    ('requestIdleCallback' in window) ? requestIdleCallback(warm, { timeout: 2000 }) : setTimeout(warm, 800);
  }

  function opts(list, label) {
    return `<option value="all">${label}</option>` +
      list.map((o) => `<option value="${o.id}">${o.id} (${o.count})</option>`).join('');
  }

  function buildFacetOptions() {
    const m = S.meta;
    el.category.innerHTML = opts(m.categories, 'All categories');
    el.platform.innerHTML = opts(m.platforms, 'All platforms');
    el.language.innerHTML = opts(m.languages, 'Any language');
    el.pm.innerHTML = opts(m.packageManagers, 'Any install method');
    if (m.difficulties.length) {
      el.difficulty.innerHTML = opts(m.difficulties, 'Any difficulty');
      el.difficulty.closest('label').hidden = false;
    } else {
      el.difficulty.closest('label').hidden = true;
    }
  }

  function wire() {
    let t;
    el.search.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(() => { S.q = el.search.value.trim(); S.sel = -1; sync(); }, 90);
    });
    for (const [node, key] of [
      [el.source, 'source'], [el.category, 'category'], [el.platform, 'platform'],
      [el.language, 'language'], [el.pm, 'pm'], [el.difficulty, 'difficulty'],
    ]) {
      node.addEventListener('change', () => { S[key] = node.value; sync(); });
    }
    el.curated.addEventListener('change', () => { S.curated = el.curated.checked; sync(); });
    el.clear.addEventListener('click', resetAll);

    el.head.addEventListener('click', (e) => {
      const th = e.target.closest('th[data-sort]');
      if (!th) return;
      const k = th.dataset.sort;
      if (S.sort === k) S.dir *= -1;
      else { S.sort = k; S.dir = k === 'name' ? 1 : -1; }
      sync();
    });

    el.tbody.addEventListener('click', onTbodyClick);
    document.addEventListener('keydown', onKey);
    window.addEventListener('popstate', () => { readURL(); apply(); });
  }

  function onKey(e) {
    if (e.key === '/' && document.activeElement !== el.search) {
      e.preventDefault(); el.search.focus(); el.search.select(); return;
    }
    if (e.key === 'Escape') {
      if (document.activeElement === el.search && el.search.value) {
        el.search.value = ''; S.q = ''; sync();
      } else {
        el.search.blur(); S.sel = -1; renderSelection();
      }
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!S.view.length) return;
      e.preventDefault();
      S.sel += e.key === 'ArrowDown' ? 1 : -1;
      if (S.sel < 0) S.sel = 0;
      if (S.sel >= S.view.length) S.sel = S.view.length - 1;
      if (S.sel >= (S.limit || Infinity)) { S.limit = Infinity; render(); }
      renderSelection(true);
    }
    if (e.key === 'Enter' && S.sel >= 0 && S.view[S.sel]) {
      location.href = `cli.html?slug=${encodeURIComponent(S.view[S.sel].slug)}`;
    }
  }

  function resetAll() {
    Object.assign(S, {
      q: '', source: 'all', category: 'all', platform: 'all',
      language: 'all', pm: 'all', difficulty: 'all', curated: false,
      sort: 'relevance', dir: -1, sel: -1,
    });
    el.search.value = '';
    el.source.value = el.category.value = el.platform.value = 'all';
    el.language.value = el.pm.value = el.difficulty.value = 'all';
    el.curated.checked = false;
    sync();
  }

  function sync() { pushURL(); apply(); }

  function readURL() {
    const p = new URLSearchParams(location.search);
    const g = (k, d) => p.get(k) ?? d;
    S.q = g('q', '');
    S.source = g('source', 'all');
    S.category = g('cat', 'all');
    S.platform = g('platform', 'all');
    S.language = g('lang', 'all');
    S.pm = g('pm', 'all');
    S.difficulty = g('difficulty', 'all');
    S.curated = g('curated', '') === '1';
    S.sort = g('sort', 'relevance');
    S.dir = g('dir', '-1') === '1' ? 1 : -1;
    el.search.value = S.q;
    el.source.value = S.source;
    el.category.value = S.category;
    el.platform.value = S.platform;
    el.language.value = S.language;
    el.pm.value = S.pm;
    el.difficulty.value = S.difficulty;
    el.curated.checked = S.curated;
  }

  function pushURL() {
    const p = new URLSearchParams();
    if (S.q) p.set('q', S.q);
    if (S.source !== 'all') p.set('source', S.source);
    if (S.category !== 'all') p.set('cat', S.category);
    if (S.platform !== 'all') p.set('platform', S.platform);
    if (S.language !== 'all') p.set('lang', S.language);
    if (S.pm !== 'all') p.set('pm', S.pm);
    if (S.difficulty !== 'all') p.set('difficulty', S.difficulty);
    if (S.curated) p.set('curated', '1');
    if (S.sort !== 'relevance') p.set('sort', S.sort);
    if (S.dir === 1 && S.sort !== 'name') p.set('dir', '1');
    if (S.dir === -1 && S.sort === 'name') p.set('dir', '-1');
    const qs = p.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
  }

  function passesFacets(e) {
    if (S.source !== 'all' && e.source !== S.source) return false;
    if (S.category !== 'all' && !e.categories.includes(S.category)) return false;
    if (S.platform !== 'all' && !(e.platforms || []).includes(S.platform)) return false;
    if (S.language !== 'all' && !(e.language || '').split(/,\s*/).includes(S.language)) return false;
    if (S.pm !== 'all' && !(e.packageManagers || []).includes(S.pm)) return false;
    if (S.difficulty !== 'all' && e.difficulty !== S.difficulty) return false;
    if (S.curated && e.dataQuality !== 'curated') return false;
    return true;
  }

  function apply() {
    let rows;
    let terms = [];
    if (S.q) {
      S.index = S.index || window.CLISearch.build(S.clis); // built on first search, not on load
      const hits = window.CLISearch.query(S.index, S.q, { limit: 500 });
      terms = window.CLISearch.queryTokens(S.q);
      rows = hits.filter((h) => passesFacets(h.entry)).map((h) => ({ ...h.entry, _score: h.score, _terms: h.terms }));
    } else {
      rows = S.clis.filter(passesFacets).map((e) => ({ ...e, _score: 0, _terms: [] }));
    }

    const cmp = {
      relevance: (a, b) => (b._score - a._score) || a.name.localeCompare(b.name),
      name: (a, b) => a.name.localeCompare(b.name) * S.dir,
      updated: (a, b) => ((b.lastVerified || '') > (a.lastVerified || '') ? 1 : -1) * (S.dir === -1 ? 1 : -1),
      category: (a, b) => (a.categories[0] || '').localeCompare(b.categories[0] || '') * S.dir,
    };
    if (S.sort === 'relevance') {
      rows.sort(S.q ? cmp.relevance : (a, b) => a.name.localeCompare(b.name));
    } else {
      rows.sort(cmp[S.sort] || cmp.name);
    }

    S.view = rows;
    S._terms = terms;
    S.limit = 60; // cap the initial DOM; "show all" or keyboard nav lifts it
    render();
  }

  function render() {
    const n = S.view.length;
    const shown = Math.min(n, S.limit || n);
    el.count.innerHTML = `<b>${n}</b> of ${S.clis.length} tools` +
      (S.q ? ` · matching “${window.CLISearch.escapeHtml(S.q)}”` : '') +
      (S.q ? '' : ` · sorted by ${S.sort === 'relevance' ? 'name' : S.sort}`) +
      (n > shown ? ` · showing ${shown} <button type="button" class="linklike" id="show-all">show all</button>` : '');

    el.head.querySelectorAll('th[data-sort]').forEach((th) => {
      const on = th.dataset.sort === S.sort;
      th.setAttribute('aria-sort', on ? (S.dir === 1 ? 'ascending' : 'descending') : 'none');
      const a = th.querySelector('.arr');
      if (a) a.textContent = on ? (S.dir === 1 ? '▲' : '▼') : '';
    });

    if (!n) {
      el.tbody.innerHTML = `<tr><td colspan="6" class="empty">No tools match. <button type="button" class="linklike" id="empty-reset">Clear filters</button></td></tr>`;
      document.getElementById('empty-reset')?.addEventListener('click', resetAll);
      return;
    }

    const hl = (t) => window.CLISearch.highlight(t, S._terms);
    const st = window.CLIStore.get();
    const fav = st.favorites, cmp = st.compare;

    el.tbody.innerHTML = S.view.slice(0, shown).map((e, i) => `
      <tr class="row${i === S.sel ? ' sel' : ''}" data-slug="${e.slug}">
        <td class="c-name">
          <button class="star${fav.includes(e.slug) ? ' on' : ''}" data-fav="${e.slug}" aria-label="${fav.includes(e.slug) ? 'Remove from' : 'Add to'} favorites" aria-pressed="${fav.includes(e.slug)}">${fav.includes(e.slug) ? '★' : '☆'}</button>
          <a class="name-link" href="cli.html?slug=${encodeURIComponent(e.slug)}">${hl(e.name)}</a>
          ${e.dataQuality === 'curated' ? '<span class="pill curated" title="Human-verified profile">curated</span>' : ''}
          <span class="pill src ${e.source}">${e.source}</span>
          <div class="c-sub">${hl(e.summary)}</div>
        </td>
        <td>${e.categories.map((c) => `<span class="tagcat">${c}</span>`).join(' ')}</td>
        <td class="mono sm">${(e.platforms || []).join(', ') || '—'}</td>
        <td class="mono sm">${window.CLISearch.escapeHtml(e.language || e.runtime || '—')}</td>
        <td class="mono sm nowrap">${e.lastVerified || '—'}</td>
        <td class="c-act">
          <a class="btn-sm" href="cli.html?slug=${encodeURIComponent(e.slug)}">Open</a>
          <button class="btn-sm ghost cmp-toggle${cmp.includes(e.slug) ? ' on' : ''}" data-cmp="${e.slug}" aria-pressed="${cmp.includes(e.slug)}">${cmp.includes(e.slug) ? 'In compare' : 'Compare'}</button>
        </td>
      </tr>`).join('');

    document.getElementById('show-all')?.addEventListener('click', () => { S.limit = Infinity; render(); });
    renderBar();
  }

  // One delegated listener for the whole table (bound once in wire()), instead
  // of ~3 listeners per row — keeps main-thread work flat as the list grows.
  function onTbodyClick(ev) {
    const favBtn = ev.target.closest('[data-fav]');
    if (favBtn) {
      ev.stopPropagation();
      const on = window.CLIStore.toggleFavorite(favBtn.dataset.fav);
      favBtn.classList.toggle('on', on);
      favBtn.textContent = on ? '★' : '☆';
      favBtn.setAttribute('aria-pressed', on);
      favBtn.setAttribute('aria-label', `${on ? 'Remove from' : 'Add to'} favorites`);
      return;
    }
    const cmpBtn = ev.target.closest('[data-cmp]');
    if (cmpBtn) {
      ev.stopPropagation();
      const r = window.CLIStore.toggleCompare(cmpBtn.dataset.cmp);
      if (!r.ok) { flashBar(`Compare holds at most ${r.limit} tools.`); return; }
      cmpBtn.classList.toggle('on', r.inCompare);
      cmpBtn.textContent = r.inCompare ? 'In compare' : 'Compare';
      cmpBtn.setAttribute('aria-pressed', r.inCompare);
      renderBar();
      return;
    }
    if (ev.target.closest('a') || ev.target.closest('button')) return;
    const row = ev.target.closest('tr.row');
    if (row) location.href = `cli.html?slug=${encodeURIComponent(row.dataset.slug)}`;
  }

  function renderBar() {
    let bar = document.getElementById('cmp-bar');
    const q = window.CLIStore.get().compare;
    if (!q.length) { if (bar) bar.remove(); return; }
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'cmp-bar';
      bar.className = 'cmp-bar';
      document.body.appendChild(bar);
    }
    bar.innerHTML = `<span><b>${q.length}</b> in compare</span>
      ${q.length >= 2 ? `<a class="btn-sm" href="compare.html?slugs=${q.join(',')}">Compare</a>` : '<span class="muted sm">add one more</span>'}
      <button class="btn-sm ghost" id="cmp-bar-clear">Clear</button>`;
    document.getElementById('cmp-bar-clear').addEventListener('click', () => {
      window.CLIStore.clearCompare();
      renderBar();
      el.tbody.querySelectorAll('[data-cmp]').forEach((b) => {
        b.classList.remove('on'); b.textContent = 'Compare'; b.setAttribute('aria-pressed', 'false');
      });
    });
  }

  function flashBar(msg) {
    let bar = document.getElementById('cmp-bar');
    if (!bar) { renderBar(); bar = document.getElementById('cmp-bar'); }
    if (!bar) return;
    const note = document.createElement('span');
    note.className = 'cmp-bar-note';
    note.textContent = msg;
    bar.appendChild(note);
    setTimeout(() => note.remove(), 2200);
  }

  function renderSelection(scroll) {
    el.tbody.querySelectorAll('tr.row').forEach((tr, i) => {
      tr.classList.toggle('sel', i === S.sel);
      if (scroll && i === S.sel) tr.scrollIntoView({ block: 'nearest' });
    });
  }
})();
